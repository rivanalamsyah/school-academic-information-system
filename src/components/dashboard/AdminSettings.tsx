import React from "react";
import { FileSpreadsheet, CheckCircle, RotateCw } from "lucide-react";
import { motion } from "motion/react";
import { SchoolSettings } from "../../types";

interface AdminSettingsProps {
  settingsForm: SchoolSettings | null;
  setSettingsForm: React.Dispatch<React.SetStateAction<SchoolSettings | null>>;
  handleSettingsUpdate: (e: React.FormEvent) => void;
  handleGoogleSheetsSync: () => void;
  handleGoogleSheetsDisconnect: () => void;
  isSyncing: boolean;
  isDisconnecting: boolean;
}

export function AdminSettings({
  settingsForm,
  setSettingsForm,
  handleSettingsUpdate,
  handleGoogleSheetsSync,
  handleGoogleSheetsDisconnect,
  isSyncing,
  isDisconnecting
}: AdminSettingsProps) {
  if (!settingsForm) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6" id="admin-settings-view">
      <form onSubmit={handleSettingsUpdate} className="space-y-6">
        <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2 tracking-tight">Identitas & Logo Sekolah</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Sekolah</label>
            <input
              type="text"
              value={settingsForm.name}
              onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Logo URL</label>
            <input
              type="text"
              value={settingsForm.logo}
              onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Telepon</label>
            <input
              type="text"
              value={settingsForm.phone}
              onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">E-mail</label>
            <input
              type="email"
              value={settingsForm.email}
              onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Alamat Kampus</label>
            <input
              type="text"
              value={settingsForm.address}
              onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
            />
          </div>
        </div>

        <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2 pt-4 tracking-tight">Sambutan Kepala Sekolah</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Kepala Sekolah</label>
            <input
              type="text"
              value={settingsForm.principalName}
              onChange={(e) => setSettingsForm({ ...settingsForm, principalName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">NIP Kepala Sekolah</label>
            <input
              type="text"
              value={settingsForm.principalNip}
              onChange={(e) => setSettingsForm({ ...settingsForm, principalNip: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Teks Sambutan</label>
            <textarea
              rows={4}
              value={settingsForm.principalGreeting}
              onChange={(e) => setSettingsForm({ ...settingsForm, principalGreeting: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Simpan Perubahan Pengaturan
          </button>
        </div>
      </form>

      {/* GOOGLE SHEETS INTEGRATION SECTION */}
      <div className="border-t border-slate-200 pt-6 mt-6 space-y-4" id="google-sheets-integration-panel">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Integrasi Google Sheets &amp; Drive</h3>
        </div>
        <p className="text-slate-500 text-[11px] leading-relaxed max-w-2xl">
          Hubungkan portal akademik ini dengan Google Sheets untuk mensinkronkan seluruh database sekolah (data siswa, guru, kelas, nilai rapor, kehadiran, hingga log aktivitas) secara langsung ke satu spreadsheet cloud yang aman.
        </p>

        {settingsForm.googleSpreadsheetId ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 text-white p-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Status: Integrasi Aktif</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Laporan sekolah disinkronkan secara realtime ke cloud spreadsheet.</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <a
                  href={settingsForm.googleSpreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold border border-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer animate-pulse hover:animate-none focus:outline-none"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Buka Google Sheets
                </a>
                <button
                  type="button"
                  onClick={handleGoogleSheetsSync}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-white hover:bg-slate-50 disabled:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs focus:outline-none"
                >
                  {isSyncing ? (
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Mensinkronkan...
                    </span>
                  ) : "Sinkronkan Sekarang"}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleSheetsDisconnect}
                  disabled={isDisconnecting}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
                >
                  {isDisconnecting ? "Memutuskan..." : "Putuskan Koneksi"}
                </button>
              </div>
            </div>
            {settingsForm.googleSpreadsheetLastSync && (
              <div className="border-t border-emerald-100 pt-2 text-[10px] text-slate-500 font-medium flex justify-between items-center">
                <span>
                  Sinkronisasi terakhir pada: <span className="font-bold text-slate-700">{new Date(settingsForm.googleSpreadsheetLastSync).toLocaleString("id-ID")} WIB</span>
                </span>
                <span className="text-[9px] text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full font-bold">TERKONEKSI</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-700">Integrasi Belum Terhubung</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Gunakan akun Google Anda untuk mengizinkan aplikasi ini membuat dan mengisi laporan spreadsheet.</p>
            </div>
            <button
              type="button"
              onClick={handleGoogleSheetsSync}
              disabled={isSyncing}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed focus:outline-none"
            >
              {isSyncing ? (
                <span className="flex items-center gap-1">
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  Mengkoneksikan...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.91 2.37-1.95 3.07v2.55h3.15c1.84-1.7 2.91-4.2 2.91-7.17 0-.58-.06-1.15-.14-1.65z" fill="#4285F4"/>
                    <path d="M12 21c2.43 0 4.47-.8 5.96-2.18l-3.15-2.55c-.88.6-2 .95-2.81.95-2.18 0-4.03-1.47-4.69-3.45H4.15v2.6C5.64 19.33 8.57 21 12 21z" fill="#34A853"/>
                    <path d="M7.31 13.77c-.17-.5-.26-1.04-.26-1.57s.09-1.07.26-1.57V8.03H4.15C3.56 9.22 3.22 10.57 3.22 12s.34 2.78.93 3.97l3.16-2.6c-.17-.5-.26-1.04-.26-1.57z" fill="#FBBC05"/>
                    <path d="M12 6.78c1.33 0 2.52.46 3.46 1.35l2.6-2.6C16.47 4.09 14.43 3.3 12 3.3 8.57 3.3 5.64 4.97 4.15 7.6l3.16 2.6c.66-1.98 2.51-3.45 4.69-3.45z" fill="#EA4335"/>
                  </svg>
                  Hubungkan Google Sheets
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
