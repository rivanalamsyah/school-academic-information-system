import { motion } from "motion/react";
import { 
  Award, ArrowRight, ChevronRight, 
  CheckCircle2, Star, Shield, Leaf
} from "lucide-react";
import { News, SchoolSettings } from "../../types";

type TabId = "beranda" | "akademik" | "kehidupan" | "ppdb" | "kontak";

interface HomeHubProps {
  settings: SchoolSettings | null;
  news: News[];
  activeSchool: SchoolSettings;
  setActiveTab: (tab: TabId) => void;
  onOpenNews: (newsItem: News) => void;
}

export default function HomeHub({ settings: _settings, news, activeSchool, setActiveTab, onOpenNews }: HomeHubProps) {
  return (
    <div className="space-y-16">

      {/* SECTION 1: HERO BANNER */}
      <section id="home-hero" className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-16 px-4 md:py-24 relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.12),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider font-mono">
              <Award className="w-3.5 h-3.5" />
              Pendidikan Berkelas Dunia
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Unggul Akademik, Kokoh Karakter Pancasila
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Selamat datang di SMA Negeri 1 Nusantara. Kami menumbuhkan kecerdasan intelektual, keterampilan global, dan moralitas luhur untuk mencetak pemimpin masa depan bangsa.
            </p>
            <div className="flex gap-4 flex-wrap pt-2">
              <button
                onClick={() => setActiveTab("ppdb")}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold border border-blue-700 shadow-md shadow-blue-950/40 hover:shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                Pendaftaran Siswa Baru (PPDB)
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("akademik")}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Visi & Misi Sekolah
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative mx-auto md:ml-auto w-full max-w-md"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl rotate-1 scale-95 opacity-25 blur-lg" />
            <img
              src="/school.jpg"
              alt="Gedung Sekolah"
              className="rounded-2xl border border-white/10 shadow-2xl relative z-10 w-full object-cover aspect-video sm:aspect-square md:aspect-[4/3] referrerPolicy='no-referrer'"
            />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: KEY METRICS */}
      <section id="home-stats" className="max-w-7xl mx-auto px-4 relative z-10 -mt-24 sm:-mt-20">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 md:border-r border-slate-100 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-mono">800+</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Siswa Aktif</div>
          </div>
          <div className="space-y-1 md:border-r border-slate-100 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-mono">45+</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pendidik Profesional</div>
          </div>
          <div className="space-y-1 md:border-r border-slate-100 last:border-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-mono">20+</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Klub & Ekskul</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 font-mono">98%</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Kelulusan PTN</div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SAMBUTAN KEPALA SEKOLAH */}
      <section id="home-principal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid md:grid-cols-3 gap-12 items-center">
        <div className="md:col-span-1 space-y-3 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-600/10 rounded-2xl translate-x-2 translate-y-2 pointer-events-none" />
            <img
              src={activeSchool.principalImage}
              alt={activeSchool.principalName}
              className="rounded-2xl shadow-md w-60 h-72 object-cover mx-auto border-4 border-white relative z-10 referrerPolicy='no-referrer'"
            />
          </div>
          <div className="pt-2">
            <h4 className="font-extrabold text-slate-900 text-base leading-tight">{activeSchool.principalName}</h4>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">Kepala SMAN 1 Nusantara</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP: {activeSchool.principalNip}</p>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs relative">
          <span className="text-6xl text-slate-100 font-serif absolute -top-4 left-6 pointer-events-none">“</span>
          <h3 className="text-lg font-bold text-slate-900 relative z-10 tracking-tight">
            Sambutan Hangat Kepala Sekolah
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed relative z-10 whitespace-pre-line">
            {activeSchool.principalGreeting}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab("akademik")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
            >
              Kenali Lebih Jauh Profil Sekolah
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: PILAR KEUNGGULAN SEKOLAH */}
      <section id="home-pillars" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Tiga Pilar Utama Keunggulan</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Kami mengintegrasikan karakter Pancasila, pemikiran logis, dan kecerdasan global.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Kokoh Iman & Taqwa</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Membina akhlak luhur siswa melalui kegiatan keagamaan rutin, pengajian berkala, kepedulian sosial, dan penerapan etika kerja dalam kehidupan sehari-hari.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Unggul Sains & Teknologi</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Pembelajaran berbasis teknologi, praktikum sains secara komprehensif, serta pembekalan logika berpikir terstruktur dalam pemecahan masalah nyata.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="h-10 w-10 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Peduli Lingkungan & Global</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Menerapkan zero-waste lifestyle di lingkungan sekolah, merawat taman vertikal mandiri, dan menumbuhkan toleransi budaya lintas benua.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: KURIKULUM & SISTEM MERDEKA INTRO */}
      <section id="home-academic-intro" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 grid md:grid-cols-2 gap-8 items-center border border-slate-800">
          <div className="space-y-4">
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              Kurikulum Merdeka Belajar
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Sistem Pembelajaran Personalisasi</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Kami membebaskan siswa untuk memilih pemintalan subjek yang paling sesuai dengan bakat alami dan cita-cita kuliah mereka. Tidak ada lagi kotak batasan jurusan yang membatasi mimpi anak.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex gap-2 items-center">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Pembelajaran berbasis projek (Project-Based Learning)</span>
              </li>
              <li className="flex gap-2 items-center">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Asesmen bakat & minat sejak semester awal masuk</span>
              </li>
              <li className="flex gap-2 items-center">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Kolaborasi digital intensif memanfaatkan smart screen Google Workspace</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-950/60 p-6 rounded-xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-blue-400 font-mono">Fokus Kompetensi Unggul</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-slate-300">
                  <span>Logika Matematika & Coding</span>
                  <span>90%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[90%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-slate-300">
                  <span>Bahasa Inggris & Komunikasi Publik</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold text-slate-300">
                  <span>Sains Terapan & Riset Kreatif</span>
                  <span>80%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full w-[80%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: PROGRAM UNGGULAN (BILINGUAL, STEAM, CHARACTERS) */}
      <section id="home-programs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Kesiapan Karir Internasional
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Tiga Program Unggulan Akademik</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Dirancang khusus untuk merespon revolusi teknologi industri dan tuntutan dunia profesional.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col group">
            <div className="aspect-video bg-blue-100 overflow-hidden">
              <img 
                src="/facilities.jpg" 
                alt="Bilingual Class" 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 referrerPolicy='no-referrer'" 
              />
            </div>
            <div className="p-5 flex-1 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">1. International Bilingual Class</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Kelas dengan pengantar dwi-bahasa (Inggris & Indonesia) dalam KBM matematika, sains, dan sosiologi, didukung persiapan TOEFL/IELTS intensif gratis.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col group">
            <div className="aspect-video bg-blue-100 overflow-hidden">
              <img 
                src="/facilities.jpg" 
                alt="STEAM Club" 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 referrerPolicy='no-referrer'" 
              />
            </div>
            <div className="p-5 flex-1 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">2. STEAM & Robotics Center</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Memfasilitasi siswa menyukai rekayasa logika lewat bengkel robotika, perakitan mikrokontroler Arduino, dan kompetisi pemetaan cuaca berbasis Internet of Things (IoT).
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col group">
            <div className="aspect-video bg-blue-100 overflow-hidden">
              <img 
                src="/facilities.jpg" 
                alt="Character Building" 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 referrerPolicy='no-referrer'" 
              />
            </div>
            <div className="p-5 flex-1 space-y-3">
              <h4 className="font-bold text-slate-800 text-sm">3. Executive Leadership Academy</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Program kepemimpinan tahunan berkerja sama dengan lembaga psikologi guna melatih keberanian presentasi, mitigasi krisis konflik, dan etos kerja manajerial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: SOROTAN PRESTASI TERKINI */}
      <section id="home-achievements" className="bg-slate-100/50 py-12 border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Kabar Berita & Prestasi Terbaru</h3>
              <p className="text-xs text-slate-500">Liputan kegiatan, pengumuman ujian, serta trofi prestasi murid.</p>
            </div>
            <button
              onClick={() => setActiveTab("ppdb")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              Lihat Portal Informasi
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {news.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 hover:shadow-xs transition-all overflow-hidden flex flex-col group cursor-pointer"
                onClick={() => onOpenNews(item)}
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={item.image || "/school.jpg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 referrerPolicy='no-referrer'"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-md border border-blue-700 shadow-sm">
                    {item.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-400 font-mono uppercase font-bold">{item.date}</p>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">
                    Baca Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: TESTIMONI WALI & ALUMNI */}
      <section id="home-testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Ulasan Komunitas
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kisah Sukses Keluarga SMAN 1 Nusantara</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Dengarkan penuturan jujur dari alumni yang kini berkuliah di luar negeri serta para orang tua murid.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <p className="text-slate-600 text-xs leading-relaxed italic">
              "Kurikulum personalisasi yang dijalankan SMAN 1 benar-benar luar biasa. Anak saya bebas mendalami pemintal robotika dan sekarang berhasil lolos beasiswa penuh di Universitas Nanyang Singapura (NTU)."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-9 w-9 bg-slate-100 rounded-full overflow-hidden shrink-0">
                <img src="/default-avatar.png" alt="Wali Murid" className="w-full h-full object-cover referrerPolicy='no-referrer'" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Ir. Gunawan Setyadi</h5>
                <p className="text-[10px] text-slate-400 font-medium">Orang Tua dari Alif Setyadi (Alumni 2024)</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <p className="text-slate-600 text-xs leading-relaxed italic">
              "Kombinasi pelajaran yang disiplin serta dukungan BK karir yang detail membantu saya menavigasi ujian masuk kedokteran Universitas Indonesia secara gemilang. Terima kasih dewan guru SMAN 1."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-9 w-9 bg-slate-100 rounded-full overflow-hidden shrink-0">
                <img src="/default-avatar.png" alt="Alumni" className="w-full h-full object-cover referrerPolicy='no-referrer'" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">dr. Amanda Kirana</h5>
                <p className="text-[10px] text-slate-400 font-medium">Alumni SMAN 1 (Kedokteran UI)</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <p className="text-slate-600 text-xs leading-relaxed italic">
              "Kami sangat mengapresiasi sistem portal akademik sekolah. Sebagai orang tua, saya bisa memantau catatan absensi harian dan perkembangan nilai kuis anak secara real-time lewat ponsel tanpa cemas."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="h-9 w-9 bg-slate-100 rounded-full overflow-hidden shrink-0">
                <img src="/default-avatar.png" alt="Wali Murid" className="w-full h-full object-cover referrerPolicy='no-referrer'" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Siti Hardiyanti</h5>
                <p className="text-[10px] text-slate-400 font-medium">Wali Murid Kelas X MIPA 1</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: ECO-CAMPUS & DIGITAL SECURITY */}
      <section id="home-eco-security" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              Green & Secure Environment
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Lingkungan Kampus Ramah Lingkungan & Terproteksi</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Kami percaya lingkungan belajar yang sehat akan melipatgandakan daya serap informasi siswa. SMAN 1 Nusantara berkomitmen menjaga keseimbangan ekologis melalui area resapan hijau rindang, penghematan listrik lampu LED otomatis, serta proteksi keamanan berlapis 24 jam dengan 120 titik kamera CCTV terintegrasi.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">100% Kampus Bebas Sampah Plastik</h5>
                  <p className="text-[11px] text-slate-500 leading-snug">Wajib membawa tumbler mandiri, kantin hanya melayani kemasan biodegradable.</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Sistem Autentikasi Kartu RFID</h5>
                  <p className="text-[11px] text-slate-500 leading-snug">Setiap pintu gerbang masuk terproteksi sensor kartu ID murid guna menghindari penyusup.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="/school.jpg" 
              alt="Eco-friendly Nature" 
              className="rounded-2xl shadow-md aspect-video md:aspect-square object-cover referrerPolicy='no-referrer'" 
            />
          </div>
        </div>
      </section>

      {/* SECTION 10: CALL TO ACTION */}
      <section id="home-cta" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white rounded-2xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-lg border border-blue-800">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Siap Memulai Perjalanan Emas Anda?</h3>
          <p className="text-slate-100 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            Bergabunglah bersama SMA Negeri 1 Nusantara. Kuota penerimaan terbatas melalui seleksi administrasi ketat. Jangan lewatkan pendaftaran gelombang utama PPDB.
          </p>
          <div className="flex justify-center gap-4 flex-wrap pt-2 relative z-10">
            <button
              onClick={() => setActiveTab("ppdb")}
              className="px-6 py-3 bg-white text-blue-700 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Mulai Pendaftaran Online
            </button>
            <button
              onClick={() => setActiveTab("kontak")}
              className="px-6 py-3 bg-blue-900/40 hover:bg-blue-900/60 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Tanya Jawab Panitia Hubungi Kami
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
