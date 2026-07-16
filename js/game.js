/* ===========================================================
   game.js — Lanet Düellosu: yandan görünümlü 2D piksel dövüş.
   Canvas 2D, programatik piksel dövüşçüler, CPU veya 2 oyuncu.
   =========================================================== */
(function () {
  "use strict";

  const canvas = document.getElementById("game");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const VW = 480, VH = 270;
  ctx.imageSmoothingEnabled = false;

  // ---- Sabitler ----
  const GROUND = 236;        // ayak hizası
  const GRAV = 0.62, MOVE = 2.3, JUMPV = -10;
  const ROUND_SECONDS = 60;
  let winsNeeded = 2;
  let matchFormat = 3;
  let difficulty = "normal";
  let stance = "balanced";

  const DIFFICULTY = {
    easy:{think:[28,46],special:.32,ultimate:.35,label:"Çırak"},
    normal:{think:[14,30],special:.55,ultimate:.62,label:"1. Sınıf"},
    hard:{think:[7,17],special:.78,ultimate:.88,label:"Özel Sınıf"}
  };
  const STANCES = {
    balanced:{label:"Dengeli",move:1,damage:1,defense:1,meter:1},
    rush:{label:"Yakın Dövüş",move:1.12,damage:1.1,defense:.9,meter:.9},
    control:{label:"Teknik Ustası",move:.94,damage:.95,defense:.94,meter:1.28}
  };
  const ULTIMATES = {
    gojo:{type:"domain",name:"Sınırsız Boşluk"},
    yuji:{type:"domain",name:"İsimsiz Alan"},
    sukuna:{type:"domain",name:"Şeytani Mabet"},
    megumi:{type:"domain",name:"Chimera Gölge Bahçesi (Eksik)"},
    mahito:{type:"domain",name:"Kendini Kusursuzlaştırma"},
    nobara:{type:"finisher",name:"Rezonans: Saç Tokası"},
    toji:{type:"finisher",name:"Büyücü Katili Hücumu"},
    todo:{type:"finisher",name:"Boogie Woogie: Zirve"}
  };

  // ---- Roster ----
  const ROSTER = [
    { id:"gojo",   name:"Gojo",   skin:"#f1c9a5", hair:"#ffffff", cloth:"#15151f", cloth2:"#2a2a40", accent:"#5fd0ff", mark:"band",   special:{ type:"projectile", name:"Mavi",        color:"#5fd0ff" } },
    { id:"yuji",   name:"Yuji",   skin:"#f0c0a0", hair:"#ff7eb0", cloth:"#262626", cloth2:"#3c3c3c", accent:"#ff3b3b", mark:null,     special:{ type:"burst",      name:"Kara Şimşek",  color:"#ff3b3b" } },
    { id:"sukuna", name:"Sukuna", skin:"#f0c4a0", hair:"#caa6c0", cloth:"#3a1414", cloth2:"#5a1e1e", accent:"#ff2a2a", mark:"sukuna", special:{ type:"slash",      name:"Parçala",      color:"#ff2a2a" } },
    { id:"megumi", name:"Megumi", skin:"#e9c0a0", hair:"#15151d", cloth:"#1f2d36", cloth2:"#2c3f4b", accent:"#6a7bff", mark:null,     special:{ type:"projectile", name:"İlahi Köpek",  color:"#9aa6ff" } },
    { id:"nobara", name:"Nobara", skin:"#f2c9a0", hair:"#d98a3a", cloth:"#3a2a3a", cloth2:"#4a374a", accent:"#ff6a6a", mark:null,     special:{ type:"projectile", name:"Çivi",         color:"#ffcf6a" } },
    { id:"toji",   name:"Toji",   skin:"#e6b690", hair:"#191919", cloth:"#202020", cloth2:"#323232", accent:"#9aa0a6", mark:null,     special:{ type:"dash",       name:"Suikast",      color:"#cfd6da" } },
    { id:"mahito", name:"Mahito", skin:"#d9c2cc", hair:"#5a6a7a", cloth:"#6a5a3a", cloth2:"#7a6a48", accent:"#b06acc", mark:"stitch", special:{ type:"projectile", name:"Ruh Vuruşu",   color:"#b06acc" } },
    { id:"todo",   name:"Todo",   skin:"#c98a5a", hair:"#181818", cloth:"#333333", cloth2:"#454545", accent:"#ffd34d", mark:null,     special:{ type:"dash",       name:"Boogie Woogie",color:"#ffd34d" } },
  ];

  const ATK = {
    punch: { dur:16, active:[5,9],  dmg:6, reach:18, kb:2.6, ku:-1,  stun:12 },
    kick:  { dur:24, active:[8,14], dmg:9, reach:24, kb:4.2, ku:-3,  stun:16 },
  };

  // ---- Ses kısayolu ----
  const SND = (n) => { if (window.JJKAudio) window.JJKAudio.playSfx(n); };

  // ---- Giriş ----
  const keys = {}, prev = {};
  const P1 = { left:"KeyA", right:"KeyD", jump:"KeyW", punch:"KeyJ", kick:"KeyK", special:"KeyL", ultimate:"KeyI" };
  const P2 = { left:"ArrowLeft", right:"ArrowRight", jump:"ArrowUp", punch:"KeyN", kick:"KeyM", special:"Comma", ultimate:"Slash" };
  const MAPPED = new Set([...Object.values(P1), ...Object.values(P2), "Space"]);

  window.addEventListener("keydown", (e) => { if (MAPPED.has(e.code)) e.preventDefault(); keys[e.code] = true; });
  window.addEventListener("keyup",   (e) => { keys[e.code] = false; });

  // Ekran butonları (fare/dokunma)
  document.querySelectorAll(".gbtn").forEach((b) => {
    const code = b.dataset.key;
    const on = (e) => { e.preventDefault(); keys[code] = true; };
    const off = (e) => { e.preventDefault(); keys[code] = false; };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off);
    b.addEventListener("pointerleave", off);
    b.addEventListener("pointercancel", off);
  });

  const down = (c) => !!keys[c];
  const pressed = (c) => keys[c] && !prev[c];

  // ---- Yardımcılar ----
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function darker(hex, k = 0.65) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k);
    return `rgb(${r},${g},${b})`;
  }
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function bodyBox(f) { return { x: f.x - 11, y: f.y - 46, w: 22, h: 46 }; }
  function meleeBox(f, reach) {
    return { x: f.facing > 0 ? f.x + 4 : f.x - 4 - reach, y: f.y - 40, w: reach, h: 28 };
  }

  // ---- Durum ----
  let scene = "select"; // select | fight | roundover | matchover
  let p1 = null, p2 = null;
  let projectiles = [], sparks = [];
  let hitstop = 0, introT = 0, overT = 0;
  let roundTimer = ROUND_SECONDS * 60;
  let round = 1, roundWinner = null;

  function makeFighter(def, x, facing, isAI, ctrl, style="balanced") {
    const mods=STANCES[style]||STANCES.balanced;
    return Object.assign({}, def, {
      x, y: GROUND, vx: 0, vy: 0, facing, onGround: true,
      hp: 100, maxHp: 100, state: "idle", atkT: 0, hasHit: false,
      hitstun: 0, flash: 0, meter: 0, anim: 0, blocking: false,
      isAI, ctrl, spType: null, spDur: 0,
      aiT: 0, aiHold: 0, aiBlockT: 0, wins: 0,
      ultimate:0, ultimateUsed:false, ultimateName:ULTIMATES[def.id].name, ultimateType:ULTIMATES[def.id].type, ultimateDur:0,
      moveMult:mods.move, damageMult:mods.damage, defenseMult:mods.defense, meterMult:mods.meter,
      combo:0, comboTimer:0, stats:{hits:0,damage:0,blocked:0,maxCombo:0,specials:0,ultimates:0},
    });
  }

  // ---- Giriş okuma ----
  function readControl(f, opp) {
    const dir = opp.x >= f.x ? 1 : -1;
    if (f.isAI) return aiControl(f, opp, dir);
    const c = f.ctrl;
    const moveDir = (down(c.left) ? -1 : 0) + (down(c.right) ? 1 : 0);
    const awayKey = dir > 0 ? c.left : c.right;
    return {
      moveDir,
      jump: pressed(c.jump),
      punch: pressed(c.punch),
      kick: pressed(c.kick),
      special: pressed(c.special),
      ultimate: pressed(c.ultimate),
      blocking: down(awayKey) && f.onGround,
    };
  }

  function aiControl(f, opp, dir) {
    const out = { moveDir: 0, jump: false, punch: false, kick: false, special: false, ultimate:false, blocking: false };
    const ad = Math.abs(opp.x - f.x);
    const tune=DIFFICULTY[difficulty];
    f.aiT--;
    if (f.aiT <= 0) {
      f.aiT = tune.think[0] + Math.random() * (tune.think[1]-tune.think[0]);
      f.aiHold = 0;
      if (f.ultimate >= 100 && !f.ultimateUsed && Math.random() < tune.ultimate) out.ultimate = true;
      else if (f.meter >= 100 && ad < 175 && Math.random() < tune.special) out.special = true;
      else if (ad > 60) { f.aiHold = dir; if (Math.random() < 0.10) out.jump = true; }
      else {
        const r = Math.random();
        if (r < 0.4) out.punch = true;
        else if (r < 0.68) out.kick = true;
        else f.aiBlockT = 22 + Math.random() * 22;
      }
    }
    if (f.aiHold > 0) out.moveDir = 1; else if (f.aiHold < 0) out.moveDir = -1;
    if (f.aiBlockT > 0) { f.aiBlockT--; out.blocking = f.onGround; out.moveDir = -dir * 0.5; }
    return out;
  }

  // ---- Dövüşçü güncelle ----
  function updateFighter(f, opp, frozen) {
    f.flash = Math.max(0, f.flash - 1);
    f.anim++;
    if(f.comboTimer>0)f.comboTimer--; else f.combo=0;

    if (f.state === "hurt") { f.hitstun--; if (f.hitstun <= 0) f.state = "idle"; }

    const ctl = frozen
      ? { moveDir: 0, jump: false, punch: false, kick: false, special: false, ultimate:false, blocking: false }
      : readControl(f, opp);

    const actionable = f.onGround && (f.state === "idle" || f.state === "walk");

    if (f.onGround && (f.state === "idle" || f.state === "walk"))
      f.facing = opp.x >= f.x ? 1 : -1;

    f.blocking = ctl.blocking && (f.state === "idle" || f.state === "walk");

    if (actionable) {
      if (ctl.ultimate && f.ultimate >= 100 && !f.ultimateUsed) startUltimate(f);
      else if (ctl.special && f.meter >= 100) startSpecial(f);
      else if (ctl.punch) startAttack(f, "punch");
      else if (ctl.kick) startAttack(f, "kick");
      else if (ctl.jump) { f.vy = JUMPV; f.onGround = false; f.state = "jump"; SND("jump"); }
    }

    const canMove = f.state === "idle" || f.state === "walk" || f.state === "jump";
    if (canMove) {
      let m = ctl.moveDir;
      if (f.blocking) m *= 0.5;
      f.vx = m * MOVE * f.moveMult;
      if (f.onGround) f.state = m !== 0 ? "walk" : "idle";
    } else {
      f.vx *= 0.82;
    }

    if (f.state === "punch" || f.state === "kick") {
      f.atkT++;
      updateMelee(f, opp);
      if (f.atkT >= ATK[f.state].dur) f.state = "idle";
    }
    if (f.state === "special") {
      f.atkT++;
      updateSpecial(f, opp);
      if (f.atkT >= f.spDur) f.state = "idle";
    }
    if (f.state === "ultimate") {
      f.atkT++;
      updateUltimate(f,opp);
      if(f.atkT>=f.ultimateDur)f.state="idle";
    }

    // Fizik
    f.vy += GRAV;
    f.x += f.vx; f.y += f.vy;
    f.x = clamp(f.x, 16, VW - 16);
    if (f.y >= GROUND) {
      f.y = GROUND; f.vy = 0;
      if (!f.onGround) { f.onGround = true; if (f.state === "jump") f.state = "idle"; }
    }

    f.meter = Math.min(100, f.meter + 0.18*f.meterMult);
  }

  function startAttack(f, type) { f.state = type; f.atkT = 0; f.hasHit = false; f.vx = 0; SND(type); }
  function startSpecial(f) {
    f.state = "special"; f.atkT = 0; f.hasHit = false; f.vx = 0; f.meter = 0;
    f.spType = f.special.type;
    f.stats.specials++;
    f.spDur = f.spType === "burst" ? 32 : f.spType === "slash" ? 30 : 28;
    SND("special");
  }

  function startUltimate(f) {
    f.state="ultimate"; f.atkT=0; f.vx=0; f.ultimate=0; f.ultimateUsed=true; f.ultimateDur=72; f.hasHit=false; f.stats.ultimates++;
    SND("special");
  }

  function updateUltimate(f,opp) {
    if(f.atkT<20){f.flash=2;spawnSpark(f.x+(Math.random()-.5)*70,f.y-25-Math.random()*45,f.accent,1);}
    if(f.atkT===24&&!f.hasHit){f.hasHit=true;applyHit(f,opp,28,8,-6,28);hitstop=9;}
  }

  function updateMelee(f, opp) {
    const a = ATK[f.state];
    if (f.atkT >= a.active[0] && f.atkT <= a.active[1] && !f.hasHit) {
      if (overlap(meleeBox(f, a.reach), bodyBox(opp))) {
        f.hasHit = true;
        applyHit(f, opp, a.dmg, a.kb, a.ku, a.stun);
      }
    }
  }

  function updateSpecial(f, opp) {
    const t = f.atkT, col = f.special.color;
    if (f.spType === "projectile") {
      if (t === 10) spawnProjectile(f, col, 4.4, 17, 16, 12, false);
    } else if (f.spType === "slash") {
      if (t === 7 || t === 13 || t === 19) spawnProjectile(f, col, 5.2, 8, 18, 6, true);
    } else if (f.spType === "burst") {
      if (t === 10) f.flash = 22;
      if (t >= 12 && t <= 22 && !f.hasHit) {
        const hb = { x: f.facing > 0 ? f.x : f.x - 48, y: f.y - 52, w: 48, h: 52 };
        spawnSpark(f.x + f.facing * 18, f.y - 26, col, 6);
        if (overlap(hb, bodyBox(opp))) { f.hasHit = true; applyHit(f, opp, 22, 7.5, -7, 22); }
      }
    } else if (f.spType === "dash") {
      if (t < 14) f.vx = f.facing * 6.2;
      if (t >= 6 && t <= 16 && !f.hasHit) {
        if (overlap(meleeBox(f, 22), bodyBox(opp))) { f.hasHit = true; applyHit(f, opp, 19, 6, -5, 18); }
      }
    }
  }

  function spawnProjectile(f, color, speed, dmg, w, h, slash) {
    projectiles.push({
      x: f.x + f.facing * 16, y: f.y - 30, vx: f.facing * speed,
      dir: f.facing, color, dmg, w, h, life: 150, owner: f, slash,
    });
  }

  function applyHit(att, def, dmg, kb, ku, stun) {
    if (def.state === "ko") return;
    const dealt=Math.max(1,Math.round(dmg*(att.damageMult||1)/(def.defenseMult||1)));
    if (def.blocking) {
      def.hp = Math.max(0, def.hp - dealt * 0.25);
      def.vx = att.facing * kb * 0.4;
      att.meter = Math.min(100, att.meter + 4);
      if(att.stats)att.stats.blocked++;
      spawnSpark(def.x + (att.facing > 0 ? -8 : 8), def.y - 28, "#cfe8ff", 5);
      SND("block");
    } else {
      def.hp = Math.max(0, def.hp - dealt);
      def.state = "hurt"; def.hitstun = stun; def.flash = 8;
      def.vx = att.facing * kb; def.vy = ku; def.onGround = false;
      spawnSpark(def.x + (att.facing > 0 ? -6 : 6), def.y - 28, "#ffffff", 8);
      att.meter = Math.min(100, att.meter + dealt * 0.6*(att.meterMult||1));
      def.meter = Math.min(100, def.meter + dealt * 0.4*(def.meterMult||1));
      att.ultimate=Math.min(100,(att.ultimate||0)+dealt*1.45);
      def.ultimate=Math.min(100,(def.ultimate||0)+dealt*.85);
      if(att.stats){att.stats.hits++;att.stats.damage+=dealt;att.combo=att.comboTimer>0?att.combo+1:1;att.comboTimer=75;att.stats.maxCombo=Math.max(att.stats.maxCombo,att.combo);}
      if (def.hp <= 0) { def.state = "ko"; def.vx = att.facing * 5; def.vy = -6.5; def.onGround = false; SND("ko"); }
      else SND("hit");
      hitstop = 4;
    }
  }

  function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx; p.life--;
      const target = p.owner === p1 ? p2 : p1;
      const box = { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
      if (target.state !== "ko" && overlap(box, bodyBox(target))) {
        const oldFacing=p.owner.facing; p.owner.facing=p.dir;
        applyHit(p.owner, target, p.dmg, 5, -3, 16);
        p.owner.facing=oldFacing;
        spawnSpark(p.x, p.y, p.color, 9);
        projectiles.splice(i, 1); continue;
      }
      if (p.life <= 0 || p.x < -20 || p.x > VW + 20) projectiles.splice(i, 1);
    }
  }

  function spawnSpark(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      sparks.push({ x, y, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.7) * 4, life: 12 + Math.random() * 8, color });
    }
  }
  function updateSparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.2; s.life--;
      if (s.life <= 0) sparks.splice(i, 1);
    }
  }

  // ---- Raunt / Maç ----
  function checkRoundEnd() {
    if (scene !== "fight") return;
    if (p1.hp <= 0 || p2.hp <= 0 || roundTimer <= 0) {
      if (p1.hp <= 0 && p2.hp <= 0) roundWinner = null;
      else if (p1.hp <= 0) roundWinner = p2;
      else if (p2.hp <= 0) roundWinner = p1;
      else roundWinner = p1.hp >= p2.hp ? p1 : p2;
      if (roundWinner) roundWinner.wins++;
      scene = "roundover"; overT = 150;
    }
  }
  function afterRoundover() {
    if (p1.wins >= winsNeeded || p2.wins >= winsNeeded) {
      scene = "matchover";
      showResult(p1.wins > p2.wins ? p1 : p2);
    } else {
      round++;
      resetRound();
      scene = "fight";
    }
  }
  function resetRound() {
    p1.hp = p2.hp = 100; p1.meter = p2.meter = 0; p1.ultimate=p2.ultimate=0; p1.ultimateUsed=p2.ultimateUsed=false; p1.combo=p2.combo=0;
    p1.x = 150; p1.y = GROUND; p1.vx = p1.vy = 0; p1.state = "idle"; p1.facing = 1; p1.onGround = true;
    p2.x = 330; p2.y = GROUND; p2.vx = p2.vy = 0; p2.state = "idle"; p2.facing = -1; p2.onGround = true;
    projectiles = []; sparks = [];
    roundTimer = ROUND_SECONDS * 60;
    introT = 100; roundWinner = null;
    SND("bell");
  }

  // ---- Çizim ----
  function clearAll() { ctx.fillStyle = "#05060a"; ctx.fillRect(0, 0, VW, VH); }

  function drawBackground() {
    // gökyüzü
    const g = ctx.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, "#0b0b1a"); g.addColorStop(1, "#241326");
    ctx.fillStyle = g; ctx.fillRect(0, 0, VW, GROUND);
    // ay
    ctx.fillStyle = "#f4e9c8"; ctx.beginPath(); ctx.arc(390, 56, 26, 0, 7); ctx.fill();
    ctx.fillStyle = "#0b0b1a"; ctx.beginPath(); ctx.arc(380, 50, 24, 0, 7); ctx.fill();
    // uzak torii
    ctx.fillStyle = "#3a0d12";
    ctx.fillRect(70, 120, 8, 116); ctx.fillRect(150, 120, 8, 116);
    ctx.fillRect(56, 116, 116, 9); ctx.fillRect(64, 132, 100, 6);
    // sütunlar
    ctx.fillStyle = "rgba(20,20,35,0.6)";
    for (let i = 0; i < 6; i++) ctx.fillRect(20 + i * 90, 150, 14, 86);
    // zemin
    ctx.fillStyle = "#1a1320"; ctx.fillRect(0, GROUND, VW, VH - GROUND);
    ctx.fillStyle = "#241a2c"; ctx.fillRect(0, GROUND, VW, 4);
  }

  // ---- Poz hesaplama (eklem açıları) ----
  function computePose(f) {
    const A = f.anim, st = f.state;
    const p = {
      bob: 0, torso: 0, head: 0,
      bArm: { a: 0.28, b: 0.5 }, fArm: { a: 0.28, b: 0.5 },
      bLeg: { a: 0.12, b: 0.12 }, fLeg: { a: -0.12, b: 0.12 },
    };
    if (st === "idle") {
      const s = Math.sin(A * 0.08);
      p.bob = s * 1.0; p.fArm.a = 0.24 + s * 0.06; p.bArm.a = 0.24 - s * 0.06; p.head = s * 0.03;
    } else if (st === "walk") {
      const w = Math.sin(A * 0.28);
      p.fLeg.a = w * 0.55; p.bLeg.a = -w * 0.55;
      p.fLeg.b = Math.max(0, -w) * 0.7; p.bLeg.b = Math.max(0, w) * 0.7;
      p.fArm.a = -w * 0.5; p.bArm.a = w * 0.5; p.bob = Math.abs(w) * 1.0;
    } else if (st === "jump") {
      p.fLeg.a = 0.5; p.fLeg.b = 0.9; p.bLeg.a = 0.25; p.bLeg.b = 0.9;
      p.fArm.a = -0.5; p.bArm.a = -0.7; p.torso = 0.05;
    } else if (st === "punch") {
      const t = clamp(f.atkT / 11, 0, 1);
      const ext = t < 0.45 ? t / 0.45 : 1 - (t - 0.45) / 0.55;
      p.fArm.a = 0.7 + ext * 0.95; p.fArm.b = 0.5 - ext * 0.5;
      p.bArm.a = -0.3 * ext; p.torso = 0.14 * ext; p.fLeg.a = -0.1 - ext * 0.12;
    } else if (st === "kick") {
      const t = clamp(f.atkT / 15, 0, 1);
      const ext = t < 0.45 ? t / 0.45 : 1 - (t - 0.45) / 0.55;
      p.fLeg.a = 0.4 + ext * 1.15; p.fLeg.b = ext * 0.25;
      p.bLeg.a = -0.2; p.torso = -0.12 * ext; p.bArm.a = -0.3; p.fArm.a = 0.4;
    } else if (st === "special" || st === "ultimate") {
      const t = clamp(f.atkT / f.spDur, 0, 1);
      p.torso = t < 0.4 ? -0.28 : 0.4; p.fArm.a = 0.6 + (t > 0.4 ? 1.0 : 0.2);
      p.fArm.b = 0.2; p.bArm.a = -0.2; p.bob = -Math.abs(Math.sin(t * 7)) * 0.8;
    } else if (st === "hurt") {
      p.torso = -0.28; p.head = -0.2; p.bArm.a = -0.35; p.fArm.a = -0.35; p.bob = -1;
    }
    return p;
  }

  function drawFighter(f) {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath(); ctx.ellipse(f.x, GROUND + 2, 15, 4, 0, 0, 7); ctx.fill();

    if (f.meter >= 100) {
      ctx.save(); ctx.globalAlpha = 0.14 + 0.08 * Math.sin(f.anim * 0.3);
      ctx.fillStyle = f.accent;
      ctx.beginPath(); ctx.ellipse(f.x, f.y - 34, 20, 40, 0, 0, 7); ctx.fill(); ctx.restore();
    }

    if (f.state === "ko") { drawKO(f); return; }
    if (f.flash > 0 && f.flash % 2 === 0) return;

    const p = computePose(f);
    const fac = f.facing, hipY = f.y - 24;
    const SX = (lx) => f.x + fac * lx, SY = (ly) => hipY + ly;
    const lean = Math.sin(p.torso) * 16, bob = p.bob, shY = -20 + bob;

    const leg = (hx, a, b) => {
      const kx = hx + Math.sin(a) * 12, ky = Math.cos(a) * 12;
      return { hip: [hx, 0], knee: [kx, ky], foot: [kx + Math.sin(a - b) * 12, ky + Math.cos(a - b) * 12] };
    };
    const arm = (sx, a, b) => {
      const ex = sx + Math.sin(a) * 9, ey = shY + Math.cos(a) * 9;
      return { sh: [sx, shY], el: [ex, ey], hand: [ex + Math.sin(a + b) * 9, ey + Math.cos(a + b) * 9] };
    };
    const bLeg = leg(-3, p.bLeg.a, p.bLeg.b), fLeg = leg(3, p.fLeg.a, p.fLeg.b);
    const bArm = arm(-4 + lean, p.bArm.a, p.bArm.b), fArm = arm(4 + lean, p.fArm.a, p.fArm.b);
    const headC = [lean + Math.sin(p.head) * 4, -32 + bob];

    const bone = (a, b, w, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(SX(a[0]), SY(a[1])); ctx.lineTo(SX(b[0]), SY(b[1])); ctx.stroke();
    };
    const dot = (pt, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(SX(pt[0]), SY(pt[1]), r, 0, 7); ctx.fill(); };

    const clothD = darker(f.cloth, 0.72), skinD = darker(f.skin, 0.85);
    // arka kol + arka bacak
    bone(bArm.sh, bArm.el, 5, clothD); bone(bArm.el, bArm.hand, 4.5, skinD); dot(bArm.hand, 2.6, skinD);
    bone(bLeg.hip, bLeg.knee, 6, clothD); bone(bLeg.knee, bLeg.foot, 5.5, clothD); dot(bLeg.foot, 2.6, "#15151a");
    // ön bacak
    bone(fLeg.hip, fLeg.knee, 6.5, f.cloth); bone(fLeg.knee, fLeg.foot, 6, f.cloth); dot(fLeg.foot, 2.9, "#1a1a20");
    // gövde
    bone([0, 1], [lean, shY + 2], 13, f.cloth);
    bone([lean - 4, shY], [lean + 4, shY], 11, f.cloth);
    ctx.lineCap = "butt";
    bone([-5, -2], [5, -2], 4, f.cloth2);             // kemer
    bone([lean - 4, shY + 1], [lean + 4, shY + 1], 3, f.accent); // yaka
    ctx.lineCap = "round";
    // kafa
    drawHeadVec(f, SX(headC[0]), SY(headC[1]), 9, fac);
    // ön kol (en üstte)
    const handGlow = f.state === "special" && f.atkT > 6;
    bone(fArm.sh, fArm.el, 5.5, f.cloth); bone(fArm.el, fArm.hand, 5, f.skin);
    dot(fArm.hand, handGlow ? 5 : 3, handGlow ? f.special.color : f.skin);

    // darbe parlaması
    if ((f.state === "punch" && f.atkT > 4 && f.atkT < 9) || (f.state === "kick" && f.atkT > 8 && f.atkT < 13)) {
      const tip = f.state === "punch" ? fArm.hand : fLeg.foot;
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(SX(tip[0]), SY(tip[1]), 7, -0.9, 0.9); ctx.stroke();
    }
  }

  function drawHeadVec(f, cx, cy, r, fac) {
    // boyun
    ctx.strokeStyle = f.skin; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, cy + r - 2); ctx.lineTo(cx, cy + r + 4); ctx.stroke();
    // yüz
    ctx.fillStyle = f.skin; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
    // arka yanak gölgesi
    ctx.fillStyle = darker(f.skin, 0.9);
    ctx.beginPath(); ctx.arc(cx - fac * 4, cy + 1, r * 0.66, 0, 7); ctx.fill();
    // gözler (ön tarafta)
    eyeAt(cx + fac * 2.5, cy - 0.5, fac);
    eyeAt(cx + fac * 6, cy - 0.5, fac);
    // saç + işaretler
    drawHair(f, cx, cy, r, fac);
    drawMarks(f, cx, cy, r, fac);
  }

  function eyeAt(x, y, fac) {
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(x, y, 1.8, 2.4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#1a1320"; ctx.beginPath(); ctx.ellipse(x + fac * 0.4, y + 0.3, 1.0, 1.7, 0, 0, 7); ctx.fill();
  }

  function drawHair(f, cx, cy, r, fac) {
    const col = f.hair;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(cx, cy - 1, r + 1.5, Math.PI * 1.02, Math.PI * 1.98);
    ctx.lineTo(cx + r + 1, cy + 2); ctx.lineTo(cx - r - 1, cy + 2);
    ctx.closePath(); ctx.fill();

    const spike = (bx, by, tx, ty, w) => {
      ctx.beginPath(); ctx.moveTo(cx + bx - w, cy + by); ctx.lineTo(cx + tx, cy + ty); ctx.lineTo(cx + bx + w, cy + by); ctx.closePath(); ctx.fill();
    };
    switch (f.id) {
      case "gojo":
        spike(-6, -6, -8, -16, 3); spike(-1, -8, -2, -19, 3); spike(4, -8, 6, -17, 3); spike(8, -5, 12, -13, 3); break;
      case "yuji":
        spike(-5, -7, -6, -12, 3); spike(0, -8, 0, -14, 3); spike(5, -7, 7, -12, 3); break;
      case "sukuna":
        spike(-5, -7, -7, -14, 3); spike(1, -8, 1, -15, 3); spike(6, -7, 9, -13, 3); break;
      case "megumi":
        spike(-6, -5, -9, -12, 2.5); spike(-2, -7, -3, -14, 2.5); spike(3, -7, 4, -13, 2.5); spike(7, -5, 10, -11, 2.5);
        ctx.fillRect(cx - 6, cy - 6, 12, 4); break;
      case "nobara":
        ctx.fillRect(cx - r - 1, cy - 2, 3, 9); ctx.fillRect(cx + r - 2, cy - 2, 3, 9);
        spike(-4, -7, -5, -12, 3); spike(2, -7, 3, -12, 3); break;
      case "toji":
        ctx.fillRect(cx - r, cy - 7, r * 2, 5); break;
      case "mahito":
        ctx.fillStyle = darker(col, 0.65); ctx.fillRect(cx - r, cy - 6, r, 6);
        ctx.fillStyle = col; ctx.fillRect(cx, cy - 6, r, 6);
        spike(-3, -6, -4, -12, 2.5); spike(4, -6, 5, -11, 2.5); break;
      case "todo":
        ctx.fillRect(cx - r, cy - 7, r * 2, 6); break;
    }
  }

  function drawMarks(f, cx, cy, r, fac) {
    if (f.mark === "band") {
      ctx.fillStyle = f.accent; ctx.fillRect(cx - r, cy - 3, r * 2, 4);
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillRect(cx - r, cy - 3, r * 2, 1);
    } else if (f.mark === "sukuna") {
      ctx.strokeStyle = f.accent; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 5, cy - 4); ctx.lineTo(cx + 5, cy - 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + fac * 2, cy + 1); ctx.lineTo(cx + fac * 2, cy + 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + fac * 5, cy + 1); ctx.lineTo(cx + fac * 5, cy + 5); ctx.stroke();
    } else if (f.mark === "stitch") {
      ctx.strokeStyle = "#3a3a3a"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6); ctx.stroke();
      for (let yy = -4; yy <= 4; yy += 3) { ctx.beginPath(); ctx.moveTo(cx - 2, cy + yy); ctx.lineTo(cx + 2, cy + yy); ctx.stroke(); }
    }
  }

  function drawKO(f) {
    const fac = f.facing, gy = GROUND - 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = f.cloth; ctx.lineWidth = 11;
    ctx.beginPath(); ctx.moveTo(f.x - fac * 10, gy); ctx.lineTo(f.x + fac * 6, gy); ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(f.x - fac * 8, gy); ctx.lineTo(f.x - fac * 18, gy - 4); ctx.stroke();
    ctx.fillStyle = f.skin; ctx.beginPath(); ctx.arc(f.x + fac * 13, gy - 2, 8, 0, 7); ctx.fill();
    ctx.fillStyle = f.hair; ctx.fillRect(f.x + fac * 7, gy - 10, 12, 5);
    ctx.strokeStyle = "#1a1320"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(f.x + fac * 12, gy - 4); ctx.lineTo(f.x + fac * 16, gy);
    ctx.moveTo(f.x + fac * 16, gy - 4); ctx.lineTo(f.x + fac * 12, gy); ctx.stroke();
  }

  function drawProjectiles() {
    projectiles.forEach((p) => {
      if (p.slash) {
        ctx.fillStyle = p.color; ctx.fillRect(Math.round(p.x - p.w / 2), Math.round(p.y - 1), p.w, 3);
        ctx.fillStyle = "#fff"; ctx.fillRect(Math.round(p.x - p.w / 2), Math.round(p.y), p.w, 1);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x - p.w / 2), Math.round(p.y - p.h / 2), p.w, p.h);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(Math.round(p.x - 2), Math.round(p.y - 2), 4, 4);
      }
    });
  }

  function drawSparks() {
    sparks.forEach((s) => {
      ctx.globalAlpha = Math.min(1, s.life / 12);
      ctx.fillStyle = s.color;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), 3, 3);
    });
    ctx.globalAlpha = 1;
  }

  function drawHUD() {
    // Can barları
    drawBar(14, 16, 180, p1.hp / 100, false, p1);
    drawBar(VW - 14 - 180, 16, 180, p2.hp / 100, true, p2);
    // İsim
    ctx.fillStyle = "#fff"; ctx.font = "bold 11px Outfit, sans-serif";
    ctx.textAlign = "left"; ctx.fillText(p1.name, 14, 40);
    ctx.textAlign = "right"; ctx.fillText(p2.name + (p2.isAI ? " (CPU)" : ""), VW - 14, 40);
    // Raunt pipleri
    for (let i = 0; i < winsNeeded; i++) {
      ctx.fillStyle = i < p1.wins ? "#ffd34d" : "rgba(255,255,255,0.25)";
      ctx.fillRect(14 + i * 12, 44, 8, 8);
      ctx.fillStyle = i < p2.wins ? "#ffd34d" : "rgba(255,255,255,0.25)";
      ctx.fillRect(VW - 22 - i * 12, 44, 8, 8);
    }
    // Enerji barları
    drawMeter(14, 56, 120, p1.meter / 100, false, p1.accent);
    drawMeter(VW - 14 - 120, 56, 120, p2.meter / 100, true, p2.accent);
    drawMeter(14, 64, 120, p1.ultimate / 100, false, "#b45cff");
    drawMeter(VW - 14 - 120, 64, 120, p2.ultimate / 100, true, "#b45cff");
    if(p1.combo>1){ctx.fillStyle=p1.accent;ctx.font="bold 10px Outfit, sans-serif";ctx.textAlign="left";ctx.fillText(`${p1.combo} HIT`,14,80);}
    if(p2.combo>1){ctx.fillStyle=p2.accent;ctx.font="bold 10px Outfit, sans-serif";ctx.textAlign="right";ctx.fillText(`${p2.combo} HIT`,VW-14,80);}
    // Zamanlayıcı
    ctx.fillStyle = "#fff"; ctx.font = "bold 16px Outfit, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(Math.ceil(roundTimer / 60), VW / 2, 30);
  }

  function drawBar(x, y, w, ratio, mirror, f) {
    ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(x - 1, y - 1, w + 2, 12);
    const fw = Math.round(w * clamp(ratio, 0, 1));
    ctx.fillStyle = ratio > 0.3 ? "#46d36a" : "#e23b3b";
    ctx.fillRect(mirror ? x + w - fw : x, y, fw, 10);
  }
  function drawMeter(x, y, w, ratio, mirror, color) {
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(x, y, w, 5);
    const fw = Math.round(w * clamp(ratio, 0, 1));
    ctx.fillStyle = ratio >= 1 ? color : "#7a7a8a";
    ctx.fillRect(mirror ? x + w - fw : x, y, fw, 5);
  }

  function drawAnnounce() {
    ctx.textAlign = "center";
    if (introT > 0) {
      ctx.fillStyle = "#fff"; ctx.font = "bold 30px Outfit, sans-serif";
      const txt = introT > 40 ? "RAUNT " + round : "DÖVÜŞ!";
      ctx.fillStyle = introT > 40 ? "#fff" : "#ff4747";
      ctx.fillText(txt, VW / 2, VH / 2);
    }
    if (scene === "roundover") {
      ctx.fillStyle = "#ffd34d"; ctx.font = "bold 24px Outfit, sans-serif";
      ctx.fillText(roundWinner ? roundWinner.name + " kazandı!" : "Berabere!", VW / 2, VH / 2);
    }
    const caster=p1?.state==="ultimate"?p1:p2?.state==="ultimate"?p2:null;
    if(caster&&caster.atkT<42){ctx.fillStyle="rgba(3,2,7,.66)";ctx.fillRect(0,92,VW,78);ctx.fillStyle=caster.accent;ctx.font="bold 11px Outfit, sans-serif";ctx.fillText(caster.ultimateType==="domain"?"ALAN GENİŞLETME":"NİHAİ HAMLE",VW/2,119);ctx.fillStyle="#fff";ctx.font="bold 25px Outfit, sans-serif";ctx.fillText(caster.ultimateName,VW/2,148);}
  }

  // ---- Ana döngü ----
  function step() {
    if (scene === "fight") {
      if (introT > 0) { introT--; }
      else if (hitstop > 0) { hitstop--; }
      else {
        updateFighter(p1, p2, false);
        updateFighter(p2, p1, false);
        updateProjectiles();
        updateSparks();
        roundTimer--;
        checkRoundEnd();
      }
    } else if (scene === "roundover") {
      updateFighter(p1, p2, true);
      updateFighter(p2, p1, true);
      updateSparks();
      overT--;
      if (overT <= 0) afterRoundover();
    }
  }

  function render() {
    clearAll();
    drawBackground();
    if (p1 && p2 && scene !== "select") {
      drawSparks();
      // arkadaki önce: soldaki dövüşçü
      drawFighter(p1); drawFighter(p2);
      drawProjectiles();
      drawHUD();
      drawAnnounce();
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "bold 14px Outfit, sans-serif";
      ctx.textAlign = "center"; ctx.fillText("Karakter seç ve dövüşe başla", VW / 2, VH / 2);
    }
  }

  function loop() {
    step();
    render();
    for (const k in keys) prev[k] = keys[k];
    requestAnimationFrame(loop);
  }

  // ---- Seçim ekranı (DOM) ----
  let selP1 = 0, selP2 = 2, mode = "cpu";

  function buildSelect() {
    const host = document.getElementById("selectScreen");
    const faces = (i, who) => `
      <button class="fighter-chip ${who}" data-i="${i}">
        <span class="chip-portrait" style="border-color:${ROSTER[i].accent}">
          <img class="chip-face-bg" src="img/characters/${ROSTER[i].id}.webp" alt="" aria-hidden="true" />
          <img class="chip-face" src="img/characters/${ROSTER[i].id}.webp" alt="${ROSTER[i].name}" loading="lazy" />
        </span>
        <span>${ROSTER[i].name}</span><small>${ROSTER[i].special.name} · ${ULTIMATES[ROSTER[i].id].type==="domain"?"Alan":"Nihai"}</small>
      </button>`;
    const grid = (who) => ROSTER.map((_, i) => faces(i, who)).join("");

    host.innerHTML = `
      <h2>Lanet Düellosu</h2>
      <p class="ov-sub">Karakterini, savaş stilini ve karşılaşma koşullarını belirle.</p>
      <div class="mode-row">
        <button class="chip ${mode === "cpu" ? "active" : ""}" data-mode="cpu">👤 vs 🤖 CPU</button>
        <button class="chip ${mode === "2p" ? "active" : ""}" data-mode="2p">👤 vs 👤 2 Oyuncu</button>
      </div>
      <div class="duel-config">
        <div><small>ZORLUK</small>${Object.entries(DIFFICULTY).map(([id,d])=>`<button class="chip ${difficulty===id?"active":""}" data-difficulty="${id}">${d.label}</button>`).join("")}</div>
        <div><small>FORMAT</small>${[1,3,5].map(n=>`<button class="chip ${matchFormat===n?"active":""}" data-format="${n}">Bo${n}</button>`).join("")}</div>
        <div><small>SAVAŞ STİLİ</small>${Object.entries(STANCES).map(([id,s])=>`<button class="chip ${stance===id?"active":""}" data-stance="${id}">${s.label}</button>`).join("")}</div>
      </div>
      <p class="duel-lore-note">Alan sahibi olmayan dövüşçüler, karakterlerine uygun nihai hamle kullanır.</p>
      <div class="pick-cols">
        <div class="pick-col p1"><h3>1. Oyuncu</h3><div class="pick-grid" id="gridP1">${grid("p1")}</div></div>
        <div class="vs-sep">VS</div>
        <div class="pick-col p2"><h3 id="p2title">Rakip</h3><div class="pick-grid" id="gridP2">${grid("p2")}</div></div>
      </div>
      <button class="btn" id="startBtn" style="margin-top:18px">DÖVÜŞE BAŞLA</button>`;

    host.querySelectorAll("[data-mode]").forEach((b) =>
      b.addEventListener("click", () => { mode = b.dataset.mode; buildSelect(); refreshSel(); })
    );
    host.querySelectorAll("[data-difficulty]").forEach(b=>b.addEventListener("click",()=>{difficulty=b.dataset.difficulty;buildSelect();}));
    host.querySelectorAll("[data-format]").forEach(b=>b.addEventListener("click",()=>{matchFormat=+b.dataset.format;winsNeeded=Math.ceil(matchFormat/2);buildSelect();}));
    host.querySelectorAll("[data-stance]").forEach(b=>b.addEventListener("click",()=>{stance=b.dataset.stance;buildSelect();}));
    host.querySelectorAll("#gridP1 .fighter-chip").forEach((b) =>
      b.addEventListener("click", () => { selP1 = +b.dataset.i; refreshSel(); })
    );
    host.querySelectorAll("#gridP2 .fighter-chip").forEach((b) =>
      b.addEventListener("click", () => { selP2 = +b.dataset.i; refreshSel(); })
    );
    host.querySelector("#startBtn").addEventListener("click", startMatch);
    document.getElementById("p2title").textContent = mode === "cpu" ? "Rakip (CPU)" : "2. Oyuncu";
    refreshSel();
  }

  function refreshSel() {
    document.querySelectorAll("#gridP1 .fighter-chip").forEach((b, i) =>
      b.classList.toggle("sel-p1", i === selP1));
    document.querySelectorAll("#gridP2 .fighter-chip").forEach((b, i) =>
      b.classList.toggle("sel-p2", i === selP2));
  }

  function startMatch() {
    // Ses motorunu kullanıcı etkileşimiyle başlat (tarayıcı politikası)
    if (window.JJKAudio) { JJKAudio.init(); JJKAudio.resume(); JJKAudio.startMusic(); }
    winsNeeded=Math.ceil(matchFormat/2);
    p1 = makeFighter(ROSTER[selP1], 150, 1, false, P1, stance);
    p2 = makeFighter(ROSTER[selP2], 330, -1, mode === "cpu", P2, "balanced");
    p1.wins = 0; p2.wins = 0; round = 1;
    resetRound();
    document.getElementById("selectScreen").classList.add("hidden");
    document.getElementById("resultScreen").classList.add("hidden");
    scene = "fight";
  }

  function showResult(winner) {
    const host = document.getElementById("resultScreen");
    host.innerHTML = `
      <span class="result-kicker">DÜELLO RAPORU // ${DIFFICULTY[difficulty].label}</span><h2>${winner.name} kazandı! 🏆</h2>
      <p class="ov-sub">${p1.name} ${p1.wins} — ${p2.wins} ${p2.name}</p>
      <div class="duel-report"><article><small>TOPLAM HASAR</small><strong>${p1.stats.damage}</strong><span>${p2.stats.damage}</span></article><article><small>İSABET</small><strong>${p1.stats.hits}</strong><span>${p2.stats.hits}</span></article><article><small>EN YÜKSEK KOMBO</small><strong>${p1.stats.maxCombo}</strong><span>${p2.stats.maxCombo}</span></article><article><small>ALAN / NİHAİ</small><strong>${p1.stats.ultimates}</strong><span>${p2.stats.ultimates}</span></article></div>
      <div class="mode-row">
        <button class="btn" id="rematchBtn">↻ Yeniden Dövüş</button>
        <button class="btn btn-outline" id="reselectBtn">Karakter Seç</button>
      </div>`;
    host.classList.remove("hidden");
    host.querySelector("#rematchBtn").addEventListener("click", () => {
      p1.wins = 0; p2.wins = 0; p1.stats={hits:0,damage:0,blocked:0,maxCombo:0,specials:0,ultimates:0}; p2.stats={hits:0,damage:0,blocked:0,maxCombo:0,specials:0,ultimates:0}; round = 1; resetRound();
      host.classList.add("hidden"); scene = "fight";
    });
    host.querySelector("#reselectBtn").addEventListener("click", () => {
      host.classList.add("hidden");
      document.getElementById("selectScreen").classList.remove("hidden");
      scene = "select";
    });
  }

  // ---- Başlat ----
  function init() {
    buildSelect();
    const mt = document.getElementById("musicToggle");
    if (mt) mt.addEventListener("click", () => {
      const on = window.JJKAudio ? JJKAudio.toggleMusic() : false;
      mt.textContent = on ? "♪ Müzik: Açık" : "♪ Müzik: Kapalı";
    });
    requestAnimationFrame(loop);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
