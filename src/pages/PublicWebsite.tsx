import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone, Mail, Menu, X
} from "lucide-react";
import { News, Gallery, Document, SchoolSettings, Teacher } from "../types";
import { PublicService } from "../services/public.service";

// Sub-hubs (heavy — only rendered when tab is active)
import HomeHub from "../components/public/HomeHub";
import AboutHub from "../components/public/AboutHub";
import CampusLifeHub from "../components/public/CampusLifeHub";
import AdmissionHub from "../components/public/AdmissionHub";
import ContactHub from "../components/public/ContactHub";

// ── Types ────────────────────────────────────────────────────────────────────

type TabId = "beranda" | "akademik" | "kehidupan" | "ppdb" | "kontak";

interface NavMenuItem {
  id: TabId;
  label: string;
}

const NAV_MENUS: NavMenuItem[] = [
  { id: "beranda",  label: "Beranda & Keunggulan" },
  { id: "akademik", label: "Profil & Akademik" },
  { id: "kehidupan",label: "Kehidupan & Fasilitas" },
  { id: "ppdb",     label: "PPDB & Berita" },
  { id: "kontak",   label: "Hubungi & Layanan" },
];

const DEFAULT_SCHOOL: SchoolSettings = {
  name: "SMA Negeri 1 Nusantara",
  logo: "/logo.png",
  favicon: "/logo.png",
  phone: "(021) 555-0199",
  email: "info@sman1nusantara.sch.id",
  address: "Jl. Pendidikan Raya No. 1, Kebayoran Baru, Jakarta Selatan, DKI Jakarta",
  vision:
    "Terwujudnya insan terpelajar yang unggul secara akademis, menguasai kompetensi digital global, berintegritas tinggi, dan kokoh mengamalkan nilai-nilai karakter Pancasila.",
  mission: [
    "Menyelenggarakan pembelajaran berbasis sains terapan, logika pemrograman, serta literasi teknologi.",
    "Membina keluhuran budi pekerti serta empati sosial lewat penguatan karakter Profil Pelajar Pancasila.",
    "Mengembangkan kemandirian kepemimpinan siswa melalui program konseling karir & jejaring alumni global.",
    "Menyediakan sarana smart classroom yang ramah ekologis, sehat, aman, dan terproteksi maksimal.",
  ],
  principalName: "Drs. H. Mulyono, M.Pd.",
  principalNip: "19681120 199303 1 005",
  principalGreeting:
    "Assalamu'alaikum Wr. Wb., Salam Sejahtera bagi kita semua.\n\nPuji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa atas peluncuran wajah baru portal akademik SMA Negeri 1 Nusantara. Di era revolusi AI saat ini, kami berkomitmen tidak hanya mengejar kepandaian kognitif anak semata, namun secara khusus menumbuhkan integritas karakter mulia.\n\nMari berkolaborasi sinergis melahirkan putra-putri terbaik penerus kejayaan bangsa.",
  principalImage: "/principal.jpg",
  facebook: "",
  twitter: "",
  instagram: "",
  youtube: "",
  seoTitle: "SMA Negeri 1 Nusantara – Portal Akademik Resmi",
  seoDescription:
    "Portal resmi SMA Negeri 1 Nusantara Jakarta. Sistem Informasi Akademik Sekolah (SIAS) untuk manajemen akademik, absensi, nilai, jadwal, dan PPDB.",
  seoKeywords: "SIAS, SMAN 1 Nusantara, portal akademik, PPDB, Jakarta",
};

// ── Props ────────────────────────────────────────────────────────────────────

