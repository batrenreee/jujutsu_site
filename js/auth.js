/* auth.js — Cihazda kalıcı hesap, güvenli parola özeti ve kullanıcıya özel veri alanı. */
(function () {
  "use strict";

  const DB_NAME = "jjk-merkez-accounts";
  const DB_VERSION = 1;
  const SESSION_KEY = "jjk-active-account-v1";
  const MIGRATION_KEY = "jjk-account-data-migrated-v1";
  const PERSONAL_KEYS = [
    "jjk-profile-v1",
    "jjk-favorite-characters-v1",
    "jjk-read-volumes-v2",
    "jjk-saved-news",
    "jjk-quiz-result-v1",
    "jjk-technique-collection-v1",
    "jjk-show-spoilers"
  ];

  if (!localStorage.getItem(SESSION_KEY)) document.documentElement.classList.add("auth-locked");

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("accounts")) {
          const accounts = db.createObjectStore("accounts", { keyPath: "id" });
          accounts.createIndex("email", "email", { unique: true });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Hesap veritabanı açılamadı."));
    });
  }

  async function withStore(mode, operation) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("accounts", mode);
      const store = transaction.objectStore("accounts");
      let request;
      try { request = operation(store); }
      catch (error) { db.close(); reject(error); return; }
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error("Veritabanı işlemi tamamlanamadı."));
      transaction.oncomplete = () => db.close();
    });
  }

  const getAccount = id => id ? withStore("readonly", store => store.get(id)) : Promise.resolve(null);
  const getAccountByEmail = email => withStore("readonly", store => store.index("email").get(email));
  const saveAccount = account => withStore("readwrite", store => store.put(account));

  function bytesToBase64(bytes) {
    let value = "";
    bytes.forEach(byte => { value += String.fromCharCode(byte); });
    return btoa(value);
  }

  function base64ToBytes(value) {
    return Uint8Array.from(atob(value), char => char.charCodeAt(0));
  }

  async function passwordHash(password, saltValue) {
    const encoder = new TextEncoder();
    const salt = saltValue ? base64ToBytes(saltValue) : crypto.getRandomValues(new Uint8Array(16));
    const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" }, key, 256);
    return { salt: bytesToBase64(salt), hash: bytesToBase64(new Uint8Array(bits)) };
  }

  function safeEqual(left, right) {
    if (left.length !== right.length) return false;
    let result = 0;
    for (let i = 0; i < left.length; i += 1) result |= left.charCodeAt(i) ^ right.charCodeAt(i);
    return result === 0;
  }

  function activeId() { return localStorage.getItem(SESSION_KEY) || ""; }
  function userStorageKey(key, id = activeId()) { return `jjk-user:${id || "guest"}:${key}`; }

  const storage = {
    getItem(key) { return localStorage.getItem(userStorageKey(key)); },
    setItem(key, value) { localStorage.setItem(userStorageKey(key), String(value)); },
    removeItem(key) { localStorage.removeItem(userStorageKey(key)); }
  };

  function migrateLegacyData(account) {
    if (localStorage.getItem(MIGRATION_KEY)) return;
    PERSONAL_KEYS.forEach(key => {
      const legacy = localStorage.getItem(key);
      const target = userStorageKey(key, account.id);
      if (legacy !== null && localStorage.getItem(target) === null) localStorage.setItem(target, legacy);
    });
    localStorage.setItem(MIGRATION_KEY, account.id);
  }

  async function register({ displayName, email, password }) {
    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLocaleLowerCase("tr-TR");
    if (cleanName.length < 2) throw new Error("Dosya adı en az 2 karakter olmalı.");
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error("Geçerli bir e-posta adresi gir.");
    if (password.length < 8) throw new Error("Parola en az 8 karakter olmalı.");
    if (await getAccountByEmail(cleanEmail)) throw new Error("Bu e-posta ile zaten bir hesap bulunuyor.");
    const secret = await passwordHash(password);
    const account = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      displayName: cleanName,
      email: cleanEmail,
      passwordHash: secret.hash,
      passwordSalt: secret.salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    await saveAccount(account);
    localStorage.setItem(SESSION_KEY, account.id);
    migrateLegacyData(account);
    if (!storage.getItem("jjk-profile-v1")) {
      storage.setItem("jjk-profile-v1", JSON.stringify({ name: cleanName, title: "Jujutsu Öğrencisi", joined: account.createdAt }));
    }
    return account;
  }

  async function login({ email, password }) {
    const cleanEmail = email.trim().toLocaleLowerCase("tr-TR");
    const account = await getAccountByEmail(cleanEmail);
    if (!account) throw new Error("E-posta veya parola hatalı.");
    const secret = await passwordHash(password, account.passwordSalt);
    if (!safeEqual(secret.hash, account.passwordHash)) throw new Error("E-posta veya parola hatalı.");
    account.lastLoginAt = new Date().toISOString();
    await saveAccount(account);
    localStorage.setItem(SESSION_KEY, account.id);
    return account;
  }

  async function currentUser() {
    const id = activeId();
    if (!id) return null;
    const account = await getAccount(id);
    if (!account) localStorage.removeItem(SESSION_KEY);
    return account;
  }

  async function updateAccount(changes) {
    const account = await currentUser();
    if (!account) throw new Error("Aktif hesap bulunamadı.");
    const updated = { ...account, ...changes, id: account.id, email: account.email, updatedAt: new Date().toISOString() };
    await saveAccount(updated);
    return updated;
  }

  async function changePassword(currentPassword, newPassword) {
    const account = await currentUser();
    if (!account) throw new Error("Aktif hesap bulunamadı.");
    if (newPassword.length < 8) throw new Error("Yeni parola en az 8 karakter olmalı.");
    const currentSecret = await passwordHash(currentPassword, account.passwordSalt);
    if (!safeEqual(currentSecret.hash, account.passwordHash)) throw new Error("Mevcut parola hatalı.");
    const nextSecret = await passwordHash(newPassword);
    account.passwordHash = nextSecret.hash;
    account.passwordSalt = nextSecret.salt;
    account.passwordChangedAt = new Date().toISOString();
    await saveAccount(account);
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    location.href = "index.html";
  }

  function authMarkup() {
    return `<div class="auth-gate" id="authGate" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <aside class="auth-visual"><div class="auth-brand"><b>呪</b><span>JJK MERKEZ<small>KİŞİSEL LANET ARŞİVİ</small></span></div><div><span>JUJUTSU HIGH // ERİŞİM PROTOKOLÜ</span><h1>Dosyana<br />geri dön.</h1><p>Okuma ilerlemen, favori karakterlerin, tekniklerin ve rozetlerin tek bir büyücü kimliğinde saklanır.</p></div><small>帳 &nbsp; KORUNAN YEREL VERİTABANI</small></aside>
      <section class="auth-panel">
        <div class="auth-form-wrap" data-auth-view="login">
          <span class="auth-kicker">PERSONEL GİRİŞİ // 01</span><h2 id="authTitle">Tekrar hoş geldin.</h2><p>Arşivini açmak için kimliğini doğrula.</p>
          <form id="loginForm" novalidate><label>E-posta<input name="email" type="email" autocomplete="email" required placeholder="buyucu@jujutsuhigh.jp" /></label><label>Parola<input name="password" type="password" autocomplete="current-password" required placeholder="En az 8 karakter" /></label><p class="auth-error" role="alert"></p><button class="btn auth-submit" type="submit">Dosyayı aç <span>→</span></button></form>
          <div class="auth-switch"><span>Henüz bir büyücü dosyan yok mu?</span><button type="button" data-auth-switch="register">Hesap oluştur</button></div>
        </div>
        <div class="auth-form-wrap" data-auth-view="register" hidden>
          <span class="auth-kicker">YENİ PERSONEL // 02</span><h2>Dosyanı oluştur.</h2><p>İlerlemeni bu cihazdaki güvenli arşive bağla.</p>
          <form id="registerForm" novalidate><label>Dosya adı<input name="displayName" autocomplete="name" maxlength="24" required placeholder="Büyücü adın" /></label><label>E-posta<input name="email" type="email" autocomplete="email" required placeholder="buyucu@jujutsuhigh.jp" /></label><label>Parola<input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="En az 8 karakter" /></label><label>Parola tekrar<input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required placeholder="Parolanı doğrula" /></label><p class="auth-error" role="alert"></p><button class="btn auth-submit" type="submit">Kaydı mühürle <span>→</span></button></form>
          <div class="auth-switch"><span>Zaten bir dosyan var mı?</span><button type="button" data-auth-switch="login">Giriş yap</button></div>
        </div>
      </section>
    </div>`;
  }

  function bindGate() {
    const gate = document.querySelector("#authGate");
    const views = gate.querySelectorAll("[data-auth-view]");
    gate.querySelectorAll("[data-auth-switch]").forEach(button => button.addEventListener("click", () => {
      views.forEach(view => { view.hidden = view.dataset.authView !== button.dataset.authSwitch; });
      gate.querySelector(`[data-auth-view="${button.dataset.authSwitch}"] input`).focus();
    }));

    function submitState(form, busy, message = "") {
      const button = form.querySelector("button[type=submit]");
      form.querySelector(".auth-error").textContent = message;
      button.disabled = busy;
      button.classList.toggle("loading", busy);
    }

    gate.querySelector("#loginForm").addEventListener("submit", async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      submitState(form, true);
      try { await login({ email: data.get("email"), password: data.get("password") }); location.reload(); }
      catch (error) { submitState(form, false, error.message); }
    });

    gate.querySelector("#registerForm").addEventListener("submit", async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      if (data.get("password") !== data.get("confirmPassword")) { submitState(form, false, "Parolalar birbiriyle eşleşmiyor."); return; }
      submitState(form, true);
      try { await register({ displayName: data.get("displayName"), email: data.get("email"), password: data.get("password") }); location.reload(); }
      catch (error) { submitState(form, false, error.message); }
    });
  }

  async function bootstrap() {
    try {
      const account = await currentUser();
      if (account) {
        document.documentElement.classList.add("auth-ready");
        document.dispatchEvent(new CustomEvent("jjk:auth-ready", { detail: account }));
        return;
      }
    } catch (error) { console.error(error); }
    document.documentElement.classList.add("auth-locked");
    document.body.insertAdjacentHTML("beforeend", authMarkup());
    bindGate();
    requestAnimationFrame(() => document.querySelector("#authGate").classList.add("visible"));
  }

  window.JJKAuth = { activeId, storage, register, login, logout, currentUser, updateAccount, changePassword };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  else bootstrap();
})();
