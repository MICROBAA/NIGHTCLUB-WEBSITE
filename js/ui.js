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

  function init() {
    initProgress();
    initBrand();
    initScramble();
    initCounters();
    initTilt();
    initParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