interface PublicWebsiteProps {
  onGoToLogin: () => void;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PublicWebsite({ onGoToLogin, showToast }: PublicWebsiteProps) {
  const [activeTab, setActiveTab] = useState<TabId>("beranda");
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Merge server settings with defaults — memoized so it's stable
  const activeSchool = useMemo(() => settings ?? DEFAULT_SCHOOL, [settings]);

  // ── Data fetching — concurrent with Promise.all ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    PublicService.fetchAll()
      .then(({ settings: s, news: n, gallery: g, documents: d, teachers: t }) => {
        if (cancelled) return;
        if (s) setSettings(s);
        if (Array.isArray(n)) setNews(n);
        if (Array.isArray(g)) setGallery(g);
        if (Array.isArray(d)) setDocuments(d);
        if (Array.isArray(t)) setTeachers(t);
      })
      .catch(() => {
        // Silent fail — fallback defaults are already in state
      });
    return () => { cancelled = true; };
  }, []);

  // Close mobile menu on tab change
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── PPDB & Contact form handlers ─────────────────────────────────────────
  const onSubmitPPDB = useCallback(async (formData: Record<string, unknown>) => {
    try {
      const data = await PublicService.submitPPDB(formData);
      if (data.success) {
        showToast(`Pendaftaran PPDB berhasil dikirim! No. Registrasi: ${data.registrationNo}`, "success");
      } else {
        showToast(data.error ?? "Gagal melakukan pendaftaran PPDB.", "error");
      }
      return data;
    } catch {
      showToast("Gagal menghubungi server saat mendaftar.", "error");
      return { success: false };
    }
  }, [showToast]);

  const onSubmitMessage = useCallback(async (formData: Record<string, unknown>) => {
    try {
      await PublicService.submitMessage(formData);
      showToast("Pesan/Masukan Anda berhasil terkirim!", "success");
      return { success: true };
    } catch {
      showToast("Gagal terhubung dengan server.", "error");
      return { success: false };
    }
  }, [showToast]);

  // Close news modal on Escape key
  useEffect(() => {
    if (!selectedNews) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedNews(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedNews]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">

      {/* 1. TOP UTILITY HEADER */}
      <div className="bg-slate-900 text-slate-400 py-2 border-b border-slate-800 text-[11px] px-4 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
              <a href={`tel:${activeSchool.phone}`} className="hover:text-white transition-colors">
                {activeSchool.phone}
              </a>
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
              <a href={`mailto:${activeSchool.email}`} className="hover:text-white transition-colors">
                {activeSchool.email}
              </a>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">
              NPSN: 20104832
            </span>
            <button
              onClick={onGoToLogin}
              className="text-white hover:text-blue-400 font-bold transition-all flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:ring-offset-slate-900 rounded-md px-1"
              aria-label="Masuk ke Portal SIAKAD"
            >
              Portal SIAKAD &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION NAVBAR */}
      <header
        className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 shadow-xs"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">

          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center p-1 shadow-2xs">
              <img
                src={activeSchool.logo}
                alt={`Logo ${activeSchool.name}`}
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
                loading="eager"
                width={44}
                height={44}
              />
            </div>
            <div>
              {/* h1 is correct here — this is the page-level brand heading for the public site */}
              <p className="font-black text-slate-900 text-sm tracking-tight leading-tight uppercase">
                {activeSchool.name}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                Unggul, Berintegritas &amp; Berkarakter
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-1">
            {NAV_MENUS.map((menu) => (
              <button
                key={menu.id}
                onClick={() => handleTabChange(menu.id)}
                aria-current={activeTab === menu.id ? "page" : undefined}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                  activeTab === menu.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {menu.label}
              </button>
            ))}
          </nav>

          {/* PPDB CTA */}
          <div className="hidden lg:block">
            <button
              onClick={() => {
                setActiveTab("ppdb");
                setTimeout(() => {
                  document.getElementById("ppdb-form")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="px-4.5 py-2 bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
            >
              PPDB Online
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Navigation Tray */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              id="mobile-nav"
              aria-label="Navigasi mobile"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2.5 absolute top-20 left-0 w-full shadow-lg z-40"
            >
              {NAV_MENUS.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => handleTabChange(menu.id)}
                  aria-current={activeTab === menu.id ? "page" : undefined}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all block focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    activeTab === menu.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {menu.label}
                </button>
              ))}
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab("ppdb");
                    setTimeout(() => {
                      document.getElementById("ppdb-form")?.scrollIntoView({ behavior: "smooth" });
                    }, 150);
                  }}
                  className="w-full text-center py-3 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
                >
                  Daftar PPDB Online Ganjil
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* 3. DYNAMIC BODY */}
      <main className="flex-1 pb-16" id="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {activeTab === "beranda" && (
              <HomeHub
                settings={settings}
                news={news}
                activeSchool={activeSchool}
                setActiveTab={handleTabChange}
                onOpenNews={setSelectedNews}
              />
            )}
            {activeTab === "akademik" && (
              <AboutHub settings={settings} teachers={teachers} activeSchool={activeSchool} />
            )}
            {activeTab === "kehidupan" && (
              <CampusLifeHub gallery={gallery} activeSchool={activeSchool} />
            )}
            {activeTab === "ppdb" && (
              <AdmissionHub
                documents={documents}
                news={news}
                onSubmitPPDB={onSubmitPPDB}
                onOpenNews={setSelectedNews}
              />
            )}
            {activeTab === "kontak" && (
              <ContactHub
                settings={settings}
                activeSchool={activeSchool}
                onSubmitMessage={onSubmitMessage}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. NEWS DETAIL MODAL */}
      <AnimatePresence>
        {selectedNews && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-modal-title"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedNews(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col"
            >
              <div className="relative aspect-video w-full bg-slate-100 border-b border-slate-100 shrink-0">
                <img
                  src={
                    selectedNews.image || "/school.jpg"
                  }
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <button
                  onClick={() => setSelectedNews(null)}
                  aria-label="Tutup detail berita"
                  className="absolute top-4 right-4 h-9 w-9 bg-black/65 hover:bg-black/80 text-white rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider">
                    {selectedNews.category}
                  </span>
                  <time
                    dateTime={selectedNews.date}
                    className="text-[10px] text-slate-400 font-mono font-bold uppercase"
                  >
                    {selectedNews.date}
                  </time>
                </div>
                <h2 id="news-modal-title" className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {selectedNews.title}
                </h2>
                <p className="text-slate-500 font-bold text-xs italic">
                  &ldquo;{selectedNews.summary}&rdquo;
                </p>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line border-t border-slate-100 pt-4">
                  {selectedNews.content}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 text-right shrink-0">
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-4.5 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2"
                >
                  Tutup Rilis Berita
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. FOOTER */}
      <footer
        className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 px-4 relative overflow-hidden shrink-0"
        aria-label="Footer"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(37,99,235,0.06),transparent)] pointer-events-none" aria-hidden="true" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center p-1 border border-blue-500/20">
                <img
                  src={activeSchool.logo}
                  alt={`Logo ${activeSchool.name}`}
                  className="h-full w-full object-contain"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width={36}
                  height={36}
                />
              </div>
              <p className="font-extrabold text-white text-xs tracking-tight uppercase">
                {activeSchool.name}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
              SMA Negeri pelopor digitalisasi pelayanan publik, membentuk pemimpin mandiri dan
              berintegritas tinggi sejak 1982.
            </p>
          </div>

          <nav aria-label="Navigasi footer — Utama">
            <h2 className="font-bold text-xs text-white uppercase tracking-wider font-mono mb-3">
              Navigasi Utama
            </h2>
            <ul className="space-y-2 text-[11px]">
              {NAV_MENUS.map((menu) => (
                <li key={menu.id}>
                  <button
                    onClick={() => handleTabChange(menu.id)}
                    className="hover:text-white transition-colors focus:outline-none focus:underline"
                  >
                    {menu.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Navigasi footer — Tautan">
            <h2 className="font-bold text-xs text-white uppercase tracking-wider font-mono mb-3">
              Tautan Penting
            </h2>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={onGoToLogin} className="hover:text-white transition-colors focus:outline-none focus:underline">
                  Masuk Portal SIAKAD
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab("ppdb"); setTimeout(() => document.getElementById("ppdb-downloads")?.scrollIntoView({ behavior: "smooth" }), 150); }}
                  className="hover:text-white transition-colors focus:outline-none focus:underline"
                >
                  Unduh Panduan PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab("ppdb"); setTimeout(() => document.getElementById("ppdb-tracker")?.scrollIntoView({ behavior: "smooth" }), 150); }}
                  className="hover:text-white transition-colors focus:outline-none focus:underline"
                >
                  Cek Kelulusan Berkas
                </button>
              </li>
            </ul>
          </nav>

          <address className="space-y-3 not-italic">
            <h2 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
              Hubungi Kami
            </h2>
            <p className="text-[11px] text-slate-500 leading-relaxed">{activeSchool.address}</p>
            <p className="text-[11px] text-slate-300 font-mono font-bold">
              Telp.{" "}
              <a href={`tel:${activeSchool.phone}`} className="hover:text-white transition-colors">
                {activeSchool.phone}
              </a>
            </p>
          </address>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-10 pt-6 text-center text-[10px] text-slate-600 font-mono flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
          <p>
            &copy; {new Date().getFullYear()} {activeSchool.name}. Hak Cipta Dilindungi
            Undang-Undang.
          </p>
          <p>Dikelola Mandiri oleh Komite Digital SMAN 1 Nusantara</p>
        </div>
      </footer>
    </div>
  );
}
