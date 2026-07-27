/**
 * Centralized menu label mapping.
 * Eliminates duplication between Header and Sidebar components.
 */

export type MenuKey =
  | "home" | "calendar" | "messages" | "checkin" | "settings"
  | "academicyear" | "classroom" | "subject" | "teacher" | "student"
  | "schedule" | "reports" | "ppdb" | "logs" | "backups" | "forum"
  | "attendance" | "grades";

export function getMenuLabel(menu: string, role?: string): string {
  switch (menu) {
    case "home":       return role === "siswa" ? "Profil Saya" : "Dashboard Utama";
    case "calendar":   return "Kalender Akademik";
    case "messages":   return "Notifikasi Orang Tua";
    case "checkin":    return role === "siswa" ? "Absensi GPS" : "Absensi GPS Mandiri";
    case "settings":   return "Identitas Sekolah";
    case "academicyear": return "Tahun Ajaran";
    case "classroom":  return "Manajemen Kelas";
    case "subject":    return "Mata Pelajaran";
    case "teacher":    return "Data Guru";
    case "student":    return "Data Siswa";
    case "schedule":   return "Jadwal Pelajaran";
    case "reports":    return "Cetak Rapor Siswa";
    case "ppdb":       return "PPDB Admissions";
    case "logs":       return "Audit Logs";
    case "backups":    return "Database Backup";
    case "forum":      return "Forum Diskusi";
    case "attendance": return "Absensi Kelas";
    case "grades":     return role === "siswa" ? "Rapor Nilai" : "Input Nilai";
    default:           return menu;
  }
}
