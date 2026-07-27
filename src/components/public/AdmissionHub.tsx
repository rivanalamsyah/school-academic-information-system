import { useState } from "react";
import { 
  FileText, CheckCircle2, AlertCircle, Search, 
  Download, ArrowRight, Send, MapPin, 
  User, ShieldAlert, Layers, Clock, ShieldCheck, RefreshCw 
} from "lucide-react";
import { News, Document } from "../../types";

interface PpdbSubmitResult {
  registrationNo?: string;
  registration?: {
    fullName: string;
  };
}

interface PpdbTrackerResult {
  registrationNo: string;
  status: 'pending' | 'approved' | 'rejected';
  fullName: string;
  nisn: string;
  previousSchool: string;
  path: string;
}

interface AdmissionHubProps {
  documents: Document[];
  news: News[];
  onSubmitPPDB: (data: Record<string, unknown>) => Promise<{
    success: boolean;
    registrationNo?: string;
    error?: string;
    registration?: {
      fullName: string;
    };
  }>;
  onOpenNews: (newsItem: News) => void;
}

export default function AdmissionHub({ documents, news, onSubmitPPDB, onOpenNews }: AdmissionHubProps) {
  // PPDB Form State
  const [formData, setFormData] = useState({
    fullName: "",
    nisn: "",
    previousSchool: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    address: "",
    path: "zonasi"
  });
  const [formLoading, setFormLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<PpdbSubmitResult | null>(null);
  const [formError, setFormError] = useState("");

  // Live Check Status Tracker State
  const [searchRegNo, setSearchRegNo] = useState("");
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerResult, setTrackerResult] = useState<PpdbTrackerResult | null>(null);
  const [trackerError, setTrackerError] = useState("");

  // News search state
  const [newsSearch, setNewsSearch] = useState("");

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setSubmitResult(null);

    // Validate fields
    if (!formData.fullName || !formData.nisn || !formData.previousSchool || !formData.phone || !formData.parentName || !formData.address) {
      setFormError("Harap lengkapi seluruh kolom formulir wajib.");
      setFormLoading(false);
      return;
    }

    try {
      const res = await onSubmitPPDB(formData);
      if (res && res.success) {
        setSubmitResult(res);
        // Clear form
        setFormData({
          fullName: "",
          nisn: "",
          previousSchool: "",
          phone: "",
          parentName: "",
          parentPhone: "",
          address: "",
          path: "zonasi"
        });
      } else {
        setFormError(res?.error || "Gagal mengirim pendaftaran.");
      }
    } catch {
      setFormError("Koneksi gagal. Silakan coba lagi.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleTrackStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRegNo) {
      setTrackerError("Masukkan nomor pendaftaran pendaftaran terlebih dahulu.");
      return;
    }

    setTrackerLoading(true);
    setTrackerError("");
    setTrackerResult(null);

    try {
      const response = await fetch(`/api/public/ppdb/status/${searchRegNo}`);
      if (response.ok) {
        const data = await response.json();
        setTrackerResult(data.registration as PpdbTrackerResult);
      } else {
        const errData = await response.json();
        setTrackerError(errData.error || "Nomor pendaftaran tidak ditemukan. Pastikan format benar (contoh: PPDB2026123).");
      }
    } catch {
      setTrackerError("Koneksi server gagal. Silakan coba lagi.");
    } finally {
      setTrackerLoading(false);
    }
  };

  const filteredNews = news.filter(n => 
    n.title.toLowerCase().includes(newsSearch.toLowerCase()) || 
    n.category.toLowerCase().includes(newsSearch.toLowerCase())
  );

  return (
    <div className="space-y-16">

      {/* SECTION 1: ALUR & KETENTUAN UMUM */}
      <section id="ppdb-rules" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            PPDB Online 2026/2027
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Alur & Ketentuan Umum Pendaftaran</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Selamat datang di sistem PPDB terpadu. Pahami 4 jalur resmi masuk sekolah.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Jalur Zonasi (50%)", desc: "Diperuntukkan bagi siswa domisili terdekat dengan titik koordinat sekolah, dibuktikan dengan Kartu Keluarga minimal 1 tahun." },
            { step: "02", title: "Jalur Prestasi (30%)", desc: "Menggunakan akumulasi rerata nilai rapor semester 1-5 atau sertifikat juara kejuaraan lomba akademik/non-akademik minimal tingkat kabupaten." },
            { step: "03", title: "Jalur Afirmasi (15%)", desc: "Bantuan khusus bagi keluarga kurang mampu pemegang kartu KIP/KKS serta penyandang disabilitas ringan yang mampu mengikuti KBM harian." },
            { step: "04", title: "Jalur Pindahan (5%)", desc: "Mengakomodasi anak ASN, TNI, POLRI, atau karyawan BUMN yang dipindahtugaskan dibuktikan surat keterangan mutasi instansi." }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
              <span className="font-mono font-black text-blue-600 text-sm">JALUR {item.step}</span>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{item.title}</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: PERSYARATAN DOKUMEN */}
      <section id="ppdb-documents" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-2">
            <img 
              src="/school.jpg" 
              alt="Folder Documents" 
              className="rounded-2xl shadow-md aspect-square object-cover referrerPolicy='no-referrer'" 
            />
          </div>
          <div className="md:col-span-3 space-y-4">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
              Kelengkapan Berkas
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Persyaratan Dokumen & Berkas Fisik</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Seluruh calon siswa yang telah melakukan pendaftaran online wajib mengunggah pindaian (scan) warna dokumen asli dengan format PDF/JPG berukuran maksimal 2MB per berkas:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Ijazah / SKL Kelulusan SMP</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Akte Kelahiran Resmi Kemenkumham</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Kartu Keluarga (KK) Min. Terbit 1 Tahun</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Buku Rapor SMP Semester 1 s/d 5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: JADWAL PENTING PPDB */}
      <section id="ppdb-timeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Jadwal Penting Pelaksanaan PPDB Ganjil</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Pastikan Anda tidak terlewat tanggal-tanggal krusial berikut.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { date: "1 - 15 Juni 2026", title: "Pendaftaran Online", desc: "Pengisian biodata diri serta unggah berkas PDF kelengkapan lewat portal pendaftaran resmi." },
            { date: "16 - 22 Juni 2026", title: "Verifikasi Berkas Fisik", desc: "Panitia mencocokkan pindaian berkas dengan dokumen asli calon siswa di sekretariat sekolah." },
            { date: "25 Juni 2026", title: "Pengumuman Lolos", desc: "Rilis nama-nama siswa yang lolos seleksi utama lewat portal web dan papan mading sekolah." },
            { date: "26 - 29 Juni 2026", title: "Daftar Ulang Resmi", desc: "Penyerahan surat pernyataan bersedia mematuhi tata tertib serta pengambilan seragam & atribut." }
          ].map((timeline, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 space-y-2 shadow-2xs relative overflow-hidden">
              <span className="text-blue-600 font-mono font-bold text-xs bg-blue-50 px-2 py-0.5 rounded-md inline-block">{timeline.date}</span>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm pt-1">{timeline.title}</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">{timeline.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: FORMULIR PENDAFTARAN ONLINE PPDB */}
      <section id="ppdb-form" className="max-w-5xl mx-auto px-4 py-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Formulir Pendaftaran
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Formulir Pengisian Online Siswa Baru</h3>
          <p className="text-xs text-slate-500">Lengkapi formulir dengan jujur dan teliti sesuai ijazah dan KK.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.02),transparent)] pointer-events-none" />
          
          {submitResult ? (
            <div className="text-center py-8 space-y-6">
              <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 text-xl tracking-tight">Pendaftaran Terkirim Berhasil!</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Tulis dan simpan Nomor Pendaftaran Anda dengan baik guna keperluan pelacakan kelulusan berkas secara berkala.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto space-y-2">
                <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">No. Pendaftaran Anda</p>
                <p className="text-3xl font-black text-blue-600 font-mono select-all tracking-wider">{submitResult.registrationNo}</p>
                <p className="text-[10px] text-slate-500">Nama Lengkap: <span className="font-bold text-slate-800">{submitResult.registration?.fullName}</span></p>
              </div>
              <div>
                <button
                  onClick={() => setSubmitResult(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Kirim Pendaftaran Lain Baru
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Nama Lengkap Calon Siswa (Sesuai Ijazah) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    placeholder="Contoh: Zahra Amalia Putri"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Nomor NISN (10 Digit Nasional) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleFormChange}
                    placeholder="Contoh: 0098451240"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Sekolah Asal (SMP / MTs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleFormChange}
                    placeholder="Contoh: SMP Negeri 5 Jakarta"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Pilih Jalur Pendaftaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="path"
                    value={formData.path}
                    onChange={handleFormChange}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
                  >
                    <option value="zonasi">Jalur Zonasi Terdekat (50%)</option>
                    <option value="prestasi">Jalur Prestasi Rapor / Lomba (30%)</option>
                    <option value="afirmasi">Jalur Afirmasi Kurang Mampu (15%)</option>
                    <option value="pindahan">Jalur Pindahan ASN/TNI/POLRI (5%)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nomor HP / WhatsApp Aktif Calon Siswa <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="Contoh: 081298451240"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Lengkap Orang Tua / Wali <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleFormChange}
                    placeholder="Contoh: Gunawan Setyadi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Alamat Rumah Tinggal Lengkap (Sesuai Kartu Keluarga) <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Contoh: Jl. Menteng Dalam No. 45, RT 02/RW 04, Kel. Kebayoran Lama, Jakarta Selatan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 h-20 resize-none"
                  required
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-sm transition-all flex items-center gap-2 ml-auto cursor-pointer"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Memproses Berkas...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Kirim Formulir Pendaftaran
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* SECTION 5: PORTAL CEK STATUS PENDAFTARAN */}
      <section id="ppdb-tracker" className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 space-y-6">
          <div className="space-y-1 text-center">
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              Sistem Pelacakan Berkas
            </span>
            <h3 className="text-xl font-bold tracking-tight">Portal Cek Status Kelulusan Berkas PPDB</h3>
            <p className="text-slate-400 text-[11px] max-w-sm mx-auto">Masukkan nomor pendaftaran Anda untuk memantau lolos/tidaknya berkas secara real-time.</p>
          </div>

          <form onSubmit={handleTrackStatus} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Masukkan No. Pendaftaran (cth: PPDB2026123)"
              value={searchRegNo}
              onChange={(e) => setSearchRegNo(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-950/60 text-white placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={trackerLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {trackerLoading ? "Mengecek..." : "Cari Status"}
            </button>
          </form>

          {trackerError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-2 text-xs max-w-md mx-auto">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{trackerError}</span>
            </div>
          )}

          {trackerResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 max-w-md mx-auto space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <p className="text-[9px] text-slate-500 font-mono font-bold uppercase">No. Pendaftaran</p>
                  <p className="text-sm font-black text-blue-400 font-mono tracking-wider">{trackerResult.registrationNo}</p>
                </div>
                <div>
                  {trackerResult.status === "pending" && (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold">
                      Menunggu Verifikasi (Pending)
                    </span>
                  )}
                  {trackerResult.status === "approved" && (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Lolos Seleksi (Approved)
                    </span>
                  )}
                  {trackerResult.status === "rejected" && (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold">
                      Berkas Ditolak (Rejected)
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] text-slate-300">
                <div>
                  <p className="text-slate-500 text-[9px]">NAMA CALON SISWA</p>
                  <p className="font-bold text-slate-100">{trackerResult.fullName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9px]">NISN SISWA</p>
                  <p className="font-bold font-mono">{trackerResult.nisn}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9px]">SEKOLAH ASAL</p>
                  <p className="font-bold text-slate-100">{trackerResult.previousSchool}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9px]">JALUR MASUK</p>
                  <p className="font-bold uppercase text-blue-400 font-mono text-[9px]">{trackerResult.path}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 6: BIAYA PENDIDIKAN & KUOTA PENERIMAAN */}
      <section id="ppdb-quotas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kapasitas Kursi & Transparansi Biaya</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Kami mengedepankan keterbukaan akuntabilitas pembiayaan operasional kelas.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h4 className="font-bold text-sm text-slate-800">1. Alokasi Daya Tampung Kursi</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Total Kelas X Baru</span>
                <span className="font-bold font-mono">8 Kelas x 32 Siswa</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Kuota Jalur Zonasi (50%)</span>
                <span className="font-bold font-mono">128 Kursi</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Kuota Jalur Prestasi (30%)</span>
                <span className="font-bold font-mono">76 Kursi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kuota Jalur Afirmasi & Mutasi (20%)</span>
                <span className="font-bold font-mono">52 Kursi</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h4 className="font-bold text-sm text-slate-800">2. Rincian Pembiayaan Operasional</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Biaya Formulir & Pendaftaran</span>
                <span className="font-bold font-mono text-emerald-600">Rp 0,- (GRATIS)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Sumbangan Pengembangan Gedung (Uang Pangkal)</span>
                <span className="font-bold font-mono text-emerald-600">Rp 0,- (Subsidi Pemerintah)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Uang Iuran Komite Bulanan (SPP)</span>
                <span className="font-bold font-mono text-blue-600">Sukarela (Sesuai Kemampuan Wali)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biaya Pembelian Buku Paket Rapor Setahun</span>
                <span className="font-bold font-mono text-blue-600">Dipinjamkan Sekolah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: SURAT PENGUMUMAN PPDB & PANDUAN PDF */}
      <section id="ppdb-downloads" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="bg-blue-100 text-blue-800 border border-blue-200 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
              Unduhan File Resmi
            </span>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Dokumen Regulasi & Panduan PDF</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Unduh berkas instruksi pendaftaran resmi guna kelancaran penyusunan berkas Anda.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">GUIDE FILE</span>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">{doc.name}</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">Format: {doc.type} • Diunggah: {doc.uploadedAt}</p>
                </div>
                <a
                  href={doc.fileUrl}
                  download
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Panduan PDF ({doc.size})
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: BERITA TERKINI & ARTIKEL EDUKASI */}
      <section id="ppdb-news" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight font-sans">Seluruh Berita & Pengumuman Sekolah</h3>
            <p className="text-xs text-slate-500">Dapatkan rilis berita resmi, liputan, serta prestasi siswa terlengkap.</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari artikel berita..."
              value={newsSearch}
              onChange={(e) => setNewsSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs text-slate-600"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
              onClick={() => onOpenNews(item)}
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={item.image || "/school.jpg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 referrerPolicy='no-referrer'"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white font-extrabold text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <p className="text-[9px] text-slate-400 font-mono font-bold uppercase">{item.date}</p>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <span className="text-xs font-bold text-blue-600 inline-flex items-center gap-1">
                  Baca Selengkapnya
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
