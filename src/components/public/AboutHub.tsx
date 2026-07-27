import { useState } from "react";
import { 
  Compass, Search, Filter, Mail, CheckCircle2, 
  UserCheck 
} from "lucide-react";
import { Teacher, SchoolSettings } from "../../types";

interface AboutHubProps {
  settings: SchoolSettings | null;
  teachers: Teacher[];
  activeSchool: SchoolSettings;
}

export default function AboutHub({ settings: _settings, teachers, activeSchool }: AboutHubProps) {
  // Teachers Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.nip.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesGender = genderFilter === "all" || t.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesGender;
  });

  const milestones = [
    { year: "1982", title: "Pendirian Perdana", desc: "Didirikan dengan 3 ruang kelas darurat di Condongcatur, Yogyakarta Selatan." },
    { year: "1995", title: "Akreditasi A & Perluasan", desc: "Memperoleh akreditasi A perdana dan membangun kompleks lab kimia & biologi." },
    { year: "2010", title: "Sekolah Kategori Mandiri", desc: "Ditunjuk kementerian sebagai salah satu rintisan sekolah digital modern mandiri." },
    { year: "2022", title: "Full Kurikulum Merdeka", desc: "Menjadi sekolah pelopor kurikulum Merdeka Belajar dengan platform terintegrasi." },
    { year: "2026", title: "Digital School Transformation", desc: "Adopsi server lokal hibrida, RFID gate security, dan e-report otomatis." }
  ];

  const calendarEvents = [
    { date: "15 Juli 2026", event: "Hari Pertama Sekolah (Masa Pengenalan MPLS)", type: "akademik" },
    { date: "17 Agustus 2026", event: "Upacara Bendera HUT RI ke-81", type: "kegiatan" },
    { date: "22-29 September 2026", event: "Ujian Tengah Semester (UTS) Ganjil", type: "ujian" },
    { date: "28 Oktober 2026", event: "Peringatan Hari Sumpah Pemuda & Bulan Bahasa", type: "kegiatan" },
    { date: "7-15 Desember 2026", event: "Ujian Akhir Semester (UAS) Ganjil", type: "ujian" },
    { date: "18 Desember 2026", event: "Pembagian Rapor Akademik Ganjil", type: "akademik" },
    { date: "21 Des - 3 Jan 2027", event: "Libur Akhir Semester Ganjil", type: "libur" }
  ];

  return (
    <div className="space-y-16">

      {/* SECTION 1: SEJARAH & MILESTONES */}
      <section id="about-history" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Kilas Balik Sejarah
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Perjalanan Panjang SMA Global</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Kami terus berkembang, melahirkan puluhan ribu lulusan berprestasi tinggi.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              SMA Global didirikan pada tahun 1982 sebagai rintisan sekolah unggulan baru di wilayah Yogyakarta Selatan. Berbekal komitmen kuat melahirkan pemimpin bangsa, kami mementingkan kedisiplinan mental serta penguasaan literasi dasar yang kuat sejak awal.
            </p>
            <p>
              Melewati era milenium, sekolah kami bertransformasi mengadopsi ruang-ruang praktikum komputer modern, perpustakaan digital, serta jaringan Wi-Fi komprehensif. Hari ini, di bawah Kurikulum Merdeka, sekolah kami menjadi kiblat bagi sekolah-sekolah di nusantara dalam hal penerapan teknologi portal administrasi guru-siswa yang paperless dan akurat.
            </p>
          </div>
          <div className="relative border-l border-blue-200 pl-6 ml-4 space-y-6">
            {milestones.map((ms, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-600 border-4 border-white shadow-sm" />
                <span className="font-mono font-black text-blue-600 text-sm">{ms.year}</span>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{ms.title}</h4>
                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{ms.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: VISI & MISI */}
      <section id="about-visimisi" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-3">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Orientasi Pendidikan
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Visi & Misi Mulia</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Kami menetapkan tujuan tinggi untuk mengarahkan seluruh program kurikuler, sarana kelas, serta ekstrakurikuler menuju kematangan emosional dan intelektual siswa.
            </p>
          </div>
          <div className="md:col-span-2 grid sm:grid-cols-2 gap-6">
            <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-9 w-9 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-blue-400 font-mono uppercase tracking-widest">VISI SEKOLAH</h4>
                <p className="text-slate-200 text-xs leading-relaxed italic">
                  "{activeSchool.vision}"
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest font-mono">MISI UTAMA SEKOLAH</h4>
              <ul className="space-y-2.5 text-xs text-slate-600">
                {activeSchool.mission.map((m: string, i: number) => (
                  <li key={i} className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: NILAI-NILAI KARAKTER MULIA */}
      <section id="about-values" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Nilai Dasar Karakter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Nilai dasar yang kami tanamkan harian kepada seluruh guru, siswa, dan pengelola sekolah.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Integritas (Integrity)", desc: "Menjunjung kejujuran mutlak dalam setiap pengerjaan ujian akademik, kepatuhan tata tertib, serta ketaatan ibadah harian." },
            { title: "Inovasi (Innovation)", desc: "Mendorong siswa melakukan eksplorasi rekayasa logika, riset sains terapan, serta penuangan kreativitas seni tanpa batasan kaku." },
            { title: "Saling Menghargai", desc: "Menumbuhkan empati luhur atas kemajemukan latar belakang etnis suku, toleransi pemikiran keagamaan, serta kesetaraan gender." },
            { title: "Kepemimpinan (Leadership)", desc: "Melatih inisiatif mengambil tanggung jawab, kerja sama tim (collaboration), mitigasi krisis konflik, serta kerendahan hati melayani." }
          ].map((val, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs">
              <span className="text-blue-600 font-mono font-bold text-xs">VALUES 0{idx + 1}.</span>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{val.title}</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: STRUKTUR ORGANISASI */}
      <section id="about-org" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Struktur Manajemen
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Tata Kelola & Struktur Kepemimpinan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Dipimpin oleh kolaborasi profesional berdedikasi tinggi demi kelancaran operasional harian.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col items-center space-y-6">
            {/* Level 1 */}
            <div className="bg-blue-600 text-white rounded-xl px-6 py-3 shadow-xs text-center border border-blue-700 max-w-xs w-full">
              <p className="text-[9px] font-bold font-mono tracking-widest uppercase opacity-75">Kepala Sekolah</p>
              <h5 className="font-bold text-xs sm:text-sm mt-0.5">{activeSchool.principalName}</h5>
            </div>

            <div className="w-0.5 h-6 bg-slate-200" />

            {/* Level 2 */}
            <div className="grid sm:grid-cols-2 gap-4 max-w-xl w-full">
              <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 text-center border border-slate-800">
                <p className="text-[8px] font-bold font-mono tracking-widest uppercase text-blue-400">Komite Sekolah</p>
                <h5 className="font-bold text-xs mt-0.5">Prof. Dr. H. M. Yusuf, M.B.A.</h5>
              </div>
              <div className="bg-slate-900 text-white rounded-xl px-4 py-2.5 text-center border border-slate-800">
                <p className="text-[8px] font-bold font-mono tracking-widest uppercase text-blue-400">Kepala Tata Usaha</p>
                <h5 className="font-bold text-xs mt-0.5">Hj. Endang Sulastri, S.Sos.</h5>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-slate-200" />

            {/* Level 3 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                { title: "Waka Kurikulum", name: "Dra. Siti Rahmah, M.Si." },
                { title: "Waka Kesiswaan", name: "Budi Santoso, S.Pd." },
                { title: "Waka Sarana Prasarana", name: "Drs. Heri Irawan" },
                { title: "Waka Hubungan Masyarakat", name: "Agus Salim, M.Pd." }
              ].map((w, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
                  <p className="text-[8px] font-bold font-mono tracking-widest uppercase text-slate-400">{w.title}</p>
                  <h6 className="font-bold text-xs text-slate-800 mt-0.5">{w.name}</h6>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: DEWAN GURU (FILTERABLE/SEARCHABLE!) */}
      <section id="about-teachers" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="bg-blue-100 text-blue-800 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
              Staff & Pendidik
            </span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kenali Dewan Pendidik Profesional Kami</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Staf pengajar bersertifikasi kompetensi nasional yang menyayangi tumbuh kembang literasi anak.</p>
          </div>

          {/* Interactive Filters Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid sm:grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari nama guru atau NIP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs text-slate-600"
              >
                <option value="all">Semua Status (PNS & Swasta)</option>
                <option value="PNS">Pegawai Negeri (PNS)</option>
                <option value="Yayasan">Staf Tetap Yayasan</option>
                <option value="Honororer">Guru Honorer</option>
              </select>
            </div>
            {/* Gender Filter */}
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-2 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs text-slate-600"
              >
                <option value="all">Semua Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            {/* Total Results */}
            <div className="text-right text-xs font-mono font-bold text-slate-400">
              Menampilkan {filteredTeachers.length} Guru
            </div>
          </div>

          {/* Teachers Grid */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTeachers.map((t) => (
              <div key={t.id} className="bg-white rounded-xl p-5 text-center border border-slate-200 flex flex-col justify-between space-y-4 group">
                <div className="relative inline-block mx-auto">
                  <div className="absolute inset-0 bg-blue-100 rounded-full scale-102 blur-2xs group-hover:bg-blue-200 transition-colors" />
                  <img
                    src="/default-avatar.png"
                    alt={t.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 relative z-10 shadow-sm referrerPolicy='no-referrer'"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">{t.name}</h4>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider font-mono bg-blue-50 py-0.5 rounded-md inline-block px-2">Status {t.status}</p>
                  <p className="text-[9px] text-slate-400 font-mono">NIP. {t.nip}</p>
                </div>
                <div className="pt-2 border-t border-slate-50 text-slate-400 text-[10px] font-mono flex justify-center gap-2">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-500" />
                    {t.email.split("@")[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: KURIKULUM MERDEKA BELAJAR */}
      <section id="about-curriculum" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kurikulum Merdeka & Kelompok Mapel</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Kelompok pengajaran lengkap untuk mempersiapkan bakat siswa secara adaptif.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h4 className="font-bold text-xs text-blue-600 font-mono uppercase tracking-widest">A. Kelompok Dasar (Wajib)</h4>
            <p className="text-slate-500 text-xs">Mata pelajaran pondasi yang wajib dipelajari oleh seluruh siswa kelas X hingga XII.</p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li>• Pendidikan Agama & Budi Pekerti</li>
              <li>• Pendidikan Pancasila & Kewarganegaraan</li>
              <li>• Bahasa Indonesia & Sastra</li>
              <li>• Matematika (Wajib)</li>
              <li>• Sejarah Indonesia</li>
              <li>• Pend. Jasmani, Olahraga & Kesehatan</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h4 className="font-bold text-xs text-blue-600 font-mono uppercase tracking-widest">B. Kelompok Pilihan MIPA</h4>
            <p className="text-slate-500 text-xs">Diperuntukkan bagi siswa yang mengarah pada cita-cita keteknikan, kedokteran, & riset sains.</p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li>• Matematika Tingkat Lanjut</li>
              <li>• Fisika Terapan & Mekanika</li>
              <li>• Kimia Organik & Biokimia</li>
              <li>• Biologi Molekuler & Ekologi</li>
              <li>• Informatika & Rekayasa Perangkat Lunak</li>
            </ul>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h4 className="font-bold text-xs text-blue-600 font-mono uppercase tracking-widest">C. Kelompok Pilihan IPS & Bahasa</h4>
            <p className="text-slate-500 text-xs">Membantu pemahaman mendalam tentang tata sosial kemasyarakatan, bisnis, & komunikasi global.</p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li>• Sosiologi & Antropologi</li>
              <li>• Ekonomi & Akuntansi Keuangan</li>
              <li>• Geografi & Pemetaan Spasial</li>
              <li>• Sastra Inggris / Komunikasi Internasional</li>
              <li>• Bahasa Mandarin & Jepang (Praktis)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 7: PROGRAM BAHASA & LITERASI INTERNASIONAL */}
      <section id="about-languages" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="bg-blue-100 text-blue-800 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
              Literasi Bahasa Asing
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Lab Bahasa Asing Interaktif & Sertifikasi TOEFL</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Bahasa adalah paspor menuju dunia luar. Sekolah kami memfasilitasi laboratorium bahasa digital bersuara jernih (surround sound), lengkap dengan program pembelajaran hibrida dari pengajar native-speaker tamu. Siswa secara rutin mempersiapkan sertifikasi kompetensi bahasa global:
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-xl p-3 border border-slate-200">
                <p className="text-sm font-black text-blue-600 font-mono">TOEFL</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Bahasa Inggris</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200">
                <p className="text-sm font-black text-blue-600 font-mono">JLPT N5/N4</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Bahasa Jepang</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200">
                <p className="text-sm font-black text-blue-600 font-mono">HSK II/III</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Bahasa Mandarin</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="/school.jpg" 
              alt="Language Learning Students" 
              className="rounded-2xl shadow-md aspect-video md:aspect-[4/3] object-cover referrerPolicy='no-referrer'" 
            />
          </div>
        </div>
      </section>

      {/* SECTION 8: BIMBINGAN KARIR & PTN PATHWAYS */}
      <section id="about-counseling" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid md:grid-cols-5 gap-12 items-center">
        <div className="md:col-span-2">
          <img 
            src="/school.jpg" 
            alt="Counseling" 
            className="rounded-2xl shadow-md aspect-square object-cover referrerPolicy='no-referrer'" 
          />
        </div>
        <div className="md:col-span-3 space-y-4">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Bimbingan Konseling (BK)
          </span>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Pathways Menuju Universitas Negeri Terfavorit</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Guru BK di SMA Global bertindak sebagai mentor karir personal. Kami melakukan asesmen sidik jari bakat, melacak tren kuota masuk lewat jalur prestasi undangan (SNBP), serta menyelenggarakan uji coba (Tryout) ujian tulis nasional (SNBT) komputerisasi sebanyak 12 kali dalam satu tahun ajaran.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 font-mono text-center pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-2xl font-extrabold text-blue-600">80%</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Jalur Prestasi</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-2xl font-extrabold text-blue-600">120+</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Lolos UI & ITB</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-2xl font-extrabold text-blue-600">15+</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Kuliah Luar Negeri</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: KALENDER AKADEMIK RESMI */}
      <section id="about-calendar" className="bg-slate-900 text-white py-12 border-y border-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              Kalender Agenda
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Kalender Kegiatan Akademik Resmi 2026/2027</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">Agenda terjadwal guna transparansi kerja seluruh murid & komite sekolah.</p>
          </div>
          <div className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase font-mono bg-slate-950">
                    <th className="py-3 px-4">Tanggal Resmi</th>
                    <th className="py-3 px-4">Nama Kegiatan / Agenda</th>
                    <th className="py-3 px-4">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {calendarEvents.map((evt, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-3.5 px-4 font-mono text-blue-400">{evt.date}</td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium">{evt.event}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-md ${
                          evt.type === "ujian" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                          evt.type === "kegiatan" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          evt.type === "libur" ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" :
                          "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {evt.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
