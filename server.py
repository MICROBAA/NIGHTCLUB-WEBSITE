#!/usr/bin/env python3
"""VOLTA Tickets — static site plus the box office.

Card numbers and CVC codes are refused. The browser may send the last four
digits only. Totals are calculated here, never trusted from the client.
"""

from __future__ import annotations

import hmac
import json
import os
import re
import secrets
import threading
from datetime import date, datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse
from zoneinfo import ZoneInfo

from qrgen import svg

ROOT = os.path.dirname(os.path.abspath(__file__))
ORDERS_PATH = os.path.join(ROOT, "data", "orders.json")
EVENTS_PATH = os.path.join(ROOT, "data", "events.json")
MADRID = ZoneInfo("Europe/Madrid")
LOCK = threading.Lock()
STAFF_CODE = os.environ.get("VOLTA_DOOR", "1839")
MAX_QTY = 8
ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

TICKETS = {
    "early": {
        "price": 12,
        "es": "Lista anticipada",
        "en": "Early list",
        "note_es": "Entrada antes de las 00:30",
        "note_en": "Entry before 00:30",
    },
    "general": {
        "price": 18,
        "es": "Entrada general",
        "en": "General admission",
        "note_es": "Acceso a todas las salas",
        "note_en": "Access to every room",
    },
    "drink": {
        "price": 25,
        "es": "Entrada + consumición",
        "en": "Entry + one drink",
        "note_es": "Copa de la carta básica",
        "note_en": "House drink included",
    },
}

FORBIDDEN_KEYS = {
    "pan", "card", "cardnumber", "card_number", "cardno", "cvc", "cvv", "cvc2",
    "cid", "securitycode", "security_code", "fullpan", "track", "track2",
}

