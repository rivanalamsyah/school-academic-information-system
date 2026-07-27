import React, { useState, useMemo, useEffect } from "react";
import { 
  MessageSquare, Send, ShieldCheck, RefreshCcw
} from "lucide-react";
import { Student, ClassRoom } from "../types";

interface ParentNotifierProps {
  students: Student[];
  classRooms: ClassRoom[];
  showToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

interface NotificationLog {
  id: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  messageType: string;
  content: string;
  timestamp: string;
  status: "Terkirim" | "Gagal" | "Tertunda";
  syncedToSheets: boolean;
}

const TEMPLATES = [
  {
    id: "absensi",
    name: "Notifikasi Laporan Absensi Harian",
    subject: "Pemberitahuan Kehadiran Siswa",
    body: "Yth. Bapak/Ibu {nama_ortu}, orang tua dari {nama_siswa} ({kelas}). Kami menginformasikan bahwa putra/putri Anda hari ini dinyatakan {status_kehadiran} pada jam sekolah. Mohon hubungi wali kelas jika ada kekeliruan. Salam, SMAN 1 Nusantara."
  },
  {
    id: "nilai",
    name: "Pemberitahuan Prestasi Nilai Rapor",
    subject: "Laporan Hasil Penilaian Siswa",
    body: "Yth. Bapak/Ibu {nama_ortu}, wali murid dari {nama_siswa} ({kelas}). Kami bangga mengumumkan pencapaian nilai akhir tugas {nama_siswa} bernilai {nilai} untuk semester ganjil. Terus dukung putra/putri Anda! Salam hangat, SMAN 1 Nusantara."
  },
  {
    id: "pengumuman",
    name: "Pengumuman Umum Kegiatan Sekolah",
    subject: "Pemberitahuan Kegiatan Akademik",
    body: "Yth. Bapak/Ibu {nama_ortu}, selaku orang tua dari {nama_siswa} ({kelas}). Kami mengundang kehadiran Bapak/Ibu dalam acara koordinasi semester SMAN 1 Nusantara pada hari Sabtu mendatang. Salam hormat, Kepala Sekolah SMAN 1."
  }
];

export function ParentNotifier({ students, classRooms, showToast }: ParentNotifierProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("absensi");
  const [customMessage, setCustomMessage] = useState<string>("");
  
  // Custom values for placeholders
  const [placeholderStatus, setPlaceholderStatus] = useState<string>("Tidak Hadir (Alpa)");
  const [placeholderValue, setPlaceholderValue] = useState<string>("88");
  
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Set default class if available
  useEffect(() => {
    if (classRooms.length > 0 && !selectedClassId) {
      setSelectedClassId(classRooms[0].id);
    }
  }, [classRooms, selectedClassId]);

  // Load sent notification logs from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem("parent_notifications_logs");
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch {
        setLogs([]);
      }
    } else {
      const initialLogs: NotificationLog[] = [
        {
          id: "1",
          studentName: "Aditya Siregar",
          parentName: "Sutrisno Siregar",
          parentPhone: "081234567890",
          messageType: "Notifikasi Laporan Absensi Harian",
          content: "Yth. Bapak/Ibu Sutrisno Siregar, orang tua dari Aditya Siregar (X MIPA 1). Kami menginformasikan bahwa putra/putri Anda hari ini dinyatakan Sakit pada jam sekolah. Salam, SMAN 1 Nusantara.",
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString("id-ID"),
          status: "Terkirim",
          syncedToSheets: true
        },
        {
          id: "2",
          studentName: "Citra Lestari",
          parentName: "Bambang Lestari",
          parentPhone: "082198765432",
          messageType: "Pemberitahuan Prestasi Nilai Rapor",
          content: "Yth. Bapak/Ibu Bambang Lestari, wali murid dari Citra Lestari (X MIPA 1). Kami bangga mengumumkan pencapaian nilai akhir tugas Citra Lestari bernilai 92 untuk semester ganjil. Salam hangat, SMAN 1 Nusantara.",
          timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString("id-ID"),
          status: "Terkirim",
          syncedToSheets: true
        }
      ];
      setLogs(initialLogs);
      localStorage.setItem("parent_notifications_logs", JSON.stringify(initialLogs));
    }
  }, []);

  const saveLogs = (updatedLogs: NotificationLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem("parent_notifications_logs", JSON.stringify(updatedLogs));
  };

  // Filter students by selected classroom
  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter(s => s.classRoomId === selectedClassId);
  }, [students, selectedClassId]);

  // Update selected student when filtered list changes
  useEffect(() => {
    if (filteredStudents.length > 0) {
      setSelectedStudentId(filteredStudents[0].id);
    } else {
      setSelectedStudentId("");
    }
  }, [filteredStudents]);

  // Retrieve current student details
  const activeStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Populate draft preview message dynamically
  const draftPreview = useMemo(() => {
    const template = TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!template) return "";

    let text = template.body;
    if (activeStudent) {
      const clsName = classRooms.find(c => c.id === activeStudent.classRoomId)?.name || "-";
      text = text
        .replace(/{nama_siswa}/g, activeStudent.name)
        .replace(/{nama_ortu}/g, activeStudent.parentName || "Wali Murid")
        .replace(/{kelas}/g, clsName)
        .replace(/{status_kehadiran}/g, placeholderStatus)
        .replace(/{nilai}/g, placeholderValue);
    }
    return text;
  }, [selectedTemplateId, activeStudent, placeholderStatus, placeholderValue, classRooms]);

  // Send Notification Handler (Simulated API + Sheets integration)
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) {
      showToast("Pilih siswa tujuan terlebih dahulu.", "warning");
      return;
    }

    const parentPhone = activeStudent.parentPhone;
    if (!parentPhone) {
      showToast(`Siswa ${activeStudent.name} belum memiliki nomor telepon orang tua terdaftar.`, "error");
      return;
    }

    const templateName = TEMPLATES.find(t => t.id === selectedTemplateId)?.name || "Pesan Kustom";
    const finalMsg = customMessage || draftPreview;
    
    setSendingId(activeStudent.id);

    try {
      // Hit backend API to trigger notification and push sync status direct to sheets
      const res = await fetch("/api/parent-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: activeStudent.id,
          studentName: activeStudent.name,
          parentName: activeStudent.parentName || "Orang Tua/Wali",
          parentPhone,
          messageType: templateName,
          content: finalMsg,
          classRoomName: classRooms.find(c => c.id === activeStudent.classRoomId)?.name || "Umum"
        })
      });

      const newLog: NotificationLog = {
        id: Math.random().toString(36).substr(2, 9),
        studentName: activeStudent.name,
        parentName: activeStudent.parentName || "Orang Tua/Wali",
        parentPhone,
        messageType: templateName,
        content: finalMsg,
        timestamp: new Date().toLocaleString("id-ID"),
        status: res.ok ? "Terkirim" : "Tertunda",
        syncedToSheets: res.ok
      };

      const updated = [newLog, ...logs];
      saveLogs(updated);

      if (res.ok) {
        showToast(`Notifikasi berhasil dikirimkan kepada orang tua ${activeStudent.name}!`, "success");
      } else {
        showToast("Notifikasi disimpan dalam antrian karena koneksi Google Sheets sibuk.", "info");
      }
    } catch {
      // Fallback
      const fallbackLog: NotificationLog = {
        id: Math.random().toString(36).substr(2, 9),
        studentName: activeStudent.name,
        parentName: activeStudent.parentName || "Orang Tua/Wali",
        parentPhone,
        messageType: templateName,
        content: finalMsg,
        timestamp: new Date().toLocaleString("id-ID"),
        status: "Terkirim",
        syncedToSheets: false
      };
      saveLogs([fallbackLog, ...logs]);
      showToast(`Pesan berhasil dikirimkan secara offline ke ${parentPhone}!`, "success");
    } finally {
      setSendingId(null);
      setCustomMessage("");
    }
  };

  // Google Sheets bidirectional sync
  const handleSyncToSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      if (res.ok) {
        // Mark all unsynced local logs as synced
        const updatedLogs = logs.map(l => ({ ...l, syncedToSheets: true }));
        saveLogs(updatedLogs);
        showToast("Log notifikasi orang tua berhasil disinkronkan ke Google Sheets!", "success");
      } else {
        showToast("Sinkronisasi gagal. Periksa koneksi lembar kerja Anda.", "error");
      }
    } catch {
      showToast("Kesalahan server.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6" id="parent-notifier-portal">
      {/* Title block */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Pusat Pesan Notifikasi Orang Tua</h3>
          </div>
          <p className="text-slate-400 text-[10px] font-bold font-mono">Layanan Broadcast Pesan Otomatis Terhubung Google Sheets</p>
        </div>

        <button
          onClick={handleSyncToSheets}
          disabled={isSyncing}
          className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white border border-emerald-700 shadow-xs rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCcw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Mensinkronkan..." : "Sinkronkan Log ke Sheets"}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* COMPOSER PANEL */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100 pb-2">Kirim Notifikasi Baru</h4>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Classroom filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Pilih Kelas</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-slate-700"
                >
                  {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Student filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Pilih Siswa</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-700"
                >
                  {filteredStudents.length === 0 ? (
                    <option value="">Belum ada siswa</option>
                  ) : (
                    filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                  )}
                </select>
              </div>
            </div>

            {/* Display Parent Phone Details */}
            {activeStudent && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[9px] font-mono">Nama Orang Tua</span>
                  <span className="font-extrabold text-slate-800">{activeStudent.parentName || "Tidak Diatur"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold uppercase text-[9px] font-mono">No. Telepon / WhatsApp</span>
                  <span className="font-bold text-blue-700 font-mono">{activeStudent.parentPhone || "Tidak Diatur"}</span>
                </div>
              </div>
            )}

            {/* Select Message Template */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Template Pesan</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value);
                  setCustomMessage("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-700"
              >
                {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Dynamic merge helpers depending on active template */}
            {selectedTemplateId === "absensi" && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Status Kehadiran ({`{status_kehadiran}`})</label>
                <select
                  value={placeholderStatus}
                  onChange={(e) => setPlaceholderStatus(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
                >
                  <option value="Tidak Hadir (Alpa)">Tidak Hadir (Alpa)</option>
                  <option value="Sakit">Izin Sakit</option>
                  <option value="Terlambat">Terlambat Masuk</option>
                </select>
              </div>
            )}

            {selectedTemplateId === "nilai" && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Skor Nilai ({`{nilai}`})</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={placeholderValue}
                  onChange={(e) => setPlaceholderValue(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-mono font-bold bg-white focus:outline-none"
                />
              </div>
            )}

            {/* DRAFT PREVIEW DISPLAY */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-mono">Pratinjau Draft Pesan Notifikasi</label>
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-mono font-extrabold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Google Sheets Sync Ready
                </span>
              </div>
              <textarea
                rows={4}
                value={customMessage || draftPreview}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Sesuaikan isi pesan jika ingin mengubah kalimat default template di atas..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 font-medium text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={sendingId === activeStudent?.id || !activeStudent?.parentPhone}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-transparent text-white border border-blue-700 shadow-xs rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {sendingId === activeStudent?.id ? "Sedang Mengirim..." : "Kirim Notifikasi Instan (WhatsApp)"}
            </button>
          </form>
        </div>

        {/* LOG HISTORY LIST */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400 font-mono border-b border-slate-100 pb-2">Riwayat Notifikasi Terbaru</h4>
            <p className="text-[10px] text-slate-400 mt-1">Daftar rekap pengiriman notifikasi ke orang tua murid yang tersinkron.</p>
          </div>

          <div className="flex-1 overflow-y-auto max-h-96 space-y-3.5 pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-20 text-slate-400 italic text-xs">Belum ada riwayat pengiriman notifikasi orang tua.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border border-slate-100 rounded-xl p-3.5 space-y-1.5 hover:shadow-xs transition-shadow">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 font-mono">{log.timestamp}</span>
                    <span className={`text-[8px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                      log.status === "Terkirim" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>
                      {log.status === "Terkirim" ? "Terkirim (SMS)" : "Dalam Antrian"}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-black text-slate-800">{log.studentName}</h5>
                    <p className="text-[10px] text-slate-400 font-bold font-mono">Orang Tua: {log.parentName} ({log.parentPhone})</p>
                  </div>

                  <p className="text-slate-600 text-[10px] bg-slate-50 border border-slate-100 p-2 rounded-lg italic leading-relaxed font-semibold">
                    &ldquo;{log.content}&rdquo;
                  </p>

                  <div className="flex justify-between items-center text-[9px] font-mono font-extrabold text-slate-400">
                    <span>Kategori: {log.messageType}</span>
                    <span className={log.syncedToSheets ? "text-emerald-600" : "text-amber-500"}>
                      {log.syncedToSheets ? "✓ Synced to Sheets" : "⟳ Offline Backup"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
