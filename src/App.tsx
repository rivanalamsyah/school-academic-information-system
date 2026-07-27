import { lazy, Suspense, useState, useEffect, useRef, useCallback } from "react";
import Toast, { ToastMessage } from "./components/Toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { User } from "./types";

import { SchoolDataProvider } from "./providers/SchoolDataProvider";

// ─── Lazy-loaded page components ────────────────────────────────────────────
// Each page is a separate chunk — only downloaded when first visited.
// Reduces initial bundle parsed & executed by the browser significantly.
const PublicWebsite = lazy(() => import("./pages/PublicWebsite"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

// ─── Shared page loading fallback ───────────────────────────────────────────
function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-50"
      aria-label="Memuat halaman..."
      aria-busy="true"
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium animate-pulse">Memuat halaman...</p>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<"website" | "login" | "dashboard">("website");
  const [user, setUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const showToast = useCallback((text: string, type: "success" | "warning" | "error" | "info" = "info") => {
    const id = `t_${Date.now()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      toastTimersRef.current.delete(id);
    }, 4000);
    toastTimersRef.current.set(id, timer);
  }, []);

  const handleCloseToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cleanup all pending timers on unmount
  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLoginSuccess = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    setView("dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setView("website");
    showToast("Anda telah berhasil keluar dari sistem akademik sekolah.", "success");
  }, [showToast]);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  // ── Session persistence ───────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem("sias_user_session");
    if (!stored) return;
    try {
      const parsed: User = JSON.parse(stored);
      setUser(parsed);
      setView("dashboard");
      showToast(`Sesi dipulihkan. Selamat datang kembali, ${parsed.name}!`, "success");
    } catch {
      localStorage.removeItem("sias_user_session");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      localStorage.setItem("sias_user_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("sias_user_session");
    }
  }, [user]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans" id="app-root-container">
      <ErrorBoundary context="App">
        <Suspense fallback={<PageLoader />}>
          {view === "website" && (
            <ErrorBoundary context="PublicWebsite">
              <PublicWebsite onGoToLogin={() => setView("login")} showToast={showToast} />
            </ErrorBoundary>
          )}

          {view === "login" && (
            <ErrorBoundary context="Login">
              <Login
                onLoginSuccess={handleLoginSuccess}
                showToast={showToast}
                onBackToWebsite={() => setView("website")}
              />
            </ErrorBoundary>
          )}

          {view === "dashboard" && user && (
            <ErrorBoundary context="Dashboard">
              <SchoolDataProvider user={user} showToast={showToast}>
                <Dashboard
                  user={user}
                  onLogout={handleLogout}
                  showToast={showToast}
                  onUpdateUser={handleUpdateUser}
                />
              </SchoolDataProvider>
            </ErrorBoundary>
          )}
        </Suspense>
      </ErrorBoundary>

      {/* Floating toast alerts — outside Suspense so always visible */}
      <Toast toasts={toasts} onClose={handleCloseToast} />
    </div>
  );
}
