import { useState, useEffect } from "react";
import { 
  CalendarDays, ChevronLeft, ChevronRight, Plus, AlertCircle, 
  RefreshCw, CheckCircle, Clock, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: "ujian" | "libur" | "kegiatan";
  location?: string;
  startTime?: string;
  endTime?: string;
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Ujian Tengah Semester (UTS) Ganjil",
    description: "Evaluasi penilaian hasil belajar tengah semester ganjil untuk seluruh siswa.",
    date: "2026-10-12",
    category: "ujian",
    location: "Ruang Kelas SMA Global",
    startTime: "07:30",
    endTime: "13:00"
  },
  {
    id: "2",
    title: "Ujian Akhir Semester (UAS) Ganjil",
    description: "Evaluasi besar penilaian akhir semester ganjil tahun ajaran.",
    date: "2026-12-07",
    category: "ujian",
    location: "Gedung Utama SMA Global",
    startTime: "07:30",
    endTime: "13:30"
  },
  {
    id: "3",
    title: "Hari Libur Nasional Maulid Nabi",
    description: "Libur nasional memperingati Maulid Nabi Muhammad SAW.",
    date: "2026-09-15",
    category: "libur",
    location: "Rumah Masing-masing"
  },
  {
    id: "4",
    title: "Hari Libur Semester Ganjil",
    description: "Masa libur panjang akhir semester setelah pembagian rapor ganjil.",
    date: "2026-12-21",
    category: "libur",
    location: "Luar Sekolah"
  },
  {
    id: "5",
    title: "Pesta Seni & Kreasi Siswa (Classmeeting)",
    description: "Kegiatan pekan olahraga dan festival kreativitas seni antar kelas.",
    date: "2026-12-16",
    category: "kegiatan",
    location: "Lapangan Utama & Aula",
    startTime: "08:00",
    endTime: "15:00"
  },
  {
    id: "6",
    title: "Upacara Peringatan Hari Kemerdekaan RI",
    description: "Upacara bendera memperingati HUT Kemerdekaan Republik Indonesia ke-81.",
    date: "2026-08-17",
    category: "kegiatan",
    location: "Lapangan Bendera Sekolah",
    startTime: "07:00",
    endTime: "09:30"
  },
  {
    id: "7",
    title: "Rapat Pleno Orang Tua & Komite Sekolah",
    description: "Pertemuan koordinasi program tahunan dan rencana anggaran bersama wali murid.",
    date: "2026-08-25",
    category: "kegiatan",
    location: "Aula Ki Hajar Dewantara",
    startTime: "09:00",
    endTime: "12:00"
  }
];

