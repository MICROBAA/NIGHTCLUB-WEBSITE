(function () {
  const LANG_KEY = "tropical-lang";
  const BOOK_KEY = "tropical-bookings-v1";
  const COOKIE_KEY = "tropical-cookie";

  const UI = {
    es: {
      switchLabel: "Switch to English",
      close: "Cerrar",
      tickets: "Tickets",
      request: "Enviar por WhatsApp",
      email: "Enviar por email",
      copy: "Copiar texto",
      copied: "Texto copiado",
      less: "Menos",
      more: "Más",
      qty: "Cantidad",
      total: "Total orientativo",
      from: "desde",
      age: "Confirmo que todos los asistentes son mayores de 18 años.",
      disclaimer: "Precios orientativos de temporada. Esta web no cobra nada: la solicitud llega al club solo cuando envías el WhatsApp o el email. El equipo confirma disponibilidad y el pago.",
      errAge: "Confirma que el grupo es mayor de 18 años.",
      errFields: "Revisa nombre, email y teléfono.",
      errDate: "Elige una fecha.",
      errHoney: "No se ha podido enviar.",
      prepared: "Solicitud preparada",
      preparedBody: "Aún no está confirmada. Envía el mensaje para que el equipo de Tropical la reciba.",
      ref: "Referencia",
      emptyBooks: "Todavía no hay solicitudes en este dispositivo.",
      booksTitle: "Mis solicitudes",
      openNow: "Abierto ahora",
      until: "hasta las",
      opensAt: "Hoy abrimos a las 18:00",
      closed: "Cerrado ahora",
      countdownOver: "Esta noche",
      days: "d",
      hours: "h",
      mins: "m",
      all: "Todos",
      calMonths: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      calDays: ["L", "M", "X", "J", "V", "S", "D"],
      early: "Lista anticipada",
      earlyNote: "Entrada antes de las 00:30",
      general: "Entrada general",
      generalNote: "Acceso a todas las salas",
      drink: "Entrada + consumición",
      drinkNote: "Copa de la carta básica",
      vipLink: "¿Prefieres mesa? Reserva VIP",
      cookie: "Guardamos el idioma y tus solicitudes solo en este navegador. No usamos cookies de publicidad.",
      accept: "Entendido",
      moreInfo: "Más info",
      guests: "personas",
      bottle: "botella",
      bottles: "botellas",
      sendRestaurant: "Pedir mesa por WhatsApp",
      sendVip: "Pedir mesa VIP por WhatsApp",
      sendContact: "Enviar mensaje por WhatsApp",
      topicClub: "Club",
      topicVip: "VIP",
      topicRest: "Restaurante",
      topicCorp: "Evento privado",
      topicOther: "Otra consulta"
    },
    en: {
      switchLabel: "Cambiar a español",
      close: "Close",
      tickets: "Tickets",
      request: "Send on WhatsApp",
      email: "Send by email",
      copy: "Copy text",
      copied: "Text copied",
      less: "Less",
      more: "More",
      qty: "Quantity",
      total: "Indicative total",
      from: "from",
      age: "I confirm everyone in the party is 18 or older.",
      disclaimer: "Seasonal guide prices. This website charges nothing: the club only receives the request when you send the WhatsApp or email. The team confirms availability and payment.",
      errAge: "Confirm that the party is 18 or older.",
      errFields: "Check name, email and phone.",
      errDate: "Choose a date.",
      errHoney: "Could not send.",
      prepared: "Request ready",
      preparedBody: "It is not confirmed yet. Send the message so the Tropical team receives it.",
      ref: "Reference",
      emptyBooks: "No requests saved on this device yet.",
      booksTitle: "My requests",
      openNow: "Open now",
      until: "until",
      opensAt: "We open today at 18:00",
      closed: "Closed now",
      countdownOver: "Tonight",
      days: "d",
      hours: "h",
      mins: "m",
      all: "All",
      calMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      calDays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
      early: "Early list",
      earlyNote: "Entry before 00:30",
      general: "General admission",
      generalNote: "Access to every room",
      drink: "Entry + one drink",
      drinkNote: "House drink included",
      vipLink: "Prefer a table? Book VIP",
      cookie: "Language and reservation requests stay in this browser only. No advertising cookies.",
      accept: "Got it",
      moreInfo: "More info",
      guests: "guests",
      bottle: "bottle",
      bottles: "bottles",
      sendRestaurant: "Request a table on WhatsApp",
      sendVip: "Request a VIP table on WhatsApp",
      sendContact: "Send message on WhatsApp",
      topicClub: "Club",
      topicVip: "VIP",
      topicRest: "Restaurant",
      topicCorp: "Private event",
      topicOther: "Other"
    }
  };

  const TICKETS = [
    { id: "early", price: 12, name: "early", note: "earlyNote" },
    { id: "general", price: 18, name: "general", note: "generalNote" },
    { id: "drink", price: 25, name: "drink", note: "drinkNote" }
  ];

  const PHONES = {
    club: "34695117539",
    vip: "34645727427",
    restaurant: "34699680057",
    email: "direccion@tropicalsalou.com"
  };

  function t(key) {
    const lang = getLang();
    return (UI[lang] && UI[lang][key]) || UI.es[key] || key;
  }

  function getLang() {
    return document.documentElement.dataset.lang === "en" ? "en" : "es";
  }

  function applyLang(lang) {
    lang = lang === "en" ? "en" : "es";
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    document.querySelectorAll("[data-es]").forEach(function (el) {
      el.textContent = el.getAttribute("data-" + lang) || el.getAttribute("data-es") || "";
    });
    document.querySelectorAll("[data-es-placeholder]").forEach(function (el) {
      el.placeholder = el.getAttribute("data-" + lang + "-placeholder") || el.getAttribute("data-es-placeholder") || "";
    });
    document.querySelectorAll("[data-es-aria]").forEach(function (el) {
      el.setAttribute("aria-label", el.getAttribute("data-" + lang + "-aria") || el.getAttribute("data-es-aria") || "");
    });
    document.querySelectorAll("[data-es-alt]").forEach(function (el) {
      el.alt = el.getAttribute("data-" + lang + "-alt") || el.getAttribute("data-es-alt") || "";
    });
    const title = document.body.getAttribute("data-" + lang + "-title");
    if (title) document.title = title;
    const switcher = document.getElementById("lang-switch");
    if (switcher) {
      switcher.textContent = lang === "es" ? "EN" : "ES";
      switcher.setAttribute("aria-label", t("switchLabel"));
    }
    document.documentElement.classList.remove("i18n-wait");
    document.documentElement.classList.add("i18n-ready");
    updateStatus();
    updateCountdown();
    renderCalendar();
    if (document.getElementById("ticket-dialog") && document.getElementById("ticket-dialog").open) {
      fillTicket(document.getElementById("ticket-dialog").dataset.event || "");
    }
    renderBooks();
    document.querySelectorAll("[data-ui]").forEach(function (el) {
      el.textContent = t(el.dataset.ui);
    });
  }

  function money(n) {
    return new Intl.NumberFormat(getLang() === "en" ? "en-GB" : "es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(n);
  }

  function madridNow() {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const parts = fmt.formatToParts(new Date());
    const get = function (type) { return parts.find(function (p) { return p.type === type; }).value; };
    const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: map[get("weekday")],
      mins: Number(get("hour")) * 60 + Number(get("minute"))
    };
  }

  function clubCloseForSessionDay(sessionDay) {
    return sessionDay === 5 || sessionDay === 6 ? 6 * 60 : 5 * 60;
  }

  function venueStatus(kind) {
    const now = madridNow();
    const mins = now.mins;
    const day = now.day;
    if (kind === "restaurant") {
      if (mins >= 18 * 60 || mins < 60) {
        return { open: true, close: "01:00" };
      }
      return { open: false, close: "01:00" };
    }
    if (mins < 6 * 60) {
      const sessionDay = (day + 6) % 7;
      const close = clubCloseForSessionDay(sessionDay);
      if (mins < close) return { open: true, close: close === 6 * 60 ? "06:00" : "05:00" };
      return { open: false };
    }
    if (mins >= 18 * 60) {
      const close = clubCloseForSessionDay(day);
      return { open: true, close: close === 6 * 60 ? "06:00" : "05:00" };
    }
    return { open: false };
  }

  function updateStatus() {
    document.querySelectorAll("[data-status]").forEach(function (el) {
      const st = venueStatus(el.dataset.status || "club");
      el.classList.toggle("is-open", st.open);
      const dot = el.querySelector("i");
      if (!dot) {
        el.insertAdjacentHTML("afterbegin", "<i></i>");
      }
      if (st.open) {
        el.lastChild.nodeType === 3
          ? (el.childNodes[el.childNodes.length - 1].textContent = " " + t("openNow") + " · " + t("until") + " " + st.close)
          : el.append(" " + t("openNow") + " · " + t("until") + " " + st.close);
        // rebuild cleanly
      }
      el.innerHTML = '<i></i><span>' + (st.open
        ? t("openNow") + " · " + t("until") + " " + st.close
        : t("closed") + " · " + t("opensAt")) + "</span>";
      el.classList.toggle("is-open", st.open);
    });
  }

  function updateCountdown() {
    const el = document.getElementById("countdown");
    if (!el) return;
    const target = new Date(el.dataset.target);
    const diff = target.getTime() - Date.now();
    if (Number.isNaN(target.getTime()) || diff <= 0) {
      el.textContent = t("countdownOver");
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    el.textContent = d + t("days") + " " + String(h).padStart(2, "0") + t("hours") + " " + String(m).padStart(2, "0") + t("mins");
  }

  function loadBooks() {
    try { return JSON.parse(localStorage.getItem(BOOK_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveBooks(list) {
    try { localStorage.setItem(BOOK_KEY, JSON.stringify(list.slice(0, 24))); } catch (e) {}
    updateBookBadge();
  }
  function updateBookBadge() {
    const n = loadBooks().length;
    const badge = document.getElementById("bookings-count");
    if (!badge) return;
    badge.hidden = n === 0;
    badge.textContent = String(n);
  }

  function refCode() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "TR-";
    for (let i = 0; i < 5; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validPhone(v) { return v.replace(/\D/g, "").length >= 9; }

  function waLink(phone, text) {
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
  }

  function ensureDialogs() {
    if (document.getElementById("ticket-dialog")) return;
    const wrap = document.createElement("div");
    wrap.innerHTML =
      '<dialog class="sheet" id="ticket-dialog">' +
      '<form id="ticket-form">' +
      '<div class="sheet__head"><div><p class="kicker" id="ticket-kicker"></p><h2 id="ticket-title"></h2></div>' +
      '<button type="button" class="icon-btn" data-close aria-label="Close">×</button></div>' +
      '<div class="choices" id="ticket-types"></div>' +
      '<div class="field-row">' +
      '<label class="field"><span data-ui="qty">Quantity</span><div class="stepper"><button type="button" data-step="-1">−</button><output id="qty-out">1</output><button type="button" data-step="1">+</button></div></label>' +
      '<div class="total-line"><span data-ui="total">Total</span><strong id="ticket-total"></strong></div>' +
      "</div>" +
      '<label class="field"><span data-es="Nombre" data-en="Name">Nombre</span><input name="name" required autocomplete="name" data-es-placeholder="Nombre y apellidos" data-en-placeholder="Full name" placeholder="Nombre y apellidos"></label>' +
      '<div class="field-row">' +
      '<label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email" placeholder="email@ejemplo.com"></label>' +
      '<label class="field"><span data-es="Teléfono" data-en="Phone">Teléfono</span><input name="phone" type="tel" required autocomplete="tel" placeholder="+34"></label>' +
      "</div>" +
      '<label class="field"><span data-es="Notas" data-en="Notes">Notas</span><textarea name="notes" data-es-placeholder="Cumpleaños, llegada prevista…" data-en-placeholder="Birthday, expected arrival…" placeholder="Cumpleaños, llegada prevista…"></textarea></label>' +
      '<label class="check"><input type="checkbox" name="age" required><span data-ui="age"></span></label>' +
      '<p class="fine" data-ui="disclaimer"></p>' +
      '<p class="form-error" id="ticket-error" hidden></p>' +
      '<div class="hp" aria-hidden="true"><label>Company<input name="company" tabindex="-1" autocomplete="off"></label></div>' +
      '<div class="stack-btns"><button class="btn btn--gold" type="submit" data-ui="request"></button><a class="btn btn--ghost" id="ticket-mail" href="#" data-ui="email"></a></div>' +
      '<p class="fine"><a class="link-arrow" href="vip.html" data-ui="vipLink"></a></p>' +
      "</form>" +
      '<div id="ticket-success" class="form-success" hidden></div>' +
      "</dialog>" +
      '<dialog class="sheet" id="books-dialog"><div class="sheet__head"><h2 data-ui="booksTitle"></h2><button type="button" class="icon-btn" data-close>×</button></div><div id="books-list"></div></dialog>' +
      '<dialog class="lightbox" id="lightbox"><img alt=""><div class="lightbox__bar"><p id="lightbox-cap"></p><div class="lightbox__nav"><button type="button" class="icon-btn" id="lightbox-prev" aria-label="Previous">←</button><button type="button" class="icon-btn" id="lightbox-next" aria-label="Next">→</button><button type="button" class="icon-btn" data-close>×</button></div></div></dialog>';
    document.body.appendChild(wrap);
    applyLang(getLang());
  }

  function selectedTicket() {
    const picked = document.querySelector('#ticket-types input:checked');
    return TICKETS.find(function (item) { return item.id === (picked ? picked.value : "general"); }) || TICKETS[1];
  }

  function currentQty() {
    return Number(document.getElementById("qty-out").textContent) || 1;
  }

  function updateTotal() {
    const total = document.getElementById("ticket-total");
    if (!total) return;
    total.textContent = money(selectedTicket().price * currentQty());
  }

  function fillTicket(eventId) {
    const card = document.getElementById(eventId);
    const dialog = document.getElementById("ticket-dialog");
    dialog.dataset.event = eventId;
    const title = card ? (card.querySelector("h3") ? card.querySelector("h3").textContent.trim() : eventId) : "Tropical";
    const when = card ? (card.dataset.when || "") : "";
    document.getElementById("ticket-title").textContent = title;
    document.getElementById("ticket-kicker").textContent = when;
    document.getElementById("ticket-form").hidden = false;
    document.getElementById("ticket-success").hidden = true;
    document.getElementById("ticket-error").hidden = true;
    document.getElementById("qty-out").textContent = "1";
    const types = document.getElementById("ticket-types");
    types.innerHTML = TICKETS.map(function (item, i) {
      return '<label class="choice"><input type="radio" name="ticket" value="' + item.id + '"' + (i === 1 ? " checked" : "") + '><span><strong>' + t(item.name) + '</strong><small>' + t(item.note) + '</small></span><b>' + money(item.price) + '</b></label>';
    }).join("");
    updateTotal();
    const mail = document.getElementById("ticket-mail");
    mail.href = "mailto:" + PHONES.email;
  }

  function openTicket(eventId) {
    ensureDialogs();
    fillTicket(eventId);
    const dialog = document.getElementById("ticket-dialog");
    if (!dialog.open) dialog.showModal();
  }

  function messageForTicket(data) {
    const lang = getLang();
    if (lang === "en") {
      return "Hello Tropical, I would like to request tickets.\nRef: " + data.ref +
        "\nEvent: " + data.event + "\nWhen: " + data.when +
        "\nTicket: " + data.ticket + " × " + data.qty +
        "\nIndicative total: " + data.total +
        "\nName: " + data.name + "\nEmail: " + data.email + "\nPhone: " + data.phone +
        (data.notes ? "\nNotes: " + data.notes : "") +
        "\n18+ confirmed. Please confirm availability and payment.";
    }
    return "Hola Tropical, quiero solicitar entradas.\nRef: " + data.ref +
      "\nEvento: " + data.event + "\nCuándo: " + data.when +
      "\nEntrada: " + data.ticket + " × " + data.qty +
      "\nTotal orientativo: " + data.total +
      "\nNombre: " + data.name + "\nEmail: " + data.email + "\nTeléfono: " + data.phone +
      (data.notes ? "\nNotas: " + data.notes : "") +
      "\n+18 confirmado. Confirmad disponibilidad y pago, por favor.";
  }

  function showPrepared(container, form, data, phone) {
    const text = data.text;
    form.hidden = true;
    container.hidden = false;
    container.innerHTML =
      '<p class="kicker">' + t("ref") + " " + data.ref + "</p>" +
      "<h3>" + t("prepared") + "</h3>" +
      "<p>" + t("preparedBody") + "</p>" +
      '<p class="fine">' + data.event + " · " + data.ticket + " × " + data.qty + " · " + data.total + "</p>" +
      '<div class="stack-btns"><a class="btn btn--gold" target="_blank" rel="noopener" href="' + waLink(phone, text) + '">' + t("request") + '</a>' +
      '<a class="btn btn--ghost" href="mailto:' + PHONES.email + "?subject=" + encodeURIComponent("Tropical " + data.ref) + "&body=" + encodeURIComponent(text) + '">' + t("email") + '</a>' +
      '<button type="button" class="btn btn--ghost" id="copy-request">' + t("copy") + "</button></div>";
    const copyBtn = document.getElementById("copy-request");
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = t("copied");
      }).catch(function () {
        copyBtn.textContent = text;
      });
    });
  }

  function renderBooks() {
    const list = document.getElementById("books-list");
    if (!list) return;
    const books = loadBooks();
    if (!books.length) {
      list.innerHTML = '<p class="muted">' + t("emptyBooks") + "</p>";
      return;
    }
    list.innerHTML = books.map(function (b) {
      return '<article class="book-item"><strong>' + b.event + "</strong><p class=\"fine\">" + b.ref + " · " + b.when + "<br>" + b.ticket + " × " + b.qty + " · " + b.total + "</p></article>";
    }).join("");
  }

  function initHeader() {
    const header = document.querySelector("[data-header]");
    const toggle = document.getElementById("nav-toggle");
    const panel = document.getElementById("nav-panel");
    const onScroll = function () {
      if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        const open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        panel.classList.toggle("is-open", !open);
        panel.inert = open;
        document.body.style.overflow = open ? "" : "hidden";
      });
      panel.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          toggle.setAttribute("aria-expanded", "false");
          panel.classList.remove("is-open");
          panel.inert = true;
          document.body.style.overflow = "";
        });
      });
    }
    document.getElementById("lang-switch")?.addEventListener("click", function () {
      applyLang(getLang() === "es" ? "en" : "es");
    });
    document.getElementById("open-bookings")?.addEventListener("click", function () {
      ensureDialogs();
      renderBooks();
      document.getElementById("books-dialog").showModal();
    });
  }

  function initReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function initEvents() {
    const cards = document.querySelectorAll(".event-card");
    function openCard(card, scroll) {
      cards.forEach(function (c) { c.classList.toggle("is-open", c === card); });
      if (card && scroll) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    cards.forEach(function (card) {
      const btn = card.querySelector("[data-expand]");
      if (!btn) return;
      btn.addEventListener("click", function () {
        const willOpen = !card.classList.contains("is-open");
        openCard(willOpen ? card : null, false);
        card.querySelectorAll("[data-expand]").forEach(function (b) {
          b.setAttribute("aria-expanded", String(willOpen));
        });
        if (willOpen) history.replaceState(null, "", "#" + card.id);
      });
    });
    const hash = location.hash.replace("#", "");
    const hashed = hash && document.getElementById(hash);
    if (hashed && hashed.classList.contains("event-card")) openCard(hashed, false);
    else if (cards[0] && document.body.dataset.page === "events") openCard(cards[0], false);

    document.querySelectorAll("[data-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll("[data-filter]").forEach(function (c) { c.classList.remove("is-on"); });
        chip.classList.add("is-on");
        const filter = chip.dataset.filter;
        document.querySelectorAll(".event-card").forEach(function (card) {
          const show = filter === "all" || (card.dataset.date || "").indexOf(filter) === 0;
          card.hidden = !show;
        });
      });
    });
  }

  function renderCalendar() {
    const mount = document.getElementById("calendar-mount");
    if (!mount) return;
    const events = Array.prototype.map.call(document.querySelectorAll(".event-card"), function (card) {
      return card.dataset.date;
    }).filter(Boolean);
    const months = [];
    events.forEach(function (date) {
      const key = date.slice(0, 7);
      if (months.indexOf(key) === -1) months.push(key);
    });
    const lang = getLang();
    mount.innerHTML = months.map(function (key) {
      const year = Number(key.slice(0, 4));
      const month = Number(key.slice(5, 7)) - 1;
      const first = new Date(year, month, 1);
      const start = (first.getDay() + 6) % 7;
      const days = new Date(year, month + 1, 0).getDate();
      let cells = UI[lang].calDays.map(function (d) { return '<span class="calendar__label">' + d + "</span>"; }).join("");
      for (let i = 0; i < start; i++) cells += '<span class="calendar__day"></span>';
      for (let day = 1; day <= days; day++) {
        const iso = key + "-" + String(day).padStart(2, "0");
        const eventCard = document.querySelector('.event-card[data-date="' + iso + '"]');
        if (eventCard) {
          cells += '<a class="calendar__day is-event" href="#' + eventCard.id + '">' + day + "</a>";
        } else {
          cells += '<span class="calendar__day">' + day + "</span>";
        }
      }
      return '<div class="calendar-block"><div class="calendar-head"><h2>' + UI[lang].calMonths[month] + " " + year + '</h2></div><div class="calendar">' + cells + "</div></div>";
    }).join("");
    mount.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        const id = a.getAttribute("href").slice(1);
        const card = document.getElementById(id);
        if (!card) return;
        document.querySelectorAll(".event-card").forEach(function (c) { c.classList.toggle("is-open", c === card); c.hidden = false; });
        document.querySelectorAll("[data-filter]").forEach(function (c) { c.classList.toggle("is-on", c.dataset.filter === "all"); });
      });
    });
  }

  function initRooms() {
    const root = document.querySelector("[data-room-switch]");
    if (!root) return;
    root.dataset.enhanced = "true";
    const tabs = root.querySelectorAll("[data-room]");
    const panels = root.querySelectorAll(".room-panel");
    function show(id) {
      tabs.forEach(function (tab) {
        const on = tab.dataset.room === id;
        tab.classList.toggle("is-on", on);
        tab.setAttribute("aria-selected", String(on));
      });
      panels.forEach(function (panel) {
        panel.classList.toggle("is-active", panel.id === "room-" + id);
      });
    }
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { show(tab.dataset.room); });
    });
    const hash = location.hash.replace("#", "");
    show(hash && root.querySelector('[data-room="' + hash + '"]') ? hash : "main");
  }

  function initMenu() {
    const search = document.getElementById("menu-search");
    const chips = document.querySelectorAll("[data-cat-filter]");
    if (!chips.length && !search) return;
    function apply() {
      const q = (search && search.value || "").trim().toLowerCase();
      const cat = (document.querySelector("[data-cat-filter].is-on") || {}).dataset;
      const active = cat ? cat.catFilter : "all";
      document.querySelectorAll(".menu-group").forEach(function (group) {
        let visible = 0;
        group.querySelectorAll(".dish").forEach(function (dish) {
          const text = dish.textContent.toLowerCase();
          const okCat = active === "all" || group.dataset.cat === active;
          const ok = okCat && (!q || text.indexOf(q) !== -1);
          dish.hidden = !ok;
          if (ok) visible += 1;
        });
        group.hidden = visible === 0;
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-on"); });
        chip.classList.add("is-on");
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);
  }

  const shots = [];
  let shotIndex = 0;
  function initGallery() {
    document.querySelectorAll(".shot").forEach(function (shot, index) {
      shots.push(shot);
      shot.addEventListener("click", function () { openShot(index); });
    });
    document.getElementById("lightbox-prev")?.addEventListener("click", function () {
      openShot((shotIndex - 1 + shots.length) % shots.length);
    });
    document.getElementById("lightbox-next")?.addEventListener("click", function () {
      openShot((shotIndex + 1) % shots.length);
    });
  }
  function openShot(index) {
    if (!shots.length) return;
    ensureDialogs();
    shotIndex = index;
    const shot = shots[shotIndex];
    const img = shot.querySelector("img");
    const dialog = document.getElementById("lightbox");
    const full = dialog.querySelector("img");
    full.src = shot.dataset.full || img.src;
    full.alt = img.alt;
    const cap = shot.querySelector("[data-es]") || shot.querySelector(".cap");
    document.getElementById("lightbox-cap").textContent = cap ? cap.textContent : img.alt;
    if (!dialog.open) dialog.showModal();
  }

  function initForms() {
    bindRequestForm("vip-form", "vip", function (fd) {
      const lang = getLang();
      const pack = fd.get("package");
      const ref = refCode();
      const text = lang === "en"
        ? "Hello Tropical VIP, I would like a table.\nRef: " + ref +
          "\nPackage: " + pack + "\nDate: " + fd.get("date") + " " + fd.get("time") +
          "\nGuests: " + fd.get("guests") + "\nName: " + fd.get("name") +
          "\nPhone: " + fd.get("phone") + "\nEmail: " + fd.get("email") +
          (fd.get("notes") ? "\nNotes: " + fd.get("notes") : "") +
          "\nPlease confirm availability. 18+."
        : "Hola Tropical VIP, quiero reservar mesa.\nRef: " + ref +
          "\nPack: " + pack + "\nFecha: " + fd.get("date") + " " + fd.get("time") +
          "\nPersonas: " + fd.get("guests") + "\nNombre: " + fd.get("name") +
          "\nTeléfono: " + fd.get("phone") + "\nEmail: " + fd.get("email") +
          (fd.get("notes") ? "\nNotas: " + fd.get("notes") : "") +
          "\nConfirmad disponibilidad, por favor. +18.";
      return { ref: ref, event: pack, when: fd.get("date") + " " + fd.get("time"), ticket: "VIP", qty: fd.get("guests"), total: t("from"), text: text, name: fd.get("name") };
    });
    bindRequestForm("table-form", "restaurant", function (fd) {
      const lang = getLang();
      const ref = refCode();
      const text = lang === "en"
        ? "Hello Tropical Fusion, I would like a table.\nRef: " + ref +
          "\nDate: " + fd.get("date") + " " + fd.get("time") +
          "\nGuests: " + fd.get("guests") + "\nName: " + fd.get("name") +
          "\nPhone: " + fd.get("phone") + "\nEmail: " + fd.get("email") +
          (fd.get("notes") ? "\nNotes: " + fd.get("notes") : "")
        : "Hola Tropical Fusion, quiero reservar mesa.\nRef: " + ref +
          "\nFecha: " + fd.get("date") + " " + fd.get("time") +
          "\nPersonas: " + fd.get("guests") + "\nNombre: " + fd.get("name") +
          "\nTeléfono: " + fd.get("phone") + "\nEmail: " + fd.get("email") +
          (fd.get("notes") ? "\nNotas: " + fd.get("notes") : "");
      return { ref: ref, event: "Tropical Fusion", when: fd.get("date") + " " + fd.get("time"), ticket: "Mesa", qty: fd.get("guests"), total: "—", text: text };
    });
    bindRequestForm("contact-form", "club", function (fd) {
      const lang = getLang();
      const ref = refCode();
      const text = lang === "en"
        ? "Hello Tropical.\nRef: " + ref + "\nTopic: " + fd.get("topic") +
          "\nName: " + fd.get("name") + "\nPhone: " + fd.get("phone") + "\nEmail: " + fd.get("email") +
          "\nMessage: " + fd.get("message")
        : "Hola Tropical.\nRef: " + ref + "\nTema: " + fd.get("topic") +
          "\nNombre: " + fd.get("name") + "\nTeléfono: " + fd.get("phone") + "\nEmail: " + fd.get("email") +
          "\nMensaje: " + fd.get("message");
      return { ref: ref, event: fd.get("topic"), when: "", ticket: "Contacto", qty: 1, total: "—", text: text };
    });
  }

  function bindRequestForm(id, phoneKey, build) {
    const form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const error = form.querySelector(".form-error");
      const fd = new FormData(form);
      if (fd.get("company")) {
        error.hidden = false;
        error.textContent = t("errHoney");
        return;
      }
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      if (name.length < 2 || !validEmail(email) || !validPhone(phone)) {
        error.hidden = false;
        error.textContent = t("errFields");
        return;
      }
      if (form.querySelector('[name="date"]') && !fd.get("date")) {
        error.hidden = false;
        error.textContent = t("errDate");
        return;
      }
      error.hidden = true;
      const data = build(fd);
      data.name = name;
      const books = loadBooks();
      books.unshift({ ref: data.ref, event: data.event, when: data.when, ticket: data.ticket, qty: data.qty, total: data.total });
      saveBooks(books);
      const success = form.parentElement.querySelector(".form-success") || form.nextElementSibling;
      if (success && success.classList.contains("form-success")) {
        showPrepared(success, form, data, PHONES[phoneKey]);
        window.open(waLink(PHONES[phoneKey], data.text), "_blank", "noopener");
      }
    });
  }

  function initTicketForm() {
    document.addEventListener("click", function (event) {
      const closer = event.target.closest("[data-close]");
      if (closer) {
        const dialog = closer.closest("dialog");
        if (dialog) dialog.close();
      }
      const ticket = event.target.closest("[data-ticket]");
      if (ticket) {
        event.preventDefault();
        openTicket(ticket.dataset.ticket);
      }
      const step = event.target.closest("[data-step]");
      if (step && document.getElementById("qty-out")) {
        const out = document.getElementById("qty-out");
        const next = Math.min(10, Math.max(1, Number(out.textContent) + Number(step.dataset.step)));
        out.textContent = String(next);
        updateTotal();
      }
    });
    document.addEventListener("change", function (event) {
      if (event.target.name === "ticket") updateTotal();
    });
    document.addEventListener("submit", function (event) {
      if (event.target.id !== "ticket-form") return;
      event.preventDefault();
      const form = event.target;
      const error = document.getElementById("ticket-error");
      const fd = new FormData(form);
      if (fd.get("company")) {
        error.hidden = false;
        error.textContent = t("errHoney");
        return;
      }
      if (!fd.get("age")) {
        error.hidden = false;
        error.textContent = t("errAge");
        return;
      }
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      if (name.length < 2 || !validEmail(email) || !validPhone(phone)) {
        error.hidden = false;
        error.textContent = t("errFields");
        return;
      }
      const chosen = selectedTicket();
      const qty = currentQty();
      const dialog = document.getElementById("ticket-dialog");
      const data = {
        ref: refCode(),
        event: document.getElementById("ticket-title").textContent,
        when: document.getElementById("ticket-kicker").textContent,
        ticket: t(chosen.name),
        qty: qty,
        total: money(chosen.price * qty),
        name: name,
        email: email,
        phone: phone,
        notes: String(fd.get("notes") || "").trim()
      };
      data.text = messageForTicket(data);
      const books = loadBooks();
      books.unshift({ ref: data.ref, event: data.event, when: data.when, ticket: data.ticket, qty: data.qty, total: data.total });
      saveBooks(books);
      showPrepared(document.getElementById("ticket-success"), form, data, PHONES.club);
      window.open(waLink(PHONES.club, data.text), "_blank", "noopener");
      dialog.dataset.event = dialog.dataset.event;
    });
  }

  function initCookies() {
    let seen = false;
    try { seen = localStorage.getItem(COOKIE_KEY) === "1"; } catch (e) {}
    if (seen) return;
    const bar = document.createElement("div");
    bar.className = "cookie";
    bar.innerHTML = '<p data-ui="cookie"></p><div class="stack-btns"><a class="btn btn--ghost btn--small" href="legal.html" data-ui="moreInfo"></a><button type="button" class="btn btn--gold btn--small" id="cookie-ok" data-ui="accept"></button></div>';
    document.body.appendChild(bar);
    applyLang(getLang());
    document.getElementById("cookie-ok").addEventListener("click", function () {
      try { localStorage.setItem(COOKIE_KEY, "1"); } catch (e) {}
      bar.remove();
    });
  }

  function initDates() {
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      if (!input.min) input.min = new Date().toISOString().slice(0, 10);
    });
  }

  document.addEventListener("keydown", function (event) {
    const dialog = document.getElementById("lightbox");
    if (!dialog || !dialog.open) return;
    if (event.key === "ArrowLeft") openShot((shotIndex - 1 + shots.length) % shots.length);
    if (event.key === "ArrowRight") openShot((shotIndex + 1) % shots.length);
  });

  const initial = (function () {
    try {
      return localStorage.getItem(LANG_KEY) || document.documentElement.dataset.lang || ((navigator.language || "").toLowerCase().startsWith("en") ? "en" : "es");
    } catch (e) {
      return "es";
    }
  })();
  applyLang(initial);
  initHeader();
  initReveal();
  initEvents();
  renderCalendar();
  initRooms();
  initMenu();
  ensureDialogs();
  initGallery();
  initForms();
  initTicketForm();
  initCookies();
  initDates();
  updateBookBadge();
  updateCountdown();
  setInterval(updateCountdown, 30000);
  setInterval(updateStatus, 60000);
})();
