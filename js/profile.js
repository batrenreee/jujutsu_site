/* profile.js — Yerel büyücü kimliği, koleksiyonlar ve başarı rozetleri. */
(function () {
  "use strict";

  const KEYS={profile:"jjk-profile-v1",favorites:"jjk-favorite-characters-v1",read:"jjk-read-volumes-v2",saved:"jjk-saved-news",quiz:"jjk-quiz-result-v1",techniques:"jjk-technique-collection-v1"};
  const BADGES=[
    {id:"first",icon:"壱",title:"İlk Mühür",note:"İlk cildi tamamla",test:s=>s.read>=1},
    {id:"collector",icon:"蒐",title:"Dosya Koleksiyoncusu",note:"3 karakter kaydet",test:s=>s.favorites>=3},
    {id:"reader",icon:"読",title:"Arşiv Okuru",note:"3 haberi listene ekle",test:s=>s.saved>=3},
    {id:"soul",icon:"魂",title:"Ruh Eşleşmesi",note:"Karakter testini tamamla",test:s=>!!s.quiz},
    {id:"architect",icon:"術",title:"Teknik Mimarı",note:"İlk özgün tekniğini mühürle",test:s=>s.techniques>=1},
    {id:"manga",icon:"十",title:"Manga Takipçisi",note:"10 cildi tamamla",test:s=>s.read>=10},
    {id:"research",icon:"究",title:"Lanet Araştırmacısı",note:"8 karakter kaydet",test:s=>s.favorites>=8},
    {id:"special",icon:"特",title:"Özel Sınıf Arşivci",note:"31 cildin tamamını oku",test:s=>s.read>=31}
  ];

  function json(key,fallback){try{return JSON.parse(JJKAuth.storage.getItem(key)||"null")||fallback;}catch{return fallback;}}
  function profile(account){return {...{name:account?.displayName||"İsimsiz Büyücü",title:"Jujutsu Öğrencisi",joined:account?.createdAt||new Date().toISOString()},...json(KEYS.profile,{})};}
  function favoriteData(){return json(KEYS.favorites,[]).map(item=>typeof item==="string"?{id:item,name:item,img:`img/characters/${item}.webp`,grade:"Dosya",affiliation:"JJK Evreni"}:item);}

  async function init(){
    const [manga,account]=await Promise.all([JJK.fetchJSON("data/manga.json"),JJKAuth.currentUser()]);
    const p=profile(account), favorites=favoriteData(), read=json(KEYS.read,{}), saved=json(KEYS.saved,[]), quiz=json(KEYS.quiz,null);
    if(!JJKAuth.storage.getItem(KEYS.profile))JJKAuth.storage.setItem(KEYS.profile,JSON.stringify(p));
    const stats={read:Object.keys(read).filter(id=>read[id]).length,favorites:favorites.length,saved:Array.isArray(saved)?saved.length:0,quiz,techniques:json(KEYS.techniques,[]).length};
    const xp=stats.read*80+stats.favorites*35+stats.saved*20+stats.techniques*45+(quiz?100:0), level=Math.floor(xp/250)+1, nextXp=level*250, progress=Math.round((xp%250)/250*100);
    const lead=favorites[0]||quiz||null;

    document.querySelector("#profileHero").innerHTML=`
      <div class="profile-sigil"><div>${account?.avatarDataUrl?`<img src="${JJK.escapeHtml(account.avatarDataUrl)}" alt="${JJK.escapeHtml(p.name)} profil fotoğrafı" />`:lead?`<img src="${JJK.escapeHtml(lead.img)}" alt="${JJK.escapeHtml(lead.name||p.name)}" />`:'<b>呪</b>'}</div><span>LEVEL ${level}</span></div>
      <div class="profile-identity"><span>JUJUTSU HIGH // PERSONEL DOSYASI</span><h1>${JJK.escapeHtml(p.name)}</h1><p>${JJK.escapeHtml(p.title)}</p><div class="profile-xp"><i style="width:${progress}%"></i><small>${xp} XP · sonraki seviye ${nextXp} XP</small></div></div>
      <div class="profile-clearance"><small>ERİŞİM SEVİYESİ</small><strong>${level>=5?"ÖZEL":level>=3?"1. SINIF":"ADAY"}</strong><em>${JJK.escapeHtml(account?.email||"")}</em><button id="editProfile" type="button">Kimliği düzenle ↗</button><button id="logoutAccount" type="button">Hesaptan çık →</button></div>`;

    document.querySelector("#profileMetrics").innerHTML=`<article><span>01</span><strong>${stats.read}<small>/31</small></strong><p>Okunan cilt</p></article><article><span>02</span><strong>${stats.favorites}</strong><p>Favori karakter</p></article><article><span>03</span><strong>${stats.saved}</strong><p>Kayıtlı haber</p></article><article><span>04</span><strong>${BADGES.filter(b=>b.test(stats)).length}<small>/${BADGES.length}</small></strong><p>Açılan rozet</p></article>`;

    document.querySelector("#badgeVault").innerHTML=BADGES.map(b=>{const unlocked=b.test(stats);return `<article class="profile-badge ${unlocked?"unlocked":"locked"}"><div><b>${unlocked?b.icon:"?"}</b></div><span>${unlocked?"AÇILDI":"KİLİTLİ"}</span><h3>${b.title}</h3><p>${b.note}</p></article>`;}).join("");

    const favHost=document.querySelector("#profileFavorites");
    favHost.innerHTML=favorites.length?favorites.map((c,i)=>`<a href="karakterler.html?character=${encodeURIComponent(c.id)}" class="profile-favorite"><div><img src="${JJK.escapeHtml(c.img)}" alt="${JJK.escapeHtml(c.name)}" /><span>0${i+1}</span></div><small>${JJK.escapeHtml(c.grade||"Dosya")}</small><h3>${JJK.escapeHtml(c.name)}</h3><p>${JJK.escapeHtml(c.affiliation||"")}</p></a>`).join(""):`<div class="profile-empty"><b>☆</b><h3>Koleksiyon boş</h3><p>Karakter vikisindeki yıldız düğmesiyle favorilerini buraya ekle.</p><a class="btn" href="karakterler.html">Karakter seç</a></div>`;

    const readVolumes=manga.volumes.filter(v=>read[v.id]), next=manga.volumes.find(v=>!read[v.id]);
    document.querySelector("#profileShelf").innerHTML=`<div class="shelf-books">${readVolumes.length?readVolumes.slice(-8).map(v=>`<a href="manga.html?volume=${v.id}" title="Cilt ${v.number}: ${JJK.escapeHtml(v.title)}"><img src="${JJK.escapeHtml(v.cover)}" alt="Cilt ${v.number}" /><span>${String(v.number).padStart(2,"0")}</span></a>`).join(""):'<div class="shelf-empty">Henüz tamamlanan cilt yok.</div>'}</div><aside>${next?`<span>SIRADAKİ CİLT</span><strong>${String(next.number).padStart(2,"0")}</strong><h3>${JJK.escapeHtml(next.title)}</h3><p>${JJK.escapeHtml(next.arc)} · Bölüm ${JJK.escapeHtml(next.chapters)}</p><a href="manga.html?volume=${next.id}">Dosyayı aç →</a>`:'<span>ARŞİV TAMAMLANDI</span><strong>✓</strong><h3>Özel sınıf okur</h3><p>Bütün ana seri koleksiyonunda işaretlendi.</p>'}</aside>`;

    bindEditor(p);
    bindAccountSettings(account,p);
    document.querySelector("#logoutAccount").addEventListener("click",JJKAuth.logout);
  }

  function imageToAvatar(file){
    return new Promise((resolve,reject)=>{
      if(!/^image\/(jpeg|png|webp)$/.test(file.type)){reject(new Error("Yalnızca JPG, PNG veya WebP yükleyebilirsin."));return;}
      if(file.size>8*1024*1024){reject(new Error("Görsel 8 MB'tan küçük olmalı."));return;}
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error("Görsel okunamadı."));
      reader.onload=()=>{
        const image=new Image();
        image.onerror=()=>reject(new Error("Görsel işlenemedi."));
        image.onload=()=>{
          const size=Math.min(image.naturalWidth,image.naturalHeight),x=(image.naturalWidth-size)/2,y=(image.naturalHeight-size)/2;
          const canvas=document.createElement("canvas"); canvas.width=512; canvas.height=512;
          canvas.getContext("2d").drawImage(image,x,y,size,size,0,0,512,512);
          resolve(canvas.toDataURL("image/jpeg",.84));
        };
        image.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function bindAccountSettings(account,p){
    if(!account)return;
    const preview=document.querySelector("#avatarPreview"),input=document.querySelector("#avatarInput"),select=document.querySelector("#avatarSelect"),remove=document.querySelector("#avatarRemove");
    const initials=account.displayName.trim().split(/\s+/).slice(0,2).map(part=>part[0]).join("").toLocaleUpperCase("tr-TR")||"呪";
    preview.innerHTML=account.avatarDataUrl?`<img src="${JJK.escapeHtml(account.avatarDataUrl)}" alt="Profil fotoğrafı" />`:JJK.escapeHtml(initials);
    remove.hidden=!account.avatarDataUrl;
    document.querySelector("#settingsDisplayName").textContent=p.name;
    document.querySelector("#settingsEmail").textContent=account.email;
    document.querySelector("#settingsJoined").textContent=new Date(account.createdAt).toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
    document.querySelector("#settingsEditProfile").addEventListener("click",()=>document.querySelector("#editProfile").click());
    select.addEventListener("click",()=>input.click());
    input.addEventListener("change",async()=>{
      const file=input.files?.[0]; if(!file)return;
      select.disabled=true; select.textContent="İşleniyor…";
      try{const avatarDataUrl=await imageToAvatar(file);await JJKAuth.updateAccount({avatarDataUrl});location.reload();}
      catch(error){JJK.toast(error.message);select.disabled=false;select.textContent="Fotoğraf seç";input.value="";}
    });
    remove.addEventListener("click",async()=>{remove.disabled=true;await JJKAuth.updateAccount({avatarDataUrl:""});location.reload();});

    const form=document.querySelector("#passwordForm"),message=document.querySelector("#passwordMessage");
    form.addEventListener("submit",async event=>{
      event.preventDefault(); const data=new FormData(form),current=data.get("currentPassword"),next=data.get("newPassword"),confirm=data.get("confirmPassword"),button=form.querySelector("button[type=submit]");
      message.className="settings-message";
      if(next!==confirm){message.textContent="Yeni parolalar eşleşmiyor.";message.classList.add("error");return;}
      button.disabled=true;button.textContent="Doğrulanıyor…";
      try{await JJKAuth.changePassword(current,next);form.reset();message.textContent="Parolan başarıyla güncellendi.";message.classList.add("success");}
      catch(error){message.textContent=error.message;message.classList.add("error");}
      finally{button.disabled=false;button.textContent="Parolayı güncelle";}
    });
  }

  function bindEditor(p){
    const overlay=document.querySelector("#profileEditor"),form=overlay.querySelector("form"),name=document.querySelector("#profileName"),title=document.querySelector("#profileTitle");
    document.querySelector("#editProfile").addEventListener("click",()=>{name.value=p.name;title.value=p.title;overlay.classList.add("open");document.body.classList.add("modal-open");name.focus();});
    function close(){overlay.classList.remove("open");document.body.classList.remove("modal-open");}
    overlay.querySelector(".modal-close").addEventListener("click",close); overlay.addEventListener("click",e=>{if(e.target===overlay)close();});
    form.addEventListener("submit",async e=>{e.preventDefault();const updated={...p,name:name.value.trim()||"İsimsiz Büyücü",title:title.value};JJKAuth.storage.setItem(KEYS.profile,JSON.stringify(updated));await JJKAuth.updateAccount({displayName:updated.name});location.reload();});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>init().catch(e=>document.querySelector("#profileHero").innerHTML=`<p class="empty">Profil yüklenemedi: ${JJK.escapeHtml(e.message)}</p>`));
  else init();
})();
