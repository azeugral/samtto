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
    // Aparece no topo da home. Vazio = some.
    agenda: "Agenda de outubro aberta|vagas de 01 a 10/10",
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

  /* ---------- Status da agenda ---------- */
  document.querySelectorAll("[data-agenda]").forEach((el) => {
    if (!CONFIG.agenda) { el.remove(); return; }
    const [a, b] = CONFIG.agenda.split("|");
    el.querySelector("[data-agenda-a]").textContent = a;
    el.querySelector("[data-agenda-b]").textContent = b || "";
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
  };
  // flyers de uma mesma grade entram em sequência
  document.querySelectorAll(".flyers").forEach((g) => g.querySelectorAll(".flyer").forEach((f, i) => { f.dataset.i = i % 4; }));
  watch(".reveal");
  watch(".scan", { threshold: .3, parent: true });
  watch(".wire", { threshold: .5 });
  watch(".flyers .flyer", { stagger: 90, threshold: .12 });

  /* ---------- Título em colagem: entra batendo; tocar re-cola as letras ---------- */
  document.querySelectorAll(".ransom").forEach((r) => {
    requestAnimationFrame(() => setTimeout(() => r.classList.add("is-in"), 120));
    setTimeout(() => r.classList.add("is-settled"), 1400);
    r.addEventListener("click", () => {
      if (reduceMotion) return;
      r.querySelectorAll(".ransom__c").forEach((c) => {
        const deg = (Math.random() * 16 - 8).toFixed(1);
        c.style.setProperty("--rot", `${deg}deg`);
      });
    });
  });

  /* ---------- Mascote: olhos seguem o dedo/mouse, tocar faz rosnar ---------- */
  document.querySelectorAll(".mascot").forEach((m) => {
    const pupils = m.querySelectorAll(".m-pupil");
    const look = (x, y) => {
      const r = m.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * .45;
      const a = Math.atan2(y - cy, x - cx);
      const d = Math.min(1, Math.hypot(x - cx, y - cy) / 300);
      pupils.forEach((p) => { p.style.transform = `translate(${(Math.cos(a) * 3.2 * d).toFixed(2)}px, ${(Math.sin(a) * 2.6 * d).toFixed(2)}px)`; });
    };
    if (!reduceMotion) {
      window.addEventListener("pointermove", (e) => look(e.clientX, e.clientY), { passive: true });
      window.addEventListener("touchstart", (e) => { const t = e.touches[0]; if (t) look(t.clientX, t.clientY); }, { passive: true });
    }
    m.addEventListener("click", () => {
      m.classList.remove("is-mad"); void m.offsetWidth; m.classList.add("is-mad");
      if (navigator.vibrate) navigator.vibrate(30);
    });
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

  /* ---------- Disponíveis: reservar uma folha ---------- */
  document.querySelectorAll("[data-reserve]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      abreWa(`Salve Samtto! Quero reservar um desenho disponível: ${b.dataset.reserve}. Qual o valor e as datas livres?`);
    });
  });

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

  /* ---------- Loja: mini-checkout que fecha no WhatsApp ---------- */
  const co = document.querySelector(".checkout");
  if (co) {
    const form = co.querySelector("form");
    const money = (v) => "R$ " + v.toLocaleString("pt-BR");
    let item = { name: "", price: 0, sizes: "" };
    document.querySelectorAll("[data-order]").forEach((btn) => {
      btn.addEventListener("click", () => {
        item = { name: btn.dataset.name, price: Number(btn.dataset.price) || 0, sizes: btn.dataset.sizes || "" };
        co.querySelector("[data-co-name]").textContent = item.name;
        co.querySelector("[data-co-price]").textContent = item.price ? money(item.price) : "valor a combinar";
        const im = co.querySelector("[data-co-img]"); im.src = btn.dataset.img; im.alt = item.name;
        const sizes = co.querySelector("[data-co-sizes]");
        sizes.hidden = !item.sizes;
        sizes.querySelector(".chips").innerHTML = item.sizes.split(",").filter(Boolean).map((s, i) =>
          `<label class="chip"><input type="radio" name="tam" value="${s}"${i === 0 ? " checked" : ""}><span>${s}</span></label>`).join("");
        form.reset();
        if (item.sizes) sizes.querySelector("input").checked = true;
        form.querySelectorAll(".is-invalid").forEach((f) => f.classList.remove("is-invalid"));
        co.showModal();
      });
    });
    co.querySelector(".x-close").addEventListener("click", () => co.close());
    co.addEventListener("click", (e) => { if (e.target === co || e.target.classList.contains("checkout__in")) co.close(); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = form.querySelector("#co-nome");
      const bad = !nome.value.trim();
      nome.closest(".field").classList.toggle("is-invalid", bad);
      if (bad) { nome.focus(); return; }
      const tam = form.querySelector('input[name="tam"]:checked')?.value;
      const cidade = form.querySelector("#co-cidade").value.trim();
      const msg = [
        `Salve Samtto! Quero: ${item.name}` + (item.price ? ` (${money(item.price)})` : ""),
        tam && `Tamanho: ${tam}`,
        `Nome: ${nome.value.trim()}`,
        cidade && `Cidade: ${cidade}`,
        "Como faço o pagamento e a retirada/envio?",
      ].filter(Boolean).join("\n");
      abreWa(msg);
      co.close();
    });
  }

  /* ---------- Copia a imagem de referência ---------- */
  const copiaImagem = async (file) => {
    try {
      if (!navigator.clipboard || !window.ClipboardItem) return false;
      const bitmap = await createImageBitmap(file);
      const s = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      const cv = document.createElement("canvas");
      cv.width = Math.round(bitmap.width * s); cv.height = Math.round(bitmap.height * s);
      cv.getContext("2d").drawImage(bitmap, 0, 0, cv.width, cv.height);
      const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
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
      const msg = [
        "Salve Samtto! Vim pelo site.",
        pick("tipo") && `Quero: ${pick("tipo")}`,
        `Ideia: ${v("ideia")}`,
        v("regiao") && `Região: ${v("regiao")}`,
        pick("tamanho") && `Tamanho: ${pick("tamanho")}`,
        v("ref"),
        refFile && "Tenho uma imagem de referência, mando aqui em seguida.",
        `Nome: ${v("nome")}`,
      ].filter(Boolean).join("\n");

      const hint = form.querySelector("[data-hint]");
      await abreWa(msg);
      if (refFile && hint) {
        const okImg = CONFIG.whatsappNumber ? await copiaImagem(refFile) : false;
        hint.textContent = okImg
          ? "Conversa aberta. A imagem está copiada: cola no chat."
          : CONFIG.whatsappNumber ? "Conversa aberta. Anexa a imagem pelo clipe do WhatsApp." : "Mensagem copiada: cola no chat e depois anexa a imagem pelo clipe.";
        hint.hidden = false;
      } else if (!CONFIG.whatsappNumber && hint) {
        hint.textContent = "Mensagem copiada: é só colar no chat que abriu.";
        hint.hidden = false;
      }
    });
  }
})();
