import { useEffect, useRef } from "react";
import { 
  TrendingUp, CalendarDays, MessageSquare, MapPin, Settings, 
  Calendar, School, BookOpen, Users, GraduationCap, CheckSquare, 
  Printer, UserCheck, Activity, Database, Award, LogOut, Camera, X
} from "lucide-react";
import { User, SchoolSettings } from "../../types";
import { ROLE_MENUS } from "../../utils/permissions";
import { getMenuLabel } from "../../utils/menuLabels";

interface SidebarProps {
  user: User;
  settings: SchoolSettings | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
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
  setSidebarOpen,
  activeMenu,
  allowedMenus: _allowedMenus,
  canAccess,
  setActiveMenu,
  setSearchTerm,
  onLogout,
  setIsAvatarModalOpen
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Esc Key to Close Sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen && window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen, setSidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const getNavIcon = (menu: string) => {
    switch (menu) {
      case "home": return <TrendingUp className="w-5 h-5 shrink-0" />;
      case "calendar": return <CalendarDays className="w-5 h-5 shrink-0" />;
      case "messages": return <MessageSquare className="w-5 h-5 shrink-0" />;
      case "checkin": return <MapPin className="w-5 h-5 shrink-0" />;
      case "settings": return <Settings className="w-5 h-5 shrink-0" />;
      case "academicyear": return <Calendar className="w-5 h-5 shrink-0" />;
      case "classroom": return <School className="w-5 h-5 shrink-0" />;
      case "subject": return <BookOpen className="w-5 h-5 shrink-0" />;
      case "teacher": return <Users className="w-5 h-5 shrink-0" />;
      case "student": return <GraduationCap className="w-5 h-5 shrink-0" />;
      case "schedule": return <CheckSquare className="w-5 h-5 shrink-0" />;
      case "reports": return <Printer className="w-5 h-5 shrink-0" />;
      case "ppdb": return <UserCheck className="w-5 h-5 shrink-0" />;
      case "logs": return <Activity className="w-5 h-5 shrink-0" />;
      case "backups": return <Database className="w-5 h-5 shrink-0" />;
      case "forum": return <MessageSquare className="w-5 h-5 shrink-0" />;
      default: return <Award className="w-5 h-5 shrink-0" />;
    }
  };

  // getMenuLabel now imported from utils/menuLabels (DRY)


  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setSearchTerm("");
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Use centralized ROLE_MENUS — single source of truth for which menus each role can see
  const menus = (ROLE_MENUS[user.role] || []).filter(menu => canAccess(menu));


  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-45 md:hidden transition-opacity duration-300 ease-out"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside 
        ref={sidebarRef}
        role="navigation"
        aria-label="Sidebar Navigation"
        className={`bg-slate-900 text-slate-300 shrink-0 flex flex-col justify-between border-r border-slate-800/80 transition-all duration-300 ease-in-out fixed md:sticky top-0 bottom-0 left-0 h-screen z-50 md:z-30
          ${sidebarOpen 
            ? "w-72 translate-x-0 md:w-64" 
            : "w-72 -translate-x-full md:w-20 md:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Brand Header */}
          <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src={settings?.logo || "/logo.png"} 
                alt="Logo" 
                className="w-10 h-10 object-cover rounded-xl border border-slate-700/60 shadow-md" 
                referrerPolicy="no-referrer"
              />
              {(sidebarOpen) && (
                <div className="min-w-0 transition-opacity duration-200">
                  <h2 className="font-extrabold text-white text-xs truncate leading-snug tracking-tight">
                    {settings?.name || "SIAS PORTAL"}
                  </h2>
                  <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest font-mono">
                    Panel {user.role.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile close button inside header */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-transparent focus:ring-2 focus:ring-blue-500"
              aria-label="Tutup Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items list - Custom Scrollable for SaaS feel */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {menus.map((menu) => {
              const isActive = activeMenu === menu;
              return (
                <button
                  key={menu}
                  onClick={() => handleMenuClick(menu)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border min-h-[44px]
                    ${isActive 
                      ? "bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-500/10" 
                      : "border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-white"
                    }
                  `}
                >
                  {getNavIcon(menu)}
                  {sidebarOpen && (
                    <span className="truncate">{getMenuLabel(menu, user.role)}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile bottom anchor */}
          <div className="p-4 border-t border-slate-800/80 shrink-0 bg-slate-900/60">
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="w-full flex items-center gap-3 p-2 bg-slate-800/30 hover:bg-slate-800/80 rounded-xl transition-all group text-left cursor-pointer border border-transparent hover:border-slate-700/60"
              title="Klik untuk mengubah foto profil"
            >
              <div className="relative flex-shrink-0">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-9 h-9 object-cover rounded-xl group-hover:opacity-75 transition-opacity shadow-sm" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 rounded-xl">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              {(sidebarOpen) && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                    {user.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono truncate">
                    Ubah Foto Profil
                  </p>
                </div>
              )}
            </button>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 mt-3 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer border border-transparent min-h-[44px]"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>Keluar Panel</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
