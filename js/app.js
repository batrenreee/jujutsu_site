/* ===========================================================
   app.js — Ortak altyapı: tema, vurgu rengi, navigasyon,
   scroll-reveal ve yardımcı fonksiyonlar.
   Tüm sayfalarda ilk yüklenen script budur. window.JJK üzerinden
   sayfa scriptleri yardımcıları kullanır.
   =========================================================== */
(function () {
  "use strict";

  const ACCENTS = [
    { id: "red", hex: "#ff4747", label: "Kırmızı (Sukuna)" },
    { id: "blue", hex: "#4f9dff", label: "Mavi (Gojo)" },
    { id: "purple", hex: "#a855f7", label: "Mor (Sınırsızlık)" },
    { id: "green", hex: "#22c55e", label: "Yeşil (Şifa)" },
  ];

  const NAV = [
    { page: "home", href: "index.html", label: "Ana Sayfa" },
    { page: "manga", href: "manga.html", label: "Manga" },
    { page: "characters", href: "karakterler.html", label: "Karakterler" },
    { page: "quiz", href: "test.html", label: "Karakter Testi" },
    { page: "game", href: "game.html", label: "Düello" },
  ];

  /* ---- Yardımcılar ---- */
  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const n = parseInt(h, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`${path} yüklenemedi (${res.status})`);
    return res.json();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Dış bağlantıyı sistem tarayıcısında aç (Tauri opener), yoksa normal aç.
  async function openExternal(url) {
    try {
      if (window.__TAURI__ && window.__TAURI__.opener) {
        await window.__TAURI__.opener.openUrl(url);
        return;
      }
    } catch (e) {
      console.warn("opener başarısız, fallback:", e);
    }
    window.open(url, "_blank", "noopener");
  }

  let toastTimer;
  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* ---- Tema & Vurgu ---- */
  const THEMES = {
    dark: { label: "Karanlık", icon: "◐" },
    light: { label: "Aydınlık", icon: "☀" },
    system: { label: "Sistem", icon: "◑" },
  };

  function applyTheme(mode) {
    const safeMode = THEMES[mode] ? mode : "dark";
    const resolved = safeMode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : safeMode;
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-mode", safeMode);
    localStorage.setItem("jjk-theme-mode", safeMode);
    localStorage.setItem("jjk-theme", resolved);
    const button = document.querySelector("#themeToggle");
    if (button) {
      button.querySelector(".theme-icon").textContent = THEMES[safeMode].icon;
      button.querySelector(".theme-label").textContent = THEMES[safeMode].label;
      button.setAttribute("aria-label", `Tema: ${THEMES[safeMode].label}`);
    }
    document.querySelectorAll("[data-theme-option]").forEach((option) => {
      option.classList.toggle("selected", option.dataset.themeOption === safeMode);
      option.setAttribute("aria-checked", option.dataset.themeOption === safeMode ? "true" : "false");
    });
  }

  function applyAccent(hex) {
    document.documentElement.style.setProperty("--accent", hex);
    document.documentElement.style.setProperty("--accent-rgb", hexToRgb(hex));
    localStorage.setItem("jjk-accent", hex);
    document.querySelectorAll(".swatch").forEach((s) => {
      s.classList.toggle("selected", s.dataset.hex === hex);
    });
  }

  /* ---- Üst bar + Footer enjeksiyonu ---- */
  function renderChrome() {
    const active = document.body.dataset.page || "home";

    const topbarHost = document.querySelector("#topbar");
    if (topbarHost) {
      const links = NAV.map(
        (n) =>
          `<a href="${n.href}" class="${n.page === active ? "active" : ""}">${n.label}</a>`
      ).join("");

      const swatches = ACCENTS.map(
        (a) =>
          `<button class="swatch" title="${a.label}" data-hex="${a.hex}" style="background:${a.hex}"></button>`
      ).join("");

      topbarHost.outerHTML = `
        <header class="topbar">
          <div class="brand"><span class="dot"></span> JJK Merkez</div>
          <button class="icon-btn menu-toggle" id="menuToggle" aria-label="Menü">☰</button>
          <nav class="nav-links" id="navLinks">${links}</nav>
          <div class="topbar-actions">
            <div class="accent-picker">${swatches}</div>
            <div class="theme-control">
              <button class="theme-toggle" id="themeToggle" aria-label="Tema seç" aria-haspopup="true" aria-expanded="false"><span class="theme-icon">◐</span><span class="theme-label">Karanlık</span><span class="theme-chevron">⌄</span></button>
              <div class="theme-menu" id="themeMenu" role="menu" aria-label="Görünüm teması">
                <button type="button" role="menuitemradio" data-theme-option="dark"><span>◐</span><b>Karanlık</b><small>Gece görünümü</small></button>
                <button type="button" role="menuitemradio" data-theme-option="light"><span>☀</span><b>Aydınlık</b><small>Gündüz görünümü</small></button>
                <button type="button" role="menuitemradio" data-theme-option="system"><span>◑</span><b>Sistem</b><small>Windows ile eşleş</small></button>
              </div>
            </div>
          </div>
        </header>`;
    }

    const footerHost = document.querySelector("#footer");
    if (footerHost) {
      footerHost.outerHTML = `
        <footer>
          <p>&copy; 2026 Jujutsu Kaisen Merkez — Hayran projesi | Hazırlayan: Eren</p>
        </footer>`;
    }
  }

  /* ---- Olaylar ---- */
  function wireEvents() {
    const themeBtn = document.querySelector("#themeToggle");
    const themeMenu = document.querySelector("#themeMenu");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const open = themeMenu.classList.toggle("open");
        themeBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    document.querySelectorAll("[data-theme-option]").forEach((option) => {
      option.addEventListener("click", () => {
        applyTheme(option.dataset.themeOption);
        themeMenu.classList.remove("open");
        themeBtn.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".theme-control")) {
        themeMenu?.classList.remove("open");
        themeBtn?.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        themeMenu?.classList.remove("open");
        themeBtn?.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll(".swatch").forEach((s) => {
      s.addEventListener("click", () => applyAccent(s.dataset.hex));
    });

    const menuBtn = document.querySelector("#menuToggle");
    const nav = document.querySelector("#navLinks");
    if (menuBtn && nav) {
      menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
    }
  }

  /* ---- Scroll Reveal ---- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
  }

  // Dinamik eklenen .reveal öğeleri için tekrar tarama
  function observeReveal(root) {
    const els = (root || document).querySelectorAll(".reveal:not(.visible)");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
  }

  /* ---- Açılış ---- */
  function boot() {
    renderChrome();
    applyTheme(localStorage.getItem("jjk-theme-mode") || localStorage.getItem("jjk-theme") || "dark");
    applyAccent(localStorage.getItem("jjk-accent") || "#ff4747");
    wireEvents();
    initReveal();
  }

  // window.JJK API
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (localStorage.getItem("jjk-theme-mode") === "system") applyTheme("system");
  });

  window.JJK = { fetchJSON, escapeHtml, openExternal, toast, observeReveal, applyTheme, ACCENTS, THEMES };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
