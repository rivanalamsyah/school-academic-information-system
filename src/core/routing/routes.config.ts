import { Role, PermissionAction } from "../../utils/permissions";

export interface RouteConfig {
  key: string;
  path: string;
  label: string;
  roles?: Role[];
  permissions?: PermissionAction[];
}

export interface LayoutConfig {
  name: string;
  routes: RouteConfig[];
}

// ─── Public Website Routes (SEO-friendly keys) ──────────────────────────────
export const PUBLIC_ROUTES: RouteConfig[] = [
  { key: "beranda", path: "/#beranda", label: "Beranda & Keunggulan" },
  { key: "akademik", path: "/#akademik", label: "Profil & Akademik" },
  { key: "kehidupan", path: "/#kehidupan", label: "Kehidupan & Fasilitas" },
  { key: "ppdb", path: "/#ppdb", label: "PPDB & Berita" },
  { key: "kontak", path: "/#kontak", label: "Hubungi & Layanan" },
];

// ─── Auth Routes ────────────────────────────────────────────────────────────
export const AUTH_ROUTES: RouteConfig[] = [
  { key: "login", path: "/login", label: "Masuk ke Sistem" },
];

// ─── Dashboard Protected Routes (With strict RBAC matching ROLE_PERMISSIONS) 
export const DASHBOARD_ROUTES: RouteConfig[] = [
  {
    key: "home",
    path: "#home",
    label: "Dashboard Utama",
    roles: ["super_admin", "admin", "guru", "siswa"],
    permissions: ["view_dashboard"]
  },
  {
    key: "calendar",
    path: "#calendar",
    label: "Kalender Akademik",
    roles: ["super_admin", "admin", "guru", "siswa"]
  },
  {
    key: "messages",
    path: "#messages",
    label: "Notifikasi Orang Tua",
    roles: ["super_admin", "admin", "guru"]
  },
  {
    key: "checkin",
    path: "#checkin",
    label: "Absensi GPS",
    roles: ["guru", "siswa"]
  },
  {
    key: "settings",
    path: "#settings",
    label: "Identitas Sekolah",
    roles: ["super_admin", "admin"],
    permissions: ["manage_settings"]
  },
  {
    key: "academicyear",
    path: "#academicyear",
    label: "Tahun Ajaran",
    roles: ["super_admin", "admin"],
    permissions: ["manage_academicyear"]
  },
  {
    key: "classroom",
    path: "#classroom",
    label: "Manajemen Kelas",
    roles: ["super_admin", "admin"],
    permissions: ["manage_classroom"]
  },
  {
    key: "subject",
    path: "#subject",
    label: "Mata Pelajaran",
    roles: ["super_admin", "admin"],
    permissions: ["manage_subject"]
  },
  {
    key: "teacher",
    path: "#teacher",
    label: "Data Guru",
    roles: ["super_admin", "admin"],
    permissions: ["manage_teacher"]
  },
  {
    key: "student",
    path: "#student",
    label: "Data Siswa",
    roles: ["super_admin", "admin"],
    permissions: ["manage_student"]
  },
  {
    key: "schedule",
    path: "#schedule",
    label: "Jadwal Pelajaran",
    roles: ["super_admin", "admin", "siswa"],
    permissions: ["view_schedule"]
  },
  {
    key: "reports",
    path: "#reports",
    label: "Cetak Rapor Siswa",
    roles: ["super_admin", "admin", "guru"],
    permissions: ["view_reports"]
  },
  {
    key: "ppdb",
    path: "#ppdb",
    label: "PPDB Admissions",
    roles: ["super_admin", "admin"],
    permissions: ["manage_ppdb"]
  },
  {
    key: "logs",
    path: "#logs",
    label: "Audit Logs",
    roles: ["super_admin"],
    permissions: ["view_logs"]
  },
  {
    key: "backups",
    path: "#backups",
    label: "Database Backup",
    roles: ["super_admin"],
    permissions: ["manage_backups"]
  },
  {
    key: "forum",
    path: "#forum",
    label: "Forum Diskusi",
    roles: ["super_admin", "admin", "guru", "siswa"]
  },
  {
    key: "attendance",
    path: "#attendance",
    label: "Absensi Kelas",
    roles: ["guru"],
    permissions: ["manage_attendance"]
  },
  {
    key: "grades",
    path: "#grades",
    label: "Input Nilai",
    roles: ["guru", "siswa"],
    permissions: ["view_grades"]
  }
];

// ─── Layout Configuration ───────────────────────────────────────────────────
export const LAYOUTS: LayoutConfig[] = [
  { name: "PublicLayout", routes: PUBLIC_ROUTES },
  { name: "AuthLayout", routes: AUTH_ROUTES },
  { name: "DashboardLayout", routes: DASHBOARD_ROUTES }
];
