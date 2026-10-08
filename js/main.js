/* SAMTTO  -  scripts compartilhados (sem dependências) */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Config: tudo que o cliente pode trocar fica aqui ---------- */
  const CONFIG = {
    // CONFIRMAR: número com DDI (ex.: "5592999999999"). Com ele, o WhatsApp abre com a mensagem pronta.
    // Sem ele, o site copia a mensagem e abre o link da bio (wa.me/message não aceita texto).
    whatsappNumber: "",
    whatsappMessageLink: "https://wa.me/message/QKAXWV63BVPDD1",
    instagram: "https://www.instagram.com/ssamtto/",
    estudio: "https://www.instagram.com/manivatattoo/",
    // Upload da imagem de referência (preset unsigned do Cloudinary). CONFIRMAR: criar o preset.
    // Vazio = a pessoa anexa a imagem pelo clipe do WhatsApp.
    cloudinaryCloud: "",
    cloudinaryPreset: "",
  };
  window.SAMTTO = CONFIG;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast ---------- */
  let toastEl, toastT;
  const toast = (msg, ms = 4200) => {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast"; toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add("is-on"));
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), ms);
  };

  /* ---------- WhatsApp ---------- */
  const waHref = (text) => {
    if (CONFIG.whatsappNumber) {
      const q = text ? `?text=${encodeURIComponent(text)}` : "";
      return `https://wa.me/${CONFIG.whatsappNumber}${q}`;
    }
    return CONFIG.whatsappMessageLink;
  };
  const copia = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; }
  };
  // Abre a conversa. Sem número, copia a mensagem antes para a pessoa colar.
  const abreWa = async (text) => {
    if (!CONFIG.whatsappNumber && text) {
      const ok = await copia(text);
      if (ok) toast("Mensagem copiada. Cola no chat que abriu.");
    }
    window.open(waHref(text), "_blank", "noopener");
  };
  window.SAMTTO.abreWa = abreWa;

  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waHref(a.dataset.wa || "");
    a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", (e) => {
      if (CONFIG.whatsappNumber || !a.dataset.wa) return;
      e.preventDefault();
      abreWa(a.dataset.wa);
    });
  });

  /* ---------- Logo: se a imagem não existir, cai no monograma ---------- */
  document.querySelectorAll("img[data-logo]").forEach((img) => {
    const swap = () => {
      const fb = document.createElement("span");
      const inBadge = img.classList.contains("hero__logo");
      fb.className = inBadge ? "hero__badge--text" : "brand__mark brand__mark--fallback";
      fb.textContent = "S";
      fb.setAttribute("aria-hidden", "true");
      img.replaceWith(fb);
    };
    if (img.complete && img.naturalWidth === 0) swap();
    else img.addEventListener("error", swap, { once: true });
  });

  /* ---------- Nav: página atual ---------- */
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav__link, .menu__link").forEach((a) => {
    if (a.getAttribute("href").split("/").pop() === here) a.setAttribute("aria-current", "page");
  });

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    const label = toggle.querySelector(".nav-toggle__label");
    const set = (open) => {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      label.textContent = open ? "Fechar" : "Menu";
    };
    toggle.addEventListener("click", () => set(!document.body.classList.contains("menu-open")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    document.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  /* ---------- Fundo: as chamas andam com a rolagem (uma var CSS, um rAF) ---------- */
  if (!reduceMotion) {
    const root = document.documentElement;
    let ticking = false;
    const upd = () => { root.style.setProperty("--sy", String(Math.round(window.scrollY))); ticking = false; };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---------- Reveals (IntersectionObserver) ---------- */
  const watch = (sel, opts = {}) => {
    const els = document.querySelectorAll(sel);
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target._scan || en.target;
        const delay = opts.stagger ? (Number(el.dataset.i) || 0) * opts.stagger : 0;
        setTimeout(() => el.classList.add("is-in"), delay);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: opts.threshold ?? .15 });
    // clip-path zerado esconde o elemento do observer: nesses casos observa o pai
    els.forEach((el) => {
      if (opts.parent) { el.parentElement._scan = el; io.observe(el.parentElement); } else io.observe(el);
    });
    // o que já nasce na tela entra sem depender do observer
    setTimeout(() => els.forEach((el) => {
      const r = (opts.parent ? el.parentElement : el).getBoundingClientRect();
      if (r.top < innerHeight * .92 && r.bottom > 0) el.classList.add("is-in");
    }), 120);
  };
  // flyers de uma mesma grade entram em sequência
  document.querySelectorAll(".flyers").forEach((g) => g.querySelectorAll(".flyer").forEach((f, i) => { f.dataset.i = i % 4; }));
  watch(".reveal");
  watch(".scan", { threshold: .3, parent: true });
  watch(".wire", { threshold: .5 });
  watch(".flyers .flyer", { stagger: 90, threshold: .12 });

  /* ---------- Marca do hero: entra depois do primeiro quadro ---------- */
  document.querySelectorAll(".wordmark").forEach((w) => {
    setTimeout(() => w.classList.add("is-in"), 150);
  });

  /* ---------- Carinha: pupilas seguem o mouse/dedo, clique faz pular ---------- */
  document.querySelectorAll(".face").forEach((face) => {
    const looks = face.querySelectorAll(".face__look");
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, lastMove = 0;
    const onScreen = () => { const r = face.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    const step = () => {
      x += (tx - x) * .22; y += (ty - y) * .22;
      looks.forEach((l) => { l.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`; });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .05 ? requestAnimationFrame(step) : 0;
    };
    const aim = (dx, dy) => {
      const size = face.offsetWidth;
      // o olho é estreito embaixo: desce menos do que sobe pra pupila não sumir no contorno
      tx = dx * size * .03; ty = dy * size * (dy > 0 ? .009 : .016);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(step);
    };
    // aponta para um ponto da tela (-1..1 em cada eixo, saturando longe da cara)
    const lookAt = (px, py) => {
      const r = face.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * .45;
      const a = Math.atan2(py - cy, px - cx);
      const d = Math.min(1, Math.hypot(px - cx, py - cy) / (r.width * .7));
      aim(Math.cos(a) * d, Math.sin(a) * d);
    };
    if (!reduceMotion) {
      window.addEventListener("pointermove", (e) => { lastMove = Date.now(); if (onScreen()) lookAt(e.clientX, e.clientY); }, { passive: true });
      window.addEventListener("touchstart", (e) => { const t = e.touches[0]; lastMove = Date.now(); if (t && onScreen()) lookAt(t.clientX, t.clientY); }, { passive: true });
      // sem mouse (celular parado): olhadas de canto de vez em quando
      setInterval(() => {
        if (!onScreen() || Date.now() - lastMove < 2500) return;
        aim(Math.random() * 2 - 1, Math.random() * 1.4 - .7);
      }, 2200);
    }
    face.addEventListener("click", (e) => {
      lookAt(e.clientX, e.clientY);
      face.classList.remove("is-mad"); void face.offsetWidth; face.classList.add("is-mad");
      if (navigator.vibrate) navigator.vibrate(25);
    });
    face.addEventListener("animationend", (e) => { if (e.animationName === "face-hop") face.classList.remove("is-mad"); });
  });

  /* ---------- Portfólio: filtros ---------- */
  const filters = document.querySelectorAll(".filter");
  const items = document.querySelectorAll("[data-grid] .flyer");
  if (filters.length && items.length) {
    filters.forEach((btn) => {
      const cat = btn.dataset.filter;
      const n = cat === "all" ? items.length : [...items].filter((it) => (it.dataset.cat || "").split(" ").includes(cat)).length;
      const sup = document.createElement("sup"); sup.textContent = n; btn.appendChild(sup);
      btn.addEventListener("click", () => {
        filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        items.forEach((it) => {
          const match = cat === "all" || (it.dataset.cat || "").split(" ").includes(cat);
          it.classList.toggle("is-hidden", !match);
          if (match && !reduceMotion) { it.classList.remove("is-in"); void it.offsetWidth; it.classList.add("is-in"); }
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  const lb = document.querySelector(".lightbox");
  if (lb) {
    const img = lb.querySelector("[data-lb-img]");
    const title = lb.querySelector("[data-lb-title]");
    const sub = lb.querySelector("[data-lb-sub]");
    const cta = lb.querySelector("[data-lb-cta]");
    document.querySelectorAll("[data-grid] .flyer:not(.flyer--empty)").forEach((w) => {
      w.addEventListener("click", (e) => {
        e.preventDefault();
        const src = w.querySelector("img");
        img.src = src.dataset.full || src.src; img.alt = src.alt;
        title.textContent = w.dataset.title || "";
        sub.textContent = w.dataset.sub || "";
        cta.href = `orcamento.html?ref=${encodeURIComponent(w.dataset.title || "")}`;
        lb.showModal();
      });
    });
    lb.querySelector(".x-close").addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lightbox__in")) lb.close(); });
  }

  /* ---------- FAQ: abre e fecha com altura animada ---------- */
  document.querySelectorAll(".faq details").forEach((d) => {
    const summary = d.querySelector("summary");
    const body = d.querySelector(".faq__a");
    let running = null;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (reduceMotion) { d.open = !d.open; return; }
      if (running) running.cancel();
      const from = d.offsetHeight;
      d.style.overflow = "hidden";
      if (d.open) {
        running = d.animate([{ height: `${from}px` }, { height: `${summary.offsetHeight + 2}px` }], { duration: 360, easing: "cubic-bezier(.65,0,.35,1)" });
        running.onfinish = () => { d.open = false; d.style.overflow = ""; running = null; };
      } else {
        d.open = true;
        const to = d.offsetHeight;
        running = d.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 460, easing: "cubic-bezier(.16,.84,.32,1)" });
        body.animate([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 400, delay: 60, easing: "cubic-bezier(.16,.84,.32,1)", fill: "backwards" });
        running.onfinish = () => { d.style.overflow = ""; running = null; };
      }
    });
  });

  /* ---------- Reduz a foto (celular manda 4 MB ou mais) ---------- */
  const reduz = async (file, type = "image/jpeg") => {
    const bitmap = await createImageBitmap(file);
    const s = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const cv = document.createElement("canvas");
    cv.width = Math.round(bitmap.width * s); cv.height = Math.round(bitmap.height * s);
    cv.getContext("2d").drawImage(bitmap, 0, 0, cv.width, cv.height);
    return new Promise((r) => cv.toBlob(r, type, .85));
  };

  /* ---------- Sobe a imagem e devolve o link (vai dentro da mensagem) ---------- */
  const enviaImagem = async (file) => {
    if (!CONFIG.cloudinaryCloud || !CONFIG.cloudinaryPreset) return "";
    try {
      const dados = new FormData();
      dados.append("file", await reduz(file), `samtto-${Date.now()}.jpg`);
      dados.append("upload_preset", CONFIG.cloudinaryPreset);
      const resp = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG.cloudinaryCloud}/image/upload`, { method: "POST", body: dados });
      if (!resp.ok) return "";
      return (await resp.json()).secure_url || "";
    } catch (e) { return ""; }
  };

  /* ---------- Copia a imagem de referência ---------- */
  const copiaImagem = async (file) => {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) return false;
      const blob = await reduz(file, "image/png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      return true;
    } catch (e) { return false; }
  };

  /* ---------- Orçamento: monta a mensagem e abre o WhatsApp ---------- */
  const form = document.querySelector("#form-orcamento");
  if (form) {
    const up = form.querySelector("[data-upload]");
    const upInput = up?.querySelector(".upload__input");
    const upPrev = up?.querySelector(".upload__preview");
    const zone = up?.querySelector(".upload__zone");
    let refFile = null;
    if (upInput) {
      const setFile = (file) => {
        if (!file || !file.type.startsWith("image/")) return;
        refFile = file;
        upPrev.querySelector("img").src = URL.createObjectURL(file);
        upPrev.querySelector(".upload__name").textContent = file.name;
        upPrev.hidden = false; zone.hidden = true;
      };
      upInput.addEventListener("change", () => setFile(upInput.files[0]));
      upPrev.querySelector(".upload__remove").addEventListener("click", () => { refFile = null; upInput.value = ""; upPrev.hidden = true; zone.hidden = false; });
      ["dragenter", "dragover"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); up.classList.add("is-drag"); }));
      ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); up.classList.remove("is-drag"); }));
      zone.addEventListener("drop", (e) => setFile(e.dataTransfer.files[0]));
    }
    const params = new URLSearchParams(location.search);
    if (params.get("ref")) form.querySelector("#ref").value = `Referência do site: ${params.get("ref")}`;
    if (params.get("tipo")) { const r = form.querySelector(`input[name="tipo"][value="${params.get("tipo")}"]`); if (r) r.checked = true; }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll("[required]").forEach((f) => {
        const bad = !f.value.trim();
        f.closest(".field").classList.toggle("is-invalid", bad);
        if (bad) ok = false;
      });
      if (!ok) { form.querySelector(".is-invalid input, .is-invalid textarea")?.focus(); return; }
      const v = (id) => (form.querySelector(`#${id}`)?.value || "").trim();
      const pick = (n) => form.querySelector(`input[name="${n}"]:checked`)?.value || "";
      const linhas = [
        "Salve Samtto! Vim pelo site.",
        pick("tipo") && `Quero: ${pick("tipo")}`,
        `Ideia: ${v("ideia")}`,
        v("regiao") && `Região: ${v("regiao")}`,
        pick("tamanho") && `Tamanho: ${pick("tamanho")}`,
        v("ref"),
        `Nome: ${v("nome")}`,
      ];
      const hint = form.querySelector("[data-hint]");
      const avisa = (t) => { if (hint) { hint.textContent = t; hint.hidden = false; } };

      const junta = (a) => a.filter(Boolean).join("\n");

      if (!refFile) {
        await abreWa(junta(linhas));
        if (!CONFIG.whatsappNumber) avisa("Mensagem copiada: é só colar no chat que abriu.");
        return;
      }

      // Com imagem: sobe e manda o link dentro da mensagem
      const botao = form.querySelector('button[type="submit"]');
      const rotulo = botao.innerHTML;
      botao.disabled = true; botao.textContent = "Enviando imagem...";
      const link = await enviaImagem(refFile);
      botao.disabled = false; botao.innerHTML = rotulo;
      if (link) {
        await abreWa(junta([...linhas, `Imagem de referência: ${link}`]));
        avisa(CONFIG.whatsappNumber ? "Pronto. A imagem foi junto, como link." : "Mensagem copiada com o link da imagem: cola no chat.");
        return;
      }
      // Sem upload configurado ou falha de rede: a pessoa anexa no chat
      await abreWa(junta([...linhas, "Tenho uma imagem de referência, mando aqui em seguida."]));
      const copiou = CONFIG.whatsappNumber ? await copiaImagem(refFile) : false;
      avisa(copiou ? "Conversa aberta. A imagem está copiada: cola no chat."
        : "Conversa aberta. Anexa a imagem pelo clipe do WhatsApp.");
    });
  }
})();
