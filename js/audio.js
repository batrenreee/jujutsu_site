/* ===========================================================
   audio.js — Web Audio tabanlı ses motoru.
   - Ses efektleri tamamen sentezle üretilir (dosya gerekmez).
   - Arka plan müziği: orijinal sentez döngüsü (telifsiz).
   - Kullanıcı isterse music/bgm.mp3 koyarsa onu çalar.
   =========================================================== */
window.JJKAudio = (function () {
  "use strict";
  let ctx, master, musicGain, sfxGain;
  let musicOn = true, musicTimer = null, step = 0;
  let htmlAudio = null, usingFile = false;

  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = musicOn ? 0.32 : 0; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = 0.55; sfxGain.connect(master);
  }
  function resume() { if (ctx && ctx.state === "suspended") ctx.resume(); }

  // ---- Temel ses üreticiler ----
  function tone(freq, dur, type, gain, slideTo, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(gain || 0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + dur);
    o.connect(g); g.connect(dest || sfxGain);
    o.start(); o.stop(ctx.currentTime + dur);
  }
  function noise(dur, gain, filterFreq, dest) {
    const n = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filterFreq || 1200;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain || 0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0008, ctx.currentTime + dur);
    n.connect(f); f.connect(g); g.connect(dest || sfxGain);
    n.start(); n.stop(ctx.currentTime + dur);
  }

  const SFX = {
    punch() { noise(0.09, 0.35, 1900); tone(190, 0.09, "square", 0.18, 90); },
    kick()  { noise(0.13, 0.42, 1000); tone(120, 0.15, "square", 0.24, 55); },
    hit()   { noise(0.13, 0.5, 2600); tone(320, 0.1, "sawtooth", 0.2, 110); },
    block() { noise(0.07, 0.3, 3200); tone(760, 0.06, "square", 0.14); },
    jump()  { tone(300, 0.16, "square", 0.18, 740); },
    special(){ tone(220, 0.42, "sawtooth", 0.28, 1150); noise(0.3, 0.18, 2500); },
    ko()    { tone(420, 0.7, "sawtooth", 0.34, 55); noise(0.5, 0.25, 1400); },
    bell()  { tone(880, 0.32, "triangle", 0.28); tone(1320, 0.32, "triangle", 0.13); },
    click() { tone(620, 0.05, "square", 0.18); },
  };
  function playSfx(name) { if (!ctx) return; resume(); (SFX[name] || function () {})(); }

  // ---- Orijinal sentez müzik döngüsü (A-minör, enerjik) ----
  const STEP_MS = 132;
  // 16 adımlık desen
  const BASS = [55, 0, 55, 82.41, 0, 55, 73.42, 0, 65.41, 0, 65.41, 98, 0, 82.41, 0, 0];
  const LEAD = [440, 523.25, 659.25, 0, 587.33, 0, 523.25, 659.25, 523.25, 0, 622.25, 0, 659.25, 783.99, 659.25, 587.33];

  function playStep() {
    if (!ctx || usingFile) return;
    const i = step % 16;
    if (BASS[i]) tone(BASS[i], STEP_MS / 1000 * 1.4, "triangle", 0.5, null, musicGain);
    if (LEAD[i]) tone(LEAD[i], STEP_MS / 1000 * 0.9, "square", 0.16, null, musicGain);
    // hi-hat / vurmalı
    noise(0.025, i % 2 === 0 ? 0.10 : 0.05, 7000, musicGain);
    if (i % 4 === 0) noise(0.06, 0.18, 220, musicGain); // kick davul
    step++;
  }

  function startSynth() {
    if (musicTimer) return;
    step = 0;
    musicTimer = setInterval(playStep, STEP_MS);
  }
  function stopSynth() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  function startMusic() {
    if (!ctx) return;
    resume();
    // Kullanıcı dosyası var mı? (music/bgm.mp3) — varsa onu çal, yoksa sentez.
    if (!htmlAudio) {
      htmlAudio = new Audio("music/bgm.mp3");
      htmlAudio.loop = true;
      htmlAudio.volume = musicOn ? 0.5 : 0;
      htmlAudio.addEventListener("canplay", () => {
        usingFile = true; stopSynth();
        if (musicOn) htmlAudio.play().catch(() => {});
      }, { once: true });
      htmlAudio.addEventListener("error", () => { usingFile = false; if (musicOn) startSynth(); }, { once: true });
      htmlAudio.load();
    } else if (usingFile) {
      if (musicOn) htmlAudio.play().catch(() => {});
    } else {
      if (musicOn) startSynth();
    }
  }
  function stopMusic() { stopSynth(); if (htmlAudio) htmlAudio.pause(); }

  function toggleMusic() {
    musicOn = !musicOn;
    if (musicGain) musicGain.gain.value = musicOn ? 0.32 : 0;
    if (usingFile && htmlAudio) {
      htmlAudio.volume = musicOn ? 0.5 : 0;
      if (musicOn) htmlAudio.play().catch(() => {}); else htmlAudio.pause();
    } else {
      if (musicOn) startSynth(); else stopSynth();
    }
    return musicOn;
  }

  return { init, resume, playSfx, startMusic, stopMusic, toggleMusic, isOn: () => musicOn, usingFile: () => usingFile };
})();
