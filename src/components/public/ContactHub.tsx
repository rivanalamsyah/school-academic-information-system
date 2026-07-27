import { useState } from "react";
import { 
  Phone, Mail, MapPin, Send, HelpCircle, ChevronDown, 
  ChevronUp, CheckCircle2, 
  Instagram, Youtube, ArrowUpRight, Globe, AlertTriangle 
} from "lucide-react";
import { SchoolSettings } from "../../types";

interface ContactHubProps {
  settings: SchoolSettings | null;
  activeSchool: SchoolSettings;
  onSubmitMessage: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
}

export default function ContactHub({ settings: _settings, activeSchool, onSubmitMessage }: ContactHubProps) {
  // Message Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  // Whistleblower Form State
  const [wbData, setWbData] = useState({
    category: "perundungan",
    description: "",
    contactInfo: "" // Optional
  });
  const [wbSuccess, setWbSuccess] = useState(false);

  // FAQ Expand States
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess(false);

    if (!formData.name || !formData.email || !formData.message) {
      setFormError("Harap lengkapi nama, email, dan pesan Anda.");
      setFormLoading(false);
      return;
    }

    try {
      const res = await onSubmitMessage(formData);
      if (res && res.success) {
        setFormSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setFormError(res?.error || "Gagal mengirim pesan.");
      }
    } catch {
      setFormError("Koneksi gagal. Silakan coba lagi nanti.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleWbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wbData.description) return;
    setWbSuccess(true);
    setWbData({ category: "perundungan", description: "", contactInfo: "" });
  };

  const faqs = [
    { q: "Kapan pendaftaran PPDB gelombang utama dibuka?", a: "PPDB Gelombang utama dibuka mulai tanggal 1 - 15 Juni 2026. Seluruh pendaftaran dilakukan secara online tanpa dipungut biaya sepeser pun." },
    { q: "Bagaimana cara melakukan legalisir ijazah alumni?", a: "Alumni dapat mengajukan permohonan legalisir dengan mengunggah foto ijazah asli melalui Unit Pelayanan Terpadu di bagian tata usaha, atau mengajukannya secara fisik pada jam pelayanan." },
    { q: "Apakah sekolah menyediakan fasilitas jemputan bus sekolah?", a: "Saat ini sekolah bekerja sama dengan dinas perhubungan setempat untuk rute bus sekolah gratis khusus halte Condongcatur pada pagi dan sore hari." },
    { q: "Apakah ada program beasiswa bagi anak kurang mampu?", a: "Ya, sekolah menyalurkan program PIP (Program Indonesia Pintar) serta beasiswa komite sekolah untuk siswa berprestasi berlatar belakang kurang mampu." },
    { q: "Bagaimana sistem pengkondisian kelas jika terjadi bencana banjir?", a: "SMA Global memiliki sistem e-learning hibrida Google Classroom. KBM akan dialihkan ke pembelajaran jarak jauh (PJJ) secara interaktif dari rumah masing-masing." }
  ];

  return (
    <div className="space-y-16">

      {/* SECTION 1: HUBUNGI KAMI & HOTLINE */}
      <section id="contact-direct" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Hubungan Masyarakat
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Hubungi Kami & Layanan Hotline</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Kami siap merespon pertanyaan Anda seputar PPDB, nilai rapor, maupun kemitraan.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-6">
              <h4 className="font-bold text-sm text-blue-400 font-mono uppercase tracking-widest">Informasi Kontak</h4>
              <div className="space-y-4 text-xs">
                <div className="flex gap-3">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">TELEPON UTAMA</p>
                    <p className="font-semibold text-slate-200">{activeSchool.phone}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">SUREL RESMI</p>
                    <p className="font-semibold text-slate-200">{activeSchool.email}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold">ALAMAT FISIK</p>
                    <p className="font-semibold text-slate-200 leading-relaxed">{activeSchool.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs">
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest font-mono mb-4">Kirim Pesan Pengaduan / Masukan</h4>
            
            {formSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">Pesan Berhasil Terkirim!</h5>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Humas kami akan menanggapi surel Anda dalam waktu maksimal 2x24 jam kerja.</p>
                </div>
                <button
                  onClick={() => setFormSuccess(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
                >
                  Kirim Pesan Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-xs">
                    {formError}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Nama Lengkap *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Contoh: Budi Gunawan"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Email Masukan *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Contoh: budi@gmail.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Subjek Keperluan</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    placeholder="Contoh: Pertanyaan Syarat PPDB Jalur Zonasi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Detail Pesan / Pertanyaan *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="Tulis pesan lengkap Anda di sini..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 h-24 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {formLoading ? "Mengirim..." : "Kirim Masukan"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 2: LOKASI & PETA LENGKAP */}
      <section id="contact-map" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Lokasi Fisik & Peta Gedung Sekolah</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Mudah diakses menggunakan TransYogyakarta rute MRT Blok M maupun bus kota.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-3 shadow-2xs">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m2!1s0x2e69f14f483bf9e1%3A0x6b8ec4344d9f67a2!2sKebayoran%20Baru%2C%20South%20Yogyakarta%20City%2C%20Yogyakarta!5m2!1sid!2sid" 
              className="w-full h-80 border-0 rounded-xl"
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: FAQ COLLAPSIBLE ACCORDION */}
      <section id="contact-faq" className="max-w-4xl mx-auto px-4 py-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-mono">
            Tanya Jawab
          </span>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">FAQ / Pertanyaan Sering Diajukan</h3>
          <p className="text-xs text-slate-500">Temukan jawaban cepat seputar kendala pendaftaran online dan mutasi siswa masuk.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  {faq.q}
                </span>
                {openFaqIdx === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaqIdx === idx && (
                <div className="p-4 pt-0 border-t border-slate-100 text-xs text-slate-500 leading-relaxed bg-slate-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: UNIT PELAYANAN PUBLIK TERPADU */}
      <section id="contact-services" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Unit Pelayanan Publik Terpadu</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Kami menyediakan prosedur mudah untuk legalisir ijazah online & pengajuan mutasi siswa.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-2xs space-y-4">
              <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">PELAYANAN 01</span>
              <h4 className="font-bold text-slate-800 text-sm">Legalisir Ijazah Alumni Online</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Kirim pindaian warna ijazah asli melalui surat elektronik sekolah dengan subjek "LEGALISIR - [NAMA] - [TAHUN LULUS]". Hasil legalisir bertanda tangan basah kepala sekolah dapat diambil langsung dalam 2 hari kerja.
              </p>
            </div>
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-2xs space-y-4">
              <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">PELAYANAN 02</span>
              <h4 className="font-bold text-slate-800 text-sm">Pengajuan Surat Mutasi Masuk/Keluar</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Wali murid mengajukan surat pengantar resmi bermaterai 10.000 ke loket tata usaha, melampirkan rapor asli legalisir, surat rekomendasi bebas narkoba, serta ketersediaan daya tampung bangku kosong di kelas tujuan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: KOTAK WHISTLEBLOWER PENYELEWENGAN */}
      <section id="contact-whistle" className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.04),transparent)] pointer-events-none" />
          <div className="space-y-1 text-center">
            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              Saluran Pengaduan Rahasia
            </span>
            <h3 className="text-xl font-bold tracking-tight text-slate-100 flex items-center justify-center gap-1.5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              Kotak Pengaduan Whistleblowing (Anonim)
            </h3>
            <p className="text-slate-400 text-[11px] max-w-md mx-auto">Bantu kami menegakkan integritas moral bebas korupsi, pungli, serta tindakan bullying. Laporan Anda dijamin 100% rahasia.</p>
          </div>

          {wbSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/20 text-center py-6 px-4 rounded-xl space-y-3 max-w-md mx-auto">
              <p className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Laporan Berhasil Masuk Sekretariat!
              </p>
              <p className="text-[10px] text-slate-400">Tim pengawas independen komite sekolah akan segera menindaklanjuti kebenaran bukti tanpa membuka identitas pengirim.</p>
              <button onClick={() => setWbSuccess(false)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded-lg cursor-pointer">Kirim Aduan Lain</button>
            </div>
          ) : (
            <form onSubmit={wbWbSubmit => handleWbSubmit(wbWbSubmit)} className="space-y-4 max-w-md mx-auto text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Kategori Tindakan Kejahatan</label>
                <select
                  value={wbData.category}
                  onChange={(e) => setWbData({ ...wbData, category: e.target.value })}
                  className="w-full px-2.5 py-2 border border-slate-800 rounded-xl bg-slate-950 text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="perundungan">Bullying / Perundungan Murid</option>
                  <option value="pungli">Pungutan Liar (Pungli) / Korupsi Dana</option>
                  <option value="pelecehan">Pelecehan Seksual / Pelanggaran Etika</option>
                  <option value="contek">Kecurangan Masal / Ujian Bocor</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Uraian Kejadian Secara Kronologis (Tanggal & Pelaku) *</label>
                <textarea
                  value={wbData.description}
                  onChange={(e) => setWbData({ ...wbData, description: e.target.value })}
                  placeholder="Ceritakan kejadian secara jelas agar panitia independen dapat memverifikasi..."
                  className="w-full px-3 py-2 border border-slate-800 rounded-xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-red-500 h-20 resize-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">No. HP / Surel (Opsional - Jika bersedia dihubungi tim pencari fakta)</label>
                <input
                  type="text"
                  value={wbData.contactInfo}
                  onChange={(e) => setWbData({ ...wbData, contactInfo: e.target.value })}
                  placeholder="Boleh dikosongkan jika ingin tetap anonim"
                  className="w-full px-3 py-2 border border-slate-800 rounded-xl bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Kirim Aduan Anonim Rahasia
              </button>
            </form>
          )}
        </div>
      </section>

      {/* SECTION 6: MEDIA SOSIAL RESMI */}
      <section id="contact-socials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Kanal Media Sosial Resmi</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Dapatkan konten dokumentasi visual harian, info ujian, serta interaksi kuis berhadiah lewat akun resmi.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noreferrer"
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between hover:border-pink-500 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm">Instagram Resmi</h5>
                <p className="text-[10px] text-slate-400">@smaglobal.id</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-pink-500 transition-colors" />
          </a>
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noreferrer"
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between hover:border-red-500 group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <Youtube className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm">YouTube Channel</h5>
                <p className="text-[10px] text-slate-400">SMA Global Official</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          </a>
        </div>
      </section>

      {/* SECTION 7: LINK LAYANAN EKSTERNAL */}
      <section id="contact-external" className="bg-slate-50 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Pranala Eksternal Instansi</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Pranala luar penting Kementerian Pendidikan & pengawasan data siswa.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Kemdikbudristek", url: "https://kemdikbud.go.id" },
              { label: "Portal Dapodik", url: "https://dapo.kemdikbud.go.id" },
              { label: "Rapor Pendidikan", url: "https://raporpendidikan.kemdikbud.go.id" },
              { label: "Portal SNPMB", url: "https://snpmb.bppp.kemdikbud.go.id" }
            ].map((ext, idx) => (
              <a
                key={idx}
                href={ext.url}
                target="_blank"
                rel="noreferrer"
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-blue-500 hover:text-blue-600 transition-all text-xs font-bold text-slate-700 block"
              >
                <Globe className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                {ext.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: JAM OPERASIONAL KANTOR */}
      <section id="contact-hours" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-850 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <span className="bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              Jam Kerja Kantor
            </span>
            <h3 className="text-xl font-bold tracking-tight">Jam Operasional Pelayanan Resepsionis & TU</h3>
            <p className="text-slate-400 text-xs max-w-sm">Pelayanan verifikasi berkas PPDB fisik serta legalisir ijazah hanya dilayani pada jam berikut.</p>
          </div>
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono w-full md:max-w-xs shrink-0 text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span>Senin - Kamis</span>
              <span className="font-bold text-blue-400">07:30 - 15:00</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span>Jumat</span>
              <span className="font-bold text-blue-400">07:30 - 11:30</span>
            </div>
            <div className="flex justify-between">
              <span>Sabtu - Minggu</span>
              <span className="font-bold text-red-400">TUTUP / LIBUR</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
