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

  function bindAvatarCropper(input,select){
    const overlay=document.querySelector("#avatarCropper"),canvas=document.querySelector("#avatarCropCanvas"),stage=canvas.closest(".avatar-crop-stage"),zoom=document.querySelector("#avatarZoom"),save=document.querySelector("#avatarCropSave"),error=document.querySelector("#avatarCropError"),ctx=canvas.getContext("2d");
    const state={image:null,url:"",zoom:1,x:0,y:0,dragging:false,lastX:0,lastY:0};

    function dimensions(){
      if(!state.image)return null;
      const base=Math.max(canvas.width/state.image.naturalWidth,canvas.height/state.image.naturalHeight),scale=base*state.zoom;
      return {width:state.image.naturalWidth*scale,height:state.image.naturalHeight*scale};
    }
    function clampPosition(){
      const size=dimensions(); if(!size)return;
      const maxX=Math.max(0,(size.width-canvas.width)/2),maxY=Math.max(0,(size.height-canvas.height)/2);
      state.x=Math.max(-maxX,Math.min(maxX,state.x)); state.y=Math.max(-maxY,Math.min(maxY,state.y));
    }
    function draw(){
      const size=dimensions(); if(!size)return;
      clampPosition(); ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(state.image,(canvas.width-size.width)/2+state.x,(canvas.height-size.height)/2+state.y,size.width,size.height);
    }
    function close(){
      overlay.classList.remove("open");document.body.classList.remove("modal-open");input.value="";error.textContent="";
      if(state.url)URL.revokeObjectURL(state.url); state.image=null;state.url="";
    }
    function open(file){
      const looksLikeImage=file.type.startsWith("image/")||/\.(jpe?g|png|webp|gif|avif)$/i.test(file.name);
      if(!looksLikeImage)throw new Error("Seçilen dosya bir görsel değil. JPG, PNG, WebP veya AVIF dene.");
      if(file.size>15*1024*1024)throw new Error("Görsel 15 MB'tan küçük olmalı.");
      if(state.url)URL.revokeObjectURL(state.url); state.url=URL.createObjectURL(file);
      return new Promise((resolve,reject)=>{
        const image=new Image();
        image.onload=()=>{state.image=image;state.zoom=1;state.x=0;state.y=0;zoom.value="1";draw();overlay.classList.add("open");document.body.classList.add("modal-open");resolve();};
        image.onerror=()=>{URL.revokeObjectURL(state.url);state.url="";reject(new Error("Bu görsel biçimi tarayıcı tarafından açılamadı. Fotoğrafı JPG, PNG veya WebP olarak yeniden kaydedip dene."));};
        image.src=state.url;
      });
    }
    zoom.addEventListener("input",()=>{state.zoom=Number(zoom.value);draw();});
    canvas.addEventListener("pointerdown",event=>{state.dragging=true;state.lastX=event.clientX;state.lastY=event.clientY;stage.classList.add("dragging");canvas.setPointerCapture(event.pointerId);});
    canvas.addEventListener("pointermove",event=>{if(!state.dragging)return;const ratio=canvas.width/canvas.getBoundingClientRect().width;state.x+=(event.clientX-state.lastX)*ratio;state.y+=(event.clientY-state.lastY)*ratio;state.lastX=event.clientX;state.lastY=event.clientY;draw();});
    function stopDrag(){state.dragging=false;stage.classList.remove("dragging");}
    canvas.addEventListener("pointerup",stopDrag);canvas.addEventListener("pointercancel",stopDrag);
    document.querySelector("#avatarCropClose").addEventListener("click",close);document.querySelector("#avatarCropCancel").addEventListener("click",close);overlay.addEventListener("click",event=>{if(event.target===overlay)close();});
    save.addEventListener("click",()=>{
      save.disabled=true;save.textContent="Kaydediliyor…";error.textContent="";
      canvas.toBlob(blob=>{
        if(!blob){error.textContent="Kırpılmış görsel oluşturulamadı.";save.disabled=false;save.textContent="Fotoğrafı kaydet";return;}
        const reader=new FileReader();
        reader.onerror=()=>{error.textContent="Kırpılmış görsel okunamadı.";save.disabled=false;save.textContent="Fotoğrafı kaydet";};
        reader.onload=async()=>{try{await JJKAuth.updateAccount({avatarDataUrl:reader.result});location.reload();}catch(caught){error.textContent=caught.message;save.disabled=false;save.textContent="Fotoğrafı kaydet";}};
        reader.readAsDataURL(blob);
      },"image/jpeg",.86);
    });
    return open;
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
    const openCropper=bindAvatarCropper(input,select);
    input.addEventListener("change",async()=>{
      const file=input.files?.[0]; if(!file)return;
      select.disabled=true; select.textContent="Hazırlanıyor…";
      try{await openCropper(file);}
      catch(error){JJK.toast(error.message);input.value="";}
      finally{select.disabled=false;select.textContent="Fotoğraf seç";}
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
