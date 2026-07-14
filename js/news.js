/* JJK Merkez canlı haber merkezi: uzak akış, çevrimdışı önbellek ve yerel yedek. */
(function () {
  "use strict";

  const REMOTE_FEED_URL = "https://raw.githubusercontent.com/batrenreee/jujutsu_site/main/data/live-news.json";
  const CACHE_KEY = "jjk-live-news-cache-v1";
  const SAVED_KEY = "jjk-saved-news";
  const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000;
  let editorial = [];
  let live = [];
  let liveUpdatedAt = null;
  let ALL = [];
  let featured = null;
  let controlsReady = false;
  let state = { search: "", category: "Tümü", sort: "newest" };
  let saved;

  try {
    const stored = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
    saved = new Set(Array.isArray(stored) ? stored : []);
  } catch {
    saved = new Set();
  }

  function formatDate(iso) {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  }

  function formatDateTime(value) {
    if (!value) return "Henüz güncellenmedi";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Güncelleme zamanı bilinmiyor";
    return date.toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  function persistSaved() {
    localStorage.setItem(SAVED_KEY, JSON.stringify([...saved]));
    document.querySelector("#savedTotal").textContent = saved.size;
  }

  function validNewsItem(item) {
    if (!item || typeof item !== "object") return false;
    if (!["id", "title", "date", "category", "source", "img", "excerpt", "url"].every((key) => typeof item[key] === "string" && item[key].trim())) return false;
    if (!Array.isArray(item.content) || !item.content.every((part) => typeof part === "string")) return false;
    if (!item.img.startsWith("img/") || !/^https:\/\//.test(item.url) || Number.isNaN(Date.parse(`${item.date}T12:00:00Z`))) return false;
    return true;
  }

  function validFeed(payload) {
    if (!payload || typeof payload !== "object" || !Array.isArray(payload.items)) return null;
    return {
      version: Number(payload.version) || 1,
      updatedAt: typeof payload.updatedAt === "string" ? payload.updatedAt : null,
      items: payload.items.filter(validNewsItem).slice(0, 40),
    };
  }

  function visual(news, cls = "") {
    return `<div class="news-visual ${cls}"><img class="news-visual-bg" src="${JJK.escapeHtml(news.img)}" alt="" aria-hidden="true" /><img class="news-visual-main" src="${JJK.escapeHtml(news.img)}" alt="${JJK.escapeHtml(news.title)}" loading="lazy" /></div>`;
  }

  function cardHTML(news) {
    const isSaved = saved.has(news.id);
    const liveBadge = news.auto ? '<span class="auto-news-badge"><i></i> CANLI AKIŞ</span>' : "";
    return `<article class="news-feed-card reveal ${news.auto ? "auto-news" : ""}" data-id="${JJK.escapeHtml(news.id)}" tabindex="0">
      ${visual(news)}
      <div class="news-feed-body">
        <div class="news-card-meta"><span class="news-category">${JJK.escapeHtml(news.category)}</span>${liveBadge}<span>${formatDate(news.date)}</span><span>•</span><span>${Number(news.readTime) || 1} dk okuma</span></div>
        <h3>${JJK.escapeHtml(news.title)}</h3>
        <p>${JJK.escapeHtml(news.excerpt)}</p>
        <div class="news-card-foot"><span>${JJK.escapeHtml(news.source)}</span><button class="save-news ${isSaved ? "saved" : ""}" data-save="${JJK.escapeHtml(news.id)}" aria-label="${isSaved ? "Okuma listesinden çıkar" : "Okuma listesine ekle"}">${isSaved ? "★" : "☆"}</button></div>
      </div>
    </article>`;
  }

  function filtered() {
    const query = state.search.trim().toLocaleLowerCase("tr");
    const list = ALL.filter((news) => (state.category === "Tümü" || news.category === state.category)
      && (!query || [news.title, news.excerpt, news.category, news.source, ...news.content].join(" ").toLocaleLowerCase("tr").includes(query)));
    list.sort((a, b) => state.sort === "oldest"
      ? new Date(a.date) - new Date(b.date)
      : state.sort === "shortest"
        ? (Number(a.readTime) || 1) - (Number(b.readTime) || 1)
        : new Date(b.publishedAt || b.date) - new Date(a.publishedAt || a.date));
    return list;
  }

  function render() {
    const list = filtered();
    const grid = document.querySelector("#newsGrid");
    grid.innerHTML = list.length ? list.map(cardHTML).join("") : '<div class="empty"><strong>Haber bulunamadı</strong><span>Arama kelimesini veya kategoriyi değiştirmeyi dene.</span></div>';
    wireCards(grid);
    JJK.observeReveal(grid);
  }

  function wireCards(root) {
    root.querySelectorAll(".news-feed-card").forEach((card) => {
      card.addEventListener("click", (event) => { if (!event.target.closest(".save-news")) openArticle(card.dataset.id); });
      card.addEventListener("keydown", (event) => {
        if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".save-news")) {
          event.preventDefault();
          openArticle(card.dataset.id);
        }
      });
    });
    root.querySelectorAll(".save-news").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSave(button.dataset.save);
      render();
    }));
  }

  function toggleSave(id) {
    if (saved.has(id)) {
      saved.delete(id);
      JJK.toast("Okuma listesinden çıkarıldı");
    } else {
      saved.add(id);
      JJK.toast("Okuma listene eklendi");
    }
    persistSaved();
  }

  function openArticle(id) {
    const news = ALL.find((item) => item.id === id);
    if (!news) return;
    const overlay = document.querySelector("#newsModal");
    const isSaved = saved.has(id);
    overlay.querySelector(".news-reader").innerHTML = `
      <button class="modal-close" aria-label="Kapat">×</button>
      ${visual(news, "reader-visual")}
      <div class="reader-body">
        <div class="news-card-meta"><span class="news-category">${JJK.escapeHtml(news.category)}</span>${news.auto ? '<span class="auto-news-badge"><i></i> CANLI AKIŞ</span>' : ""}<span>${formatDate(news.date)}</span><span>•</span><span>${Number(news.readTime) || 1} dk okuma</span></div>
        <h2>${JJK.escapeHtml(news.title)}</h2><p class="reader-lead">${JJK.escapeHtml(news.excerpt)}</p>
        <div class="reader-source"><div><span>Kaynak</span><strong>${JJK.escapeHtml(news.source)}</strong></div><span>${news.auto ? "Otomatik canlı akış • Kaynakta doğrula" : "Türkçe özet • JJK Merkez"}</span></div>
        <div class="reader-copy">${news.content.map((paragraph) => `<p>${JJK.escapeHtml(paragraph)}</p>`).join("")}${news.highlights?.length ? `<div class="reader-highlights"><h3>Kısa kısa</h3><ul>${news.highlights.map((item) => `<li>${JJK.escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}</div>
        <div class="reader-actions"><button class="btn save-article ${isSaved ? "saved" : ""}">${isSaved ? "★ Okuma listemde" : "☆ Okuma listesine ekle"}</button><button class="btn btn-outline open-source">Kaynağı aç ↗</button></div>
      </div>`;
    overlay.classList.add("open");
    document.body.classList.add("modal-open");
    overlay.querySelector(".modal-close").addEventListener("click", closeArticle);
    overlay.querySelector(".save-article").addEventListener("click", () => { toggleSave(id); openArticle(id); render(); });
    overlay.querySelector(".open-source").addEventListener("click", () => JJK.openExternal(news.url));
  }

  function closeArticle() {
    document.querySelector("#newsModal").classList.remove("open");
    document.body.classList.remove("modal-open");
  }

  function mergeNews() {
    const editorialUrls = new Set(editorial.map((news) => news.url.replace(/\/$/, "")));
    const uniqueLive = live.filter((news) => !editorialUrls.has(news.url.replace(/\/$/, "")));
    ALL = [...editorial, ...uniqueLive].filter((news, index, list) => list.findIndex((candidate) => candidate.id === news.id) === index);
  }

  function setupFeatured() {
    featured = editorial.find((news) => news.featured) || editorial[0];
    if (!featured) return;
    document.querySelector("#featuredMeta").textContent = `${featured.category.toUpperCase()} • ${formatDate(featured.date)} • ${featured.readTime} DK OKUMA`;
    document.querySelector("#featuredTitle").textContent = featured.title;
    document.querySelector("#featuredExcerpt").textContent = featured.excerpt;
    const button = document.querySelector("#readFeatured");
    button.disabled = false;
    button.addEventListener("click", () => openArticle(featured.id));
  }

  function renderTicker() {
    document.querySelector("#tickerTrack").innerHTML = ALL.slice()
      .sort((a, b) => new Date(b.publishedAt || b.date) - new Date(a.publishedAt || a.date))
      .slice(0, 6)
      .map((news) => `<button data-id="${JJK.escapeHtml(news.id)}"><i></i>${JJK.escapeHtml(news.title)}</button>`)
      .join("");
    document.querySelectorAll("#tickerTrack button").forEach((button) => button.addEventListener("click", () => openArticle(button.dataset.id)));
  }

  function renderCategories() {
    const categories = ["Tümü", ...new Set(ALL.map((news) => news.category))];
    if (!categories.includes(state.category)) state.category = "Tümü";
    document.querySelector("#newsCategories").innerHTML = categories.map((category) => `<button class="news-filter ${category === state.category ? "active" : ""}" data-category="${JJK.escapeHtml(category)}">${JJK.escapeHtml(category)}<span>${category === "Tümü" ? ALL.length : ALL.filter((news) => news.category === category).length}</span></button>`).join("");
    document.querySelectorAll(".news-filter").forEach((button) => button.addEventListener("click", () => {
      state.category = button.dataset.category;
      renderCategories();
      render();
    }));
  }

  function renderSidebar() {
    document.querySelector("#trendingList").innerHTML = ALL.slice()
      .sort((a, b) => (Number(b.popularity) || 0) - (Number(a.popularity) || 0))
      .slice(0, 4)
      .map((news, index) => `<button class="trending-item" data-id="${JJK.escapeHtml(news.id)}"><b>0${index + 1}</b><span>${JJK.escapeHtml(news.title)}<small>${JJK.escapeHtml(news.category)} • ${Number(news.readTime) || 1} dk</small></span></button>`)
      .join("");
    document.querySelectorAll(".trending-item").forEach((button) => button.addEventListener("click", () => openArticle(button.dataset.id)));
  }

  function renderAll() {
    mergeNews();
    document.querySelector("#newsTotal").textContent = ALL.length;
    document.querySelector("#categoryTotal").textContent = new Set(ALL.map((news) => news.category)).size;
    persistSaved();
    renderTicker();
    renderCategories();
    renderSidebar();
    render();
  }

  function setFeedStatus(mode, feedUpdatedAt = null) {
    const stateBox = document.querySelector("#feedState");
    const updated = document.querySelector("#feedUpdatedAt");
    const status = document.querySelector("#feedStatus");
    const labels = {
      live: ["Canlı akış bağlı", "Güvenilir kaynaklar • şimdi kontrol edildi"],
      cache: ["Önbellekten gösteriliyor", "Çevrimdışı yedek aktif"],
      local: ["Yerel arşiv hazır", "Canlı akışa bağlanılıyor"],
      error: ["Bağlantı kurulamadı", "Son kayıtlı haberler gösteriliyor"],
      loading: ["Akış yenileniyor", "Güvenilir kaynaklar kontrol ediliyor"],
    };
    const [label, detail] = labels[mode] || labels.local;
    stateBox.className = `feed-state ${mode}`;
    stateBox.querySelector("span").textContent = label;
    updated.textContent = mode === "live" ? "Az önce kontrol edildi" : formatDateTime(feedUpdatedAt);
    status.textContent = detail;
  }

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      const valid = validFeed(cached?.payload);
      if (!valid || !cached.savedAt || Date.now() - new Date(cached.savedAt).getTime() > MAX_CACHE_AGE) return null;
      return valid;
    } catch {
      return null;
    }
  }

  async function fetchWithTimeout(url, timeout = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function refreshLive({ manual = false } = {}) {
    const button = document.querySelector("#newsRefresh");
    button.disabled = true;
    button.classList.add("loading");
    setFeedStatus("loading");
    try {
      const payload = validFeed(await fetchWithTimeout(`${REMOTE_FEED_URL}?v=${Date.now()}`));
      if (!payload) throw new Error("Geçersiz canlı akış");
      const before = new Set(live.map((news) => news.id));
      live = payload.items;
      liveUpdatedAt = payload.updatedAt;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: new Date().toISOString(), payload }));
      renderAll();
      setFeedStatus("live", payload.updatedAt);
      const added = live.filter((news) => !before.has(news.id)).length;
      if (manual) JJK.toast(added ? `${added} yeni haber bulundu` : "Haberler zaten güncel");
    } catch (error) {
      const cached = readCache();
      if (cached) {
        live = cached.items;
        liveUpdatedAt = cached.updatedAt;
        renderAll();
        setFeedStatus("cache", cached.updatedAt);
      } else {
        setFeedStatus(live.length ? "cache" : "error", liveUpdatedAt);
      }
      if (manual) JJK.toast("Canlı akışa ulaşılamadı; kayıtlı haberler gösteriliyor");
      console.warn("Canlı haber akışı:", error.message);
    } finally {
      button.disabled = false;
      button.classList.remove("loading");
    }
  }

  function setupControls() {
    if (controlsReady) return;
    controlsReady = true;
    document.querySelector("#newsSearch").addEventListener("input", (event) => { state.search = event.target.value; render(); });
    document.querySelector("#newsSort").addEventListener("change", (event) => { state.sort = event.target.value; render(); });
    document.querySelector("#newsRefresh").addEventListener("click", () => refreshLive({ manual: true }));
    const overlay = document.querySelector("#newsModal");
    overlay.addEventListener("click", (event) => { if (event.target === overlay) closeArticle(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeArticle(); });
    window.addEventListener("online", () => refreshLive());
  }

  async function init() {
    try {
      editorial = (await JJK.fetchJSON("data/news.json")).filter(validNewsItem);
    } catch (error) {
      document.querySelector("#newsGrid").innerHTML = `<p class="empty">Haber arşivi yüklenemedi: ${JJK.escapeHtml(error.message)}</p>`;
      return;
    }

    try {
      const bundled = validFeed(await JJK.fetchJSON("data/live-news.json"));
      if (bundled) {
        live = bundled.items;
        liveUpdatedAt = bundled.updatedAt;
      }
    } catch { /* Paket içi canlı akış isteğe bağlıdır. */ }

    const cached = readCache();
    if (cached && (!live.length || new Date(cached.updatedAt || 0) >= new Date(liveUpdatedAt || 0))) {
      live = cached.items;
      liveUpdatedAt = cached.updatedAt;
      setFeedStatus("cache", cached.updatedAt);
    } else {
      setFeedStatus("local", liveUpdatedAt);
    }

    setupControls();
    setupFeatured();
    renderAll();
    await refreshLive();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
