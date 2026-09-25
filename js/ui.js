/* VOLTA — modern UI layer: progress, hero motion, counters, tilt, parallax.
   All effects are progressive: they respect prefers-reduced-motion and skip on unsupported browsers. */
(function () {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;

  function initProgress() {
    if (document.getElementById("scroll-progress")) return;
    const bar = document.createElement("div");
    bar.id = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    let raf = 0;
    function paint() {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    window.addEventListener("resize", function () {
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  }

  function initBrand() {
    const brand = document.querySelector(".hero__brand");
    if (!brand || reduce || brand.dataset.split) return;
    const text = brand.textContent.trim();
    if (!text) return;
    brand.dataset.split = "1";
    brand.setAttribute("aria-label", text);
    brand.textContent = "";
    Array.prototype.forEach.call(text, function (ch, i) {
      const span = document.createElement("span");
      span.className = "brand-letter";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--i", String(i));
      span.textContent = ch === " " ? "\u00a0" : ch;
      brand.appendChild(span);
    });
  }

  function initScramble() {
    const el = document.querySelector(".hero__tag");
    if (!el || reduce || el.dataset.scramble) return;
    el.dataset.scramble = "1";
    const finalText = el.textContent;
    const pool = "!<>-_/[]{}=+*^?#·";
    const dur = 750;
    const start = performance.now();
    function frame(now) {
      const p = Math.min(1, (now - start) / dur);
      const keep = Math.floor(finalText.length * p);
      let out = finalText.slice(0, keep);
      for (let i = keep; i < finalText.length; i++) {
        out += finalText[i] === " " ? " " : pool[Math.floor(Math.random() * pool.length)];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    const nodes = document.querySelectorAll("[data-count]");
    if (!nodes.length || reduce || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        const pad = parseInt(el.dataset.pad || "0", 10);
        const prefix = el.dataset.prefix || "";
        const t0 = performance.now();
        const dur = 950;
        function frame(now) {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          let value = String(Math.round(target * eased));
          if (pad) value = value.padStart(pad, "0");
          el.textContent = prefix + value;
          if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  function initTilt() {
    if (!fine || reduce) return;
    document.querySelectorAll(".next-card, .room-card, .feature-event, .pass").forEach(function (card) {
      if (card.dataset.tilt) return;
      card.dataset.tilt = "1";
      card.classList.add("tilt-ready");
      card.addEventListener("pointermove", function (event) {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(750px) rotateX(" + (-y * 5).toFixed(2) +
          "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  function initParallax() {
    if (reduce) return;
    const layers = document.querySelectorAll(".hero__media, .page-hero__media");
    if (!layers.length) return;
    let raf = 0;
    function paint() {
      raf = 0;
      layers.forEach(function (layer) {
        const rect = layer.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const shift = Math.min(90, window.scrollY * 0.14);
        layer.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
      });
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  }


  function initSpotlight() {
    if (!fine || reduce) return;
    const selector = ".event-card, .room-card, .night-card, .night-pick, .package, .dish, .book-item, .next-card, .shot";
    let raf = 0;
    let pending = null;
    function paint() {
      raf = 0;
      if (!pending) return;
      const target = pending.target.closest(selector);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      target.classList.add("is-spot");
      target.style.setProperty("--mx", (pending.clientX - rect.left).toFixed(0) + "px");
      target.style.setProperty("--my", (pending.clientY - rect.top).toFixed(0) + "px");
    }
    document.addEventListener("pointermove", function (event) {
      pending = event;
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
  }

  function splitWords(el) {
    let index = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          const words = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          words.forEach(function (word) {
            if (!word.trim()) { frag.appendChild(document.createTextNode(word)); return; }
            const span = document.createElement("span");
            span.className = "w";
            span.style.setProperty("--w", String(index++));
            span.textContent = word;
            frag.appendChild(span);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("w")) {
          walk(child);
        }
      });
    }
    walk(el);
  }

  function initSplitHeadings() {
    if (reduce || !("IntersectionObserver" in window)) return;
    const heads = document.querySelectorAll(".display");
    if (!heads.length) return;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        entry.target.classList.add("is-split");
      });
    }, { threshold: 0.25 });
    heads.forEach(function (head) {
      if (head.dataset.splitWords) return;
      head.dataset.splitWords = "1";
      splitWords(head);
      head.classList.add("split-armed");
      io.observe(head);
    });
  }

  function initHeaderHide() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    let lastY = window.scrollY;
    let raf = 0;
    function paint() {
      raf = 0;
      const y = window.scrollY;
      const panelOpen = document.getElementById("nav-panel");
      const blocked = panelOpen && panelOpen.classList.contains("is-open");
      if (!blocked && y > 180 && y > lastY + 4) header.classList.add("is-hidden");
      else if (y < lastY - 2 || y <= 180 || blocked) header.classList.remove("is-hidden");
      lastY = y;
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
  }

  function initTopButton() {
    if (document.getElementById("to-top")) return;
    const en = document.documentElement.dataset.lang === "en";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "to-top";
    btn.setAttribute("aria-label", en ? "Back to top" : "Volver arriba");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 19V5m0 0-6 6m6-6 6 6"/></svg>';
    document.body.appendChild(btn);
    let raf = 0;
    function paint() {
      raf = 0;
      btn.classList.toggle("is-show", window.scrollY > 720);
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    paint();
  }

  function initMarqueeVelocity() {
    const track = document.querySelector(".marquee__track");
    if (!track || reduce || track.dataset.vel) return;
    track.dataset.vel = "1";
    let lastY = window.scrollY;
    let skew = 0;
    let raf = 0;
    function loop() {
      const y = window.scrollY;
      const v = y - lastY;
      lastY = y;
      const target = Math.max(-7, Math.min(7, v * 0.45));
      skew += (target - skew) * 0.12;
      track.style.transform = "skewX(" + skew.toFixed(2) + "deg)";
      if (Math.abs(skew) > 0.05 || Math.abs(v) > 0.5) raf = requestAnimationFrame(loop);
      else { track.style.transform = ""; raf = 0; }
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  }

  function initLightbox() {
    const shots = Array.prototype.slice.call(document.querySelectorAll(".shot[data-full]"));
    if (!shots.length || !("HTMLDialogElement" in window) || document.getElementById("lightbox")) return;
    const en = document.documentElement.dataset.lang === "en";
    const box = document.createElement("dialog");
    box.id = "lightbox";
    box.className = "lightbox";
    box.innerHTML =
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<div class="lightbox__bar">' +
      '<span class="lightbox__count"></span>' +
      '<button type="button" class="lightbox__nav" data-dir="-1" aria-label="' + (en ? "Previous" : "Anterior") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button type="button" class="lightbox__nav" data-dir="1" aria-label="' + (en ? "Next" : "Siguiente") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<button type="button" class="lightbox__nav" data-close aria-label="' + (en ? "Close" : "Cerrar") + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      "</div>";
    document.body.appendChild(box);
    const img = box.querySelector("img");
    const cap = box.querySelector("figcaption");
    const count = box.querySelector(".lightbox__count");
    let current = 0;
    let lastFocus = null;
    function show(i) {
      current = (i + shots.length) % shots.length;
      const shot = shots[current];
      img.src = shot.dataset.full;
      img.alt = (shot.querySelector("img") || {}).alt || "";
      cap.textContent = (shot.querySelector(".cap") || {}).textContent || "";
      count.textContent = (current + 1) + " / " + shots.length;
    }
    shots.forEach(function (shot, i) {
      shot.addEventListener("click", function () {
        lastFocus = shot;
        show(i);
        if (!box.open) box.showModal();
      });
    });
    box.addEventListener("click", function (event) {
      if (event.target === box) box.close();
      const dir = event.target.closest("[data-dir]");
      if (dir) show(current + Number(dir.dataset.dir));
      if (event.target.closest("[data-close]")) box.close();
    });
    box.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") show(current - 1);
      if (event.key === "ArrowRight") show(current + 1);
    });
    box.addEventListener("close", function () {
      img.src = "";
      if (lastFocus) lastFocus.focus();
    });
  }

  function init() {
    initProgress();
    initBrand();
    initScramble();
    initCounters();
    initTilt();
    initParallax();
    initSpotlight();
    initSplitHeadings();
    initHeaderHide();
    initTopButton();
    initMarqueeVelocity();
    initLightbox();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
