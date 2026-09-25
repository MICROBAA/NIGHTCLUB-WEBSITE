(function () {
  const PASS_KEY = "tropical-tickets-v1";
  const COPY = {
    es: {
      loading: "Cargando la taquilla…",
      offline: "La taquilla no responde. Recarga la página.",
      chooseNight: "Elige la noche",
      changeNight: "Cambiar noche",
      sold: "Noche pasada",
      onSale: "A la venta",
      qty: "Entradas",
      name: "Nombre y apellidos",
      email: "Email",
      phone: "Teléfono",
      notes: "Notas",
      notesPh: "Cumpleaños, llegada prevista…",
      age: "Confirmo que todas las personas son mayores de 18 años.",
      payWith: "Pagar con",
      card: "Tarjeta",
      bizum: "Bizum",
      holder: "Titular de la tarjeta",
      number: "Número de tarjeta",
      expiry: "Caducidad",
      cvc: "CVC",
      bizumPhone: "Móvil Bizum",
      bizumHint: "Un móvil español. La entrada se emite al confirmar.",
      fine: "El número completo y el CVC no salen de este dispositivo. Solo guardamos los 4 últimos dígitos en el recibo.",
      vip: "¿Mesa o botella? El VIP sigue por WhatsApp.",
      total: "Total",
      each: "por entrada",
      pay: "Pagar",
      processing: "Confirmando el pago…",
      processingSub: "Emitiendo tu entrada.",
      errAge: "Confirma que el grupo es mayor de 18.",
      errBuyer: "Revisa nombre, email y teléfono.",
      errCard: "Revisa el número, la caducidad y el CVC.",
      errBizum: "El Bizum necesita un móvil español que empiece por 6 o 7.",
      errNight: "Esa noche ya no está a la venta.",
      paid: "Pago confirmado",
      valid: "Válida",
      used: "Usada",
      show: "Muestra este QR en la puerta. Entrada +18 con documento.",
      doors: "Apertura",
      guest: "A nombre de",
      order: "Pedido",
      methodCard: "Tarjeta",
      methodBizum: "Bizum",
      print: "Imprimir",
      copy: "Copiar enlace",
      copied: "Enlace copiado",
      another: "Comprar otra noche",
      lookup: "¿Ya tienes un código?",
      lookupBtn: "Ver entrada",
      lookupPh: "TR-······",
      saved: "En este dispositivo",
      emptySaved: "Cuando pagues, la entrada queda guardada aquí.",
      missing: "No encontramos esa entrada.",
      doorTitle: "Puerta",
      doorLead: "Lee el código de la entrada y el código de sala.",
      doorCode: "Código de entrada",
      staff: "Código de sala",
      validate: "Validar entrada",
      admitted: "Adelante",
      denied: "No pasar",
      people: "personas",
      person: "persona",
      of: "de"
    },
    en: {
      loading: "Opening the box office…",
      offline: "The box office is not responding. Reload the page.",
      chooseNight: "Choose the night",
      changeNight: "Change night",
      sold: "Night passed",
      onSale: "On sale",
      qty: "Tickets",
      name: "Full name",
      email: "Email",
      phone: "Phone",
      notes: "Notes",
      notesPh: "Birthday, expected arrival…",
      age: "I confirm everyone in the party is 18 or older.",
      payWith: "Pay with",
      card: "Card",
      bizum: "Bizum",
      holder: "Name on card",
      number: "Card number",
      expiry: "Expiry",
      cvc: "CVC",
      bizumPhone: "Bizum mobile",
      bizumHint: "A Spanish mobile. The ticket is issued when you confirm.",
      fine: "The full number and CVC never leave this device. We only keep the last 4 digits on the receipt.",
      vip: "A table or a bottle? VIP is still on WhatsApp.",
      total: "Total",
      each: "each",
      pay: "Pay",
      processing: "Confirming payment…",
      processingSub: "Issuing your ticket.",
      errAge: "Confirm the party is 18 or older.",
      errBuyer: "Check name, email and phone.",
      errCard: "Check the number, expiry and CVC.",
      errBizum: "Bizum needs a Spanish mobile starting with 6 or 7.",
      errNight: "That night is no longer on sale.",
      paid: "Payment confirmed",
      valid: "Valid",
      used: "Used",
      show: "Show this QR at the door. Entry is 18+ with ID.",
      doors: "Doors",
      guest: "In the name of",
      order: "Order",
      methodCard: "Card",
      methodBizum: "Bizum",
      print: "Print",
      copy: "Copy link",
      copied: "Link copied",
      another: "Buy another night",
      lookup: "Already have a code?",
      lookupBtn: "View ticket",
      lookupPh: "TR-······",
      saved: "On this device",
      emptySaved: "After you pay, the ticket stays here.",
      missing: "We could not find that ticket.",
      doorTitle: "Door",
      doorLead: "Read the ticket code and the room code.",
      doorCode: "Ticket code",
      staff: "Room code",
      validate: "Validate ticket",
      admitted: "Come through",
      denied: "Do not admit",
      people: "guests",
      person: "guest",
      of: "of"
    }
  };

  const state = {
    catalog: null,
    eventId: "",
    type: "general",
    qty: 1,
    method: "card",
    idem: "",
    busy: false
  };

  function lang() {
    return document.documentElement.dataset.lang === "en" ? "en" : "es";
  }
  function t(key) {
    return (COPY[lang()] && COPY[lang()][key]) || COPY.es[key] || key;
  }
  function money(n) {
    return new Intl.NumberFormat(lang() === "en" ? "en-GB" : "es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(n);
  }
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }
  function luhn(num) {
    if (!/^\d{13,19}$/.test(num)) return false;
    let sum = 0;
    let flip = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = num.charCodeAt(i) - 48;
      if (flip) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      flip = !flip;
    }
    return sum % 10 === 0;
  }
  function brandOf(num) {
    if (/^3[47]/.test(num)) return "amex";
    if (/^4/.test(num)) return "visa";
    if (/^(5[1-5]|2[2-7])/.test(num)) return "mastercard";
    return "card";
  }
  function prettyDate(iso) {
    const date = new Date(iso + "T12:00:00");
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat(lang() === "en" ? "en-GB" : "es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(date);
  }
  function selectedEvent() {
    if (!state.catalog) return null;
    return state.catalog.events.find(function (item) { return item.id === state.eventId; }) || null;
  }
  function selectedType() {
    if (!state.catalog) return null;
    return state.catalog.tickets.find(function (item) { return item.id === state.type; }) || state.catalog.tickets[1];
  }
  function total() {
    const spec = selectedType();
    return spec ? spec.price * state.qty : 0;
  }
  function params() {
    return new URLSearchParams(window.location.search);
  }

  function remember(order) {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(PASS_KEY) || "[]"); } catch (e) { list = []; }
    list = list.filter(function (item) { return item.id !== order.id; });
    list.unshift({
      id: order.id,
      event: order.event.title,
      when: order.event.when,
      ticketEs: order.ticketName.es,
      ticketEn: order.ticketName.en,
      qty: order.qty,
      total: order.total,
      href: "ticket.html?order=" + encodeURIComponent(order.id)
    });
    try { localStorage.setItem(PASS_KEY, JSON.stringify(list.slice(0, 24))); } catch (e) {}
  }
  function savedPasses() {
    try { return JSON.parse(localStorage.getItem(PASS_KEY) || "[]"); } catch (e) { return []; }
  }

  async function getJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(function () { return {}; });
    return { response: response, data: data };
  }
  function apiMessage(data) {
    if (data && data.message) return data.message[lang()] || data.message.es || t("offline");
    return t("offline");
  }

  function setError(text) {
    const node = document.getElementById("pay-error");
    if (!node) return;
    node.hidden = !text;
    node.textContent = text || "";
  }

  function renderCheckout() {
    const root = document.getElementById("checkout-root");
    if (!root || !state.catalog) return;
    const event = selectedEvent();
    const nights = state.catalog.events.map(function (item) {
      const on = item.id === state.eventId ? " is-on" : "";
      const off = item.onSale ? "" : " is-off";
      return '<button type="button" class="night-pick' + on + off + '" data-event="' + esc(item.id) + '"' + (item.onSale ? "" : " disabled") + ">" +
        '<img src="' + esc(item.image) + '" alt="">' +
        "<span><strong>" + esc(item.title) + "</strong><small>" + esc(item.when) + (item.onSale ? "" : " · " + esc(t("sold"))) + "</small></span></button>";
    }).join("");
    const types = state.catalog.tickets.map(function (item) {
      const checked = item.id === state.type ? " checked" : "";
      return '<label class="choice"><input type="radio" name="ticketType" value="' + esc(item.id) + '"' + checked + ">" +
        "<span><strong>" + esc(item.name[lang()]) + "</strong><small>" + esc(item.note[lang()]) + "</small></span><b>" + money(item.price) + "</b></label>";
    }).join("");
    const hero = event
      ? '<article class="night-card"><img src="' + esc(event.image) + '" alt=""><div><p class="kicker">' + esc(event.when) + "</p><h2>" + esc(event.title) + "</h2><p class=\"fine\">" + esc(event.genre) + "</p><button type=\"button\" class=\"link-arrow\" id=\"change-night\">" + esc(t("changeNight")) + "</button></div></article>"
      : '<p class="kicker">' + esc(t("chooseNight")) + "</p>";
    root.innerHTML =
      '<form id="pay-form" novalidate>' +
      "<div>" + hero +
      '<div class="night-list" id="night-list"' + (event ? " hidden" : "") + ">" + nights + "</div>" +
      '<div class="choices" id="type-list">' + types + "</div>" +
      '<div class="field-row">' +
      '<label class="field"><span>' + esc(t("qty")) + '</span><div class="stepper"><button type="button" data-qty="-1" aria-label="-">−</button><output id="qty-out">' + state.qty + '</output><button type="button" data-qty="1" aria-label="+">+</button></div></label>' +
      '<label class="field"><span>' + esc(t("name")) + '</span><input name="name" autocomplete="name" required maxlength="80"></label>' +
      "</div>" +
      '<div class="field-row">' +
      '<label class="field"><span>' + esc(t("email")) + '</span><input name="email" type="email" autocomplete="email" required></label>' +
      '<label class="field"><span>' + esc(t("phone")) + '</span><input name="phone" type="tel" autocomplete="tel" required placeholder="+34"></label>' +
      "</div>" +
      '<label class="field"><span>' + esc(t("notes")) + '</span><textarea name="notes" maxlength="280" placeholder="' + esc(t("notesPh")) + '"></textarea></label>' +
      '<label class="check"><input type="checkbox" name="age"><span>' + esc(t("age")) + "</span></label>" +
      "</div>" +
      '<aside class="pay-panel">' +
      '<p class="kicker">' + esc(t("payWith")) + "</p>" +
      '<div class="pay-methods" role="tablist">' +
      '<button type="button" class="method' + (state.method === "card" ? " is-on" : "") + '" data-method="card">' + esc(t("card")) + "</button>" +
      '<button type="button" class="method' + (state.method === "bizum" ? " is-on" : "") + '" data-method="bizum">' + esc(t("bizum")) + "</button>" +
      "</div>" +
      '<div id="card-fields"' + (state.method === "card" ? "" : " hidden") + ">" +
      '<label class="field"><span>' + esc(t("holder")) + '</span><input name="holder" autocomplete="cc-name" maxlength="80"></label>' +
      '<label class="field"><span>' + esc(t("number")) + '</span><input name="number" inputmode="numeric" autocomplete="cc-number" maxlength="23" placeholder="•••• •••• •••• ••••" spellcheck="false"></label>' +
      '<div class="field-row">' +
      '<label class="field"><span>' + esc(t("expiry")) + '</span><input name="expiry" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="MM/YY"></label>' +
      '<label class="field"><span>' + esc(t("cvc")) + '</span><input name="cvc" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="•••"></label>' +
      "</div>" +
      '<p class="card-brand" id="card-brand" aria-live="polite"></p>' +
      "</div>" +
      '<div id="bizum-fields"' + (state.method === "bizum" ? "" : " hidden") + ">" +
      '<label class="field"><span>' + esc(t("bizumPhone")) + '</span><input name="bizum" type="tel" inputmode="tel" autocomplete="tel" placeholder="6XX XXX XXX"></label>' +
      '<p class="fine">' + esc(t("bizumHint")) + "</p>" +
      "</div>" +
      '<div class="total-line"><span>' + esc(t("total")) + '</span><strong id="pay-total">' + money(total()) + "</strong></div>" +
      '<p class="fine" id="pay-unit"></p>' +
      '<p class="form-error" id="pay-error" hidden></p>' +
      '<button class="btn btn--gold pay-submit" type="submit" id="pay-btn">' + esc(t("pay")) + " " + money(total()) + "</button>" +
      '<p class="fine">' + esc(t("fine")) + "</p>" +
      '<p class="fine"><a class="link-arrow" href="vip.html">' + esc(t("vip")) + "</a></p>" +
      "</aside></form>";
    paintUnit();
    const form = document.getElementById("pay-form");
    form.addEventListener("submit", onPay);
    form.addEventListener("input", onInput);
  }

  function paintUnit() {
    const spec = selectedType();
    const unit = document.getElementById("pay-unit");
    const button = document.getElementById("pay-btn");
    const sum = document.getElementById("pay-total");
    if (spec && unit) unit.textContent = money(spec.price) + " " + t("each") + " · " + spec.name[lang()];
    if (sum) sum.textContent = money(total());
    if (button && !state.busy) button.textContent = t("pay") + " " + money(total());
  }

  function onInput(event) {
    const input = event.target;
    if (input.name === "number") {
      const raw = digits(input.value).slice(0, 19);
      input.value = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
      const brand = document.getElementById("card-brand");
      if (brand) {
        const name = raw.length >= 2 ? brandOf(raw) : "";
        brand.textContent = name === "amex" ? "American Express" : name === "visa" ? "Visa" : name === "mastercard" ? "Mastercard" : "";
      }
    }
    if (input.name === "expiry") {
      const raw = digits(input.value).slice(0, 4);
      input.value = raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw;
    }
    if (input.name === "cvc") input.value = digits(input.value).slice(0, 4);
  }

  function readCard() {
    const form = document.getElementById("pay-form");
    const number = digits(form.number.value);
    const expiry = digits(form.expiry.value);
    const cvc = digits(form.cvc.value);
    const holder = form.holder.value.trim();
    const brand = brandOf(number);
    const cvcLen = brand === "amex" ? 4 : 3;
    if (holder.length < 2 || !luhn(number) || expiry.length !== 4 || cvc.length !== cvcLen) return null;
    const month = Number(expiry.slice(0, 2));
    const year = 2000 + Number(expiry.slice(2));
    if (month < 1 || month > 12) return null;
    const today = new Date();
    if (year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth() + 1)) return null;
    return { last4: number.slice(-4), brand: brand, expMonth: month, expYear: year };
  }

  async function onPay(event) {
    event.preventDefault();
    if (state.busy) return;
    const form = event.target;
    const night = selectedEvent();
    if (!night || !night.onSale) {
      setError(t("errNight"));
      return;
    }
    if (!form.age.checked) {
      setError(t("errAge"));
      return;
    }
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || digits(phone).length < 9) {
      setError(t("errBuyer"));
      return;
    }
    let payment;
    if (state.method === "card") {
      const card = readCard();
      if (!card) {
        setError(t("errCard"));
        return;
      }
      payment = { method: "card", last4: card.last4, brand: card.brand, expMonth: card.expMonth, expYear: card.expYear };
      form.number.value = "";
      form.cvc.value = "";
    } else {
      let bizum = digits(form.bizum.value || phone);
      if (bizum.startsWith("34") && bizum.length === 11) bizum = bizum.slice(2);
      if (bizum.length !== 9 || (bizum[0] !== "6" && bizum[0] !== "7")) {
        setError(t("errBizum"));
        return;
      }
      payment = { method: "bizum", phone: "+34" + bizum };
    }
    setError("");
    state.busy = true;
    if (!state.idem) state.idem = (crypto.randomUUID && crypto.randomUUID()) || ("idem" + Date.now());
    const overlay = document.getElementById("pay-overlay");
    if (overlay) overlay.hidden = false;
    const started = Date.now();
    try {
      const result = await getJson("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: night.id,
          ticketType: state.type,
          qty: state.qty,
          buyer: { name: name, email: email, phone: phone },
          notes: form.notes.value.trim(),
          age: true,
          idempotencyKey: state.idem,
          payment: payment
        })
      });
      const wait = 700 - (Date.now() - started);
      if (wait > 0) await new Promise(function (resolve) { setTimeout(resolve, wait); });
      if (!result.response.ok || !result.data.order) {
        state.busy = false;
        if (overlay) overlay.hidden = true;
        setError(apiMessage(result.data));
        return;
      }
      remember(result.data.order);
      window.location.href = "ticket.html?order=" + encodeURIComponent(result.data.order.id);
    } catch (e) {
      state.busy = false;
      if (overlay) overlay.hidden = true;
      setError(t("offline"));
    }
  }

  function bindCheckout() {
    const root = document.getElementById("checkout-root");
    if (!root) return;
    root.addEventListener("click", function (event) {
      const night = event.target.closest("[data-event]");
      if (night && !night.disabled) {
        state.eventId = night.dataset.event;
        const list = document.getElementById("night-list");
        if (list) list.hidden = true;
        renderCheckout();
        return;
      }
      if (event.target.id === "change-night") {
        const list = document.getElementById("night-list");
        if (list) list.hidden = !list.hidden;
        return;
      }
      const qty = event.target.closest("[data-qty]");
      if (qty) {
        const max = (state.catalog && state.catalog.maxQty) || 8;
        state.qty = Math.min(max, Math.max(1, state.qty + Number(qty.dataset.qty)));
        const out = document.getElementById("qty-out");
        if (out) out.textContent = String(state.qty);
        paintUnit();
        return;
      }
      const method = event.target.closest("[data-method]");
      if (method) {
        state.method = method.dataset.method;
        document.querySelectorAll(".method").forEach(function (btn) {
          btn.classList.toggle("is-on", btn.dataset.method === state.method);
        });
        document.getElementById("card-fields").hidden = state.method !== "card";
        document.getElementById("bizum-fields").hidden = state.method !== "bizum";
      }
    });
    root.addEventListener("change", function (event) {
      if (event.target.name === "ticketType") {
        state.type = event.target.value;
        paintUnit();
      }
    });
  }

  async function initCheckout() {
    const query = params();
    state.eventId = query.get("event") || "";
    state.type = query.get("type") || "general";
    const root = document.getElementById("checkout-root");
    try {
      const result = await getJson("/api/catalog");
      if (!result.data.ok) throw new Error("catalog");
      state.catalog = result.data;
      if (!selectedEvent()) {
        const open = state.catalog.events.find(function (item) { return item.onSale; });
        state.eventId = open ? open.id : "";
      }
      if (!selectedType()) state.type = "general";
      renderCheckout();
      bindCheckout();
    } catch (e) {
      if (root) root.innerHTML = '<p class="form-error">' + esc(t("offline")) + "</p>";
    }
  }

  function paymentLine(order) {
    const pay = order.payment || {};
    if (pay.method === "bizum") return t("methodBizum") + " " + (pay.phoneMasked || "");
    const brand = pay.brand === "amex" ? "Amex" : pay.brand === "mastercard" ? "Mastercard" : pay.brand === "visa" ? "Visa" : t("methodCard");
    return brand + " ···· " + (pay.last4 || "");
  }

  function passHtml(order, ticket) {
    const name = order.ticketName[lang()] || order.ticketName.es;
    const status = ticket.status === "used" ? t("used") : t("valid");
    const stamp = ticket.status === "used" ? "is-used" : "is-paid";
    return '<article class="pass" id="pass-' + esc(ticket.code) + '">' +
      '<div class="pass__main">' +
      '<div class="pass__top"><p class="kicker">Tropical Salou</p><span class="pass__stamp ' + stamp + '">' + esc(status) + "</span></div>" +
      "<h2>" + esc(order.event.title) + "</h2>" +
      "<p class=\"pass__date\">" + esc(prettyDate(order.event.date)) + "</p>" +
      '<p class="fine">' + esc(t("doors")) + " " + esc(order.event.time) + " · " + esc(order.event.genre) + "</p>" +
      '<dl class="pass__facts"><div><dt>' + esc(name) + "</dt><dd>" + ticket.index + " " + esc(t("of")) + " " + order.qty + "</dd></div>" +
      "<div><dt>" + esc(t("guest")) + "</dt><dd>" + esc(order.buyerName) + "</dd></div></dl>" +
      '<div class="pass__tear"><p class="pass__code">' + esc(ticket.code) + "</p>" +
      "<p class=\"fine\">" + esc(paymentLine(order)) + " · " + money(order.total) + "</p>" +
      "<p class=\"fine\">" + esc(t("show")) + "</p></div></div>" +
      '<div class="pass__qr" data-qr="' + esc(ticket.code) + '"></div></article>';
  }

  function mountQr(root, order) {
    order.tickets.forEach(function (ticket) {
      const slot = root.querySelector('[data-qr="' + ticket.code + '"]');
      if (!slot || !ticket.qr || ticket.qr.indexOf("<svg") !== 0) return;
      slot.innerHTML = ticket.qr;
    });
  }

  function renderOrder(order, focus) {
    const root = document.getElementById("ticket-root");
    if (!root) return;
    const list = order.tickets.filter(function (ticket) {
      return !focus || ticket.code === focus;
    });
    const shown = list.length ? list : order.tickets;
    root.innerHTML =
      '<p class="kicker">' + esc(t("paid")) + " · " + esc(order.id) + "</p>" +
      '<div class="pass-list">' + shown.map(function (ticket) { return passHtml(order, ticket); }).join("") + "</div>" +
      '<div class="stack-btns no-print">' +
      '<button type="button" class="btn btn--gold" id="print-pass">' + esc(t("print")) + "</button>" +
      '<button type="button" class="btn btn--ghost" id="copy-pass">' + esc(t("copy")) + "</button>" +
      '<a class="btn btn--ghost" href="checkout.html">' + esc(t("another")) + "</a>" +
      '<a class="btn btn--ghost" href="door.html?code=' + encodeURIComponent((focus || shown[0].code)) + '">Door</a>' +
      "</div>";
    mountQr(root, order);
    if (focus) {
      const node = document.getElementById("pass-" + focus);
      if (node) node.scrollIntoView({ block: "center" });
    }
    document.getElementById("print-pass").addEventListener("click", function () { window.print(); });
    document.getElementById("copy-pass").addEventListener("click", function () {
      const link = window.location.origin + "/ticket.html?order=" + encodeURIComponent(order.id);
      const button = document.getElementById("copy-pass");
      navigator.clipboard.writeText(link).then(function () {
        button.textContent = t("copied");
      }).catch(function () {
        button.textContent = link;
      });
    });
  }

  function renderLookup() {
    const root = document.getElementById("ticket-root");
    if (!root) return;
    const saved = savedPasses();
    const items = saved.length
      ? saved.map(function (item) {
        const name = lang() === "en" ? (item.ticketEn || "") : (item.ticketEs || "");
        return '<article class="book-item"><strong>' + esc(item.event) + '</strong><p class="fine">' + esc(item.id) + " · " + esc(item.when) + "<br>" + esc(name) + " × " + esc(item.qty) + " · " + money(item.total) + '</p><p><a class="link-arrow" href="' + esc(item.href) + '">' + esc(t("lookupBtn")) + "</a></p></article>";
      }).join("")
      : '<p class="muted">' + esc(t("emptySaved")) + "</p>";
    root.innerHTML =
      '<form class="lookup" id="lookup-form"><label class="field"><span>' + esc(t("lookup")) + '</span><input name="code" required placeholder="' + esc(t("lookupPh")) + '" autocapitalize="characters"></label><button class="btn btn--gold" type="submit">' + esc(t("lookupBtn")) + "</button></form>" +
      '<p class="form-error" id="lookup-error" hidden></p>' +
      '<p class="kicker">' + esc(t("saved")) + "</p>" + items;
    document.getElementById("lookup-form").addEventListener("submit", function (event) {
      event.preventDefault();
      const code = event.target.code.value.trim().toUpperCase();
      if (!code) return;
      window.location.href = "ticket.html?code=" + encodeURIComponent(code);
    });
  }

  async function initTicket() {
    const query = params();
    const code = query.get("order") || query.get("code") || "";
    const root = document.getElementById("ticket-root");
    if (!code) {
      renderLookup();
      return;
    }
    try {
      const result = await getJson("/api/orders/" + encodeURIComponent(code));
      if (!result.response.ok || !result.data.order) {
        if (root) root.innerHTML = '<p class="form-error">' + esc(t("missing")) + '</p><p><a class="link-arrow" href="ticket.html">' + esc(t("lookup")) + "</a></p>";
        return;
      }
      remember(result.data.order);
      renderOrder(result.data.order, query.get("code"));
    } catch (e) {
      if (root) root.innerHTML = '<p class="form-error">' + esc(t("offline")) + "</p>";
    }
  }

  async function initDoor() {
    const form = document.getElementById("door-form");
    const result = document.getElementById("door-result");
    if (!form || !result) return;
    const preset = params().get("code");
    if (preset && form.code) form.code.value = preset.toUpperCase();
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const code = form.code.value.trim().toUpperCase();
      const staff = form.staff.value.trim();
      result.hidden = true;
      try {
        const response = await getJson("/api/orders/" + encodeURIComponent(code) + "/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staff: staff })
        });
        const order = response.data.order;
        const ok = response.response.ok;
        const ticket = order && order.tickets.find(function (item) { return item.code === (order.focus || code); });
        result.hidden = false;
        result.className = "door-result " + (ok ? "is-ok" : "is-bad");
        if (!order) {
          result.innerHTML = "<h2>" + esc(t("denied")) + "</h2><p>" + esc(apiMessage(response.data)) + "</p>";
          return;
        }
        result.innerHTML = "<p class=\"kicker\">" + esc(ok ? t("admitted") : t("denied")) + "</p><h2>" + esc(order.event.title) + "</h2><p>" + esc(order.buyerName) + " · " + esc(ticket ? ticket.code : code) + "</p><p class=\"fine\">" + esc(order.ticketName[lang()]) + " · " + (ticket ? ticket.index : 1) + " " + esc(t("of")) + " " + order.qty + "</p><p>" + esc(apiMessage(response.data) === t("offline") && ok ? t("admitted") : (ok ? t("admitted") : apiMessage(response.data))) + "</p>";
      } catch (e) {
        result.hidden = false;
        result.className = "door-result is-bad";
        result.innerHTML = "<h2>" + esc(t("denied")) + "</h2><p>" + esc(t("offline")) + "</p>";
      }
    });
  }

  const page = document.body.dataset.page;
  if (page === "checkout") initCheckout();
  if (page === "ticket") initTicket();
  if (page === "door") initDoor();

  document.addEventListener("tropical:lang", function () {
    if (page === "checkout" && state.catalog) renderCheckout();
    if (page === "ticket") initTicket();
  });
})();
