import { 
  TrendingUp, CalendarDays, MessageSquare, MapPin, Settings, 
  Calendar, School, BookOpen, Users, GraduationCap, CheckSquare, 
  Printer, UserCheck, Activity, Database, Award, LogOut, Camera
} from "lucide-react";
import { User, SchoolSettings } from "../../types";

interface SidebarProps {
  user: User;
  settings: SchoolSettings | null;
  sidebarOpen: boolean;
  activeMenu: string;
  allowedMenus: string[];
  canAccess: (menu: string) => boolean;
  setActiveMenu: (menu: string) => void;
  setSearchTerm: (term: string) => void;
  onLogout: () => void;
  setIsAvatarModalOpen: (open: boolean) => void;
}

export function Sidebar({
  user,
  settings,
  sidebarOpen,
  activeMenu,
  allowedMenus: _allowedMenus,
  canAccess,
  setActiveMenu,
  setSearchTerm,
  onLogout,
  setIsAvatarModalOpen
}: SidebarProps) {

  const getNavIcon = (menu: string) => {
    switch (menu) {
      case "home": return <TrendingUp className="w-4 h-4" />;
      case "calendar": return <CalendarDays className="w-4 h-4" />;
      case "messages": return <MessageSquare className="w-4 h-4" />;
      case "checkin": return <MapPin className="w-4 h-4" />;
      case "settings": return <Settings className="w-4 h-4" />;
      case "academicyear": return <Calendar className="w-4 h-4" />;
      case "classroom": return <School className="w-4 h-4" />;
      case "subject": return <BookOpen className="w-4 h-4" />;
      case "teacher": return <Users className="w-4 h-4" />;
      case "student": return <GraduationCap className="w-4 h-4" />;
      case "schedule": return <CheckSquare className="w-4 h-4" />;
      case "reports": return <Printer className="w-4 h-4" />;
      case "ppdb": return <UserCheck className="w-4 h-4" />;
      case "logs": return <Activity className="w-4 h-4" />;
      case "backups": return <Database className="w-4 h-4" />;
      case "forum": return <MessageSquare className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

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

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setSearchTerm("");
  };

  const getMenusForRole = () => {
    if (user.role === "super_admin" || user.role === "admin") {
      return ["home", "settings", "academicyear", "classroom", "subject", "teacher", "student", "schedule", "reports", "ppdb", "logs", "backups", "forum"];
    } else if (user.role === "guru") {
      return ["home", "checkin", "attendance", "grades", "reports", "forum"];
    } else {
      return ["home", "calendar", "checkin", "grades", "schedule", "forum"];
    }
  };

  const menus = getMenusForRole().filter(menu => canAccess(menu));

  return (
    <aside 
      className="bg-slate-900 text-slate-300 w-64 shrink-0 transition-all duration-300 flex flex-col justify-between border-r border-slate-800 z-40 fixed md:static inset-y-0 left-0"
      style={{ width: sidebarOpen ? "16rem" : "5rem" }}
      aria-label="Sidebar Navigation"
    >
      <div className="flex flex-col">
        {/* Logo Brand Header */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-slate-800">
          <img 
            src={settings?.logo || "/logo.png"} 
            alt="Logo" 
            className="w-10 h-10 object-cover rounded-lg border border-slate-700" 
            referrerPolicy="no-referrer"
          />
          {sidebarOpen && (
            <div className="min-w-0">
              <h2 className="font-extrabold text-white text-xs truncate leading-snug">{settings?.name || "SIAS PORTAL"}</h2>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono">Panel {user.role.replace('_', ' ')}</p>
            </div>
          )}
        </div>

        {/* Navigation Items list */}
        <nav className="p-4 space-y-1.5 flex-1">
          {menus.map((menu) => (
            <button
              key={menu}
              onClick={() => handleMenuClick(menu)}
              aria-current={activeMenu === menu ? "page" : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                activeMenu === menu 
                  ? "bg-blue-600 text-white border-blue-700 shadow-xs" 
                  : "border-transparent hover:bg-slate-800 hover:text-white"
              }`}
            >
              {getNavIcon(menu)}
              {sidebarOpen && <span>{getMenuLabel(menu)}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* User profile bottom anchor */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => setIsAvatarModalOpen(true)}
          className="w-full flex items-center gap-3 p-2 bg-slate-800/40 hover:bg-slate-800/80 rounded-xl transition-all group text-left cursor-pointer border border-transparent hover:border-slate-700"
          title="Klik untuk mengubah foto profil"
        >
          <div className="relative flex-shrink-0">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-9 h-9 object-cover rounded-lg group-hover:opacity-75 transition-opacity" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/40 rounded-lg">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">Ubah Foto Profil</p>
            </div>
          )}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 mt-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span>Keluar Panel</span>}
        </button>
      </div>
    </aside>
  );
}