CODE_RE = re.compile(r"^TR-[A-Z0-9]{6}(?:-\d{1,2})?$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def now() -> datetime:
    return datetime.now(MADRID)


def luhn_ok(digits: str) -> bool:
    if not digits.isdigit() or not (13 <= len(digits) <= 19):
        return False
    total = 0
    flip = False
    for ch in reversed(digits):
        n = ord(ch) - 48
        if flip:
            n *= 2
            if n > 9:
                n -= 9
        total += n
        flip = not flip
    return total % 10 == 0


def looks_like_pan(value: str) -> bool:
    digits = re.sub(r"\D", "", value or "")
    return luhn_ok(digits)


def contains_card_data(obj, key: str = "") -> bool:
    if isinstance(obj, dict):
        return any(contains_card_data(v, str(k)) for k, v in obj.items())
    if isinstance(obj, list):
        return any(contains_card_data(v, key) for v in obj)
    if key.lower().replace("-", "") in FORBIDDEN_KEYS:
        return True
    if isinstance(obj, str) and key.lower() not in {"phone", "tel", "bizum", "notes", "name", "email"}:
        if looks_like_pan(obj):
            return True
    return False


def load_events() -> list[dict]:
    with open(EVENTS_PATH, encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError("events catalog is not a list")
    return data


def load_orders() -> dict:
    if not os.path.exists(ORDERS_PATH):
        return {"orders": []}
    with open(ORDERS_PATH, encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict) or not isinstance(data.get("orders"), list):
        return {"orders": []}
    return data


def save_orders(data: dict) -> None:
    os.makedirs(os.path.dirname(ORDERS_PATH), exist_ok=True)
    tmp = ORDERS_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    os.replace(tmp, ORDERS_PATH)


def fresh_code(existing: set[str]) -> str:
    for _ in range(20):
        code = "TR-" + "".join(secrets.choice(ALPHABET) for _ in range(6))
        if code not in existing:
            return code
    raise RuntimeError("could not allocate a ticket code")


def mask_email(email: str) -> str:
    local, _, domain = (email or "").partition("@")
    if not domain:
        return "•••"
    head = local[:1] if local else "•"
    return f"{head}•••@{domain}"


def mask_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) < 3:
        return "•••"
    return "••• " + digits[-3:]


def public_order(order: dict, origin: str) -> dict:
    tickets = []
    for ticket in order["tickets"]:
        url = f"{origin}/ticket.html?code={ticket['code']}"
        try:
            image = svg(url)
            payload = url
        except ValueError:
            image = svg(ticket["code"])
            payload = ticket["code"]
        tickets.append({
            "code": ticket["code"],
            "index": ticket["index"],
            "status": ticket["status"],
            "redeemedAt": ticket.get("redeemedAt"),
            "qr": image,
            "qrText": payload,
        })
    payment = order["payment"]
    return {
        "id": order["id"],
        "created": order["created"],
        "event": order["event"],
        "ticketType": order["ticketType"],
        "ticketName": order["ticketName"],
        "ticketNote": order["ticketNote"],
        "qty": order["qty"],
        "unit": order["unit"],
        "total": order["total"],
        "currency": "EUR",
        "buyerName": order["buyer"]["name"],
        "emailMasked": mask_email(order["buyer"]["email"]),
        "phoneMasked": mask_phone(order["buyer"]["phone"]),
        "payment": {
            "method": payment["method"],
            "brand": payment.get("brand"),
            "last4": payment.get("last4"),
            "phoneMasked": mask_phone(payment["phone"]) if payment.get("phone") else None,
            "status": "paid",
        },
        "tickets": tickets,
    }


def find_order(orders: list[dict], code: str):
    code = code.upper()
    for order in orders:
        if order["id"] == code:
            return order, None
        for ticket in order["tickets"]:
            if ticket["code"] == code:
                return order, ticket["code"]
    return None, None


def msg(es: str, en: str) -> dict:
    return {"es": es, "en": en}


ERRORS = {
    "invalid_json": msg("No se ha podido leer el pago.", "The payment could not be read."),
    "card_data_rejected": msg(
        "El número completo de la tarjeta no se acepta. Vuelve a intentarlo desde la página de pago.",
        "The full card number is not accepted. Try again from the checkout page.",
    ),
    "missing_fields": msg("Revisa nombre, email y teléfono.", "Check name, email and phone."),
    "age_required": msg("La entrada es +18. Confirma la edad del grupo.", "Entry is 18+. Confirm the party’s age."),
    "unknown_event": msg("Esa noche no está en cartel.", "That night is not on the bill."),
    "event_passed": msg("Esa noche ya ha pasado.", "That night has already passed."),
    "bad_ticket": msg("Elige un tipo de entrada.", "Choose a ticket type."),
    "bad_qty": msg("Puedes comprar entre 1 y 8 entradas.", "You can buy between 1 and 8 tickets."),
    "bad_payment": msg("Revisa los datos de pago.", "Check the payment details."),
    "card_expired": msg("La tarjeta está caducada.", "The card has expired."),
    "not_found": msg("No hay ninguna entrada con ese código.", "No ticket matches that code."),
    "bad_staff": msg("Código de sala incorrecto.", "Wrong door code."),
    "already_used": msg("Esta entrada ya se ha usado.", "This ticket has already been used."),
    "too_large": msg("La solicitud es demasiado larga.", "That request is too large."),
}


class Handler(SimpleHTTPRequestHandler):
    server_version = "VoltaTickets/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        # Path only. Never log a request body.
        super().log_message(fmt, *args)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        super().end_headers()

    def origin(self) -> str:
        proto = (self.headers.get("X-Forwarded-Proto") or "").split(",")[0].strip()
        host = (self.headers.get("X-Forwarded-Host") or self.headers.get("Host") or "").split(",")[0].strip()
        if not proto:
            proto = "https" if host and "e2b.app" in host else "http"
        if not host:
            host = "127.0.0.1:4173"
        return f"{proto}://{host}"

    def read_json(self, limit: int = 6000):
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > limit:
            return None, "too_large" if length > limit else "invalid_json"
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return None, "invalid_json"
        if not isinstance(data, dict):
            return None, "invalid_json"
        if contains_card_data(data):
            return None, "card_data_rejected"
        return data, None

    def send_json(self, status: int, payload: dict) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def fail(self, status: int, code: str) -> None:
        self.send_json(status, {"ok": False, "error": code, "message": ERRORS[code]})

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        if path == "/api/catalog":
            self.handle_catalog()
            return
        if path == "/api/qr.svg":
            self.handle_qr(parsed)
            return
        if path.startswith("/api/orders/"):
            self.handle_get_order(path)
            return
        if path.startswith("/api/"):
            self.fail(404, "not_found")
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        if path == "/api/orders":
            self.handle_create()
            return
        if path.startswith("/api/orders/") and path.endswith("/redeem"):
            self.handle_redeem(path)
            return
        self.fail(404, "not_found")

    def handle_catalog(self) -> None:
        today = now().date()
        events = []
        for event in load_events():
            day = date.fromisoformat(event["date"])
            item = dict(event)
            item["onSale"] = day >= today
            events.append(item)
        tickets = []
        for key, spec in TICKETS.items():
            tickets.append({
                "id": key,
                "price": spec["price"],
                "name": {"es": spec["es"], "en": spec["en"]},
                "note": {"es": spec["note_es"], "en": spec["note_en"]},
            })
        self.send_json(200, {
            "ok": True,
            "currency": "EUR",
            "maxQty": MAX_QTY,
            "tickets": tickets,
            "events": events,
        })

    def handle_qr(self, parsed) -> None:
        data = (parse_qs(parsed.query).get("data") or [""])[0]
        data = unquote(data)[:180]
        if not data:
            self.send_error(400)
            return
        try:
            body = svg(data).encode("utf-8")
        except ValueError:
            self.send_error(400)
            return
        self.send_response(200)
        self.send_header("Content-Type", "image/svg+xml; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "public, max-age=86400")
        self.end_headers()
        self.wfile.write(body)

    def handle_get_order(self, path: str) -> None:
        code = unquote(path.split("/")[-1]).upper()
        if not CODE_RE.match(code):
            self.fail(404, "not_found")
            return
        with LOCK:
            store = load_orders()
            order, focus = find_order(store["orders"], code)
        if not order:
            self.fail(404, "not_found")
            return
        payload = public_order(order, self.origin())
        payload["focus"] = focus
        self.send_json(200, {"ok": True, "order": payload})

    def handle_create(self) -> None:
        body, error = self.read_json()
        if error:
            self.fail(400, error)
            return
        if not body.get("age"):
            self.fail(400, "age_required")
            return
        event_id = str(body.get("eventId") or "")
        ticket_type = str(body.get("ticketType") or "")
        try:
            qty = int(body.get("qty"))
        except (TypeError, ValueError):
            self.fail(400, "bad_qty")
            return
        if qty < 1 or qty > MAX_QTY:
            self.fail(400, "bad_qty")
            return
        spec = TICKETS.get(ticket_type)
        if not spec:
            self.fail(400, "bad_ticket")
            return
        event = next((item for item in load_events() if item.get("id") == event_id), None)
        if not event:
            self.fail(400, "unknown_event")
            return
        if date.fromisoformat(event["date"]) < now().date():
            self.fail(400, "event_passed")
            return
        buyer = body.get("buyer") if isinstance(body.get("buyer"), dict) else {}
        name = str(buyer.get("name") or "").strip()
        email = str(buyer.get("email") or "").strip()
        phone = str(buyer.get("phone") or "").strip()
        notes = str(body.get("notes") or "").strip()[:280]
        digits = re.sub(r"\D", "", phone)
        if len(name) < 2 or len(name) > 80 or not EMAIL_RE.match(email) or not (9 <= len(digits) <= 15):
            self.fail(400, "missing_fields")
            return
        payment = body.get("payment") if isinstance(body.get("payment"), dict) else {}
        method = str(payment.get("method") or "")
        paid = self.normalize_payment(payment, method)
        if paid is None:
            self.fail(400, "bad_payment")
            return
        if method == "card" and self.card_expired(paid):
            self.fail(400, "card_expired")
            return
        idem = str(body.get("idempotencyKey") or "")[:80]
        if idem and not re.fullmatch(r"[A-Za-z0-9_-]{8,80}", idem):
            idem = ""
        with LOCK:
            store = load_orders()
            if idem:
                previous = next((item for item in store["orders"] if item.get("idempotencyKey") == idem), None)
                if previous:
                    self.send_json(200, {"ok": True, "order": public_order(previous, self.origin())})
                    return
            taken = {item["id"] for item in store["orders"]}
            for item in store["orders"]:
                taken.update(ticket["code"] for ticket in item["tickets"])
            order_id = fresh_code(taken)
            taken.add(order_id)
            tickets = []
            for index in range(1, qty + 1):
                code = f"{order_id}-{index}"
                tickets.append({"code": code, "index": index, "status": "valid", "redeemedAt": None})
            order = {
                "id": order_id,
                "idempotencyKey": idem or None,
                "created": now().isoformat(timespec="seconds"),
                "event": {
                    "id": event["id"],
                    "title": event["title"],
                    "date": event["date"],
                    "time": event["time"],
                    "when": event["when"],
                    "image": event["image"],
                    "genre": event["genre"],
                },
                "ticketType": ticket_type,
                "ticketName": {"es": spec["es"], "en": spec["en"]},
                "ticketNote": {"es": spec["note_es"], "en": spec["note_en"]},
                "qty": qty,
                "unit": spec["price"],
                "total": spec["price"] * qty,
                "buyer": {"name": name, "email": email, "phone": phone},
                "notes": notes,
                "payment": paid,
                "tickets": tickets,
            }
            store["orders"].insert(0, order)
            save_orders(store)
        self.send_json(201, {"ok": True, "order": public_order(order, self.origin())})

    def normalize_payment(self, payment: dict, method: str):
        if method == "card":
            last4 = str(payment.get("last4") or "")
            brand = str(payment.get("brand") or "card")[:16]
            try:
                month = int(payment.get("expMonth"))
                year = int(payment.get("expYear"))
            except (TypeError, ValueError):
                return None
            if not re.fullmatch(r"\d{4}", last4) or not (1 <= month <= 12) or not (2026 <= year <= 2042):
                return None
            if brand not in {"visa", "mastercard", "amex", "card"}:
                brand = "card"
            return {"method": "card", "brand": brand, "last4": last4, "expMonth": month, "expYear": year, "status": "paid"}
        if method == "bizum":
            phone = str(payment.get("phone") or "")
            digits = re.sub(r"\D", "", phone)
            if digits.startswith("34") and len(digits) == 11:
                digits = digits[2:]
            if len(digits) != 9 or digits[0] not in "67":
                return None
            return {"method": "bizum", "phone": "+34" + digits, "status": "paid"}
        return None

    def card_expired(self, paid: dict) -> bool:
        today = now().date()
        year = paid["expYear"]
        month = paid["expMonth"]
        if year < today.year:
            return True
        if year == today.year and month < today.month:
            return True
        return False

    def handle_redeem(self, path: str) -> None:
        parts = [unquote(part) for part in path.split("/") if part]
        # api / orders / CODE / redeem
        if len(parts) != 4:
            self.fail(404, "not_found")
            return
        code = parts[2].upper()
        if not CODE_RE.match(code):
            self.fail(404, "not_found")
            return
        body, error = self.read_json()
        if error:
            self.fail(400, error)
            return
        given = str((body or {}).get("staff") or "")
        if len(given) != len(STAFF_CODE) or not hmac.compare_digest(given, STAFF_CODE):
            self.fail(403, "bad_staff")
            return
        with LOCK:
            store = load_orders()
            order, focus = find_order(store["orders"], code)
            if not order:
                self.fail(404, "not_found")
                return
            target = focus or (order["tickets"][0]["code"] if len(order["tickets"]) == 1 else None)
            if focus is None and "-" not in code:
                self.fail(400, "bad_payment")
                return
            ticket = next(item for item in order["tickets"] if item["code"] == (focus or code))
            if ticket["status"] == "used":
                payload = public_order(order, self.origin())
                payload["focus"] = ticket["code"]
                self.send_json(409, {"ok": False, "error": "already_used", "message": ERRORS["already_used"], "order": payload})
                return
            ticket["status"] = "used"
            ticket["redeemedAt"] = now().isoformat(timespec="seconds")
            save_orders(store)
            payload = public_order(order, self.origin())
            payload["focus"] = ticket["code"]
        self.send_json(200, {"ok": True, "order": payload})


def main() -> None:
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("0.0.0.0", 4173), Handler)
    print("VOLTA Tickets on http://0.0.0.0:4173", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
