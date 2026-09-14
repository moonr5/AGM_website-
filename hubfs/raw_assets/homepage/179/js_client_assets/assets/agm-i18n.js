/**
 * Site-wide EN / ID language. Preference lives in localStorage and is applied
 * to the header, drawer, footer, cookies, and any [data-i18n] copy.
 */
(function () {
  var KEY = "agm-lang";
  var DICT = {
    "nav.home": { en: "Home", id: "Beranda" },
    "nav.fleet": { en: "Fleet", id: "Armada" },
    "nav.about": { en: "About", id: "Tentang" },
    "nav.services": { en: "Services", id: "Layanan" },
    "nav.shipyard": { en: "Shipyard", id: "Galangan" },
    "nav.ownercare": { en: "Owner Care", id: "Perawatan" },
    "nav.seatrad": { en: "Sea Cucumber Trade", id: "Perdagangan Teripang" },
    "nav.blue": { en: "Blue Economy", id: "Ekonomi Biru" },
    "nav.story": { en: "Our Story", id: "Kisah Kami" },
    "nav.people": { en: "People", id: "Orang" },
    "nav.compliance": { en: "Compliance", id: "Kepatuhan" },
    "nav.enquire": { en: "Enquire", id: "Hubungi" },
    "nav.contact": { en: "Contact", id: "Kontak" },
    "nav.contacts": { en: "Contacts", id: "Kontak" },
    "nav.careers": { en: "Careers", id: "Karier" },
    "nav.privacy": { en: "Privacy", id: "Privasi" },
    "nav.cookies": { en: "Cookie Policy", id: "Kebijakan Cookie" },
    "nav.cookiemgr": { en: "Cookie Manager", id: "Pengelola Cookie" },
    "nav.operations": { en: "Operations", id: "Operasi" },
    "cookie.title": { en: "Cookies on this site", id: "Cookie di situs ini" },
    "cookie.copy": {
      en: "We use necessary cookies so the forms work. Analytics and marketing stay off unless you allow them.",
      id: "Kami memakai cookie yang diperlukan agar formulir berjalan. Analitik dan pemasaran tetap mati kecuali Anda mengizinkannya."
    },
    "cookie.accept": { en: "Accept all", id: "Terima semua" },
    "cookie.reject": { en: "Necessary only", id: "Yang diperlukan saja" },
    "footer.place": { en: "PT. Agara Global Maritim — Marunda, North Jakarta", id: "PT. Agara Global Maritim — Marunda, Jakarta Utara" },
    "footer.call": { en: "Call", id: "Telepon" },
    "hero.eyebrow": { en: "Marunda yard · North Jakarta", id: "Galangan Marunda · Jakarta Utara" },
    "hero.line": { en: "Your trusted partner", id: "Mitra terpercaya Anda" },
    "hero.lux": { en: "for marine services", id: "untuk layanan kelautan" },
    "hero.statement": { en: "More than just a boat builder.", id: "Lebih dari sekadar pembuat kapal." },
    "hero.lead": {
      en: "PT. Agara Global Maritim charters crewboats, builds FRP vessels, and supports marine operations from Marunda, North Jakarta.",
      id: "PT. Agara Global Maritim menyewakan crewboat, membangun kapal FRP, dan mendukung operasi kelautan dari Marunda, Jakarta Utara."
    },
    "hero.phrases": {
      en: "From our own yard in Marunda.|Charter-ready. Built in-house.|A ship's company, and a yard.",
      id: "Dari galangan kami sendiri di Marunda.|Siap charter. Dibangun sendiri.|Perusahaan kapal, dan sebuah galangan."
    },
    "fact.1t": { en: "Ship chartering", id: "Penyewaan kapal" },
    "fact.1d": { en: "Crew transfer, tourism and project work", id: "Transfer kru, pariwisata, dan kerja proyek" },
    "fact.2t": { en: "FRP shipbuilding", id: "Pembangunan kapal FRP" },
    "fact.2d": { en: "Built to order at our own yard", id: "Dibangun sesuai pesanan di galangan sendiri" },
    "fact.3t": { en: "Marine support", id: "Dukungan kelautan" },
    "fact.3d": { en: "Shorebase and light logistics", id: "Shorebase dan logistik ringan" },
    "fact.4t": { en: "Repair & maintenance", id: "Perbaikan & perawatan" },
    "fact.4d": { en: "Hull, engine and electrical attendance", id: "Perawatan lambung, mesin, dan kelistrikan" },
    "home.kicker": { en: "The company", id: "Perusahaan" },
    "home.h2a": { en: "A ship's company,", id: "Perusahaan kapal," },
    "home.h2b": { en: "and a yard.", id: "dan sebuah galangan." },
    "home.script": { en: "From our own berth in Marunda.", id: "Dari dermaga kami sendiri di Marunda." },
    "home.deck": {
      en: "AGM charters crewboats, builds FRP vessels, and supports marine operations from North Jakarta. We are part of the PT. Stratcon Agara Global Group.",
      id: "AGM menyewakan crewboat, membangun kapal FRP, dan mendukung operasi kelautan dari Jakarta Utara. Kami bagian dari Grup PT. Stratcon Agara Global."
    },
    "home.more": { en: "More about us", id: "Lebih lanjut tentang kami" },
    "home.where": { en: "Marunda yard · North Jakarta 14150", id: "Galangan Marunda · Jakarta Utara 14150" },
    "fig.yard": { en: "Yard", id: "Galangan" },
    "fig.yardd": { en: "Own berth, Marunda", id: "Dermaga sendiri, Marunda" },
    "fig.group": { en: "Group", id: "Grup" },
    "fig.pass": { en: "Passengers per crewboat", id: "Penumpang per crewboat" },
    "fig.desk": { en: "Operations desk", id: "Meja operasi" },
    "cap.charter": { en: "On charter", id: "Sedang charter" },
    "cap.build": { en: "In build", id: "Dalam pembangunan" },
    "cap.station": { en: "On station", id: "Di stasiun" },
    "lane.fleet": { en: "Fleet", id: "Armada" },
    "lane.charter": { en: "Vessel charter", id: "Sewa kapal" },
    "lane.yard": { en: "Yard", id: "Galangan" },
    "lane.frp": { en: "FRP shipbuilding", id: "Pembangunan kapal FRP" },
    "lane.ops": { en: "Operations", id: "Operasi" },
    "lane.support": { en: "Marine support", id: "Dukungan kelautan" },
    "lane.open": { en: "Open", id: "Buka" },
    "part.kicker": { en: "Official partners", id: "Mitra resmi" },
    "part.h2": { en: "The engines we specify", id: "Mesin yang kami tetapkan" },
    "part.lede": {
      en: "Suzuki Marine and Yamaha — installed, attended, and supported from the Marunda yard.",
      id: "Suzuki Marine dan Yamaha — dipasang, dirawat, dan didukung dari galangan Marunda."
    },
    "about.kicker": { en: "About us", id: "Tentang kami" },
    "about.h1": { en: "Your trusted partner for marine services", id: "Mitra terpercaya untuk layanan kelautan" },
    "about.lede": {
      en: "More than just a boat builder. Ship chartering, marine and logistic support, and high-quality FRP vessels from our own yard in Marunda.",
      id: "Lebih dari sekadar pembuat kapal. Penyewaan kapal, dukungan kelautan dan logistik, serta kapal FRP berkualitas dari galangan kami di Marunda."
    },
    "about.fleet": { en: "View fleet", id: "Lihat armada" },
    "stat.yard": { en: "Own yard, North Jakarta", id: "Galangan sendiri, Jakarta Utara" },
    "stat.fleet": { en: "Charter-ready FRP fleet", id: "Armada FRP siap charter" },
    "stat.pax": { en: "Passengers per crewboat", id: "Penumpang per crewboat" },
    "stat.desk": { en: "Operations desk", id: "Meja operasi" },
    "co.kicker": { en: "The company", id: "Perusahaan" },
    "co.h2": { en: "A ship’s company and FRP yard, under one roof", id: "Perusahaan kapal dan galangan FRP, dalam satu atap" },
    "co.p1": {
      en: "PT. Agara Global Maritim (AGM) is based in Marunda, North Jakarta. We charter crewboats, support marine operations, and build high-quality FRP vessels for industrial, tourism, and fishing principals who must answer for safety and timetable.",
      id: "PT. Agara Global Maritim (AGM) berkedudukan di Marunda, Jakarta Utara. Kami menyewakan crewboat, mendukung operasi kelautan, dan membangun kapal FRP berkualitas untuk prinsipal industri, pariwisata, dan perikanan yang harus menjawab soal keselamatan dan jadwal."
    },
    "co.p2": {
      en: "We operate charter-ready vessels and expand the fleet through our own shipyard, so quality and build time stay in our hands.",
      id: "Kami mengoperasikan kapal siap charter dan menambah armada melalui galangan sendiri, sehingga mutu dan waktu bangun tetap di tangan kami."
    },
    "co.p3": {
      en: "AGM is part of the PT. Stratcon Agara Global (SAG) Group, which gives us added reach through its strategic advisory and government relations network.",
      id: "AGM bagian dari Grup PT. Stratcon Agara Global (SAG), yang memberi jangkauan tambahan melalui jaringan penasihat strategis dan hubungan pemerintahan."
    },
    "vis.kicker": { en: "Vision", id: "Visi" },
    "vis.title": { en: "Our Vision", id: "Visi Kami" },
    "vis.h2": { en: "A maritime company a principal can name without reservation.", id: "Perusahaan maritim yang dapat disebut prinsipal tanpa ragu." },
    "vis.p": {
      en: "Charter, FRP construction, and marine support from one yard in Marunda — owned by us, crewed by us, and held to a standard that will stand inspection.",
      id: "Charter, pembangunan FRP, dan dukungan kelautan dari satu galangan di Marunda — dimiliki kami, diawaki kami, dan dipegang pada standar yang tahan pemeriksaan."
    },
    "vis.1": { en: "Charter, FRP construction, and marine support under one roof", id: "Charter, pembangunan FRP, dan dukungan kelautan dalam satu atap" },
    "vis.2": { en: "Owned by us, crewed by us", id: "Dimiliki kami, diawaki kami" },
    "vis.3": { en: "Held to a standard that will stand inspection", id: "Dipegang pada standar yang tahan pemeriksaan" },
    "mis.kicker": { en: "Mission", id: "Misi" },
    "mis.title": { en: "Our Mission", id: "Misi Kami" },
    "mis.p": {
      en: "We place boats, build hulls, and stay answerable from our own yard in Marunda.",
      id: "Kami menempatkan kapal, membangun lambung, dan tetap bertanggung jawab dari galangan kami sendiri di Marunda."
    },
    "mis.1": { en: "Place the boat on time, with a named crew and a desk that answers.", id: "Menempatkan kapal tepat waktu, dengan kru yang disebut namanya dan meja yang menjawab." },
    "mis.2": { en: "Build the hull in our own yard, to the agreed brief, without handing quality away.", id: "Membangun lambung di galangan sendiri, sesuai brief yang disepakati, tanpa menyerahkan mutu." },
    "mis.3": { en: "Treat logistics and attendance as part of the same contract, not an extra.", id: "Memperlakukan logistik dan kehadiran sebagai bagian kontrak yang sama, bukan tambahan." },
    "mis.4": { en: "Keep our word on price, condition, and timetable.", id: "Menepati janji soal harga, kondisi, dan jadwal." },
    "mis.5": { en: "Leave Indonesia’s marine trade stronger than we found it.", id: "Meninggalkan perdagangan kelautan Indonesia lebih kuat daripada saat kami menemukannya." },
    "how.kicker": { en: "How we work", id: "Cara kami bekerja" },
    "how.h2": { en: "Three things principals can hold us to", id: "Tiga hal yang dapat prinsipal pegang pada kami" },
    "how.1t": { en: "New, efficient boats", id: "Kapal baru yang efisien" },
    "how.1p": { en: "Clean, well-maintained FRP crewboats ready for transfer, tourism, and project work.", id: "Crewboat FRP yang bersih dan terawat, siap untuk transfer, pariwisata, dan kerja proyek." },
    "how.2t": { en: "Certified crews", id: "Kru bersertifikat" },
    "how.2p": { en: "Professionally trained crews experienced with industrial and commercial clients.", id: "Kru terlatih profesional, berpengalaman dengan klien industri dan komersial." },
    "how.3t": { en: "24/7 support", id: "Dukungan 24/7" },
    "how.3p": { en: "Fast operational response with daily, trip, or monthly charter options.", id: "Respons operasi yang cepat dengan opsi charter harian, per trip, atau bulanan." },
    "how.more": { en: "Read more", id: "Baca selengkapnya" },
    "notes.kicker": { en: "Company notes", id: "Catatan perusahaan" },
    "notes.h2": { en: "Official briefs", id: "Brief resmi" },
    "next.kicker": { en: "Next step", id: "Langkah berikutnya" },
    "next.h2": { en: "Tell us the work. We will place the boat.", id: "Sebutkan pekerjaannya. Kami akan menempatkan kapalnya." },
    "next.p": { en: "The operations desk answers from Marunda. Call, write, or send the enquire form.", id: "Meja operasi menjawab dari Marunda. Telepon, tulis, atau kirim formulir." },
    "home.fleet.h2": { en: "Explore our charter-ready vessels", id: "Jelajahi kapal siap charter kami" },
    "home.fleet.p": {
      en: "Harvester II is ready for crew transfer, sea tourism, fishing trips, and project work. Additional hulls are under construction at Marunda.",
      id: "Harvester II siap untuk transfer kru, wisata laut, memancing, dan kerja proyek. Lambung tambahan sedang dibangun di Marunda."
    },
    "pg.services.k": { en: "Services", id: "Layanan" },
    "pg.services.h": { en: "Charter, build,<br>and support", id: "Charter, bangun,<br>dan dukung" },
    "pg.services.l": { en: "Four service lines from one team: ship chartering, FRP shipbuilding, marine and logistic support, and repair and maintenance.", id: "Empat lini layanan dari satu tim: penyewaan kapal, pembangunan kapal FRP, dukungan kelautan dan logistik, serta perbaikan dan perawatan." },
    "pg.fleet.k": { en: "Fleet", id: "Armada" },
    "pg.fleet.h": { en: "Crewboats ready<br>for charter", id: "Crewboat siap<br>untuk charter" },
    "pg.fleet.l": { en: "Harvester II, built at our own Marunda yard in 2025, available on daily, per-trip, or monthly terms.", id: "Harvester II, dibangun di galangan Marunda kami tahun 2025, tersedia harian, per trip, atau bulanan." },
    "pg.yard.k": { en: "Marunda shipyard", id: "Galangan Marunda" },
    "pg.yard.h": { en: "Construction conducted under our own roof", id: "Pembangunan dilakukan di bawah atap kami sendiri" },
    "pg.yard.l": { en: "Hull, accommodation, and finish are undertaken at Marunda, North Jakarta — not assembled from distant, unexamined labour.", id: "Lambung, akomodasi, dan finishing dikerjakan di Marunda, Jakarta Utara — bukan dirakit dari tenaga yang tidak kami awasi." },
    "pg.care.k": { en: "Owner Care", id: "Perawatan" },
    "pg.care.h": { en: "Keep the boat<br>working", id: "Jaga kapal<br>tetap bekerja" },
    "pg.care.l": { en: "Repair, maintenance, and retrofit from the same yard that builds our charter fleet.", id: "Perbaikan, perawatan, dan retrofit dari galangan yang sama yang membangun armada charter kami." },
    "pg.ops.k": { en: "Marine operations", id: "Operasi kelautan" },
    "pg.ops.h": { en: "Command, crew, and cover that remain answerable", id: "Komando, kru, dan dukungan yang tetap bertanggung jawab" },
    "pg.ops.l": { en: "Industrial, commercial, and tourism assignments are executed by certificated seafarers, with an operations desk that does not close with the office lights.", id: "Tugas industri, komersial, dan pariwisata dijalankan pelaut bersertifikat, dengan meja operasi yang tidak tutup bersama lampu kantor." },
    "pg.blue.k": { en: "Blue economy", id: "Ekonomi biru" },
    "pg.blue.h": { en: "The sea as working capital, not scenery", id: "Laut sebagai modal kerja, bukan pemandangan" },
    "pg.blue.l": { en: "Indonesia's prosperity is written in water. A yard of our scale cannot lecture the ocean; it can, however, refuse to treat the ocean as disposable.", id: "Kemakmuran Indonesia tertulis di air. Galangan sebesar kami tidak dapat menggurui laut; kami dapat menolak memperlakukannya sebagai hal yang dibuang." },
    "pg.story.k": { en: "Our Story", id: "Kisah Kami" },
    "pg.story.h": { en: "Building Indonesia's<br>maritime future", id: "Membangun masa depan<br>maritim Indonesia" },
    "pg.story.l": { en: "From a Marunda yard we charter, build, and support boats with a long view on safety, quality, and responsible production.", id: "Dari galangan Marunda kami menyewakan, membangun, dan mendukung kapal dengan pandangan panjang pada keselamatan, mutu, dan produksi yang bertanggung jawab." },
    "pg.people.k": { en: "People", id: "Orang" },
    "pg.people.h": { en: "Crews and craftsmen<br>you can trust", id: "Kru dan pengrajin<br>yang dapat dipercaya" },
    "pg.people.l": { en: "Operations succeed because of people. AGM crews are certified, and our Marunda team builds and maintains every hull we put to work.", id: "Operasi berhasil karena orang. Kru AGM bersertifikat, dan tim Marunda membangun serta merawat setiap lambung yang kami kerjakan." },
    "pg.comp.k": { en: "Compliance", id: "Kepatuhan" },
    "pg.comp.h": { en: "Licensed, documented,<br>and accountable", id: "Berizin, terdokumentasi,<br>dan bertanggung jawab" },
    "pg.comp.l": { en: "As experienced boat builders, we operate in full compliance with Indonesian business and maritime regulations, ensuring a trusted and reliable partnership for every project.", id: "Sebagai pembangun kapal berpengalaman, kami beroperasi sesuai peraturan bisnis dan maritim Indonesia, memastikan kemitraan yang dapat dipercaya pada setiap proyek." },
    "pg.enq.k": { en: "Enquire", id: "Hubungi" },
    "pg.enq.h": { en: "Tell us what<br>you need", id: "Sebutkan apa<br>yang Anda butuhkan" },
    "pg.enq.l": { en: "Charter dates, a new hull, or yard work — send the details and we will reply.", id: "Tanggal charter, lambung baru, atau kerja galangan — kirim detailnya dan kami akan membalas." },
    "pg.con.k": { en: "Contacts", id: "Kontak" },
    "pg.con.h": { en: "The operations desk<br>is in Marunda", id: "Meja operasi<br>berada di Marunda" },
    "pg.con.l": { en: "Call, write, or visit the yard. Charter, new builds, and support are answered from one address.", id: "Telepon, tulis, atau kunjungi galangan. Charter, bangun baru, dan dukungan dijawab dari satu alamat." },
    "pg.car.k": { en: "Careers", id: "Karier" },
    "pg.car.h": { en: "Work from the yard<br>to the water", id: "Bekerja dari galangan<br>ke laut" },
    "pg.car.l": { en: "AGM hires seafarers, FRP craftsmen, and shore staff who can be trusted with a principal’s timetable and a hull we built ourselves.", id: "AGM merekrut pelaut, pengrajin FRP, dan staf darat yang dapat dipercaya dengan jadwal prinsipal dan lambung yang kami bangun sendiri." },
    "pg.priv.k": { en: "Privacy", id: "Privasi" },
    "pg.priv.h": { en: "How we handle<br>your information", id: "Bagaimana kami menangani<br>informasi Anda" },
    "pg.priv.l": { en: "PT. Agara Global Maritim collects only what we need to answer an enquiry, run a charter, or plan yard work. Last updated 7 September 2026.", id: "PT. Agara Global Maritim hanya mengumpulkan yang diperlukan untuk menjawab pertanyaan, menjalankan charter, atau merencanakan kerja galangan. Diperbarui 7 September 2026." },
    "pg.ck.k": { en: "Cookie Policy", id: "Kebijakan Cookie" },
    "pg.ck.h": { en: "What this site<br>stores on your device", id: "Apa yang situs ini<br>simpan di perangkat Anda" },
    "pg.ck.l": { en: "A short account of the cookies and similar storage used on agmaritim.com. Last updated 7 September 2026.", id: "Ringkasan cookie dan penyimpanan serupa di agmaritim.com. Diperbarui 7 September 2026." },
    "pg.cm.k": { en: "Cookie Manager", id: "Pengelola Cookie" },
    "pg.cm.h": { en: "Choose what<br>this site may store", id: "Pilih apa yang<br>boleh disimpan situs ini" },
    "pg.cm.l": { en: "Necessary cookies stay on so the site and the forms work. Analytics and marketing wait for your say.", id: "Cookie yang diperlukan tetap aktif agar situs dan formulir berjalan. Analitik dan pemasaran menunggu izin Anda." },
    "pg.sea.k": { en: "New business development", id: "Pengembangan usaha baru" },
    "pg.sea.h": { en: "Strategic expansion:<br>sea cucumber trade", id: "Ekspansi strategis:<br>perdagangan teripang" },
    "pg.sea.l": { en: "A new business line under development, built on the coastal infrastructure, vessels, and operational network we already run.", id: "Lini usaha baru yang sedang dikembangkan, dibangun di atas infrastruktur pesisir, kapal, dan jaringan operasi yang sudah kami jalankan." },
    "pg.news.k": { en: "News", id: "Berita" },
    "pg.news.h": { en: "Yard and fleet<br>updates", id: "Kabar galangan<br>dan armada" },
    "pg.news.l": { en: "Selected notes from Marunda as the fleet and shipyard grow.", id: "Catatan terpilih dari Marunda seiring armada dan galangan tumbuh." },
    "pg.inv.k": { en: "Investors", id: "Investor" },
    "pg.inv.h": { en: "A privately held<br>marine company", id: "Perusahaan kelautan<br>tertutup" },
    "pg.inv.l": { en: "AGM is not a listed issuer. Partnership and supply enquiries are welcome through the contact team.", id: "AGM bukan emiten tercatat. Pertanyaan kemitraan dan pasokan diterima melalui tim kontak." },
    "pg.corp.k": { en: "Company", id: "Perusahaan" },
    "pg.corp.h": { en: "Registered and<br>ready to operate", id: "Terdaftar dan<br>siap beroperasi" },
    "pg.corp.l": { en: "PT. Agara Global Maritim is a legally registered Indonesian company serving charter, shipbuilding, and marine support clients.", id: "PT. Agara Global Maritim adalah perusahaan Indonesia yang terdaftar secara hukum, melayani klien charter, pembangunan kapal, dan dukungan kelautan." },
    "pg.char.k": { en: "Fleet programme · 2025", id: "Program armada · 2025" },
    "pg.char.h": { en: "A vessel placed into service, not merely advertised", id: "Kapal yang dioperasikan, bukan sekadar diiklankan" },
    "pg.char.l": { en: "PT. Agara Global Maritim presents a multi-purpose FRP crewboat, constructed at Marunda and available for disciplined commercial charter.", id: "PT. Agara Global Maritim menghadirkan crewboat FRP serbaguna, dibangun di Marunda dan tersedia untuk charter komersial yang tertib." },
    "pg.brand.k": { en: "Partners", id: "Mitra" },
    "pg.brand.h": { en: "Work with AGM", id: "Bekerja dengan AGM" },
    "pg.brand.l": { en: "Agents, operators, and project owners who need reliable Indonesian marine support can partner with us.", id: "Agen, operator, dan pemilik proyek yang membutuhkan dukungan kelautan Indonesia yang andal dapat bermitra dengan kami." },
    "form.name": { en: "Your name", id: "Nama Anda" },
    "form.email": { en: "Your email", id: "Email Anda" },
    "form.phone": { en: "Your phone", id: "Telepon Anda" },
    "form.msg": { en: "Tell us more", id: "Ceritakan lebih lanjut" },
    "form.send": { en: "Send message", id: "Kirim pesan" },
    "form.sending": { en: "Sending…", id: "Mengirim…" },
    "form.need": { en: "Please add your name, email, and a short message.", id: "Mohon isi nama, email, dan pesan singkat." },
    "form.ok": { en: "Thank you. Your enquiry has been sent. We will reply shortly.", id: "Terima kasih. Pertanyaan Anda telah terkirim. Kami akan membalas segera." },
    "form.err": { en: "The message could not be sent. Please email corporate@stratconagaraglobal.com or call +62 819-231-001.", id: "Pesan tidak dapat dikirim. Silakan email corporate@stratconagaraglobal.com atau telepon +62 819-231-001." },
    "close.kicker": { en: "Next step", id: "Langkah berikutnya" },
    "close.h2": { en: "Plan the next charter from Marunda", id: "Rencanakan charter berikutnya dari Marunda" },
    "close.p": { en: "Tell the operations desk the work. We will place the boat, or start the hull.", id: "Sebutkan pekerjaannya ke meja operasi. Kami akan menempatkan kapalnya, atau memulai lambungnya." },
    "close.form": { en: "Send us the brief", id: "Kirim brief Anda" },
    "close.foot": { en: "Plan the next charter from Marunda", id: "Rencanakan charter berikutnya dari Marunda" }
  };

  var HREF_KEY = [
    [/\/en\/?$/, "nav.home"],
    [/\/about/, "nav.about"],
    [/\/services/, "nav.services"],
    [/\/our-fleet|\/fleet-charter|#range/, "nav.fleet"],
    [/\/shipyard/, "nav.shipyard"],
    [/\/owner-care/, "nav.ownercare"],
    [/\/sea-cucumber/, "nav.seatrad"],
    [/\/blue-economy/, "nav.blue"],
    [/\/sustainability/, "nav.story"],
    [/\/people/, "nav.people"],
    [/\/compliance/, "nav.compliance"],
    [/\/enquire/, "nav.enquire"],
    [/\/contacts/, "nav.contacts"],
    [/\/careers/, "nav.careers"],
    [/\/privacy/, "nav.privacy"],
    [/\/cookie-manager/, "nav.cookiemgr"],
    [/\/cookie-policy/, "nav.cookies"],
    [/\/operations/, "nav.operations"]
  ];

  function read() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "id" ? "id" : "en";
    } catch (err) {
      return "en";
    }
  }

  function t(key, lang) {
    var row = DICT[key];
    if (!row) return "";
    return row[lang || read()] || row.en;
  }

  function hrefKey(href) {
    var path = String(href || "");
    for (var i = 0; i < HREF_KEY.length; i++) {
      if (HREF_KEY[i][0].test(path)) return HREF_KEY[i][1];
    }
    return "";
  }

  function fill(el, lang) {
    if (!el) return;
    var key = el.getAttribute("data-i18n");
    if (!key || !DICT[key]) return;
    if (el.hasAttribute("data-i18n-html")) el.innerHTML = t(key, lang);
    else el.textContent = t(key, lang);
  }

  function applyNav(lang) {
    document.querySelectorAll("#appbar .agm-nav a, .agm-drawer nav a, .agm-page-footer-nav a, .agm-endfoot-cols a").forEach(function (a) {
      if (a.hasAttribute("data-i18n")) {
        fill(a, lang);
        return;
      }
      var key = hrefKey(a.getAttribute("href"));
      if (key) a.textContent = t(key, lang);
    });
  }

  function apply(lang) {
    lang = lang === "id" ? "id" : "en";
    document.documentElement.lang = lang === "id" ? "id" : "en";
    document.documentElement.setAttribute("data-agm-lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      fill(el, lang);
    });
    applyNav(lang);
    var script = document.querySelector(".agm-hero-script");
    if (script) script.setAttribute("data-phrases", t("hero.phrases", lang));
    document.querySelectorAll(".agm-langs button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-agm-lang") === lang ? "true" : "false");
    });
    try {
      document.dispatchEvent(new CustomEvent("agm:lang", { detail: { lang: lang } }));
    } catch (err) {}
  }

  function set(lang) {
    lang = lang === "id" ? "id" : "en";
    try {
      localStorage.setItem(KEY, lang);
    } catch (err) {}
    apply(lang);
  }

  function switcherHtml() {
    return (
      '<div class="agm-langs" role="group" aria-label="Language">' +
      '<button type="button" data-agm-lang="en">EN</button>' +
      '<button type="button" data-agm-lang="id">ID</button>' +
      "</div>"
    );
  }

  function bindBox(box) {
    box.querySelectorAll("[data-agm-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        set(btn.getAttribute("data-agm-lang"));
      });
    });
  }

  function mount() {
    var bar = document.querySelector("#appbar-corporate #appbar") || document.querySelector("#appbar");
    if (bar) {
      var nav = bar.querySelector(".agm-nav");
      if (nav && !nav.querySelector(".agm-langs")) {
        var wrap = document.createElement("div");
        wrap.innerHTML = switcherHtml();
        var desk = wrap.firstElementChild;
        var cta = nav.querySelector(".agm-nav-cta");
        if (cta) nav.insertBefore(desk, cta);
        else nav.appendChild(desk);
        bindBox(desk);
      }
      var burger = bar.querySelector("#burger");
      if (burger && burger.parentNode && !burger.parentNode.querySelector(".agm-langs")) {
        var hold = document.createElement("div");
        hold.innerHTML = switcherHtml();
        var mobile = hold.firstElementChild;
        mobile.classList.add("is-compact");
        burger.parentNode.insertBefore(mobile, burger);
        bindBox(mobile);
      }
    }
    var drawer = document.querySelector(".agm-drawer nav");
    if (drawer && !drawer.querySelector(".agm-langs")) {
      var boxHold = document.createElement("div");
      boxHold.innerHTML = switcherHtml();
      var box = boxHold.firstElementChild;
      drawer.insertBefore(box, drawer.firstChild);
      bindBox(box);
    }
    apply(read());
  }

  window.AGM_I18N = { t: t, get: read, set: set, apply: apply, mount: mount };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
