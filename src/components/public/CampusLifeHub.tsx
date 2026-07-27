import { useState } from "react";
import { 
  Users, Heart, CheckCircle2 
} from "lucide-react";
import { Gallery } from "../../types";

interface CampusLifeHubProps {
  gallery: Gallery[];
  activeSchool: unknown;
}

export default function CampusLifeHub({ gallery, activeSchool: _activeSchool }: CampusLifeHubProps) {
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredGallery = filterCategory === "all"
    ? gallery
    : gallery.filter(item => item.category === filterCategory);

  return (
    <div className="space-y-16">

      {/* SECTION 1: SMART CLASSES & LABS */}
      <section id="life-labs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Sarana Modern
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Classroom & Laboratorium Multimedia</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Kami menginvestasikan infrastruktur digital terkini demi kenyamanan belajar mengajar.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h4 className="text-base font-extrabold text-slate-900">Ruang Kelas Pintar Ber-AC & Smartboard</h4>
            <p>
              Setiap ruang kelas di SMAN 1 Nusantara telah dilengkapi pendingin udara (AC) ganda, proyektor LCD beresolusi tajam, serta papan tulis digital interaktif (Smartboard). Guru dapat memproyeksikan video interaktif, materi presentasi 3D, serta kuis live dalam satu sentuhan pen tablet.
            </p>
            <p>
              Selain itu, kami memiliki Laboratorium Komputer Multimedia modern dengan 40 unit PC berspesifikasi tinggi, terintegrasi audio digital terpusat untuk simulasi percakapan bahasa asing serta pelatihan logika pemrograman.
            </p>
          </div>
          <div>
            <img 
              src="/facilities.jpg" 
              alt="sarana" 
              className="rounded-2xl shadow-md w-full aspect-video object-cover referrerPolicy='no-referrer'" 
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: PERPUSTAKAAN PINTAR DIGITAL */}
      <section id="life-library" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-5 gap-8 items-center">
          <div className="md:col-span-2">
            <img 
              src="/facilities.jpg" 
              alt="Smart Library" 
              className="rounded-2xl shadow-md aspect-square object-cover referrerPolicy='no-referrer'" 
            />
          </div>
          <div className="md:col-span-3 space-y-4">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Pusat Literasi
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Perpustakaan Pintar Digital (Smart Library)</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Taman baca yang sejuk dan tenang dengan koleksi lebih dari 10.000 buku fisik mulai dari buku wajib, jurnal penelitian internasional, novel literasi, hingga ensiklopedia visual. Siswa juga memiliki akses akun e-library digital sekolah berbasis QR-Code untuk membaca ribuan e-book langsung dari ponsel atau tablet mereka di sudut baca (reading corner) yang dilengkapi bean-bag empuk.
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex gap-2 items-center">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Pencarian katalog otomatis via Terminal Komputer OPAC</span>
              </li>
              <li className="flex gap-2 items-center">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Peminjaman buku digital instan tanpa antrean manual</span>
              </li>
              <li className="flex gap-2 items-center">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Sudut literasi audiovisual dilengkapi 5 unit iPad gratis pakai</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: KAWASAN OLAHRAGA & SENI */}
      <section id="life-sports" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
              Fisik & Kreativitas
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Kompleks Olahraga & Studio Seni Kreatif</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Tubuh yang sehat melahirkan daya pikir yang tajam. SMAN 1 Nusantara memfasilitasi sarana olah fisik premium yang mencakup lapangan futsal outdoor beralaskan rumput sintetis, lapangan basket standar turnamen regional, lompat jauh, serta lintasan lari (running track).
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Untuk pengembangan minat seni tari dan musik, kami menyediakan studio kedap suara yang dilengkapi drum elektrik, piano, gitar listrik, bass, keyboard, serta amplifier bermutu tinggi untuk latihan grup band / paduan suara sekolah.
            </p>
          </div>
          <div>
            <img 
              src="/facilities.jpg" 
              alt="Sports Complex" 
              className="rounded-2xl shadow-md w-full aspect-video object-cover referrerPolicy='no-referrer'" 
            />
          </div>
        </div>
      </section>

      {/* SECTION 4: EKSTRAKURIKULER SAINS & TEKNOLOGI */}
      <section id="life-ekskul-tech" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Ekstrakurikuler Bidang Sains & Logika</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Klub ilmiah pendorong rasa ingin tahu (curiosity) serta keterampilan analisis data tingkat lanjut.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-2">
              <div className="text-blue-600 font-mono font-bold text-xs">CLUB A.</div>
              <h4 className="font-bold text-slate-800 text-sm">Robotics & Arduino Coding</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Siswa mempelajari konsep elektro mekanika, perakitan robot pemadam api cerdas, pemrograman sensor ultrasonik Arduino, serta penyusunan logika pengkondisian.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-2">
              <div className="text-blue-600 font-mono font-bold text-xs">CLUB B.</div>
              <h4 className="font-bold text-slate-800 text-sm">Persiapan Olimpiade Sains (OSN)</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Bimbingan belajar intensif di luar jam KBM reguler untuk penguasaan tingkat mahir mata pelajaran Fisika, Matematika, Kimia, Biologi, Geografi, dan Astronomi nasional.</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-2">
              <div className="text-blue-600 font-mono font-bold text-xs">CLUB C.</div>
              <h4 className="font-bold text-slate-800 text-sm">Youth Science & Ecology Club</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Komunitas peneliti remaja yang melakukan pengujian mutu kebersihan air sungai, daur ulang minyak jelantah menjadi lilin hias aromaterapi, serta analisis isu ekologis perkotaan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: EKSTRAKURIKULER SENI & ATLETIK */}
      <section id="life-ekskul-arts" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Klub Kesiswaan
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Ekstrakurikuler Bidang Seni, Budaya & Olahraga</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Kami mewadahi penyaluran minat bakat kinetik dan cita rasa estetika murid secara imbang.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Basket & Futsal", desc: "Tim putra-putri berpartisipasi reguler dalam kejuaraan DBL (Development Basketball League) dan piala walikota." },
            { title: "Paduan Suara & Choir", desc: "Melatih harmonisasi suara, olah pernapasan diafragma, membaca partitur, serta rutin mengisi perayaan wisuda kelulusan." },
            { title: "Tari Tradisional & Modern", desc: "Melestarikan kekayaan budaya tari saman aceh, jaipong, serta eksplorasi koreografi tari modern panggung festival." },
            { title: "Gerakan Pramuka & Paskibra", desc: "Menempa kedisiplinan baris-berbaris (PBB), kemandirian berkemah, kepanduan pramuka wajib, serta formasi upacara bendera." }
          ].map((ek, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
              <span className="text-blue-600 font-mono font-bold text-xs">EXCLUSIVES 0{idx + 1}.</span>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{ek.title}</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">{ek.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: KEGIATAN OSIS */}
      <section id="life-osis" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="bg-blue-100 text-blue-800 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
              Kepemimpinan Siswa
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Kegiatan Kepemimpinan OSIS & MPK</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Organisasi Siswa Intra Sekolah (OSIS) dan Majelis Perwakilan Kelas (MPK) di SMAN 1 Nusantara didesain sebagai miniatur pemerintahan demokratis. Siswa melakukan kampanye pemilihan ketua OSIS berbasis e-voting, menyusun proposal anggaran dana kegiatan, mengoordinasi kepanitiaan pentas seni (pensi), serta belajar memimpin rapat evaluasi krisis.
            </p>
            <div className="flex gap-4 font-mono">
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs">
                <p className="text-xl font-extrabold text-blue-600">35+</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Anggota Aktif</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs">
                <p className="text-xl font-extrabold text-blue-600">8+</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Kepanitiaan Event</p>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="/school.jpg" 
              alt="OSIS Students Meeting" 
              className="rounded-2xl shadow-md w-full aspect-video object-cover referrerPolicy='no-referrer'" 
            />
          </div>
        </div>
      </section>

      {/* SECTION 7: KESEHATAN & WELFARE SISWA */}
      <section id="life-welfare" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kesejahteraan, UKS & Kantin Sehat Gizi</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Kami mementingkan aspek kesehatan mental, fisik, serta gizi asupan harian murid.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
            <div className="h-9 w-9 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Unit Kesehatan Sekolah (UKS) Terbina</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Bekerja sama dengan puskesmas kecamatan setempat untuk penyediaan obat-obatan P3K lengkap, 3 tempat tidur pasien yang bersih, tabung oksigen darurat, serta penimbangan berat/tinggi berkala.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
            <div className="h-9 w-9 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Layanan Psikologi & Konseling Pribadi</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Ruang bimbingan konseling yang nyaman, menjamin kerahasiaan siswa dalam mencurahkan kecemasan belajar (stress), perundungan (bullying), ataupun konsultasi masa depan karir kuliah mereka.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
            <div className="h-9 w-9 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Kantin Bersih Hijau Rendah Lemak</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Seluruh gerai makanan di kantin sekolah telah melalui inspeksi berkala kelayakan higienitas pangan, menyajikan menu nasi merah rendah lemak, jus buah murni tanpa pemanis berlebih, serta bebas MSG buatan.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: GALERI DOKUMENTASI FOTO & VIDEO */}
      <section id="life-gallery" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="bg-blue-100 text-blue-800 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
              Dokumentasi Visual
            </span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Galeri Kegiatan Sekolah</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Potret kegembiraan pembelajaran kelas, perlombaan olahraga, hingga kreasi seni musik.</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[
              { id: "all", label: "Semua Kategori" },
              { id: "KBM", label: "KBM Kelas" },
              { id: "Ekstrakurikuler", label: "Ekstrakurikuler" },
              { id: "Fasilitas", label: "Sarana Prasarana" },
              { id: "Prestasi", label: "Prestasi Murid" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterCategory(btn.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                  filterCategory === btn.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 referrerPolicy='no-referrer'"
                  />
                  <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white font-extrabold text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-md shadow-xs">
                    {item.category}
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">{item.title}</h4>
                  <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: EVENT TAHUNAN & PROJEK P5 */}
      <section id="life-events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Event Tahunan & Projek Penguatan Karakter (P5)</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Siswa menampilkan aksi nyata bela negara, kewirausahaan mandiri, & lestarinya tari adat daerah.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
            <span className="bg-blue-600 text-white font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-md inline-block">EVENT 01</span>
            <h4 className="font-bold text-sm text-blue-400">Nusantara Art & Culture Festival</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Pentas seni megah tahunan di mana tiap kelas X-XII membangun anjungan kebudayaan (booth), menampilkan drama kolosal daerah, meracik makanan tradisional nusantara, serta menggalang dana charity sosial kemanusiaan.
            </p>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
            <span className="bg-blue-600 text-white font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-md inline-block">EVENT 02</span>
            <h4 className="font-bold text-sm text-blue-400">Projek Pancasila (P5) Wirausaha Mandiri</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Siswa merancang merek dagang (branding), menghitung modal produksi (HPP), serta menjajakan produk olahan kreatif buatan sendiri dalam pameran kewirausahaan sekolah yang dikunjungi perwakilan dinas pendidikan provinsi.
            </p>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
            <span className="bg-blue-600 text-white font-mono font-bold text-[9px] uppercase px-2 py-0.5 rounded-md inline-block">EVENT 03</span>
            <h4 className="font-bold text-sm text-blue-400">Bootcamp Bela Negara & Pramuka Inti</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Pelatihan mental, ketangkasan fisik, serta kepanduan pramuka wajib yang diselenggarakan di area pegunungan bersuhu sejuk selama 3 hari guna melatih kerja sama tim, keberanian moral, serta kemandirian berkemah.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
