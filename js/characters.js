/* characters.js — Aranabilir, filtrelenebilir Jujutsu Kaisen karakter vikisi. */
(function () {
  "use strict";

  const EXTRA = [
    ["akari-nitta","Akari Nitta","新田 明","Yardımcı","Tokyo Jujutsu Lisesi","Hayatta","Yardımcı yönetici; büyücüleri görevlere taşır ve saha koordinasyonu sağlar.","Saha koordinasyonu|Araç kullanımı"],
    ["arata-nitta","Arata Nitta","新田 新","Büyücü","Kyoto Jujutsu Lisesi","Hayatta","Birinci sınıf öğrencisi. Yaraların kötüleşmesini durduran destek tekniğiyle Shibuya'da kritik rol oynar.","Ağrı Katili|İlk yardım|Destek"],
    ["atsuyu-kusakabe","Atsuya Kusakabe","日下部 篤也","Büyücü","Tokyo Jujutsu Lisesi","Hayatta","Doğuştan tekniği olmadan birinci sınıfa yükselen, Yeni Gölge Stili'nin usta kılıç kullanıcısı.","Yeni Gölge Stili|Basit Alan|Kılıç"],
    ["angel","Angel","天使","Büyücü","Culling Game","Hayatta","Hana Kurusu ile aynı bedeni paylaşan Heian dönemi büyücüsü; lanetli teknikleri söndürebilir.","Teknik Söndürme|Jacob's Ladder|Uçuş"],
    ["hana-kurusu","Hana Kurusu","来栖 華","Büyücü","Culling Game","Hayatta","Angel'ın taşıyıcısı olan modern büyücü; Megumi'ye çocukluğundan beri güçlü bir bağ hisseder.","Angel'ın Taşıyıcısı|Jacob's Ladder|Uçuş"],
    ["charles-bernard","Charles Bernard","シャルル・ベルナール","Büyücü","Culling Game","Hayatta","Manga çizeri olmayı arzulayan oyuncu; G Warstaff ile rakibinin yakın geleceğini görür.","G Warstaff|Gelecek Görüşü|Mızrak"],
    ["dhruv","Dhruv Lakdawalla","ドルゥヴ・ラクダワラ","Büyücü","Culling Game","Hayatını kaybetti","İkinci kez bedenlenen kadim büyücü. Shikigamilerinin izleriyle alan oluşturur.","Shikigami|Alan yörüngesi|Kadim büyücü"],
    ["takako-uro","Takako Uro","烏鷺 亨子","Büyücü","Culling Game","Bilinmiyor","Fujiwara suikast birliğinin eski kaptanı; gökyüzünü yüzey gibi bükerek uzayı yönlendirir.","Gökyüzü Manipülasyonu|İnce Buz Kırıcı|Uçuş"],
    ["ryu-ishigori","Ryu Ishigori","石流 龍","Büyücü","Culling Game","Hayatını kaybetti","Tarihin en yüksek lanet enerjisi çıkışlarından birine sahip bedenlenmiş oyuncu.","Granite Blast|Yüksek enerji çıkışı|Alan Genişletme"],
    ["reggie-star","Reggie Star","レジィ・スター","Büyücü","Culling Game","Hayatını kaybetti","Fişlerde yazılı ürünleri yeniden yaratan sözleşme tekniğiyle savaşan stratejist.","Sözleşme Yeniden Yaratımı|Hollow Wicker Basket|Strateji"],
    ["remi","Remi","麗美","Büyücü","Culling Game","Bilinmiyor","Tokyo No. 1 Kolonisi'nde hedefleri Reggie'nin grubuna çeken modern oyuncu.","Akrep Saçı|Aldatma|Yakın dövüş"],
    ["iori-hazenoki","Iori Hazenoki","黄櫨 折","Büyücü","Culling Game","Hayatını kaybetti","Kendi beden parçalarını patlayıcıya çeviren bedenlenmiş büyücü.","Patlayıcı Et|Ters Lanet Tekniği|Yakın dövüş"],
    ["chizuru-hari","Chizuru Hari","針 千鈞","Büyücü","Culling Game","Hayatını kaybetti","Reggie'nin grubunda yer alan Culling Game oyuncusu.","Lanet enerjisi|Yakın dövüş"],
    ["rin-amai","Rin Amai","甘井 凛","Büyücü","Culling Game","Hayatta","Yuji'nin eski okul çevresinden; şekeri maddesel biçimde üretebilen modern oyuncu.","Şeker Üretimi|Destek|Rehberlik"],
    ["fumihiko-takaba","Fumihiko Takaba","髙羽 史彦","Büyücü","Culling Game","Hayatta","Komik bulduğu şeyleri gerçeğe dönüştüren Comedian tekniğinin sahibi başarısız komedyen.","Comedian|Gerçeklik bükme|Dayanıklılık"],
    ["hagane-daido","Hagane Daido","大道 鋼","Büyücü","Culling Game","Hayatta","Lanet enerjisini göremese de her şeyi algılayan eşsiz bir kılıç ustası.","Kılıç ustalığı|Keskin algı|Katana"],
    ["rokumushi-miyo","Rokujushi Miyo","三代 六十四","Büyücü","Culling Game","Hayatta","Sumoya takıntılı bedenlenmiş oyuncu; zamanın farklı aktığı basit bir alan kurar.","Sumo Alanı|Basit Alan|Yakın dövüş"],
    ["hanyu","Hanyu","羽生","Büyücü","Culling Game","Bilinmiyor","Saçını jet motoruna dönüştürerek havada yüksek hızla saldırır.","Jet Saçı|Uçuş|Dalış saldırısı"],
    ["haba","Haba","羽場","Büyücü","Culling Game","Bilinmiyor","Saçını helikopter pervanesine dönüştüren ve Hanyu ile çalışan oyuncu.","Pervane Saç|Uçuş|Dayanıklılık"],
    ["kirara-hoshi","Kirara Hoshi","星 綺羅羅","Büyücü","Tokyo Jujutsu Lisesi","Hayatta","Hakari'nin yakın müttefiki; yıldız işaretleriyle hedeflerin yaklaşma sırasını kontrol eder.","Love Rendezvous|Yıldız işaretleri|Alan kontrolü"],
    ["kasumi-miwa","Kasumi Miwa","三輪 霞","Büyücü","Kyoto Jujutsu Lisesi","Hayatta","Çalışkan kılıç öğrencisi; Yeni Gölge Stili ve Basit Alan kullanır.","Yeni Gölge Stili|Basit Alan|Batto"],
    ["yoshinobu-gakuganji","Yoshinobu Gakuganji","楽巌寺 嘉伸","Büyücü","Kyoto Jujutsu Lisesi","Hayatta","Kyoto okulunun muhafazakâr müdürü; elektro gitarıyla lanet enerjisi dalgaları yollar.","Ses Yükseltme|Elektro gitar|Yakın dövüş"],
    ["masamichi-yaga","Masamichi Yaga","夜蛾 正道","Büyücü","Tokyo Jujutsu Lisesi","Hayatını kaybetti","Tokyo okulunun eski müdürü ve Panda'nın yaratıcısı; bağımsız lanetli ceset uzmanı.","Lanetli Ceset|Çekirdek bilgisi|Yakın dövüş"],
    ["kiyotaka-ijichi","Kiyotaka Ijichi","伊地知 潔高","Yardımcı","Tokyo Jujutsu Lisesi","Hayatta","Tokyo okulunun güvenilir yardımcı yöneticisi; perdeler kurar ve görev lojistiğini yönetir.","Perde|Koordinasyon|Sürüş"],
    ["ui-ui","Ui Ui","憂憂","Büyücü","Bağımsız","Hayatta","Mei Mei'nin kardeşi ve destekçisi; uzun mesafeli uzamsal aktarım yapabilir.","Uzamsal Aktarım|Basit Alan|Destek"],
    ["yu-haibara","Yu Haibara","灰原 雄","Büyücü","Tokyo Jujutsu Lisesi","Hayatını kaybetti","Nanami'nin neşeli sınıf arkadaşı; öğrenciyken çıktığı görevde yaşamını yitirdi.","Lanet enerjisi|Yakın dövüş"],
    ["misato-kuroi","Misato Kuroi","黒井 美里","Yardımcı","Star Plasma Vessel","Hayatını kaybetti","Riko Amanai'nin bakıcısı ve ailesi yerine koyduğu koruyucusu.","Bakım|Yakın dövüş|Sadakat"],
    ["shiu-kong","Shiu Kong","孔 時雨","Diğer","Time Vessel Association","Hayatta","Toji ile Time Vessel Association arasında aracılık yapan yeraltı bağlantısı.","Aracılık|Bilgi ağı|Pazarlık"],
    ["naobito-zenin","Naobito Zenin","禪院 直毘人","Büyücü","Zenin Klanı","Hayatını kaybetti","Zenin klanının 26. lideri; Projection Sorcery ile saniyeyi 24 kareye böler.","Projection Sorcery|Hız|Falling Blossom Emotion"],
    ["ogi-zenin","Ogi Zenin","禪院 扇","Büyücü","Zenin Klanı","Hayatını kaybetti","Maki ve Mai'nin babası; alevli kılıç ve Yeni Gölge Stili kullanır.","Blazing Courage|Kılıç|Basit Alan"],
    ["jinichi-zenin","Jinichi Zenin","禪院 甚壱","Büyücü","Zenin Klanı","Hayatını kaybetti","Hei biriminin güçlü üyesi; dev taş yumruklar oluşturan tekniğe sahiptir.","Lanetli taş yumruklar|Yakın dövüş|Hei"],
    ["ranta-zenin","Ranta Zenin","禪院 蘭太","Büyücü","Zenin Klanı","Hayatını kaybetti","Rakibin hareketini bakışıyla sabitleyen Kukuru/Hei destek savaşçısı.","Felç edici bakış|Destek|Lanet enerjisi"],
    ["chojuro-zenin","Chojuro Zenin","禪院 長寿郎","Büyücü","Zenin Klanı","Hayatını kaybetti","Yerden dev taş kollar çıkarabilen Hei üyesi.","Toprak kollar|Alan kontrolü|Hei"],
    ["nobuaki-zenin","Nobuaki Zenin","禪院 信朗","Büyücü","Zenin Klanı","Hayatını kaybetti","Zenin klanının Kukuru birliğinin kaptanı ve kılıç kullanıcısı.","Kılıç|Kukuru Birliği|Yakın dövüş"],
    ["naoya-curse","Naoya Zenin (Lanet)","呪霊・直哉","Lanet","Culling Game","Hayatını kaybetti","İntikamla geri dönen Naoya'nın lanetli ruh formu; Projection Sorcery'si çok daha hızlıdır.","Projection Sorcery|Mach 3|Time Cell Moon Palace"],
    ["rika-orimoto","Rika Orimoto","祈本 里香","Diğer","Yuta Okkotsu","Hayatını kaybetti","Yuta'nın çocukluk arkadaşı; ölümü sonrasında istemeden Lanetlerin Kraliçesi'ne dönüşmüştür.","Muazzam lanet enerjisi|Tam tezahür|Bağ"],
    ["rika-shikigami","Rika","リカ","Diğer","Yuta Okkotsu","Uygulanamaz","Orimoto'nun ruhu özgür kaldıktan sonra Yuta'ya kalan dışsal teknik ve enerji deposu.","Teknik depolama|Lanetli araç deposu|Tam tezahür"],
    ["mimiko-hasaba","Mimiko Hasaba","枷場 美々子","Lanet Kullanıcısı","Geto'nun Grubu","Hayatını kaybetti","Geto tarafından kurtarılan ikizlerden biri; fotoğraf tabanlı bir teknik kullanır.","Fotoğraf tekniği|İp bebek|Lanet enerjisi"],
    ["nanako-hasaba","Nanako Hasaba","枷場 菜々子","Lanet Kullanıcısı","Geto'nun Grubu","Hayatını kaybetti","Geto'yu ailesi sayan ikiz lanet kullanıcısı; cep telefonu kamerasıyla hedefi etkiler.","Cep telefonu tekniği|Lanet enerjisi|Çeviklik"],
    ["larue","Larue","ラルゥ","Lanet Kullanıcısı","Geto'nun Grubu","Hayatta","Geto'nun eski ailesinden; kalp yakalayan tekniğiyle hedefin dikkatini ve bedenini çeker.","Heart Catch|Sanal el|Destek"],
    ["manami-suda","Manami Suda","菅田 真奈美","Lanet Kullanıcısı","Geto'nun Grubu","Bilinmiyor","Geto'nun komutanlarından ve grubunun idari yüzlerinden biri.","Lanet enerjisi|Liderlik|Yakın dövüş"],
    ["toshihisa-negi","Toshihisa Negi","祢木 利久","Lanet Kullanıcısı","Geto'nun Grubu","Bilinmiyor","Geto'nun davasına sadık kalan lanet kullanıcısı.","Lanet enerjisi|Yakın dövüş"],
    ["haruta-shigemo","Haruta Shigemo","重面 春太","Lanet Kullanıcısı","Kenjaku'nun Grubu","Hayatını kaybetti","Biriktirdiği küçük mucizeler ölümcül darbelerden kurtulmasını sağlayan sadist kullanıcı.","Mucizeler|El-kılıç|Şans"],
    ["jiro-awasaka","Jiro Awasaka","粟坂 二良","Lanet Kullanıcısı","Kenjaku'nun Grubu","Hayatını kaybetti","Güçlü saldırıları zayıf, zayıf saldırıları güçlü kılan Terslik tekniğinin sahibi.","Terslik|Yakın dövüş|Dayanıklılık"],
    ["ogami","Ogami","オガミ婆","Lanet Kullanıcısı","Kenjaku'nun Grubu","Hayatını kaybetti","Ölülerin beden bilgisini bir taşıyıcıya çağıran seans tekniğini kullanır.","Seans|Beden bilgisi|Perde"],
    ["juzo-kumiya","Juzo Kumiya","組屋 鞣造","Lanet Kullanıcısı","Kenjaku'nun Grubu","Hayatta","İnsan bedenlerinden eşya yapmaya saplantılı zanaatkâr ve savaşçı.","Lanetli araç yapımı|Balta|Dayanıklılık"],
    ["bayer","Bayer","バイエル","Lanet Kullanıcısı","Q","Hayatını kaybetti","Star Plasma Vessel'ı hedefleyen Q örgütünün en güçlü savaşçılarından.","Lanet enerjisi|Bıçaklar|Yakın dövüş"],
    ["kokun","Kokun","コークン","Lanet Kullanıcısı","Q","Bilinmiyor","Q örgütünün Riko Amanai'yi kaçırmakla görevlendirilen üyesi.","Lanet enerjisi|Yakın dövüş"],
    ["eso","Eso","壊相","Lanet","Ölüm Tablosu","Hayatını kaybetti","Dokuz Lanetli Rahim: Ölüm Tablosu kardeşinden biri; çürütücü kanıyla hedefi zehirler.","Rot Technique|Maximum: Wing King|Kan"],
    ["kechizu","Kechizu","血塗","Lanet","Ölüm Tablosu","Hayatını kaybetti","Eso ve Choso'nun kardeşi; zehirli kanını tükürerek Çürüme tekniğini başlatır.","Çürüme|Zehirli kan|Yakın dövüş"],
    ["ko-guy","Ko-Guy","蝗GUY","Lanet","Mahito'nun Grubu","Hayatını kaybetti","İnsan yiyerek güçlenen çekirge laneti; Shibuya'daki perde mekanizmasını korur.","Fiziksel güç|Çoklu kol|Dayanıklılık"],
    ["smallpox-deity","Smallpox Deity","疱瘡婆","Lanet","Kenjaku'nun Lanetleri","Hayatını kaybetti","Hedefini tabuta kilitleyip üç saniyelik ölüm dizisi uygulayan özel sınıf hastalık laneti.","Graveyard Domain|Tabut|Hastalık"],
    ["finger-bearer","Parmak Taşıyıcısı","指の持ち主","Lanet","Sukuna'nın Parmakları","Hayatını kaybetti","Sukuna'nın parmağını tüketerek gelişen, tamamlanmamış alana sahip özel sınıf lanet.","Saf enerji saldırısı|Eksik alan|Yenilenme"],
    ["rainbow-dragon","Gökkuşağı Ejderhası","虹龍","Lanet","Geto'nun Lanetleri","Hayatını kaybetti","Geto'nun kullandığı en dayanıklı lanetli ruhlardan biri.","Uçuş|Dayanıklılık|Yakın dövüş"],
    ["kuchisake-onna","Kuchisake-Onna","口裂け女","Lanet","Geto'nun Lanetleri","Hayatını kaybetti","Sorulu bir basit alan kurup makaslar yaratan hayali intikamcı ruh.","Basit Alan|Makas|Koşullu soru"],
    ["tamamo-no-mae","Tamamo-no-Mae Incarnate","化身玉藻前","Lanet","Geto'nun Lanetleri","Hayatını kaybetti","Geto'nun Gece Geçidi'nde çağırdığı özel sınıf hayali intikamcı ruh.","Özel sınıf|Lanet enerjisi"],
    ["ganesha","Ganesha","ガネーシャ","Lanet","Kenjaku'nun Lanetleri","Hayatını kaybetti","Kavramları ve engelleri ortadan kaldırabilen özel sınıf Asya ilahi laneti.","Kavram kaldırma|Engel kaldırma|Özel sınıf"],
    ["cockroach-spirit","Kurourushi Larvaları","黒沐死の仔","Lanet","Culling Game","Bilinmiyor","Kurourushi'nin döllenmesiz üremeyle bıraktığı ardıl hamamböceği lanetleri.","Hamamböceği sürüsü|Üreme|Festering Life Sword"],
    ["wasuke-itadori","Wasuke Itadori","虎杖 倭助","Sivil","Itadori Ailesi","Hayatını kaybetti","Yuji'yi büyüten dedesi; ona insanlara yardım etmesi yönündeki son sözlerini bırakır.","İrade|Aile bağı"],
    ["jin-itadori","Jin Itadori","虎杖 仁","Sivil","Itadori Ailesi","Hayatını kaybetti","Yuji'nin babası ve Wasuke'nin oğlu; Kaori'nin bedenindeki Kenjaku ile bir çocuk sahibi olur.","Aile bağı|Sukuna bağlantısı"],
    ["kaori-itadori","Kaori Itadori","虎杖 香織","Sivil","Itadori Ailesi","Hayatını kaybetti","Jin'in eşi; Antigravity System tekniğine sahip bedeni daha sonra Kenjaku tarafından kullanılır.","Antigravity System|Ters teknik uygulaması"],
    ["tsumiki-fushiguro","Tsumiki Fushiguro","伏黒 津美紀","Sivil","Fushiguro Ailesi","Hayatını kaybetti","Megumi'nin üvey ablası; Culling Game için Yorozu'nun taşıyıcısına dönüştürülür.","Yorozu'nun taşıyıcısı|Megumi ile bağ"],
    ["saori","Saori","沙織","Sivil","Nobara'nın Geçmişi","Hayatta","Nobara'nın çocukluk döneminde köyde hayranlık duyduğu Tokyo'lu arkadaşı.","Arkadaşlık|Nobara ile bağ"],
    ["fumi","Fumi","ふみ","Sivil","Nobara'nın Geçmişi","Hayatta","Nobara'nın memleketindeki çocukluk arkadaşı.","Arkadaşlık|Nobara ile bağ"],
    ["yuko-ozawa","Yuko Ozawa","小沢 優子","Sivil","Sendai Lisesi","Hayatta","Yuji'nin ortaokul arkadaşı; onun samimiyetinden etkilenmiştir.","Yuji ile bağ|Öğrenci"],
    ["setsuko-sasaki","Setsuko Sasaki","佐々木 節子","Sivil","Okült Araştırma Kulübü","Hayatta","Yuji'nin eski okulundaki Okült Araştırma Kulübü'nün ikinci sınıf üyesi.","Okült araştırma|Arkadaşlık"],
    ["takeshi-iguchi","Takeshi Iguchi","井口 たけし","Sivil","Okült Araştırma Kulübü","Hayatta","Okült kulübünde Sukuna'nın parmağındaki mührü açan öğrencilerden.","Okült araştırma|Arkadaşlık"],
    ["nagi-yoshino","Nagi Yoshino","吉野 凪","Sivil","Yoshino Ailesi","Hayatını kaybetti","Junpei'nin anlayışlı annesi; evine bırakılan Sukuna parmağı yüzünden öldürülür.","Aile bağı|Şefkat"],
    ["tadashi-okazaki","Tadashi Okazaki","岡崎 正","Sivil","Eishu Gözaltı Merkezi","Hayatını kaybetti","Yuji'nin ilk özel sınıf görevinde karşılaştığı gözaltı merkezi mahkûmu.","Sivil"],
    ["nobuko-takada","Nobuko Takada","高田 延子","Sivil","Eğlence Dünyası","Hayatta","Todo'nun büyük hayranlık duyduğu uzun boylu televizyon idolü, Takada-chan.","İdol|Todo ile bağ"],
    ["takeru","Takeru","タケル","Diğer","Yaga'nın Lanetli Cesetleri","Uygulanamaz","Yaga'nın, Atsuya Kusakabe'nin yeğeninin ruh bilgisinden oluşturduğu bağımsız lanetli ceset.","Lanetli Ceset|Bağımsız çekirdek"],
    ["kogane","Kogane","コガネ","Diğer","Culling Game","Uygulanamaz","Culling Game oyuncularına eşlik eden, puan ve kural sistemini yöneten shikigami arayüzü.","Kural yönetimi|Oyuncu takibi|Shikigami"],
    ["garuda","Garuda","凰輪","Diğer","Yuki Tsukumo","Uygulanamaz","Yuki'nin Star Rage tekniğinin hedefi olan ve lanetli araca dönüşebilen shikigamisi.","Star Rage|Lanetli araç|Shikigami"],
    ["inventory-curse","Envanter Laneti","格納型呪霊","Lanet","Toji Fushiguro","Hayatını kaybetti","Toji'nin lanetli araçlarını bedeninde saklayan ve kendini küçültebilen lanet.","Araç depolama|Boyut değiştirme"],
    ["judgeman","Judgeman","ジャッジマン","Diğer","Hiromi Higuruma","Uygulanamaz","Deadly Sentencing alanında delilleri sunup hüküm veren Higuruma shikigamisi.","Yargılama|Delil|Müsadere"],
    ["moon-dregs","Moon Dregs","澱月","Diğer","Junpei Yoshino","Uygulanamaz","Junpei'nin zehir salgılayan denizanası biçimli shikigamisi.","Zehir|Shikigami|Savunma"],
    ["rabbit-escape","Tavşan Kaçışı","脱兎","Diğer","Megumi Fushiguro","Uygulanamaz","On Gölge Tekniği'nin kaçış ve dikkat dağıtma amaçlı tavşan sürüsü.","On Gölge|Dikkat dağıtma|Keşif"],
    ["mahoraga","Divine General Mahoraga","魔虚羅","Diğer","On Gölge Tekniği","Hayatını kaybetti","On Gölge'nin evcilleştirilmemiş en güçlü shikigamisi; karşılaştığı olgulara uyum sağlar.","Adaptasyon|Yok Etme Kılıcı|Sekiz Kollu Çark"],
    ["agito","Merged Beast Agito","嵌合獣顎吐","Diğer","On Gölge Tekniği","Hayatını kaybetti","Nue: Totality tabanlı birleşik shikigami; yüksek hız ve iyileşme yeteneğine sahiptir.","Totality|Elektrik|İyileşme"],
    ["gakuganji-guitar","Moccus","モックス","Diğer","Yaga'nın Lanetli Cesetleri","Uygulanamaz","Yaga tarafından yaratılmış, dövüşte kullanılabilen lanetli cesetlerden biri.","Lanetli Ceset|Yakın dövüş"],
    ["noritoshi-ancestor","Noritoshi Kamo (Ata)","加茂 憲倫","Büyücü","Kamo Klanı","Hayatını kaybetti","Tarihin en kötü büyücüsü olarak anılan beden; gerçekte Kenjaku tarafından ele geçirilmişti.","Kan Manipülasyonu|Ölüm Tablosu deneyleri|Kenjaku"],
    ["michizane-sugawara","Michizane Sugawara","菅原 道真","Büyücü","Tarihi Büyücüler","Hayatını kaybetti","Japonya'nın üç büyük intikamcı ruhundan biri; Gojo ve Yuta'nın uzak atası.","Büyük intikamcı ruh|Gojo soyu"],
    ["shigeru-sonoda","Shigeru Sonoda","園田 茂","Lanet Kullanıcısı","Geto'nun Grubu","Hayatını kaybetti","Suguru Geto'nun eski destekçilerinden; Yuta ve Rika'nın gücünü ele geçirmeyi amaçlayan lanet kullanıcısı.","Lanet enerjisi|Geto ile bağ"],
    ["takada-manager","Takada'nın Menajeri","高田のマネージャー","Sivil","Eğlence Dünyası","Hayatta","Takada-chan'ın etkinliklerini yöneten yardımcı karakter.","Menajerlik"],
    ["keita-oe","Keita Oe","大江 圭太","Sivil","Saitama Urami Hastanesi","Bilinmiyor","Cursed Womb: Death Painting olayları çevresinde adı geçen öğrenci.","Sivil"],
    ["shota-ito","Shota Ito","伊藤 翔太","Sivil","Saitama Urami Hastanesi","Bilinmiyor","Yasohachi Köprüsü vakasıyla bağlantılı yardımcı karakter.","Sivil"],
    ["sotumura","Sotomura","外村","Sivil","Satozakura Lisesi","Hayatta","Junpei'nin okulundaki film kulübünün danışman öğretmeni.","Öğretmen|Film kulübü"],
    ["takagi","Takagi","高木","Sivil","Sugisawa Lisesi","Hayatta","Yuji'nin atletik yeteneğini kulübe kazandırmaya çalışan spor öğretmeni.","Atletizm|Öğretmen"],
    ["kensuke-nagino","Kensuke Nagino","凪野 健介","Sivil","Satozakura Lisesi","Hayatını kaybetti","Junpei'ye zorbalık eden ve Mahito'nun sinemada öldürdüğü öğrencilerden.","Sivil"],
    ["taichi-kanada","Taichi Kanada","金田 太一","Sivil","Satozakura Lisesi","Hayatını kaybetti","Junpei'ye zorbalık eden okul arkadaşlarından biri.","Sivil"]
  ];

  const FEATURED = ["yuji","megumi","nobara","gojo","sukuna","yuta","maki","kenjaku","geto","toji","nanami","choso","mahito","higuruma","kashimo"];
  const FINAL_STATUS = {gojo:"Hayatını kaybetti",nobara:"Hayatta",sukuna:"Hayatını kaybetti",kenjaku:"Hayatını kaybetti",higuruma:"Hayatta",uraume:"Hayatını kaybetti",tengen:"Bilinmiyor"};
  const POWER_RATINGS = {
    gojo:[100,100,96,94,98], sukuna:[100,100,94,100,99], yuji:[88,82,91,96,80], megumi:[83,91,78,75,94], nobara:[72,82,74,71,80],
    yuta:[98,96,87,94,91], maki:[12,76,98,97,88], toji:[0,74,100,96,94], kenjaku:[97,99,84,92,100], nanami:[76,79,75,82,92],
    choso:[88,87,82,90,82], mahito:[93,95,83,92,88], higuruma:[86,94,73,79,97], kashimo:[96,91,94,90,86], hakari:[94,90,88,100,85]
  };
  const STAT_LABELS = ["Lanet enerjisi","Teknik","Hız","Dayanıklılık","Strateji"];
  const IMAGE_NOTES = {angel:"Angel, Hana Kurusu ile aynı bedeni paylaşır; görsel ortak bedenlerini gösterir.","michizane-sugawara":"Kanonda resmî yüz tasarımı bulunmadığı için kamu malı tarihsel Sugawara no Michizane portresi kullanılmıştır."};
  const DETAILS = {
    yuji:{role:"Başkahraman • Tokyo birinci sınıf öğrencisi",abilities:["İnsanüstü fizik ve yakın dövüş sezgisi","Divergent Fist ve art arda Kara Şimşek kullanımı","Kan Manipülasyonu ve Shrine tekniğinin uyanışı","Ters Lanet Tekniği ve ruhu hedefleyebilen darbeler"],weaknesses:["Kendini başkaları için feda etmeye yatkın olması","Tekniklerini serinin son bölümünde yeni öğreniyor olması","Yoğun suçluluk duygusu ve travma"],story:"Sukuna'nın parmağını yutarak büyücülük dünyasına girer. Büyükbabasının ‘insanlara yardım et’ vasiyetini izler; Shibuya'nın yıkımı, Culling Game ve Shinjuku hesaplaşması boyunca bir insanın nasıl ölmesi gerektiği sorusuyla yüzleşir."},
    gojo:{role:"Özel sınıf büyücü • Öğretmen",abilities:["Limitless ile uzay üzerinde mutlak düzeyde kontrol","Six Eyes sayesinde olağanüstü algı ve enerji verimliliği","Blue, Red ve Hollow Purple","Unlimited Void alanı ve Ters Lanet Tekniği"],weaknesses:["Öğrencilerine ve sivillere verdiği değer stratejik olarak kullanılabilir","Prison Realm gibi özel mühür araçlarına karşı koşullu savunmasızlık","En güçlü olması nedeniyle sistemi tek başına taşıması"],story:"Gojo klanında Six Eyes ve Limitless ile doğar. Geto ile dostluğu ve Star Plasma Vessel görevi ideallerini şekillendirir. Eski düzeni yıkmak için güçlü öğrenciler yetiştirmeyi seçer ve Shinjuku'da Sukuna ile çağın kaderini belirleyen düelloya çıkar."},
    megumi:{role:"Tokyo birinci sınıf öğrencisi • Zenin soyundan",abilities:["On Gölge Tekniği ve çok yönlü shikigamiler","Chimera Shadow Garden eksik alanı","Gölgelerde nesne saklama ve hareket","Yüksek taktik zekâ"],weaknesses:["Kendi hayatını kolayca gözden çıkarması","Mahoraga'yı son çare olarak çağırmaya eğilimi","Yakınlarına karşı duygusal açıklığı"],story:"Toji'nin oğlu olarak Zenin klanına satılmak üzereyken Gojo tarafından korunur. Tsumiki'yi kurtarma arzusu seçimlerini belirler; Culling Game sırasında bedeni Sukuna tarafından ele geçirilerek iradesi kırılmaya çalışılır."},
    nobara:{role:"Tokyo birinci sınıf öğrencisi",abilities:["Straw Doll Technique ile uzaktan bağlantılı hasar","Resonance ve Hairpin","Ruhu doğrudan etkileyebilme","Çekiç, çivi ve yakın dövüş"],weaknesses:["Teknik için hedefe ait bir parça veya uygun bağlantı gerekebilir","Kısa menzilde ağır yaralanmalara açıktır","Kendine güveni riskli kararlar aldırabilir"],story:"Kırsal hayatı reddederek Tokyo'ya gelir ve kendi kimliğinden ödün vermeden büyücü olur. Ölüm Tablosu kardeşlerine karşı Yuji ile zafer kazanır; Shibuya'da Mahito tarafından ağır yaralansa da final savaşında belirleyici biçimde geri döner."},
    sukuna:{role:"Lanetlerin Kralı • Heian dönemi felaketi",abilities:["Dismantle ve Cleave kesikleri","Açık bariyerli Malevolent Shrine","Fuga/Divine Flame","Ters Lanet Tekniği, alan yükseltme ve olağanüstü jujutsu bilgisi"],weaknesses:["Beden ve ruh uyumu taşıyıcısına göre bozulabilir","Megumi'nin ruh direnci ve Yuji'nin ruh darbeleri","Kibri rakiplerine hazırlanma fırsatı verebilir"],story:"Heian döneminin yenilmez büyücüsü ölümünden sonra yirmi lanetli parmak hâlinde çağları aşar. Yuji'de bedenlenir, ardından Megumi'nin On Gölge potansiyelini ele geçirir ve modern büyücülere karşı Shinjuku'da son savaşını verir."},
    yuta:{role:"Özel sınıf büyücü • Tokyo ikinci sınıf öğrencisi",abilities:["Rika üzerinden dev lanet enerjisi rezervi","Copy ile çok sayıda tekniği kullanma","Ters Lanet Tekniğiyle başkalarını iyileştirme","Authentic Mutual Love alanı ve kılıç ustalığı"],weaknesses:["Rika'nın tam tezahürü beş dakikayla sınırlı","Kopyalanan tekniklerin koşulları bulunur","Arkadaşlarını koruma arzusu ağır risk aldırır"],story:"Rika'nın lanetiyle izole yaşarken Jujutsu Lisesi'nde bağ kurmayı öğrenir ve Geto'yu yener. Afrika'daki eğitiminden sonra özel sınıf olarak geri döner; Culling Game ve Shinjuku savaşında planın merkezine yerleşir."},
    maki:{role:"Lanetli araç uzmanı • Zenin klanı savaşçısı",abilities:["Tamamlanmış Heavenly Restriction ile lanet enerjisinden bağımsız beden","Ruhları kesen Split Soul Katana","Üstün duyu, hız ve dayanıklılık","Bariyerlerin hedef tanımasından kaçabilme"],weaknesses:["Ters Lanet Tekniği kullanamaz","İyileşmesi insanüstü olsa da anlık değildir","Klan travması ve Mai'nin kaybı"],story:"Lanet enerjisi olmadığı için Zenin klanınca dışlanır. Mai'nin fedakârlığı Heavenly Restriction'ını tamamlar; klanın savaşçı düzenini tek başına yıkar ve Toji düzeyinde özgürleşerek final savaşına katılır."},
    kenjaku:{role:"Kadim beden değiştirici • Culling Game'in kurucusu",abilities:["Beden değişimi ve ele geçirilen teknikleri saklama","Cursed Spirit Manipulation","Antigravity System","Açık bariyerli Womb Profusion alanı"],weaknesses:["Başındaki dikiş ve beyninin fiziksel varlığı","Planlarını gözlemleme merakı","Teknik tükenmesi anlarında savunma açığı"],story:"Bin yılı aşkın süre farklı bedenleri ele geçirerek insan ile lanet enerjisinin evrimini araştırır. Ölüm Tablolarını yaratır, Yuji'nin doğumunu düzenler, Gojo'yu mühürler ve Japonya'yı Culling Game aracılığıyla Tengen ile birleşmeye hazırlar."},
    toji:{role:"Büyücü Katili • Sıfır lanet enerjili savaşçı",abilities:["Heavenly Restriction ile görünmezlik düzeyinde sıfır lanet enerjisi","İnsanüstü duyu, hız ve güç","Inverted Spear of Heaven ve geniş lanetli araç cephaneliği","Soğukkanlı suikast planlama"],weaknesses:["Ters Lanet Tekniği ve büyüsel iyileşmesi yoktur","Gururu, uyanmış Gojo ile yeniden savaşmasına yol açar","Ailesinden ve geçmişinden kaçışı kararlarını gölgeler"],story:"Zenin klanının baskısını geride bırakıp paralı suikastçı olur. Star Plasma Vessel görevinde Gojo ve Geto'yu yener; Gojo'nun uyanışında ölür. Shibuya'da seansla döndüğünde bedenin komutasını ele geçirir ve Megumi'yi tanıyınca kendini durdurur."},
    nanami:{role:"Birinci sınıf büyücü • Eski maaşlı çalışan",abilities:["Ratio Technique ile 7:3 zayıf noktası yaratma","Overtime bağlayıcı yemini","Collapse ile çevresel yıkım","Keskin savaş analizi ve kör kılıç"],weaknesses:["İnsan bedeni ve sınırlı iyileşme kapasitesi","Görev sorumluluğunu bırakmaması","Alanlara karşı seçeneklerinin sınırlı oluşu"],story:"Haibara'nın ölümünün ardından büyücülüğü bırakıp kurumsal hayata geçer, fakat emeğin anlamını sorgulayarak geri döner. Yuji'ye akıl hocalığı yapar ve Shibuya'da son anına kadar öğrencileri korur."},
    mahito:{role:"Özel sınıf lanet • İnsan nefretinden doğan ruh",abilities:["Idle Transfiguration ile ruhun şeklini değiştirme","Klonlar ve dönüştürülmüş insanlar","Self-Embodiment of Perfection alanı","Instant Spirit Body of Distorted Killing"],weaknesses:["Ruhuna doğrudan hasar verebilen Yuji ve Nobara","Tekniği Sukuna'nın ruhuna dokunduğunda karşılık görür","Deneyimsizliği ve oyunbazlığı"],story:"İnsanların birbirine duyduğu korku ve nefretten doğar. Junpei'yi manipüle eder, Nanami ile Nobara'yı hedef alır ve Shibuya'da Yuji'nin insanlık sınavına dönüşür. Yenilgisinin ardından Kenjaku tarafından emilir."},
    choso:{role:"Ölüm Tablosu No. 1 • Yuji'nin ağabeyi",abilities:["Zehirli özel kanla Blood Manipulation","Piercing Blood, Supernova ve Flowing Red Scale","Kan kaybını lanet enerjisiyle telafi","Kardeşlerini hissedebilme"],weaknesses:["Kardeşlerine yönelik yoğun duygusal bağı","Su, kan kontrolünü bozabilir","İnsan ve lanet arası bedeninin kimlik çatışması"],story:"Eso ve Kechizu'nun intikamı için Yuji ile savaşır; ortak ebeveyn Kenjaku nedeniyle Yuji'yi kardeşi kabul eder. Shibuya sonrasında taraf değiştirir, Yuki ile Tengen'i savunur ve finalde Yuji'yi korumayı seçer."},
    higuruma:{role:"Avukat • Culling Game büyücüsü",abilities:["Deadly Sentencing alanında yargılama","Judgeman ile delil ve hüküm üretme","Confiscation ve Executioner's Sword","Kısa sürede alan yükseltme ve Ters Lanet Tekniği öğrenme"],weaknesses:["Alan hükmü suçun hukuki yorumuna bağlıdır","Judgeman'ın sonucu tamamen kontrol edilemez","Adalet duygusundan doğan suçluluk"],story:"Ceza sisteminin adaletsizliği karşısında tekniği uyanan bir savunma avukatıdır. Culling Game'de karanlığa sürüklenir; Yuji'nin dürüstlüğüyle yeniden adalete yönelir ve Sukuna'ya karşı infaz görevini üstlenir."}
  };

  let ALL = [];
  let filters = { search:"", side:"all", status:"all", affiliation:"all", sort:"featured" };
  let showSpoilers = JJKAuth.storage.getItem("jjk-show-spoilers") === "true";
  let compareIds = [];
  let favorites = (() => {
    try { const value=JSON.parse(JJKAuth.storage.getItem("jjk-favorite-characters-v1")||"[]"); return Array.isArray(value)?value:[]; }
    catch { return []; }
  })();

  function isFavorite(id) { return favorites.some((item) => (typeof item === "string" ? item : item.id) === id); }
  function toggleFavorite(id, reopen=false) {
    const c=ALL.find((item)=>item.id===id); if(!c)return;
    if(isFavorite(id)) favorites=favorites.filter((item)=>(typeof item === "string" ? item : item.id)!==id);
    else favorites.push({id:c.id,name:c.name,img:c.img,grade:c.grade,affiliation:c.affiliation});
    JJKAuth.storage.setItem("jjk-favorite-characters-v1",JSON.stringify(favorites));
    render();
    if(reopen)openModal(id);
    JJK.toast(isFavorite(id)?`${c.name} koleksiyonuna eklendi.`:`${c.name} koleksiyondan çıkarıldı.`);
  }

  function normalizeExisting(c) {
    const detail = DETAILS[c.id] || {};
    return {...c, img:`img/characters/${c.id}.webp`, imageNote:IMAGE_NOTES[c.id] || "", status:FINAL_STATUS[c.id] || c.status, category:c.side, role:detail.role || `${c.grade} • ${c.affiliation}`, abilities:detail.abilities || c.tags, weaknesses:detail.weaknesses || ["Doğrulanmış belirgin bir zayıflık açıklanmadı; karşılaşmanın koşulları belirleyicidir."], story:detail.story || c.blurb, era:c.era || "Ana seri", spoiler:c.spoiler !== false, featured:FEATURED.indexOf(c.id)};
  }

  function normalizeExtra(row, i) {
    const [id,name,jp,category,affiliation,status,blurb,tagText] = row;
    const tags = tagText.split("|");
    return {id,name,jp,category,side:category,grade:category === "Büyücü" ? "Sınıf bilgisi yok" : "—",affiliation,status,blurb,tags,abilities:tags,weaknesses:["Kaynaklarda belirgin veya doğrulanmış bir zayıflık açıklanmadı."],story:blurb,img:`img/characters/${id}.webp`,imageNote:IMAGE_NOTES[id] || "",era:"Ana seri",spoiler:true,featured:1000+i,role:`${category} • ${affiliation}`};
  }

  function avatar(c, large=false) {
    if (c.img) return `<span class="portrait-art ${large?"large":""}"><img class="portrait-backdrop" src="${JJK.escapeHtml(c.img)}" alt="" aria-hidden="true" ${large?"":"loading=\"lazy\""} /><img class="portrait-main" src="${JJK.escapeHtml(c.img)}" alt="${JJK.escapeHtml(c.name)}" ${large?"":"loading=\"lazy\""} /></span>`;
    const initials = c.name.split(/\s+/).slice(0,2).map(x=>x[0]).join("");
    return `<div class="char-avatar ${large?"large":""}" aria-label="${JJK.escapeHtml(c.name)} görsel yer tutucusu"><span>${JJK.escapeHtml(initials)}</span><small>JJK</small></div>`;
  }

  function cardHTML(c) {
    const selected=compareIds.includes(c.id);
    const favorite=isFavorite(c.id);
    return `<article class="char-card reveal ${selected?"compare-selected":""}" data-id="${c.id}">
      <button class="compare-toggle" type="button" aria-label="${JJK.escapeHtml(c.name)} karşılaştırma seçimi" aria-pressed="${selected}">${selected?"✓":"VS"}</button>
      <button class="favorite-toggle ${favorite?"saved":""}" type="button" aria-label="${JJK.escapeHtml(c.name)} ${favorite?"favorilerden çıkar":"favorilere ekle"}" aria-pressed="${favorite}">${favorite?"★":"☆"}</button>
      <button class="char-open" type="button" aria-label="${JJK.escapeHtml(c.name)} dosyasını aç">
        <div class="ph">${avatar(c)}<span class="grade-badge">${JJK.escapeHtml(c.grade)}</span><span class="category-badge">${JJK.escapeHtml(c.category)}</span></div>
        <div class="info"><h3>${JJK.escapeHtml(c.name)}</h3><div class="jp-card">${JJK.escapeHtml(c.jp||"")}</div><div class="aff"><span class="side-dot"></span>${JJK.escapeHtml(c.affiliation)}</div><div class="mini-tags">${c.tags.slice(0,2).map(t=>`<span>${JJK.escapeHtml(t)}</span>`).join("")}</div></div>
      </button>
    </article>`;
  }

  function searchText(c) { return [c.name,c.jp,c.affiliation,c.category,c.grade,c.blurb,...c.tags,...c.abilities].join(" ").toLocaleLowerCase("tr"); }

  function filteredList() {
    const q=filters.search.trim().toLocaleLowerCase("tr");
    const list=ALL.filter(c=>(filters.side==="all"||c.category===filters.side)&&(filters.status==="all"||c.status===filters.status)&&(filters.affiliation==="all"||c.affiliation===filters.affiliation)&&(!q||searchText(c).includes(q)));
    list.sort((a,b)=>filters.sort==="az"?a.name.localeCompare(b.name,"tr"):filters.sort==="za"?b.name.localeCompare(a.name,"tr"):a.featured-b.featured);
    return list;
  }

  function render() {
    const list=filteredList(), grid=document.querySelector("#charGrid");
    document.querySelector("#charCount").textContent=`${list.length} / ${ALL.length} karakter gösteriliyor`;
    grid.innerHTML=list.length?list.map(cardHTML).join(""):`<div class="empty"><strong>Sonuç bulunamadı</strong><span>Arama kelimesini veya filtreleri değiştirmeyi dene.</span></div>`;
    grid.querySelectorAll(".char-card").forEach(el=>{
      el.querySelector(".char-open").addEventListener("click",()=>openModal(el.dataset.id));
      el.querySelector(".compare-toggle").addEventListener("click",()=>toggleCompare(el.dataset.id));
      el.querySelector(".favorite-toggle").addEventListener("click",()=>toggleFavorite(el.dataset.id));
    });
    renderActiveFilters(); JJK.observeReveal(grid);
  }

  function ratingsFor(c) {
    if (POWER_RATINGS[c.id]) return POWER_RATINGS[c.id];
    const grade = String(c.grade || "");
    const base = grade.includes("Özel") ? 88 : grade.includes("1.") ? 76 : grade.includes("2.") ? 65 : grade.includes("3.") ? 54 : 45;
    const seed = [...c.id].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
    return [0,1,2,3,4].map((_,i)=>Math.max(8,Math.min(94,base+((seed*(i+3))%19)-9)));
  }

  function renderCompareTray() {
    const tray=document.querySelector("#compareTray"), slots=document.querySelector("#compareSlots");
    if(!tray||!slots)return;
    tray.classList.toggle("open",compareIds.length>0);
    slots.innerHTML=[0,1].map(index=>{
      const c=ALL.find(item=>item.id===compareIds[index]);
      return c?`<button type="button" data-remove-compare="${c.id}" title="Seçimden çıkar"><img src="${JJK.escapeHtml(c.img)}" alt="" /><span>${JJK.escapeHtml(c.name)}</span><b>×</b></button>`:`<div class="compare-empty"><i>${index+1}</i><span>Dosya seç</span></div>`;
    }).join("");
    slots.querySelectorAll("[data-remove-compare]").forEach(button=>button.addEventListener("click",()=>toggleCompare(button.dataset.removeCompare)));
    document.querySelector("#compareLaunch").disabled=compareIds.length!==2;
  }

  function toggleCompare(id) {
    if(compareIds.includes(id))compareIds=compareIds.filter(item=>item!==id);
    else if(compareIds.length<2)compareIds.push(id);
    else { compareIds=[compareIds[1],id]; JJK.toast("İlk dosya değiştirildi."); }
    render(); renderCompareTray();
  }

  function statRows(c) {
    return ratingsFor(c).map((value,index)=>`<div class="compare-stat"><span>${STAT_LABELS[index]}</span><div><i style="width:${value}%"></i></div><b>${value}</b></div>`).join("");
  }

  function comparisonSide(c, side) {
    const hidden=c.spoiler&&!showSpoilers;
    return `<section class="compare-side compare-${side}">
      <div class="compare-portrait">${avatar(c,true)}</div>
      <span class="compare-side-label">DOSYA ${side==="left"?"A":"B"}</span>
      <h3>${JJK.escapeHtml(c.name)}</h3><p class="compare-role">${JJK.escapeHtml(c.role)}</p>
      <div class="compare-facts"><div><small>Sınıf</small><strong>${JJK.escapeHtml(c.grade)}</strong></div><div><small>Durum</small><strong>${hidden?"Spoiler gizli":JJK.escapeHtml(c.status)}</strong></div></div>
      <div class="compare-stats">${statRows(c)}</div>
      <div class="compare-techniques"><small>İMZA TEKNİKLER</small>${c.abilities.slice(0,3).map(item=>`<span>${JJK.escapeHtml(item)}</span>`).join("")}</div>
    </section>`;
  }

  function openCompare() {
    if(compareIds.length!==2)return;
    const left=ALL.find(c=>c.id===compareIds[0]), right=ALL.find(c=>c.id===compareIds[1]);
    if(!left||!right)return;
    const special=[left.id,right.id].sort().join(":")==="gojo:sukuna";
    const overlay=document.querySelector("#compareModal"), modal=overlay.querySelector(".compare-modal");
    modal.classList.toggle("special-clash",special);
    modal.innerHTML=`
      <header class="compare-head"><div><small>${special?"SHINJUKU // 24.12":"DOSYA ANALİZİ // VS"}</small><h2>${special?"En Güçlülerin Hesaplaşması":"Karakter Karşılaştırması"}</h2><p>${special?"Sınırsızlık açık. Mabedin bariyeri yok. Geriye yalnızca kimin alanının ayakta kalacağı kaldı.":"Değerler resmî bir güç sıralaması değil; teknik, eşleşme ve savaş koşullarının editoryal özetidir."}</p></div><button class="modal-close" type="button" aria-label="Kapat">×</button></header>
      ${special?`<div class="clash-easter"><span class="infinity-sigil">∞</span><i></i><span class="shrine-sigil">伏魔御厨子</span><b>DOMAIN CLASH DETECTED</b></div>`:""}
      <div class="compare-layout">${comparisonSide(left,"left")}<div class="compare-vs"><span>VS</span></div>${comparisonSide(right,"right")}</div>
      <footer class="compare-foot"><span>Sonuç: koşullara bağlı</span><button type="button" id="swapCompare">Tarafları değiştir ↔</button></footer>`;
    overlay.classList.add("open"); document.body.classList.add("modal-open");
    modal.querySelector(".modal-close").addEventListener("click",closeCompare);
    modal.querySelector("#swapCompare").addEventListener("click",()=>{compareIds.reverse();openCompare();renderCompareTray();});
    if(special&&window.JJKAudio)window.JJKAudio.playSfx("special");
  }

  function closeCompare(){document.querySelector("#compareModal").classList.remove("open");document.body.classList.remove("modal-open");}

  function section(title, items, cls="") {
    if (!items || !items.length) return "";
    return `<section class="article-section ${cls}"><h3>${title}</h3><ul>${items.map(x=>`<li>${JJK.escapeHtml(x)}</li>`).join("")}</ul></section>`;
  }

  function openModal(id) {
    const c=ALL.find(x=>x.id===id); if(!c)return;
    const overlay=document.querySelector("#charModal"), hidden=c.spoiler&&!showSpoilers;
    overlay.querySelector(".modal").innerHTML=`
      <header class="wiki-modal-head"><div class="modal-portrait">${avatar(c,true)}${c.imageNote?`<span class="image-note">${JJK.escapeHtml(c.imageNote)}</span>`:""}</div><div class="modal-title"><div class="eyebrow">${JJK.escapeHtml(c.category)} • ${JJK.escapeHtml(c.affiliation)}</div><h2>${JJK.escapeHtml(c.name)}</h2><div class="jp">${JJK.escapeHtml(c.jp||"")}</div><p>${JJK.escapeHtml(c.role)}</p><button class="modal-favorite ${isFavorite(c.id)?"saved":""}" type="button">${isFavorite(c.id)?"★ Koleksiyonumda":"☆ Koleksiyona ekle"}</button></div><button class="modal-close" aria-label="Kapat">×</button></header>
      <nav class="article-nav"><button class="active" data-tab="overview">Genel bakış</button><button data-tab="power">Güçler</button><button data-tab="story">Hikâye</button></nav>
      <div class="modal-body wiki-article">
        <div class="article-tab active" data-panel="overview">
          <div class="infobox"><div><span>Taraf / tür</span><strong>${JJK.escapeHtml(c.category)}</strong></div><div><span>Sınıf</span><strong>${JJK.escapeHtml(c.grade)}</strong></div><div><span>Bağlılık</span><strong>${JJK.escapeHtml(c.affiliation)}</strong></div><div><span>Durum</span><strong class="status-${hidden?"hidden":"visible"}">${hidden?"Spoiler gizli":JJK.escapeHtml(c.status)}</strong></div></div>
          <p class="lead">${JJK.escapeHtml(c.blurb)}</p><h3>Öne çıkan özellikler</h3><div class="tag-row">${c.tags.map(t=>`<span class="tag">${JJK.escapeHtml(t)}</span>`).join("")}</div>
        </div>
        <div class="article-tab" data-panel="power">${section("Teknikler ve yetenekler",c.abilities,"strengths")}${section("Sınırlar ve zayıflıklar",c.weaknesses,"weaknesses")}<p class="wiki-note">Güç karşılaştırmaları mutlak sıralama değildir; bariyer, bağlayıcı yemin, eşleşme ve savaş koşulları sonucu değiştirebilir.</p></div>
        <div class="article-tab" data-panel="story">${hidden?`<div class="spoiler-lock"><strong>Bu bölüm manga spoilerı içeriyor.</strong><p>Hikâyeyi ve güncel durum bilgisini görmek için sayfadaki “Spoilerları göster” seçeneğini aç.</p><button id="revealThis" class="btn">Yine de göster</button></div>`:`<h3>Hikâye ve karakter gelişimi</h3><p class="article-story">${JJK.escapeHtml(c.story)}</p>`}</div>
      </div>`;
    overlay.classList.add("open"); document.body.classList.add("modal-open");
    overlay.querySelector(".modal-close").addEventListener("click",closeModal);
    overlay.querySelector(".modal-favorite").addEventListener("click",()=>toggleFavorite(id,true));
    overlay.querySelectorAll(".article-nav button").forEach(btn=>btn.addEventListener("click",()=>{
      overlay.querySelectorAll(".article-nav button,.article-tab").forEach(x=>x.classList.remove("active")); btn.classList.add("active"); overlay.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add("active");
    }));
    const reveal=overlay.querySelector("#revealThis"); if(reveal)reveal.addEventListener("click",()=>{showSpoilers=true;JJKAuth.storage.setItem("jjk-show-spoilers","true");document.querySelector("#spoilerToggle").checked=true;openModal(id);});
  }

  function closeModal(){document.querySelector("#charModal").classList.remove("open");document.body.classList.remove("modal-open");}

  function renderActiveFilters(){
    const host=document.querySelector("#activeFilters"), labels=[];
    if(filters.search)labels.push(`Arama: ${filters.search}`); if(filters.side!=="all")labels.push(filters.side); if(filters.affiliation!=="all")labels.push(filters.affiliation); if(filters.status!=="all")labels.push(filters.status);
    host.innerHTML=labels.map(x=>`<span>${JJK.escapeHtml(x)}</span>`).join("");
  }

  function setupControls(){
    const categories=[...new Set(ALL.map(c=>c.category))].sort((a,b)=>a.localeCompare(b,"tr"));
    const chips=document.querySelector("#sideChips"); chips.innerHTML=["all",...categories].map(x=>`<button class="side-chip ${x==="all"?"active":""}" data-side="${JJK.escapeHtml(x)}"><span>${x==="all"?"Tümü":JJK.escapeHtml(x)}</span><b>${x==="all"?ALL.length:ALL.filter(c=>c.category===x).length}</b></button>`).join("");
    chips.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{chips.querySelectorAll("button").forEach(x=>x.classList.remove("active"));btn.classList.add("active");filters.side=btn.dataset.side;render();}));
    const affiliations=[...new Set(ALL.map(c=>c.affiliation))].sort((a,b)=>a.localeCompare(b,"tr"));
    document.querySelector("#affiliationFilter").insertAdjacentHTML("beforeend",affiliations.map(x=>`<option>${JJK.escapeHtml(x)}</option>`).join(""));
    document.querySelector("#charSearch").addEventListener("input",e=>{filters.search=e.target.value;render();});
    document.querySelector("#statusFilter").addEventListener("change",e=>{filters.status=e.target.value;render();});
    document.querySelector("#affiliationFilter").addEventListener("change",e=>{filters.affiliation=e.target.value;render();});
    document.querySelector("#sortSelect").addEventListener("change",e=>{filters.sort=e.target.value;render();});
    document.querySelector("#spoilerToggle").checked=showSpoilers;
    document.querySelector("#spoilerToggle").addEventListener("change",e=>{showSpoilers=e.target.checked;JJKAuth.storage.setItem("jjk-show-spoilers",String(showSpoilers));});
    document.querySelector("#clearFilters").addEventListener("click",()=>{filters={search:"",side:"all",status:"all",affiliation:"all",sort:"featured"};document.querySelector("#charSearch").value="";document.querySelector("#statusFilter").value="all";document.querySelector("#affiliationFilter").value="all";document.querySelector("#sortSelect").value="featured";chips.querySelectorAll("button").forEach((x,i)=>x.classList.toggle("active",i===0));render();});
    const overlay=document.querySelector("#charModal"); overlay.addEventListener("click",e=>{if(e.target===overlay)closeModal();}); document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
    document.querySelector("#compareLaunch").addEventListener("click",openCompare);
    document.querySelector("#compareClear").addEventListener("click",()=>{compareIds=[];render();renderCompareTray();});
    document.querySelector("#compareModal").addEventListener("click",e=>{if(e.target.id==="compareModal")closeCompare();});
  }

  async function init(){
    try { const base=await JJK.fetchJSON("data/characters.json"); ALL=[...base.map(normalizeExisting),...EXTRA.map(normalizeExtra)]; }
    catch(e){document.querySelector("#charGrid").innerHTML=`<p class="empty">Karakter verileri yüklenemedi: ${JJK.escapeHtml(e.message)}</p>`;return;}
    document.querySelector("#totalCount").textContent=ALL.length; document.querySelector("#groupCount").textContent=new Set(ALL.map(c=>c.category)).size; setupControls(); render();
    const requested=new URLSearchParams(location.search).get("character"); if(requested&&ALL.some(c=>c.id===requested))openModal(requested);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
