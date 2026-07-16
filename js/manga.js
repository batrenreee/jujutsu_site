/* manga.js — Cilt 0–30 kütüphanesi, arama, filtreleme ve yerel okuma takibi. */
(function () {
  "use strict";

  const STORAGE_KEY = "jjk-read-volumes-v2";
  let data = null;
  let volumes = [];
  let read = {};
  let activeFilter = "all";
  let query = "";

  const STORY_ARCS = [
    { id:"zero", code:"00", title:"Lanetli Çocuk", subtitle:"Ön Hikâye", volumeIds:["vol-0"], chapters:"0.1–0.4", note:"Yuta ve Rika'nın laneti, ana seriden önce Tokyo Jujutsu Lisesi'nin kapısını aralar." },
    { id:"origin", code:"01", title:"Sukuna'nın Kabı", subtitle:"Başlangıç", volumeIds:["vol-1","vol-2"], chapters:"1–16", note:"Yuji'nin tek bir seçimi büyücüler dünyasının dengesini sonsuza dek değiştirir." },
    { id:"mahito", code:"02", title:"Ruhun Şekli", subtitle:"Mahito ile Yüzleşme", volumeIds:["vol-3","vol-4"], chapters:"17–34", note:"Nanami, Junpei ve Mahito; Yuji'ye lanetlerin gerçek yüzünü gösterir." },
    { id:"kyoto", code:"03", title:"Kardeş Okullar", subtitle:"Kyoto Etkinliği", volumeIds:["vol-5","vol-6"], chapters:"35–52", note:"Rekabet bir istilaya dönüşürken Yuji, Kara Şimşek'in ritmini yakalar." },
    { id:"painting", code:"04", title:"Ölüm Tabloları", subtitle:"İtaatin Kökeni", volumeIds:["vol-7"], chapters:"53–61", note:"Yasohachi Köprüsü, üç öğrenciyi lanetli kardeşlerin geçmişine bağlar." },
    { id:"inventory", code:"05", title:"Gizli Envanter", subtitle:"Geçmişin Kırılması", volumeIds:["vol-8","vol-9"], chapters:"62–79", note:"Gojo, Geto ve Toji'nin kesişen kaderleri bugünün çatışmasını hazırlar." },
    { id:"shibuya", code:"06", title:"Shibuya Olayı", subtitle:"31 Ekim", volumeIds:["vol-10","vol-11","vol-12","vol-13","vol-14","vol-15","vol-16"], chapters:"80–142", note:"Bir gecelik operasyon, jujutsu toplumunun bütün kurallarını parçalar." },
    { id:"preparation", code:"07", title:"Kusursuz Hazırlık", subtitle:"Fırtına Sonrası", volumeIds:["vol-17"], chapters:"143–152", note:"İnfaz emri, Tengen'in açıklaması ve Zenin klanındaki geri dönüşsüz hesaplaşma." },
    { id:"culling", code:"08", title:"Eleme Oyunu", subtitle:"Koloniler", volumeIds:["vol-18","vol-19","vol-20","vol-21","vol-22","vol-23","vol-24"], chapters:"153–217", note:"Eski ve yeni büyücüler, Kenjaku'nun ölümcül kolonilerinde karşı karşıya gelir." },
    { id:"shinjuku", code:"09", title:"Shinjuku Hesaplaşması", subtitle:"En Güçlüler", volumeIds:["vol-25","vol-26","vol-27","vol-28","vol-29","vol-30"], chapters:"218–271", note:"Gojo ve Sukuna ile başlayan son kuşatma, serinin kaderini belirler." }
  ];

  function loadProgress() {
    try { read = JSON.parse(JJKAuth.storage.getItem(STORAGE_KEY)) || {}; }
    catch { read = {}; }
  }

  function saveProgress() {
    JJKAuth.storage.setItem(STORAGE_KEY, JSON.stringify(read));
  }

  function setRead(id, value) {
    if (value) read[id] = true;
    else delete read[id];
    saveProgress();
    renderStats();
    renderVolumes();
  }

  function renderTimeline() {
    const host = document.querySelector("#mangaTimeline");
    if (!host) return;
    const firstUnread = volumes.find((volume) => !read[volume.id])?.id;

    host.innerHTML = STORY_ARCS.map((arc, index) => {
      const arcVolumes = arc.volumeIds.map((id) => volumes.find((volume) => volume.id === id)).filter(Boolean);
      const completed = arcVolumes.filter((volume) => read[volume.id]).length;
      const percent = arcVolumes.length ? Math.round((completed / arcVolumes.length) * 100) : 0;
      const target = arcVolumes.find((volume) => !read[volume.id]) || arcVolumes[0];
      const done = completed === arcVolumes.length && arcVolumes.length > 0;
      const current = !done && arc.volumeIds.includes(firstUnread);
      const state = done ? "done" : current ? "current" : "upcoming";
      const volumeLabel = arcVolumes.length === 1 ? `Cilt ${arcVolumes[0].number}` : `Cilt ${arcVolumes[0]?.number}–${arcVolumes.at(-1)?.number}`;
      return `<article class="timeline-entry ${state}" style="--arc-progress:${percent}%" data-arc="${arc.id}">
        <div class="timeline-rail"><span><b>${arc.code}</b></span><i></i></div>
        <div class="timeline-card">
          <div class="timeline-card-top"><span>${JJK.escapeHtml(arc.subtitle)}</span><b>${JJK.escapeHtml(arc.chapters)}</b></div>
          <h3>${JJK.escapeHtml(arc.title)}</h3>
          <p>${JJK.escapeHtml(arc.note)}</p>
          <div class="timeline-progress"><i></i><span>${completed}/${arcVolumes.length} cilt</span></div>
          <button type="button" data-timeline-volume="${target?.id || ""}">${done ? "Tekrar aç" : current ? "Devam et" : "Dosyayı aç"}<span>${volumeLabel} →</span></button>
        </div>
        ${current ? '<em>SIRADAKİ DOSYA</em>' : ''}
      </article>`;
    }).join("");
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
    renderTimeline();
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
    document.querySelector("#mangaTimeline").addEventListener("click", (event) => {
      const button = event.target.closest("[data-timeline-volume]");
      if (!button || !button.dataset.timelineVolume) return;
      openModal(button.dataset.timelineVolume);
    });

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
      const requested = new URLSearchParams(location.search).get("volume");
      if (requested && volumes.some((volume) => volume.id === requested)) openModal(requested);
    } catch (error) {
      host.innerHTML = `<p class="empty">Manga kütüphanesi yüklenemedi: ${JJK.escapeHtml(error.message)}</p>`;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
