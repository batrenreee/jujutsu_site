/* manga.js — Cilt 0–30 kütüphanesi, arama, filtreleme ve yerel okuma takibi. */
(function () {
  "use strict";

  const STORAGE_KEY = "jjk-read-volumes-v2";
  let data = null;
  let volumes = [];
  let read = {};
  let activeFilter = "all";
  let query = "";

  function loadProgress() {
    try { read = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { read = {}; }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(read));
  }

  function setRead(id, value) {
    if (value) read[id] = true;
    else delete read[id];
    saveProgress();
    renderStats();
    renderVolumes();
  }

  function renderStats() {
    const total = volumes.length;
    const done = volumes.filter((volume) => read[volume.id]).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    const stats = document.querySelector("#trackerStats");
    const ring = document.querySelector("#mangaProgressRing");

    if (stats) {
      stats.innerHTML = `
        <div class="stat-box"><div class="num">${total}</div><div class="lbl">Toplam cilt</div></div>
        <div class="stat-box"><div class="num">${done}</div><div class="lbl">Okunan</div></div>
        <div class="stat-box"><div class="num">${total - done}</div><div class="lbl">Sırada</div></div>
        <div class="stat-box"><div class="num">271</div><div class="lbl">Ana bölüm</div></div>`;
    }

    if (ring) {
      ring.style.setProperty("--progress", `${percent * 3.6}deg`);
      ring.querySelector("strong").textContent = `${percent}%`;
    }
  }

  function visibleVolumes() {
    return volumes.filter((volume) => {
      const isRead = !!read[volume.id];
      if (activeFilter === "read" && !isRead) return false;
      if (activeFilter === "unread" && isRead) return false;
      if (!query) return true;
      const haystack = `${volume.number} ${volume.title} ${volume.arc} ${volume.chapters} ${volume.summary}`.toLocaleLowerCase("tr");
      return haystack.includes(query);
    });
  }

  function renderVolumes() {
    const host = document.querySelector("#volumeGrid");
    if (!host) return;
    const list = visibleVolumes();

    if (!list.length) {
      host.innerHTML = `<div class="manga-empty"><strong>Eşleşen cilt bulunamadı.</strong><span>Arama kelimesini veya filtreyi değiştir.</span></div>`;
      return;
    }

    host.innerHTML = list.map((volume) => `
      <article class="volume-card ${read[volume.id] ? "is-read" : ""}" data-id="${volume.id}">
        <button class="volume-cover-button" data-action="details" aria-label="Cilt ${volume.number} detaylarını aç">
          <img src="${JJK.escapeHtml(volume.cover)}" alt="Jujutsu Kaisen Cilt ${volume.number} kapağı" loading="lazy" />
          <span class="volume-number">CİLT ${String(volume.number).padStart(2, "0")}</span>
          <span class="volume-read-mark" aria-hidden="true">✓</span>
          <span class="volume-cover-shine"></span>
        </button>
        <div class="volume-card-body">
          <span class="volume-arc">${JJK.escapeHtml(volume.arc)}</span>
          <h3>${JJK.escapeHtml(volume.title)}</h3>
          <p>Bölüm ${JJK.escapeHtml(volume.chapters)}</p>
          <div class="volume-card-actions">
            <button class="volume-link" data-action="details">Detaylar</button>
            <button class="volume-check ${read[volume.id] ? "checked" : ""}" data-action="toggle" aria-pressed="${read[volume.id] ? "true" : "false"}">${read[volume.id] ? "✓ Okundu" : "+ Okundu"}</button>
          </div>
        </div>
      </article>`).join("");
  }

  function openModal(id) {
    const volume = volumes.find((item) => item.id === id);
    const overlay = document.querySelector("#mangaModal");
    if (!volume || !overlay) return;

    overlay.querySelector(".modal").innerHTML = `
      <button class="modal-close manga-modal-close" aria-label="Kapat">&times;</button>
      <div class="manga-modal-layout">
        <div class="manga-modal-cover">
          <img src="${JJK.escapeHtml(volume.cover)}" alt="Jujutsu Kaisen Cilt ${volume.number} kapağı" />
          <span>CİLT ${String(volume.number).padStart(2, "0")}</span>
        </div>
        <div class="manga-modal-content">
          <span class="manga-modal-kicker">${JJK.escapeHtml(volume.arc)}</span>
          <h2>${JJK.escapeHtml(volume.title)}</h2>
          <div class="manga-modal-meta">
            <div><small>BÖLÜMLER</small><strong>${JJK.escapeHtml(volume.chapters)}</strong></div>
            <div><small>SIRA</small><strong>${volume.number === 0 ? "Ön Hikâye" : `${volume.number} / 30`}</strong></div>
            <div><small>DURUM</small><strong>${read[id] ? "Okundu" : "Okunmadı"}</strong></div>
          </div>
          <p>${JJK.escapeHtml(volume.summary)}</p>
          <div class="manga-modal-actions">
            <button class="btn" data-modal-action="reader">Okumaya devam et ↗</button>
            <button class="btn btn-outline" data-modal-action="preview">Cildi önizle ↗</button>
            <button class="btn btn-outline" data-modal-action="toggle">${read[id] ? "✓ Okundu" : "Okundu işaretle"}</button>
          </div>
          <div class="manga-modal-legal">Resmî okuyucudaki bölüm erişimi ve ücretsiz önizleme miktarı ülkeye veya üyelik durumuna göre değişebilir.</div>
        </div>
      </div>`;

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    overlay.querySelector(".manga-modal-close").addEventListener("click", closeModal);
    overlay.querySelector('[data-modal-action="reader"]').addEventListener("click", () => JJK.openExternal(data.vizReaderUrl));
    overlay.querySelector('[data-modal-action="preview"]').addEventListener("click", () => JJK.openExternal(volume.vizUrl));
    overlay.querySelector('[data-modal-action="toggle"]').addEventListener("click", () => {
      setRead(id, !read[id]);
      closeModal();
      openModal(id);
    });
  }

  function closeModal() {
    const overlay = document.querySelector("#mangaModal");
    if (!overlay) return;
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function bindEvents() {
    document.querySelector("#volumeGrid").addEventListener("click", (event) => {
      const action = event.target.closest("[data-action]");
      const card = event.target.closest(".volume-card");
      if (!action || !card) return;
      if (action.dataset.action === "toggle") setRead(card.dataset.id, !read[card.dataset.id]);
      else openModal(card.dataset.id);
    });

    document.querySelector("#mangaSearch").addEventListener("input", (event) => {
      query = event.target.value.trim().toLocaleLowerCase("tr");
      renderVolumes();
    });

    document.querySelector("#mangaFilters").addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeFilter = button.dataset.filter;
      document.querySelectorAll("#mangaFilters [data-filter]").forEach((item) => item.classList.toggle("selected", item === button));
      renderVolumes();
    });

    document.querySelector("#resetTracker").addEventListener("click", () => {
      read = {};
      saveProgress();
      renderStats();
      renderVolumes();
      JJK.toast("Manga okuma ilerlemesi sıfırlandı.");
    });

    document.querySelector("#openMangaPlus").addEventListener("click", () => JJK.openExternal(data.mangaPlusUrl));
    document.querySelector("#openVizReader").addEventListener("click", () => JJK.openExternal(data.vizReaderUrl));

    const overlay = document.querySelector("#mangaModal");
    overlay.addEventListener("click", (event) => { if (event.target === overlay) closeModal(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
  }

  async function init() {
    const host = document.querySelector("#volumeGrid");
    if (!host) return;
    try {
      data = await JJK.fetchJSON("data/manga.json");
      volumes = data.volumes;
      loadProgress();
      renderStats();
      renderVolumes();
      bindEvents();
    } catch (error) {
      host.innerHTML = `<p class="empty">Manga kütüphanesi yüklenemedi: ${JJK.escapeHtml(error.message)}</p>`;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
