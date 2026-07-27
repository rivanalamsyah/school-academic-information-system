import { ReactNode } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { User } from "../../types";
import { canAccessMenu } from "../../utils/permissions";

interface RouteGuardProps {
  user: User;
  activeMenu: string;
  children: ReactNode;
  fallbackGoHome: () => void;
}

export function RouteGuard({ user, activeMenu, children, fallbackGoHome }: RouteGuardProps) {
  // Check if the current user has access to activeMenu
  const hasAccess = canAccessMenu(user.role, activeMenu);

  if (!hasAccess) {
    return (
      <div 
        className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Akses Ditolak (403)</h2>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Maaf, Anda tidak memiliki izin yang diperlukan untuk mengakses menu 
              <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded mx-1 text-xs font-bold">
                {activeMenu}
              </span> 
              pada sistem akademik ini.
            </p>
          </div>
          <button
            onClick={fallbackGoHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dasbor Utama
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
