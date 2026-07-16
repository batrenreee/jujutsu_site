/* Ana sayfa kişisel merkezi: günün karakteri, okuma devamı ve etkinlik sayacı. */
(function () {
  "use strict";

  const READ_KEY = "jjk-read-volumes-v2";
  const SAVED_KEY = "jjk-saved-news";
  const EVENT = {
    title: "Juju Fest 2026",
    date: "2026-08-29T09:00:00+09:00",
    place: "K Arena Yokohama",
    href: "https://jujutsukaisen.jp/jujufes2026/",
  };

  let characters = [];
  let dailyIndex = 0;

  function safeJSON(key, fallback) {
    try { return JSON.parse(JJKAuth.storage.getItem(key) || "null") || fallback; }
    catch (_) { return fallback; }
  }

  function daySeed() {
    const now = new Date();
    return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  }

  function characterImage(character) {
    return character.img || `img/characters/${character.id}.webp`;
  }

  function renderDaily() {
    const host = document.querySelector("#dailyCharacter");
    if (!host || !characters.length) return;
    const character = characters[dailyIndex % characters.length];
    const tags = (character.tags || []).slice(0, 2).map((tag) => `<span>${JJK.escapeHtml(tag)}</span>`).join("");
    host.innerHTML = `
      <img src="${JJK.escapeHtml(characterImage(character))}" alt="${JJK.escapeHtml(character.name)}" />
      <div class="daily-shade"></div>
      <div class="daily-copy">
        <small>GÜNÜN DOSYASI // ${String((dailyIndex % characters.length) + 1).padStart(3, "0")}</small>
        <h3>${JJK.escapeHtml(character.name)}</h3>
        <div class="daily-tags">${tags}</div>
        <p>${JJK.escapeHtml(character.blurb || "Jujutsu arşivindeki karakter dosyasını incele.")}</p>
        <div class="daily-actions"><a class="btn" href="karakterler.html?character=${encodeURIComponent(character.id)}">Dosyayı aç</a><button type="button" class="shuffle-file" id="shuffleCharacter">Başka dosya</button></div>
      </div>`;
    host.querySelector("#shuffleCharacter").addEventListener("click", () => {
      dailyIndex = (dailyIndex + 17) % characters.length;
      renderDaily();
    });
  }

  function renderContinue(manga) {
    const host = document.querySelector("#continueReading");
    if (!host) return;
    const progress = safeJSON(READ_KEY, {});
    const readCount = manga.volumes.filter((volume) => progress[volume.id]).length;
    const next = manga.volumes.find((volume) => !progress[volume.id]);
    const percent = Math.round((readCount / manga.volumes.length) * 100);
    if (!next) {
      host.innerHTML = `<span class="command-index">02 / OKUMA</span><div class="continue-complete"><b>✓</b><h3>Arşiv tamamlandı</h3><p>${manga.volumes.length} cildin tamamını işaretledin.</p><a href="manga.html">Koleksiyonu incele →</a></div>`;
      return;
    }
    host.innerHTML = `
      <span class="command-index">02 / KALDIĞIN YER</span>
      <div class="continue-main">
        <img src="${JJK.escapeHtml(next.cover)}" alt="${JJK.escapeHtml(next.title)} kapağı" />
        <div><small>SIRADAKİ CİLT</small><h3>Cilt ${String(next.number).padStart(2, "0")}</h3><strong>${JJK.escapeHtml(next.title)}</strong><p>${JJK.escapeHtml(next.arc)}</p></div>
      </div>
      <div class="continue-progress"><span style="width:${percent}%"></span></div>
      <footer><small>${readCount}/${manga.volumes.length} cilt • %${percent}</small><a href="manga.html?volume=${encodeURIComponent(next.id)}">Devam et →</a></footer>`;
  }

  function renderEvent() {
    const host = document.querySelector("#eventCountdown");
    if (!host) return;
    const target = new Date(EVENT.date);
    const days = Math.ceil((target.getTime() - Date.now()) / 86400000);
    const counter = days > 0 ? `<strong>${days}</strong><span>GÜN KALDI</span>` : `<strong>LIVE</strong><span>ETKİNLİK DÖNEMİ</span>`;
    host.innerHTML = `
      <span class="command-index">03 / TAKVİM</span>
      <div class="event-counter">${counter}</div>
      <div><h3>${EVENT.title}</h3><p>${EVENT.place}</p><time datetime="${EVENT.date}">29–30 Ağustos 2026</time></div>
      <button type="button" id="openEvent">Resmî etkinlik sayfası ↗</button>`;
    host.querySelector("#openEvent").addEventListener("click", () => JJK.openExternal(EVENT.href));
  }

  function renderActivity(manga) {
    const host = document.querySelector("#activitySummary");
    if (!host) return;
    const progress = safeJSON(READ_KEY, {});
    const saved = safeJSON(SAVED_KEY, []);
    const readCount = manga.volumes.filter((volume) => progress[volume.id]).length;
    const level = readCount >= 25 ? "Özel Sınıf Okur" : readCount >= 15 ? "1. Sınıf Okur" : readCount >= 5 ? "2. Sınıf Okur" : "Çaylak Büyücü";
    host.innerHTML = `
      <span class="command-index">04 / ARŞİV DURUMU</span>
      <h3>${level}</h3>
      <div class="activity-numbers"><div><strong>${readCount}</strong><small>okunan cilt</small></div><div><strong>${saved.length}</strong><small>kayıtlı haber</small></div></div>
      <p>İlerlemen yalnızca bu cihazda saklanıyor.</p>
      <a href="manga.html">Arşivi büyüt →</a>`;
  }

  async function init() {
    if (!document.querySelector("#dailyCharacter")) return;
    try {
      const [characterData, manga] = await Promise.all([JJK.fetchJSON("data/characters.json"), JJK.fetchJSON("data/manga.json")]);
      characters = characterData.filter((character) => character.id && character.name);
      dailyIndex = characters.length ? daySeed() % characters.length : 0;
      renderDaily();
      renderContinue(manga);
      renderEvent();
      renderActivity(manga);
    } catch (error) {
      document.querySelectorAll(".command-loading").forEach((item) => { item.textContent = `Merkez yüklenemedi: ${error.message}`; });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
