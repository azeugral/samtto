/* SAMTTO v2  -  scripts compartilhados (sem dependências) */
(() => {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Config: o que o cliente pode trocar ---------- */
  const CONFIG = {
    // CONFIRMAR: número com DDI (ex.: "5592999999999"). Com ele o WhatsApp abre com a mensagem pronta.
    // Sem ele o site copia a mensagem e abre o link da bio (wa.me/message não aceita texto).
    whatsappNumber: "5592994075239", // (92) 9 9407-5239, passado em 12/10
    whatsappMessageLink: "https://wa.me/message/QKAXWV63BVPDD1",
    // Upload da imagem de referência (preset unsigned do Cloudinary). CONFIRMAR: criar o preset.
    // mesma conta e preset unsigned do Maronez (LRGZ); as imagens do Samtto ficam com o prefixo samtto/
    cloudinaryCloud: "waj86oks",
    cloudinaryPreset: "orcamento-maronez",
    cloudinaryFolder: "samtto",
  };
  window.SAMTTO = CONFIG;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Toast em janelinha ---------- */
  let toastEl, toastT;
  const toast = (html, ms = 4200) => {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast win"; toastEl.setAttribute("role", "status");
      toastEl.innerHTML = '<div class="win__bar"><span>aviso.txt</span></div><div class="win__body"></div>';
      document.body.appendChild(toastEl);
    }
    toastEl.querySelector(".win__body").innerHTML = html;
    requestAnimationFrame(() => toastEl.classList.add("is-on"));
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), ms);
  };

  /* ---------- WhatsApp ---------- */
  const waHref = (text) => CONFIG.whatsappNumber
    ? `https://wa.me/${CONFIG.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`
    : CONFIG.whatsappMessageLink;
  const copia = async (text) => { try { await navigator.clipboard.writeText(text); return true; } catch (e) { return false; } };
  const abreWa = async (text) => {
    if (!CONFIG.whatsappNumber && text) {
      if (await copia(text)) toast("Mensagem copiada. Cola no chat que abriu.");
    }
    window.open(waHref(text), "_blank", "noopener");
  };
  $$("[data-wa]").forEach((a) => {
    a.href = waHref(a.dataset.wa || ""); a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", (e) => {
      if (CONFIG.whatsappNumber || !a.dataset.wa) return;
      e.preventDefault(); abreWa(a.dataset.wa);
    });
  });

  /* ---------- Menu iniciar ---------- */
  const startBtn = $("[data-start]");
  const startRoot = $("[data-start-root]");
  if (startBtn && startRoot) {
    const set = (open) => {
      document.body.classList.toggle("start-open", open);
      startBtn.setAttribute("aria-expanded", String(open));
      startBtn.classList.toggle("is-down", open);
      if (open) $(".start__link", startRoot)?.focus({ preventScroll: true });
    };
    startBtn.addEventListener("click", () => set(!document.body.classList.contains("start-open")));
    startRoot.addEventListener("click", (e) => { if (e.target === startRoot) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    $$(".start__link", startRoot).forEach((a) => a.addEventListener("click", () => set(false)));
    const here = location.pathname.split("/").pop() || "index.html";
    $$(".start__link", startRoot).forEach((a) => { if ((a.getAttribute("href") || "").split("?")[0] === here) a.setAttribute("aria-current", "page"); });
  }

  /* ---------- Desktop da home: ícones aparecem em sequência ---------- */
  $$("[data-desktop]").forEach((d) => setTimeout(() => d.classList.add("is-in"), 120));

  /* ---------- Sanfonas com altura animada ---------- */
  $$(".tg").forEach((d) => {
    const summary = $("summary", d);
    const body = $(".tg__body", d);
    let running = null;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (reduceMotion) { d.open = !d.open; return; }
      if (running) running.cancel();
      const from = d.offsetHeight;
      d.style.overflow = "hidden";
      if (d.open) {
        running = d.animate([{ height: `${from}px` }, { height: `${summary.offsetHeight + 1}px` }], { duration: 260, easing: "cubic-bezier(.65,0,.35,1)" });
        running.onfinish = () => { d.open = false; d.style.overflow = ""; running = null; };
      } else {
        d.open = true;
        const to = d.offsetHeight;
        running = d.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 340, easing: "cubic-bezier(.16,.84,.32,1)" });
        body.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 60, fill: "backwards" });
        running.onfinish = () => { d.style.overflow = ""; running = null; };
      }
    });
  });

  /* ---------- Cartões das grades aparecem ao rolar ---------- */
  const revealCards = () => {
    const cards = $$(".grid .card:not(.is-in)");
    if (reduceMotion || !("IntersectionObserver" in window)) { cards.forEach((c) => c.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const i = cards.indexOf(en.target) % 4;
        setTimeout(() => en.target.classList.add("is-in"), i * 50);
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: .08 });
    cards.forEach((c) => io.observe(c));
    // o que já nasce na tela entra sem esperar o observer
    setTimeout(() => cards.forEach((c) => { const r = c.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0 && r.height) c.classList.add("is-in"); }), 150);
  };

  /* ---------- Acervo: filtros por estilo + "ver mais" ---------- */
  const grid = $("[data-grid]");
  if (grid) {
    const filters = $$(".filter");
    const items = $$(".card", grid);
    const moreBtn = $("[data-more]");
    const STEP = 12;
    let cat = "all", shown = STEP;
    const cols = () => getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const render = (animate) => {
      const match = items.filter((it) => cat === "all" || (it.dataset.cat || "").split(" ").includes(cat));
      const limit = cat === "all" ? shown : match.length;
      items.forEach((it) => { it.classList.add("is-hidden"); it.classList.remove("is-solo"); });
      const vis = match.slice(0, limit);
      vis.forEach((it, i) => {
        it.classList.remove("is-hidden");
        if (animate && !reduceMotion) { it.classList.remove("is-in"); void it.offsetWidth; setTimeout(() => it.classList.add("is-in"), (i % 8) * 40); }
      });
      if (cols() === 2 && vis.length % 2 === 1) vis[vis.length - 1].classList.add("is-solo");
      if (moreBtn) moreBtn.parentElement.hidden = limit >= match.length;
    };
    filters.forEach((btn) => {
      const c = btn.dataset.filter;
      const n = c === "all" ? items.length : items.filter((it) => (it.dataset.cat || "").split(" ").includes(c)).length;
      const sup = document.createElement("sup"); sup.textContent = n; btn.appendChild(sup);
      btn.addEventListener("click", () => {
        filters.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        cat = c; shown = STEP; render(true);
      });
    });
    moreBtn?.addEventListener("click", () => { shown += STEP; render(false); revealCards(); });
    render(false);
    let lastCols = cols();
    window.addEventListener("resize", () => { if (cols() !== lastCols) { lastCols = cols(); render(false); } }, { passive: true });
  }
  revealCards();

  /* ---------- Imagem ampliada em janela ---------- */
  const lb = $(".lightbox");
  if (lb) {
    const img = $("[data-lb-img]", lb);
    const cta = $("[data-lb-cta]", lb);
    const reserve = $("[data-lb-reserve]", lb);
    let current = null;
    $$("[data-grid] .card, [data-flash] .card").forEach((c) => {
      c.addEventListener("click", () => {
        current = c;
        const src = $("img", c);
        img.src = src.dataset.full || src.src; img.alt = src.alt;
        const nome = c.dataset.title || "";
        $("[data-lb-title]", lb).textContent = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "_") + ".png";
        $("[data-lb-name]", lb).textContent = nome;
        $("[data-lb-sub]", lb).textContent = c.dataset.sub || "";
        if (cta) cta.href = `orcamento.html?ref=${encodeURIComponent(nome)}`;
        lb.showModal();
      });
    });
    reserve?.addEventListener("click", (e) => {
      e.preventDefault();
      abreWa(`Salve Samtto! Quero reservar um desenho disponível: ${current?.dataset.reserve || ""}. Qual o valor e as datas livres?`);
    });
    $("[data-close]", lb).addEventListener("click", () => lb.close());
    lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("dlg")) lb.close(); });
  }

  /* ---------- Carinha: pupilas seguem o mouse/dedo, clique faz pular ---------- */
  $$(".face").forEach((face) => {
    const looks = $$(".face__look", face);
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, lastMove = 0;
    const onScreen = () => { const r = face.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
    const step = () => {
      x += (tx - x) * .22; y += (ty - y) * .22;
      looks.forEach((l) => { l.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`; });
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .05 ? requestAnimationFrame(step) : 0;
    };
    const aim = (dx, dy) => {
      const size = face.offsetWidth;
      // o olho é estreito embaixo: desce menos do que sobe
      tx = dx * size * .03; ty = dy * size * (dy > 0 ? .009 : .016);
      cancelAnimationFrame(raf); raf = requestAnimationFrame(step);
    };
    const lookAt = (px, py) => {
      const r = face.getBoundingClientRect();
      const a = Math.atan2(py - (r.top + r.height * .45), px - (r.left + r.width / 2));
      const d = Math.min(1, Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height * .45)) / (r.width * .7));
      aim(Math.cos(a) * d, Math.sin(a) * d);
    };
    if (!reduceMotion) {
      window.addEventListener("pointermove", (e) => { lastMove = Date.now(); if (onScreen()) lookAt(e.clientX, e.clientY); }, { passive: true });
      window.addEventListener("touchstart", (e) => { const t = e.touches[0]; lastMove = Date.now(); if (t && onScreen()) lookAt(t.clientX, t.clientY); }, { passive: true });
      setInterval(() => { if (onScreen() && Date.now() - lastMove > 2500) aim(Math.random() * 2 - 1, Math.random() * 1.4 - .7); }, 2200);
    }
    face.addEventListener("click", (e) => {
      lookAt(e.clientX, e.clientY);
      face.classList.remove("is-mad"); void face.offsetWidth; face.classList.add("is-mad");
      if (navigator.vibrate) navigator.vibrate(25);
    });
    face.addEventListener("animationend", (e) => { if (e.animationName === "face-hop") face.classList.remove("is-mad"); });
  });


  /* ---------- Loja: compra fecha no WhatsApp (só existe com LOJA = True) ---------- */
  const co = $(".checkout");
  if (co) {
    const form = $("#form-compra", co);
    const money = (v) => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: v % 1 ? 2 : 0 });
    let item = { name: "", price: 0, qty: 1 };
    const qtyOut = $("[data-co-qty]", co);
    const envioFields = $$("[data-envio]", co);
    const syncEntrega = () => {
      const envio = $('input[name="entrega"]:checked', form).value === "envio";
      envioFields.forEach((f) => { f.hidden = !envio; });
      $("#co-cep", form).required = envio;
    };
    $$("[data-buy]").forEach((b) => b.addEventListener("click", () => {
      item = { name: b.dataset.name, price: Number(b.dataset.price) || 0, qty: 1 };
      $("[data-co-name]", co).textContent = item.name;
      $("[data-co-price]", co).textContent = money(item.price);
      const img = $("[data-co-img]", co); img.src = b.dataset.img; img.alt = item.name;
      const sizes = (b.dataset.sizes || "").split(",").filter(Boolean);
      const box = $("[data-co-sizes]", co);
      box.hidden = !sizes.length;
      $(".chips", box).innerHTML = sizes.map((t, i) => `<label class="chip"><input type="radio" name="tam" value="${t}"${i === 0 ? " checked" : ""}><span class="btn">${t}</span></label>`).join("");
      form.reset(); qtyOut.textContent = "1";
      if (sizes.length) $('input[name="tam"]', box).checked = true;
      $$(".is-invalid", form).forEach((f) => f.classList.remove("is-invalid"));
      syncEntrega();
      co.showModal();
    }));
    $$("[data-q]", co).forEach((b) => b.addEventListener("click", () => {
      item.qty = Math.min(20, Math.max(1, item.qty + Number(b.dataset.q))); qtyOut.textContent = item.qty;
    }));
    $$('input[name="entrega"]', form).forEach((r) => r.addEventListener("change", syncEntrega));
    $("#co-cep", form).addEventListener("input", (e) => {
      const d = e.target.value.replace(/\D/g, "").slice(0, 8);
      e.target.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
    });
    $("[data-close]", co).addEventListener("click", () => co.close());
    co.addEventListener("click", (e) => { if (e.target === co || e.target.classList.contains("dlg")) co.close(); });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      $$("[required]", form).forEach((f) => {
        const bad = f.id === "co-cep" ? f.value.replace(/\D/g, "").length !== 8 : !f.value.trim();
        f.closest(".field").classList.toggle("is-invalid", bad); if (bad) ok = false;
      });
      if (!ok) { $(".is-invalid input", form)?.focus(); return; }
      const tam = $('input[name="tam"]:checked', form)?.value;
      const envio = $('input[name="entrega"]:checked', form).value === "envio";
      const cidade = $("#co-cidade", form).value.trim();
      const linhas = [
        "Salve Samtto! Quero comprar pela loja do site:",
        `${item.qty}x ${item.name}${tam ? ` (${tam})` : ""} · ${money(item.price * item.qty)}`,
        envio ? `Entrega: envio para o CEP ${$("#co-cep", form).value}${cidade ? `, ${cidade}` : ""}` : "Entrega: retiro no Estúdio Maniva",
        `Nome: ${$("#co-nome", form).value.trim()}`,
        envio ? "Me passa o frete e a forma de pagamento?" : "Me passa a forma de pagamento?",
      ];
      co.close();
      await abreWa(linhas.join("\n"));
    });
  }

  /* ---------- Agende: imagem de referência ---------- */
  const reduz = async (file, type = "image/jpeg") => {
    const bitmap = await createImageBitmap(file);
    const s = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const cv = document.createElement("canvas");
    cv.width = Math.round(bitmap.width * s); cv.height = Math.round(bitmap.height * s);
    cv.getContext("2d").drawImage(bitmap, 0, 0, cv.width, cv.height);
    return new Promise((r) => cv.toBlob(r, type, .85));
  };
  const enviaImagem = async (file) => {
    if (!CONFIG.cloudinaryCloud || !CONFIG.cloudinaryPreset) return "";
    try {
      const dados = new FormData();
      dados.append("file", await reduz(file), `samtto-${Date.now()}.jpg`);
      dados.append("upload_preset", CONFIG.cloudinaryPreset);
      if (CONFIG.cloudinaryFolder) dados.append("folder", CONFIG.cloudinaryFolder);
      const resp = await fetch(`https://api.cloudinary.com/v1_1/${CONFIG.cloudinaryCloud}/image/upload`, { method: "POST", body: dados });
      return resp.ok ? ((await resp.json()).secure_url || "") : "";
    } catch (e) { return ""; }
  };

  const form = $("#form-orcamento");
  if (form) {
    const up = $("[data-upload]", form);
    const upInput = $(".upload__input", up);
    const upPrev = $(".upload__preview", up);
    const zone = $(".upload__zone", up);
    let refFile = null;
    const setFile = (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      refFile = file;
      $("img", upPrev).src = URL.createObjectURL(file);
      $(".upload__name", upPrev).textContent = file.name;
      upPrev.hidden = false; zone.hidden = true;
    };
    upInput.addEventListener("change", () => setFile(upInput.files[0]));
    $(".upload__remove", upPrev).addEventListener("click", () => { refFile = null; upInput.value = ""; upPrev.hidden = true; zone.hidden = false; });
    const params = new URLSearchParams(location.search);
    if (params.get("ref")) $("#ref", form).value = `Referência do site: ${params.get("ref")}`;
    if (params.get("tipo")) { const r = $(`input[name="tipo"][value="${params.get("tipo")}"]`, form); if (r) r.checked = true; }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let ok = true;
      $$("[required]", form).forEach((f) => { const bad = !f.value.trim(); f.closest(".field").classList.toggle("is-invalid", bad); if (bad) ok = false; });
      if (!ok) { $(".is-invalid input, .is-invalid textarea", form)?.focus(); return; }
      const v = (id) => ($(`#${id}`, form)?.value || "").trim();
      const pick = (n) => $(`input[name="${n}"]:checked`, form)?.value || "";
      const linhas = ["Salve Samtto! Vim pelo site.", pick("tipo") && `Quero: ${pick("tipo")}`, `Ideia: ${v("ideia")}`,
        v("regiao") && `Região: ${v("regiao")}`, pick("tamanho") && `Tamanho: ${pick("tamanho")}`, v("ref"), `Nome: ${v("nome")}`];
      const junta = (a) => a.filter(Boolean).join("\n");
      const hint = $("[data-hint]", form);
      const avisa = (t) => { hint.textContent = t; hint.hidden = false; };
      if (!refFile) {
        await abreWa(junta(linhas));
        if (!CONFIG.whatsappNumber) avisa("Mensagem copiada: é só colar no chat que abriu.");
        return;
      }
      const botao = $('button[type="submit"]', form);
      const rotulo = botao.innerHTML;
      botao.disabled = true; botao.textContent = "Enviando imagem...";
      const link = await enviaImagem(refFile);
      botao.disabled = false; botao.innerHTML = rotulo;
      if (link) {
        await abreWa(junta([...linhas, `Imagem de referência: ${link}`]));
        avisa(CONFIG.whatsappNumber ? "Pronto. A imagem foi junto, como link." : "Mensagem copiada com o link da imagem: cola no chat.");
        return;
      }
      await abreWa(junta([...linhas, "Tenho uma imagem de referência, mando aqui em seguida."]));
      avisa("Conversa aberta. Anexa a imagem pelo clipe do WhatsApp.");
    });
  }
})();
