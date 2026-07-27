import { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, User, Lock, Eye, EyeOff, BookOpen, GraduationCap, School, X } from "lucide-react";
import { User as UserType } from "../types";
import { sendResetEmail } from "../utils/firebaseAuth";
import { AuthService } from "../services/auth.service";

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
  onBackToWebsite: () => void;
}

export default function Login({ onLoginSuccess, showToast, onBackToWebsite }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot password state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      showToast("Email reset harus diisi.", "warning");
      return;
    }
    setResetLoading(true);
    try {
      await sendResetEmail(resetEmail);
      showToast("Email instruksi pengaturan ulang kata sandi berhasil dikirim! Silakan periksa kotak masuk email Anda.", "success");
      setIsResetModalOpen(false);
      setResetEmail("");
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Gagal mengirim email reset kata sandi.";
      showToast(msg, "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast("Username dan password harus diisi.", "warning");
      return;
    }

    try {
      const data = await AuthService.login(username, password);
      showToast(`Selamat datang kembali, ${data.user.name}!`, "success");
      onLoginSuccess(data.user);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan koneksi server.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    showToast(`Formulir diisi otomatis untuk role ${user}. Silakan klik Masuk.`, "info");
  };

  return (
    <div className="min-h-screen bg-slate-50 geo-grid flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden" id="login-page">
      {/* Decorative Geometric Grid Accent Lines */}
      <div className="absolute top-0 right-0 w-64 h-64 border-b border-l border-slate-200/60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 border-t border-r border-slate-200/60 pointer-events-none" />
      <div className="absolute top-12 left-12 w-4 h-4 border border-slate-300 pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-4 h-4 border border-slate-300 pointer-events-none" />
      <div className="absolute top-20 right-20 w-8 h-8 rounded-full border border-dashed border-slate-300 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex items-center justify-center h-16 w-16 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 cursor-pointer border border-blue-700"
            onClick={onBackToWebsite}
          >
            <School className="w-8 h-8" />
          </motion.div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-slate-900 font-sans">
          SIAS Akademik
        </h2>
        <p className="mt-2 text-center text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          SMA Global Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card py-8 px-6 rounded-xl sm:px-10 shadow-xs"
        >
          <form className="space-y-5" onSubmit={handleSubmit} id="login-form">
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Username / NIS / NIP
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all bg-slate-50/50 hover:bg-white"
                  placeholder="Masukkan username, NIS, atau NIP"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Kata Sandi
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all bg-slate-50/50 hover:bg-white"
                  placeholder="Masukkan kata sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-slate-200 rounded text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 font-medium">
                  Ingat Saya
                </label>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                id="btn-login-submit"
                className="w-full flex justify-center py-2.5 px-4 border border-blue-700 rounded-xl shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memverifikasi...
                  </span>
                ) : (
                  "Masuk ke Sistem"
                )}
              </button>
            </div>
          </form>

          {/* Quick Login / Seeder Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4 font-mono">
              Uji Coba Cepat (Akun Seeder)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin("superadmin", "password123")}
                className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200/60 text-left transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Super Admin</p>
                  <p className="text-[10px] text-slate-400 font-mono">superadmin</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin("adminsekolah", "password123")}
                className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200/60 text-left transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Admin Sekolah</p>
                  <p className="text-[10px] text-slate-400 font-mono">adminsekolah</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin("19800101", "password123")}
                className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200/60 text-left transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Guru (Siti R.)</p>
                  <p className="text-[10px] text-slate-400 font-mono">19800101</p>
                </div>
              </button>

              <button
                onClick={() => handleQuickLogin("102501", "password123")}
                className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200/60 text-left transition-colors cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Siswa (Andi W.)</p>
                  <p className="text-[10px] text-slate-400 font-mono">102501</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <button
            onClick={onBackToWebsite}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            ← Kembali ke Website Utama
          </button>
        </div>
      </div>

      {/* --- PASSWORD RESET MODAL (FIREBASE AUTH) --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="password-reset-modal-overlay">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-md overflow-hidden flex flex-col animate-slide-up" id="password-reset-modal">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Atur Ulang Kata Sandi</h3>
                <p className="text-[10px] text-slate-400 font-medium">Kirim tautan reset kata sandi melalui email terdaftar Anda</p>
              </div>
              <button 
                onClick={() => setIsResetModalOpen(false)} 
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Alamat Email Terdaftar
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="mt-1.5 block w-full px-3 py-2.5 text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50/50 hover:bg-white transition-all"
                  placeholder="contoh: budi@student.smaglobal.sch.id"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl border border-blue-700 shadow-xs cursor-pointer disabled:opacity-50 transition-all"
                >
                  {resetLoading ? "Mengirim..." : "Kirim Tautan Atur Ulang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