export function AcademicCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // start on August 2026 (Maulid, Independence, etc.)
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDateVal, setNewDateVal] = useState("");
  const [newCategory, setNewCategory] = useState<"ujian" | "libur" | "kegiatan">("kegiatan");
  const [newLocation, setNewLocation] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("academic_calendar_events");
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch {
        setEvents(DEFAULT_EVENTS);
      }
    } else {
      setEvents(DEFAULT_EVENTS);
      localStorage.setItem("academic_calendar_events", JSON.stringify(DEFAULT_EVENTS));
    }
  }, []);

  // Save changes
  const saveEvents = (updated: CalendarEvent[]) => {
    setEvents(updated);
    localStorage.setItem("academic_calendar_events", JSON.stringify(updated));
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Google Calendar Integration Sync Simulation
  const handleGoogleCalendarSync = async () => {
    setIsSyncing(true);
    setSyncStatus("idle");

    try {
      // Simulate OAuth scope retrieval and Google Calendar Event writing
      const response = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events })
      });

      if (response.ok) {
        setSyncStatus("success");
      } else {
        setSyncStatus("error");
      }
    } catch {
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus("idle"), 5000);
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDateVal) return;

    const newEvent: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      description: newDesc,
      date: newDateVal,
      category: newCategory,
      location: newLocation || undefined,
      startTime: newStart || undefined,
      endTime: newEnd || undefined
    };

    const updated = [...events, newEvent];
    saveEvents(updated);

    // Reset Form
    setNewTitle("");
    setNewDesc("");
    setNewDateVal("");
    setNewCategory("kegiatan");
    setNewLocation("");
    setNewStart("");
    setNewEnd("");
    setShowAddModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jadwal kegiatan ini?")) {
      const updated = events.filter(ev => ev.id !== id);
      saveEvents(updated);
    }
  };

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday, etc.
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Generate calendar cells (including padding for previous month offset)
  const daysArray: (number | null)[] = [];
  
  // Adjust so Monday is first day of week (or keep standard Sunday-first)
  // Let's keep standard Sunday-first for simplicity
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  // Filter events
  const filteredEvents = events.filter(e => {
    if (selectedCategory === "all") return true;
    return e.category === selectedCategory;
  });

  // Get active month's events
  const getEventsForDay = (day: number) => {
    const formattedDay = day.toString().padStart(2, "0");
    const formattedMonth = (month + 1).toString().padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    return events.filter(e => e.date === dateStr);
  };

  // Helper to get category colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ujian": return "bg-rose-50 border-rose-200 text-rose-700";
      case "libur": return "bg-amber-50 border-amber-200 text-amber-700";
      case "kegiatan": return "bg-emerald-50 border-emerald-200 text-emerald-700";
      default: return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  return (
    <div className="space-y-6" id="academic-calendar-portal">
      {/* Header Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Kalender Akademik Terintegrasi</h3>
          </div>
          <p className="text-slate-400 text-[10px] font-bold font-mono">Sinkronisasi Agenda Kegiatan & Google Calendar API</p>
        </div>

        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          {/* Add Event Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Kegiatan
          </button>

          {/* Sync Button */}
          <button
            onClick={handleGoogleCalendarSync}
            disabled={isSyncing}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-950 shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed font-mono"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Menghubungkan..." : "Sync Google Calendar"}
          </button>
        </div>
      </div>

      {/* Sync Alerts */}
      <AnimatePresence>
        {syncStatus === "success" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Agenda akademik sekolah Anda berhasil disinkronisasikan ke Google Calendar API secara bidirectional!</span>
            </div>
          </motion.div>
        )}
        {syncStatus === "error" && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Google Calendar API belum terotorisasi penuh (Google OAuth membutuhkan scope calendar). Kami mencadangkan jadwal akademik ke penyimpanan lokal Anda secara aman.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: INTERACTIVE MONTH VIEW GRID */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{monthNames[month]} {year}</h4>
              <p className="text-[10px] text-slate-400 font-medium">Klik pada hari untuk melihat jadwal kegiatan aktif.</p>
            </div>
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-white hover:shadow-xs rounded-md text-slate-600 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentDate(new Date(2026, 7, 1))} className="text-[9px] font-bold uppercase px-2 py-1 hover:bg-white hover:shadow-xs rounded-md text-slate-500 cursor-pointer font-mono">Bulan Ini</button>
              <button onClick={handleNextMonth} className="p-1 hover:bg-white hover:shadow-xs rounded-md text-slate-600 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* CALENDAR MONTH GRID */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold font-mono text-slate-400 mb-1">
            <span>MING</span>
            <span>SEN</span>
            <span>SEL</span>
            <span>RAB</span>
            <span>KAM</span>
            <span>JUM</span>
            <span>SAB</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 aspect-square sm:aspect-auto sm:h-96">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="bg-slate-50/50 rounded-lg border border-dashed border-slate-100" />;
              }

              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

              return (
                <div 
                  key={`day-${day}`} 
                  className={`bg-slate-50/50 hover:bg-slate-100/80 border transition-all rounded-lg p-1 text-left flex flex-col justify-between overflow-hidden group ${
                    isToday ? "border-blue-500 bg-blue-50/20" : "border-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold font-mono ${isToday ? "text-blue-600 font-black bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center" : "text-slate-600"}`}>{day}</span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse md:hidden" />
                    )}
                  </div>

                  {/* Desktop view: show event labels */}
                  <div className="hidden md:flex flex-col gap-1 mt-1 overflow-y-auto max-h-[80%]">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div 
                        key={ev.id} 
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded border leading-tight truncate`}
                        title={ev.title}
                        style={{
                          backgroundColor: ev.category === "ujian" ? "#fee2e2" : ev.category === "libur" ? "#fef3c7" : "#d1fae5",
                          borderColor: ev.category === "ujian" ? "#fca5a5" : ev.category === "libur" ? "#fde047" : "#6ee7b7",
                          color: ev.category === "ujian" ? "#991b1b" : ev.category === "libur" ? "#92400e" : "#065f46"
                        }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[7px] text-slate-400 font-mono font-bold pl-1">+{dayEvents.length - 3} agenda...</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: AGENDA LIST & FILTERS */}
        <div className="space-y-6">
          {/* FILTER PANEL */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100 pb-2">Filter Kategori</h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setSelectedCategory("all")}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left border flex items-center justify-between cursor-pointer ${
                  selectedCategory === "all" ? "bg-slate-900 text-white border-slate-950 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <span>Semua Kegiatan</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md group-hover:bg-slate-800">{events.length}</span>
              </button>
              <button 
                onClick={() => setSelectedCategory("ujian")}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left border flex items-center justify-between cursor-pointer ${
                  selectedCategory === "ujian" ? "bg-rose-600 text-white border-rose-700 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50 text-rose-700"
                }`}
              >
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Jadwal Ujian</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md">{events.filter(e => e.category === "ujian").length}</span>
              </button>
              <button 
                onClick={() => setSelectedCategory("libur")}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left border flex items-center justify-between cursor-pointer ${
                  selectedCategory === "libur" ? "bg-amber-600 text-white border-amber-700 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50 text-amber-700"
                }`}
              >
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Hari Libur</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">{events.filter(e => e.category === "libur").length}</span>
              </button>
              <button 
                onClick={() => setSelectedCategory("kegiatan")}
                className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left border flex items-center justify-between cursor-pointer ${
                  selectedCategory === "kegiatan" ? "bg-emerald-600 text-white border-emerald-700 shadow-xs" : "bg-white border-slate-200 hover:bg-slate-50 text-emerald-700"
                }`}
              >
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Kegiatan Sekolah</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">{events.filter(e => e.category === "kegiatan").length}</span>
              </button>
            </div>
          </div>

          {/* EVENTS LIST VIEW */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100 pb-2">Daftar Agenda Pekan Ini / Mendatang</h4>
            <div className="space-y-4 overflow-y-auto max-h-96 pr-1">
              {filteredEvents.length === 0 ? (
                <p className="text-slate-400 text-xs text-center italic py-10">Tidak ada agenda kegiatan akademik ditemukan.</p>
              ) : (
                filteredEvents.sort((a, b) => a.date.localeCompare(b.date)).map((ev) => (
                  <div key={ev.id} className="border-l-3 border-blue-600 pl-4 py-1 space-y-1 relative group">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded border inline-block ${getCategoryColor(ev.category)}`}>
                        {ev.category}
                      </span>
                      <button 
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-[9px] font-mono text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>

                    <h5 className="font-extrabold text-slate-800 text-xs leading-snug">{ev.title}</h5>
                    <p className="text-slate-500 text-[10px] leading-relaxed font-medium">{ev.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-400 font-mono font-bold pt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-300" /> {ev.date} {ev.startTime ? `(${ev.startTime} - ${ev.endTime})` : ""}</span>
                      {ev.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-300" /> {ev.location}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ADD EVENT MODAL DIALOG --- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden">
              <div className="bg-slate-900 p-5 text-white flex justify-between items-center">
                <h4 className="font-extrabold text-sm tracking-tight">Tambah Kegiatan Kalender Akademik</h4>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-mono text-xs font-bold cursor-pointer">X</button>
              </div>

              <form onSubmit={handleAddEvent} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Judul Kegiatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rapat Wali Murid Akhir Semester"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Deskripsi Lengkap</label>
                  <textarea
                    rows={2}
                    placeholder="Tulis ringkasan rincian agenda di sini..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Kategori Agenda</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as "ujian" | "libur" | "kegiatan")}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="ujian">Jadwal Ujian</option>
                      <option value="libur">Hari Libur Sekolah</option>
                      <option value="kegiatan">Kegiatan Akademik</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Tanggal Kegiatan</label>
                    <input
                      type="date"
                      required
                      value={newDateVal}
                      onChange={(e) => setNewDateVal(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Waktu Mulai (Opsional)</label>
                    <input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Waktu Selesai (Opsional)</label>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Lokasi Kegiatan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Aula Ki Hajar Dewantara SMA Global"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs cursor-pointer"
                  >
                    Simpan Agenda
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
