export interface User {
  id: string;
  username: string;
  name: string;
  role: 'super_admin' | 'admin' | 'guru' | 'siswa';
  email: string;
  avatar: string;
  active: boolean;
  detailsId?: string; // Links to teacher ID or student ID if role is guru/siswa
}

export interface SchoolSettings {
  name: string;
  logo: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;
  vision: string;
  mission: string[];
  principalName: string;
  principalNip: string;
  principalGreeting: string;
  principalImage: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  googleSpreadsheetId?: string;
  googleSpreadsheetUrl?: string;
  googleSpreadsheetLastSync?: string;
  city?: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  semester: 'Ganjil' | 'Genap';
  active: boolean;
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevel: 'X' | 'XI' | 'XII';
  major: 'IPA' | 'IPS' | 'Umum' | 'Kejuruan';
  homeroomTeacherId: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "MAT-10"
  name: string; // e.g. "Matematika"
  kkm: number; // e.g. 75
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  email: string;
  phone: string;
  status: 'PNS' | 'Honororer' | 'Yayasan';
  birthDate: string;
  address: string;
  userId?: string;
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  classRoomId: string; // Class ID
  birthDate: string;
  address: string;
  status: 'Aktif' | 'Lulus' | 'Pindah' | 'Alumni';
  parentName: string;
  parentPhone: string;
  userId?: string;
}

export interface Schedule {
  id: string;
  classRoomId: string;
  subjectId: string;
  teacherId: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  startTime: string; // e.g. "07:30"
  endTime: string; // e.g. "09:00"
}

export interface Attendance {
  id: string;
  classRoomId: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  notes?: string;
}

export interface Grade {
  id: string;
  academicYearId: string;
  studentId: string;
  subjectId: string;
  classRoomId: string;
  assignmentScore: number;
  utsScore: number;
  uasScore: number;
  finalScore: number;
  gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  notes: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'important';
  date: string;
  author: string;
  targetRole?: 'all' | 'guru' | 'siswa';
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  date: string;
  author: string;
  image: string;
  slug: string;
}

export interface Gallery {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'KBM' | 'Ekstrakurikuler' | 'Fasilitas' | 'Prestasi' | 'Acara';
  date: string;
}

export interface Document {
  id: string;
  name: string;
  type: string; // e.g. "PDF", "XLSX"
  size: string; // e.g. "1.2 MB"
  fileUrl: string;
  uploadedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'read';
}

export interface PPDBRegistration {
  id: string;
  registrationNo: string;
  fullName: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace: string;
  birthDate: string;
  address: string;
  prevSchool: string;
  parentName: string;
  parentPhone: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface ActivityLog {
  id: string;
  username: string;
  role: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface Backup {
  id: string;
  filename: string;
  size: string;
  timestamp: string;
}

export interface CheckIn {
  id: string;
  studentId: string;
  studentName: string;
  classRoomId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  latitude: number;
  longitude: number;
  locationName: string;
  status: 'Tepat Waktu' | 'Terlambat';
  distanceMeter: number;
}

export interface ForumAuthor {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface ForumResource {
  name: string;
  url: string;
}

export interface ForumReply {
  id: string;
  content: string;
  author: ForumAuthor;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  author: ForumAuthor;
  resources: ForumResource[];
  upvotes: string[];
  replies: ForumReply[];
  createdAt: string;
}

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  time: string;
  read: boolean;
  category: "tugas" | "ujian" | "umum";
}

export type TempAttendanceRecord = Record<string, { status: AttendanceStatus | ""; notes: string }>;

export type TempGradeRecord = Record<string, { assignmentScore: number; utsScore: number; uasScore: number; notes: string }>;

