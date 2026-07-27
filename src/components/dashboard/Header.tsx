import { Menu, Bell, BellRing, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { User, AcademicYear, NotificationItem } from "../../types";

interface HeaderProps {
  user: User;
  activeMenu: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  academicYears: AcademicYear[];
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  notifDropdownOpen: boolean;
  setNotifDropdownOpen: (open: boolean) => void;
  isOnline: boolean;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
}

export function Header({
  user,
  activeMenu,
  sidebarOpen,
  setSidebarOpen,
  academicYears,
  notifications,
  setNotifications,
  notifDropdownOpen,
  setNotifDropdownOpen,
  isOnline,
  showToast
}: HeaderProps) {

  const getMenuLabel = (menu: string) => {
    switch (menu) {
      case "home": return user.role === "siswa" ? "Profil Saya" : "Dashboard Utama";
      case "calendar": return "Kalender Akademik";
      case "messages": return "Notifikasi Orang Tua";
      case "checkin": return user.role === "siswa" ? "Absensi GPS" : "Absensi GPS Mandiri";
      case "settings": return "Identitas Sekolah";
      case "academicyear": return "Tahun Ajaran";
      case "classroom": return "Manajemen Kelas";
      case "subject": return "Mata Pelajaran";
      case "teacher": return "Data Guru";
      case "student": return "Data Siswa";
      case "schedule": return "Jadwal Pelajaran";
      case "reports": return "Cetak Rapor Siswa";
      case "ppdb": return "PPDB Admissions";
      case "logs": return "Audit Logs";
      case "backups": return "Database Backup";
      case "forum": return "Forum Diskusi";
      case "attendance": return "Absensi Kelas";
      case "grades": return user.role === "siswa" ? "Rapor Nilai" : "Input Nilai";
      default: return menu;
    }
  };

  const activeAY = academicYears.find(ay => ay.active);

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Toggle Sidebar Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {getMenuLabel(activeMenu)}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Tahun Pelajaran: {activeAY?.year || "-"} • Semester: {activeAY?.semester || "-"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Notification Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="notification-bell-btn"
            title="Pemberitahuan Sistem"
            aria-expanded={notifDropdownOpen}
            aria-haspopup="true"
          >
            {notifications.some(n => !n.read) ? (
              <>
                <BellRing className="w-5 h-5 text-blue-600 animate-bounce" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
              </>
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </button>

          <AnimatePresence>
            {notifDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifDropdownOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-40 flex flex-col max-h-[420px]"
                  id="notification-panel-dropdown"
                  role="dialog"
                  aria-label="Pemberitahuan Terkini"
                >
                  <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-extrabold tracking-tight">Pemberitahuan Terkini</h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                          showToast("Semua notifikasi ditandai telah dibaca", "info");
                        }}
                        className="text-[9px] hover:underline text-slate-300 font-bold focus:outline-none"
                      >
                        Tandai semua dibaca
                      </button>
                    </div>
                  </div>

                  <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 space-y-1">
                        <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                        <p className="text-[10px] font-bold">Tidak ada pemberitahuan</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                          }}
                          className={`w-full p-4 hover:bg-slate-50 transition-colors cursor-pointer text-left focus:outline-none focus:bg-slate-50 ${!n.read ? 'bg-blue-50/40 border-l-2 border-blue-600' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded font-mono uppercase ${
                              n.category === 'ujian' ? 'bg-amber-100 text-amber-700' :
                              n.category === 'tugas' ? 'bg-rose-100 text-rose-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {n.category}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">{n.time}</span>
                          </div>
                          <h5 className="text-[11px] font-extrabold text-slate-900 mt-1">{n.title}</h5>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">{n.message}</p>
                        </button>
                      ))
                    )}
                  </div>
                  
                  <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-medium">Sistem Notifikasi Akademik Real-Time</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {isOnline ? (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono border border-emerald-100" id="network-status-online" title="Koneksi terhubung ke server">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono border border-amber-100" id="network-status-offline" title="Mode Offline Aktif - Sebagian fitur menggunakan cache lokal">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Offline
          </span>
        )}

        <span className="hidden sm:inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest font-mono border border-blue-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          {user.role === 'super_admin' ? 'SUPER ADMIN' : user.role === 'admin' ? 'ADMIN SEKOLAH' : user.role === 'guru' ? 'GURU' : 'SISWA'}
        </span>
        <div className="h-8 w-px bg-slate-200" />
        <span className="text-xs font-bold text-slate-500 hidden md:block">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>
    </header>
  );
}
export type { NotificationItem };
