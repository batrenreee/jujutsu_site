/* quiz.js — Veriye dayalı karakter testi motoru: adım adım sorular,
   ilerleme çubuğu, puanlama ve paylaşılabilir sonuç. */
(function () {
  "use strict";

  let DATA = null;
  let current = 0;
  let answers = []; // her soru için seçilen value

  const app = () => document.querySelector("#quizApp");

  function renderQuestion() {
    const total = DATA.questions.length;
    const q = DATA.questions[current];
    const pct = (current / total) * 100;

    app().innerHTML = `
      <div class="progress-bar"><span style="width:${pct}%"></span></div>
      <div class="q-card">
        <div class="q-title">${current + 1}. ${JJK.escapeHtml(q.q)}</div>
        <div class="options-grid">
          ${q.options
            .map(
              (o, i) =>
                `<button class="option ${answers[current] === o.value ? "selected" : ""}" data-value="${JJK.escapeHtml(o.value)}">${JJK.escapeHtml(o.label)}</button>`
            )
            .join("")}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-outline" id="prevBtn" ${current === 0 ? "style='visibility:hidden'" : ""}>← Geri</button>
          <button class="btn" id="nextBtn" ${answers[current] ? "" : "disabled style='opacity:.5;cursor:not-allowed'"}>
            ${current === total - 1 ? "ALAN GENİŞLET: SONUÇ" : "İleri →"}
          </button>
        </div>
      </div>`;

    app()
      .querySelectorAll(".option")
      .forEach((opt) => {
        opt.addEventListener("click", () => {
          answers[current] = opt.dataset.value;
          renderQuestion();
        });
      });

    const prev = app().querySelector("#prevBtn");
    if (prev) prev.addEventListener("click", () => { current--; renderQuestion(); });

    const next = app().querySelector("#nextBtn");
    next.addEventListener("click", () => {
      if (!answers[current]) return;
      if (current === DATA.questions.length - 1) showLoading();
      else { current++; renderQuestion(); }
    });
  }

  function computeWinner() {
    const scores = {};
    answers.forEach((v) => { scores[v] = (scores[v] || 0) + 1; });
    let best = null, max = -1;
    // results sırasına göre belirleyip eşitlikte ilk geleni alır
    Object.keys(DATA.results).forEach((key) => {
      const s = scores[key] || 0;
      if (s > max) { max = s; best = key; }
    });
    return best;
  }

  function showLoading() {
    app().innerHTML = `
      <div class="loader-wrap">
        <div class="loader"></div>
        <h3>Lanet enerjin analiz ediliyor...</h3>
        <p style="color:var(--text-faint)">Ruhun taranıyor.</p>
      </div>`;
    setTimeout(showResult, 1600);
  }

  function showResult() {
    const winner = computeWinner();
    const r = DATA.results[winner];
    const shareText = `Jujutsu Kaisen karakter testinde sonucum: ${r.name}! Sen kimsin?`;

    app().innerHTML = `
      <div class="result-card">
        <div class="result-portrait">
          <img class="result-portrait-bg" src="${JJK.escapeHtml(r.img)}" alt="" aria-hidden="true" />
          <img class="result-portrait-main" src="${JJK.escapeHtml(r.img)}" alt="${JJK.escapeHtml(r.name)}" />
        </div>
        <p style="color:var(--text-faint);letter-spacing:1px;text-transform:uppercase;font-size:.8rem">Sen busun</p>
        <h2>${JJK.escapeHtml(r.name)}</h2>
        <p class="desc">${JJK.escapeHtml(r.desc)}</p>
        <div class="share-row">
          <button class="btn" id="copyBtn">🔗 Sonucu Kopyala</button>
          <button class="btn btn-outline" id="twBtn">𝕏 Paylaş</button>
          <button class="btn btn-outline" id="waBtn">WhatsApp</button>
        </div>
        <div style="margin-top:18px">
          <button class="btn btn-outline" id="restartBtn">↻ Tekrar Test Et</button>
        </div>
      </div>`;

    const enc = encodeURIComponent(shareText);

    app().querySelector("#copyBtn").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(shareText);
        JJK.toast("Sonuç panoya kopyalandı!");
      } catch {
        JJK.toast("Kopyalanamadı, manuel deneyin.");
      }
    });
    app().querySelector("#twBtn").addEventListener("click", () =>
      JJK.openExternal(`https://twitter.com/intent/tweet?text=${enc}`)
    );
    app().querySelector("#waBtn").addEventListener("click", () =>
      JJK.openExternal(`https://wa.me/?text=${enc}`)
    );
    app().querySelector("#restartBtn").addEventListener("click", () => {
      current = 0;
      answers = [];
      renderQuestion();
    });
  }

  async function init() {
    if (!app()) return;
    try {
      DATA = await JJK.fetchJSON("data/quiz.json");
    } catch (e) {
      app().innerHTML = `<p class="empty">Test yüklenemedi: ${JJK.escapeHtml(e.message)}</p>`;
      return;
    }
    renderQuestion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
