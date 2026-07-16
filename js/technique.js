/* technique.js — Seçim tabanlı özgün lanet tekniği üreticisi ve yerel arşiv. */
(function () {
  "use strict";
  const STORAGE_KEY="jjk-technique-collection-v1";
  const choice={source:null,form:null,vow:null};
  let current=null;

  const SOURCES={
    memory:{label:"Hafıza",glyph:"記",prefix:"Yankı",color:"#58a8ff",desc:"Dokunduğu hedefin lanet enerjisi izini kaydeder ve aynı hareketi gecikmeli olarak yeniden üretir.",extension:"Kayıt Katmanı",domain:"Sonsuz Hatıra"},
    fear:{label:"Korku",glyph:"恐",prefix:"Kâbus",color:"#9c63ff",desc:"Hedefin içgüdüsel korkusunu lanet enerjisine dönüştürerek algısını ve kararlarını bozar.",extension:"Dehşet Eşiği",domain:"Sessiz Kâbus"},
    rage:{label:"Öfke",glyph:"怒",prefix:"Kızıl",color:"#ff4747",desc:"Bastırılmış öfkeyi yoğun darbe enerjisine çevirir; kullanıcı hasar aldıkça çıktı yükselir.",extension:"İkinci Nabız",domain:"Kızıl İnfaz"},
    void:{label:"Boşluk",glyph:"虚",prefix:"Hiçlik",color:"#28d7c0",desc:"İki nokta arasındaki lanetli mesafeyi eksilterek saldırının yönünü ve varış anını değiştirir.",extension:"Eksik Koordinat",domain:"Koordinatsız Ufuk"}
  };
  const FORMS={
    close:{label:"Yakın Dövüş",suffix:"Mührü",basic:"Temas Mührü",effect:"Avuç veya silah temasıyla formülü doğrudan hedefin bedenine işler.",domain:"Darbe Salonu",stats:[92,54,64,58]},
    range:{label:"Menzil",suffix:"Yörüngesi",basic:"İz Süren Atış",effect:"İşaretlenen lanet enerjisini görüş hattı bozulsa bile takip eden bir mermiye dönüştürür.",domain:"Kayıp Yörüngeler",stats:[72,94,62,68]},
    barrier:{label:"Bariyer",suffix:"Kafesi",basic:"Dört Köşe Perde",effect:"Küçük bir bölgeyi kuralları kullanıcı tarafından belirlenen kapalı bir formüle çevirir.",domain:"Kapalı Mahkeme",stats:[66,70,95,86]},
    summon:{label:"Çağırma",suffix:"Alayı",basic:"Gölge Vekil",effect:"Tekniğin bir parçasını bağımsız hareket eden lanetli bir vekile aktarır.",domain:"Bin Vekil",stats:[75,82,78,72]}
  };
  const VOWS={
    measured:{label:"Ölçülü",cost:"Teknik aynı hedefte arka arkaya kullanılamaz.",maximum:"Azami: Kusursuz Uygulama",boost:[-4,-2,10,14],score:0},
    balanced:{label:"Dengeli",cost:"Kullanıcı tekniğin koşulunu hedefe açıklamak zorundadır.",maximum:"Azami: Açıklanmış Formül",boost:[7,5,4,4],score:1},
    extreme:{label:"Ölümcül",cost:"Azami çıktı kullanıcının bedeninde kalıcı bir lanet izi bırakır.",maximum:"Azami: Geri Dönüşsüz Hüküm",boost:[16,10,-7,-9],score:2}
  };
  const STAT_LABELS=["Çıktı","Menzil","Kontrol","Verim"];

  function readArchive(){try{const v=JSON.parse(JJKAuth.storage.getItem(STORAGE_KEY)||"[]");return Array.isArray(v)?v:[];}catch{return[];}}
  function writeArchive(items){JJKAuth.storage.setItem(STORAGE_KEY,JSON.stringify(items));}
  function clamp(v){return Math.max(8,Math.min(100,v));}

  function select(group,value,button){
    choice[group]=value;
    const field=button.closest("fieldset"); field.querySelectorAll("button").forEach(b=>{b.classList.toggle("selected",b===button);b.setAttribute("aria-pressed",b===button?"true":"false");});
    const count=Object.values(choice).filter(Boolean).length;
    document.querySelector("#formulaStatus").textContent=`${count} / 3 parametre seçildi`;
    document.querySelector("#formulaProgress").style.width=`${count/3*100}%`;
    document.querySelector("#generateTechnique").disabled=count!==3;
  }

  function generate(){
    const s=SOURCES[choice.source],f=FORMS[choice.form],v=VOWS[choice.vow];
    const stats=f.stats.map((n,i)=>clamp(n+v.boost[i]));
    const domainScore=v.score+(choice.form==="barrier"?2:0)+(stats[2]>=85?1:0)+(choice.source==="void"?1:0);
    const hasDomain=domainScore>=3;
    current={id:`tech-${Date.now()}`,name:`${s.prefix} ${f.suffix}`,glyph:s.glyph,source:s.label,form:f.label,vow:v.label,color:s.color,grade:stats[0]>=90&&stats[2]>=80?"Özel Sınıf Potansiyeli":stats[0]>=80?"1. Sınıf":"2. Sınıf",description:`${s.desc} ${f.effect}`,basic:f.basic,extension:s.extension,maximum:v.maximum,cost:v.cost,domain:hasDomain?`Alan Genişletme: ${s.domain} — ${f.domain}`:null,stats,createdAt:new Date().toISOString()};
    renderResult();
    document.querySelector("#techniqueResult").scrollIntoView({behavior:"smooth",block:"center"});
  }

  function statRows(t){return t.stats.map((n,i)=>`<div><span>${STAT_LABELS[i]}</span><i><b style="width:${n}%"></b></i><strong>${n}</strong></div>`).join("");}
  function renderResult(){
    const t=current,host=document.querySelector("#techniqueResult");
    host.style.setProperty("--tech-color",t.color);
    host.innerHTML=`<article class="generated-technique"><header><div class="technique-glyph">${t.glyph}</div><div><span>ÜRETİLMİŞ LANET TEKNİĞİ</span><h2>${JJK.escapeHtml(t.name)}</h2><p>${JJK.escapeHtml(t.grade)} · ${JJK.escapeHtml(t.source)} / ${JJK.escapeHtml(t.form)}</p></div><b>術式</b></header><div class="generated-body"><section><p class="generated-lead">${JJK.escapeHtml(t.description)}</p><div class="technique-kit"><div><small>TEMEL UYGULAMA</small><strong>${JJK.escapeHtml(t.basic)}</strong></div><div><small>TEKNİK GENİŞLETME</small><strong>${JJK.escapeHtml(t.extension)}</strong></div><div><small>AZAMİ TEKNİK</small><strong>${JJK.escapeHtml(t.maximum)}</strong></div>${t.domain?`<div class="domain-result"><small>ALAN KAZANIMI</small><strong>${JJK.escapeHtml(t.domain)}</strong></div>`:`<div><small>BARİYER SONUCU</small><strong>Alan genişletme eşiği oluşmadı</strong></div>`}</div><div class="vow-cost"><span>BAĞLAYICI YEMİNİN BEDELİ</span><p>${JJK.escapeHtml(t.cost)}</p></div></section><aside><span>TEKNİK ANALİZİ</span><div class="generated-stats">${statRows(t)}</div><button class="btn" id="saveTechnique" type="button">Arşive kaydet</button><button class="btn btn-outline" id="copyTechnique" type="button">Dosyayı kopyala</button></aside></div></article>`;
    document.querySelector("#saveTechnique").addEventListener("click",saveCurrent);
    document.querySelector("#copyTechnique").addEventListener("click",copyCurrent);
  }

  function saveCurrent(){
    const items=readArchive(); if(items.some(x=>x.id===current.id))return JJK.toast("Bu teknik zaten arşivde.");
    items.unshift(current);writeArchive(items.slice(0,12));renderArchive();JJK.toast("Teknik kişisel arşive mühürlendi.");
  }
  async function copyCurrent(){
    const t=current,text=`${t.name} — ${t.grade}\n${t.description}\n${t.maximum}${t.domain?`\n${t.domain}`:""}\nYemin: ${t.cost}`;
    try{await navigator.clipboard.writeText(text);JJK.toast("Teknik dosyası kopyalandı.");}catch{JJK.toast("Kopyalama izni alınamadı.");}
  }
  function renderArchive(){
    const host=document.querySelector("#techniqueArchive"),items=readArchive();
    host.innerHTML=items.length?items.map(t=>`<article style="--tech-color:${t.color}"><button type="button" data-remove="${t.id}" aria-label="${JJK.escapeHtml(t.name)} tekniğini sil">×</button><b>${t.glyph}</b><span>${JJK.escapeHtml(t.grade)}</span><h3>${JJK.escapeHtml(t.name)}</h3><p>${JJK.escapeHtml(t.maximum)}</p><small>${t.domain?"ALAN KAZANILDI":"ALAN YOK"}</small></article>`).join(""):`<div class="technique-archive-empty"><b>封</b><h3>Arşiv henüz boş</h3><p>Ürettiğin teknikleri kaydettiğinde burada saklanacak.</p></div>`;
    host.querySelectorAll("[data-remove]").forEach(btn=>btn.addEventListener("click",()=>{writeArchive(readArchive().filter(x=>x.id!==btn.dataset.remove));renderArchive();}));
  }

  function init(){
    document.querySelectorAll("[data-choice]").forEach(field=>field.querySelectorAll("[data-value]").forEach(button=>button.addEventListener("click",()=>select(field.dataset.choice,button.dataset.value,button))));
    document.querySelector("#generateTechnique").addEventListener("click",generate);
    renderArchive();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
