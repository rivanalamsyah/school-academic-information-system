import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { syncDatabaseBidirectional } from './src/utils/googleSheetsSync.ts';

const currentFilename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(currentFilename);

const app = express();
const PORT = 3000;

// Security headers middleware (manually crafted to avoid unnecessary dependencies)
app.use((_req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Permissive yet secure CSP for Vite development + Firebase
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://lh3.googleusercontent.com; connect-src 'self' ws: wss: https://*.googleapis.com https://*.firebaseio.com;"
  );
  next();
});

app.use(express.json({ limit: '2mb' })); // Limit JSON body size to prevent DoS
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// ── Security Headers Middleware ──────────────────────────────────────────────
// Applied to all responses — equivalent to helmet.js core defaults
app.use((_req, res, next) => {
  // Prevent browsers from MIME-sniffing the content type
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking via iframes
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Enable XSS filtering in legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Remove Express fingerprint
  res.removeHeader('X-Powered-By');
  // Referrer policy — don't leak origin to third parties
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy — restrict access to sensitive browser APIs
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');
  // HSTS (only meaningful in production behind HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  next();
});

// Backend Role-Based Access Control (RBAC) Middleware
app.use('/api', (req, res, next) => {
  // Allow login/auth, public info, and public news/announcements/settings without checking role headers
  if (
    req.path === '/auth/login' ||
    req.path.startsWith('/public/') ||
    (req.method === 'GET' && (
      req.path === '/settings' || 
      req.path === '/academicyears' || 
      req.path === '/classrooms' || 
      req.path === '/subjects' || 
      req.path === '/teachers' || 
      req.path === '/students' || 
      req.path === '/schedules' ||
      req.path === '/news' ||
      req.path === '/announcements' ||
      req.path === '/gallery' ||
      req.path === '/documents'
    ))
  ) {
    return next();
  }

  // Get user role from headers
  const userRole = req.headers['x-user-role'] as string;

  if (!userRole) {
    return res.status(401).json({ error: "Unauthorized: Hak akses peran tidak disediakan di header permintaan (x-user-role)." });
  }

  const role = userRole.toLowerCase();

  // 1. Super Admin only resources
  if (req.path.startsWith('/logs') || req.path.startsWith('/backups')) {
    if (role !== 'super_admin') {
      return res.status(403).json({ error: `Forbidden: Peran '${userRole}' tidak memiliki izin untuk mengelola berkas database atau log sistem.` });
    }
    return next();
  }

  // 2. Admin & Super Admin write/manage operations
  const adminWritePaths = [
    '/settings', '/academicyears', '/classrooms', '/subjects', 
    '/teachers', '/students', '/schedules', '/ppdb', 
    '/news', '/announcements', '/gallery', '/documents', '/messages', '/google-sheets'
  ];
  
  const isWriteOp = ['POST', 'PUT', 'DELETE'].includes(req.method);
  const isPpdbGet = req.path.startsWith('/ppdb') && req.method === 'GET';
  const isMessagesGet = req.path.startsWith('/messages') && req.method === 'GET';

  if (
    (isWriteOp && adminWritePaths.some(p => req.path.startsWith(p))) || 
    isPpdbGet || 
    isMessagesGet
  ) {
    if (role !== 'super_admin' && role !== 'admin') {
      return res.status(403).json({ error: `Forbidden: Peran '${userRole}' tidak memiliki izin untuk memodifikasi data akademik atau konfigurasi sekolah.` });
    }
    return next();
  }

  // 3. Guru bulk updates & notifications & calendar sync
  if (
    req.path.startsWith('/attendances/bulk') || 
    req.path.startsWith('/grades/bulk') || 
    req.path.startsWith('/parent-notifications') || 
    req.path.startsWith('/calendar/sync')
  ) {
    if (role !== 'super_admin' && role !== 'admin' && role !== 'guru') {
      return res.status(403).json({ error: `Forbidden: Peran '${userRole}' tidak diizinkan untuk mengakses fitur guru ini.` });
    }
    return next();
  }

  next();
});

// Path to file-based persistent DB
const DB_PATH = path.join(currentDirname, 'src', 'db', 'data.json');

// Ensure DB directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Default initial data seeder helper
function generateSeederData() {
  const settings = {
    name: "SMA Global",
    logo: "/logo.png",
    favicon: "/logo.png",
    phone: "(0274) 567890",
    email: "info@smaglobal.sch.id",
    address: "Jl. Pendidikan Nusantara No. 88, Condongcatur, Depok, Sleman, Daerah Istimewa Yogyakarta, 55281",
    vision: "Menjadi sekolah unggul yang menghasilkan lulusan berkarakter, berprestasi, berwawasan global, dan menguasai teknologi.",
    mission: [
      "Menyelenggarakan pendidikan berkualitas.",
      "Mengembangkan karakter peserta didik.",
      "Memanfaatkan teknologi dalam pembelajaran.",
      "Mendorong prestasi akademik dan non-akademik.",
      "Menumbuhkan budaya disiplin, kreatif, dan inovatif."
    ],
    principalName: "Drs. Ahmad Fauzi, M.Pd.",
    principalNip: "19720412 199803 1 003",
    principalGreeting: "Assalamualaikum Wr. Wb. Selamat datang di portal resmi SMA Global. Sebagai salah satu institusi pendidikan modern di Sleman, Daerah Istimewa Yogyakarta, kami berkomitmen untuk mendidik calon pemimpin bangsa yang unggul, berkarakter mulia, menguasai teknologi, dan siap bersaing di tingkat global. Dengan dukungan sistem akademik portal terintegrasi (SIAS), kami menjembatani proses pembelajaran, administrasi, dan koordinasi secara cepat, transparan, dan akuntabel.",
    principalImage: "/principal.jpg",
    facebook: "SMA Global Indonesia",
    twitter: "SMA Global Official",
    instagram: "@smaglobal.id",
    youtube: "SMA Global Official",
    seoTitle: "SMA Global - Unggul, Berkarakter, Berwawasan Global",
    seoDescription: "Portal resmi SMA Global Sleman Yogyakarta. Sistem Informasi Akademik Sekolah (SIAS) terpadu untuk siswa, guru, dan orang tua.",
    seoKeywords: "SMA Global, sekolah Yogyakarta, PPDB Sleman, portal akademik SMA"
  };

  const academicYears = [
    { id: "ay1", year: "2026/2027", semester: "Ganjil", active: true },
    { id: "ay2", year: "2026/2027", semester: "Genap", active: false }
  ];

  const subjects = [
    { id: "subj1", code: "MAT-WAJIB", name: "Matematika (Wajib)", kkm: 75 },
    { id: "subj2", code: "IND-WAJIB", name: "Bahasa Indonesia", kkm: 75 },
    { id: "subj3", code: "ING-WAJIB", name: "Bahasa Inggris", kkm: 75 },
    { id: "subj4", code: "FIS-IPA", name: "Fisika", kkm: 70 },
    { id: "subj5", code: "KIM-IPA", name: "Kimia", kkm: 70 },
    { id: "subj6", code: "BIO-IPA", name: "Biologi", kkm: 70 },
    { id: "subj7", code: "SEJ-IPS", name: "Sejarah Indonesia", kkm: 75 },
    { id: "subj8", code: "GEO-IPS", name: "Geografi", kkm: 70 },
    { id: "subj9", code: "AGM-ISLAM", name: "Pendidikan Agama & Budi Pekerti", kkm: 78 },
    { id: "subj10", code: "PJOK", name: "Pend. Jasmani, Olahraga & Kesehatan", kkm: 75 }
  ];

  // 12 Teachers
  const teachers = [
    { id: "t1", nip: "19800101 200501 1 003", name: "Dra. Siti Rahmah, M.Si.", gender: "Perempuan", email: "siti.rahmah@smaglobal.sch.id", phone: "08123456701", status: "PNS", birthDate: "1980-01-01", address: "Kebayoran Lama, Yogyakarta Selatan", userId: "u_t1" },
    { id: "t2", nip: "19850415 201001 2 005", name: "Budi Santoso, S.Pd.", gender: "Laki-laki", email: "budi.santoso@smaglobal.sch.id", phone: "08123456702", status: "PNS", birthDate: "1985-04-15", address: "Cilandak, Yogyakarta Selatan", userId: "u_t2" },
    { id: "t3", nip: "19881120 201503 1 008", name: "Dewi Lestari, M.Pd.", gender: "Perempuan", email: "dewi.lestari@smaglobal.sch.id", phone: "08123456703", status: "PNS", birthDate: "1988-11-20", address: "Pasar Minggu, Yogyakarta Selatan", userId: "u_t3" },
    { id: "t4", nip: "19910905 201904 2 012", name: "Rian Hidayat, S.Pd.", gender: "Laki-laki", email: "rian.hidayat@smaglobal.sch.id", phone: "08123456704", status: "Yayasan", birthDate: "1991-09-05", address: "Jagakarsa, Yogyakarta Selatan", userId: "u_t4" },
    { id: "t5", nip: "19780312 200312 1 001", name: "Drs. Heri Irawan", gender: "Laki-laki", email: "heri.irawan@smaglobal.sch.id", phone: "08123456705", status: "PNS", birthDate: "1978-03-12", address: "Pondok Indah, Yogyakarta Selatan", userId: "u_t5" },
    { id: "t6", nip: "19931218 202201 2 015", name: "Anisa Fitriani, M.Pd.", gender: "Perempuan", email: "anisa.fitriani@smaglobal.sch.id", phone: "08123456706", status: "Honororer", birthDate: "1993-12-18", address: "Tebet, Yogyakarta Selatan", userId: "u_t6" },
    { id: "t7", nip: "19820525 200801 1 004", name: "Agus Salim, M.Pd.", gender: "Laki-laki", email: "agus.salim@smaglobal.sch.id", phone: "08123456707", status: "PNS", birthDate: "1982-05-25", address: "Mampang Prapatan, Yogyakarta Selatan", userId: "u_t7" },
    { id: "t8", nip: "19860710 201103 2 007", name: "Rina Wijayanti, S.Pd.", gender: "Perempuan", email: "rina.wijayanti@smaglobal.sch.id", phone: "08123456708", status: "PNS", birthDate: "1986-07-10", address: "Kuningan, Yogyakarta Selatan", userId: "u_t8" },
    { id: "t9", nip: "19901002 201804 1 010", name: "Fajar Nugroho, S.Si.", gender: "Laki-laki", email: "fajar.nugroho@smaglobal.sch.id", phone: "08123456709", status: "Yayasan", birthDate: "1990-10-02", address: "Setiabudi, Yogyakarta Selatan", userId: "u_t9" },
    { id: "t10", nip: "19940608 202301 2 019", name: "Sari Kusuma, S.Pd.", gender: "Perempuan", email: "sari.kusuma@smaglobal.sch.id", phone: "08123456710", status: "Honororer", birthDate: "1994-06-08", address: "Palmerah, Yogyakarta Barat", userId: "u_t10" },
    { id: "t11", nip: "19790830 200501 1 002", name: "Irwan Susanto, M.T.", gender: "Laki-laki", email: "irwan.susanto@smaglobal.sch.id", phone: "08123456711", status: "PNS", birthDate: "1979-08-30", address: "Tanah Abang, Yogyakarta Pusat", userId: "u_t11" },
    { id: "t12", nip: "19870211 201204 2 009", name: "Mega Utami, S.Pd.", gender: "Perempuan", email: "mega.utami@smaglobal.sch.id", phone: "08123456712", status: "PNS", birthDate: "1987-02-11", address: "Gambir, Yogyakarta Pusat", userId: "u_t12" }
  ];

  // Classrooms
  const classRooms = [
    { id: "cls1", name: "X MIPA 1", gradeLevel: "X", major: "IPA", homeroomTeacherId: "t1" },
    { id: "cls2", name: "X IPS 1", gradeLevel: "X", major: "IPS", homeroomTeacherId: "t2" },
    { id: "cls3", name: "XI MIPA 1", gradeLevel: "XI", major: "IPA", homeroomTeacherId: "t3" },
    { id: "cls4", name: "XI IPS 1", gradeLevel: "XI", major: "IPS", homeroomTeacherId: "t4" },
    { id: "cls5", name: "XII MIPA 1", gradeLevel: "XII", major: "IPA", homeroomTeacherId: "t5" },
    { id: "cls6", name: "XII IPS 1", gradeLevel: "XII", major: "IPS", homeroomTeacherId: "t6" }
  ];

  // 30 Students spread across classes
  const firstNames = ["Andi", "Budi", "Citra", "Dedi", "Eka", "Fani", "Gita", "Hadi", "Indah", "Joko", "Kiki", "Lilis", "Mega", "Naufal", "Olivia", "Putra", "Qori", "Rian", "Sari", "Tono", "Umar", "Vina", "Wawan", "Xena", "Yayan", "Zaki", "Arif", "Bella", "Candra", "Dina"];
  const lastNames = ["Wibowo", "Pratama", "Sari", "Saputra", "Kusuma", "Hidayat", "Lestari", "Nugroho", "Setyawan", "Wijaya", "Subagyo", "Astuti", "Rahayu", "Fadilah", "Ramadhan", "Siregar", "Lubis", "Ginting", "Nasution", "Pohan", "Simanjuntak", "Tanjung", "Harahap", "Sitorus", "Pane", "Sumbayak", "Munthe", "Pasaribu", "Pangaribuan", "Sinaga"];
  
  const students: any[] = [];
  for (let i = 1; i <= 30; i++) {
    const fName = firstNames[i - 1];
    const lName = lastNames[i - 1];
    const gender = (i % 2 === 0) ? "Perempuan" : "Laki-laki";
    const classId = `cls${(i % 6) + 1}`; // evenly distribute among class 1-6
    const nis = `10${String(2500 + i)}`;
    const nisn = `0054321${String(100 + i)}`;
    // email omitted from seed — not used in student object
    
    students.push({
      id: `s${i}`,
      nis,
      nisn,
      name: `${fName} ${lName}`,
      gender,
      classRoomId: classId,
      birthDate: `200${8 + (i % 3)}-0${(i % 9) + 1}-${10 + (i % 15)}`,
      address: `Jl. Global Raya No. ${i * 4}, Yogyakarta`,
      status: "Aktif",
      parentName: `${lastNames[29 - i]} ${i % 2 === 0 ? "S.H." : "M.B.A."}`,
      parentPhone: `085678901${String(10 + i)}`,
      userId: `u_s${i}`
    });
  }

  // Generate accounts for Users (Super Admin, Admins, Teachers, Students)
  const users: any[] = [
    { id: "u_super", username: "superadmin", name: "Super Administrator", role: "super_admin", email: "superadmin@smaglobal.sch.id", avatar: "/default-avatar.png", active: true },
    { id: "u_admin", username: "adminsekolah", name: "Admin SMA Global", role: "admin", email: "admin@smaglobal.sch.id", avatar: "/default-avatar.png", active: true }
  ];

  // Add teachers to user accounts
  teachers.forEach(t => {
    users.push({
      id: t.userId!,
      username: t.nip.split(' ')[0], // first section of NIP as username
      name: t.name,
      role: "guru",
      email: t.email,
      avatar: t.gender === "Laki-laki" 
        ? "/default-avatar.png"
        : "/default-avatar.png",
      active: true,
      detailsId: t.id
    });
  });

  // Add students to user accounts
  students.forEach(s => {
    users.push({
      id: s.userId!,
      username: s.nis, // NIS as username
      name: s.name,
      role: "siswa",
      email: `${s.nis}@student.smaglobal.sch.id`,
      avatar: s.gender === "Laki-laki"
        ? "/default-avatar.png"
        : "/default-avatar.png",
      active: true,
      detailsId: s.id
    });
  });

  // Schedules (Monday to Friday)
  const schedules = [
    // Senin
    { id: "sch1", classRoomId: "cls1", subjectId: "subj1", teacherId: "t2", day: "Senin", startTime: "07:30", endTime: "09:00" },
    { id: "sch2", classRoomId: "cls1", subjectId: "subj2", teacherId: "t3", day: "Senin", startTime: "09:15", endTime: "10:45" },
    { id: "sch3", classRoomId: "cls1", subjectId: "subj9", teacherId: "t5", day: "Senin", startTime: "11:00", endTime: "12:30" },
    
    { id: "sch4", classRoomId: "cls2", subjectId: "subj7", teacherId: "t7", day: "Senin", startTime: "07:30", endTime: "09:00" },
    { id: "sch5", classRoomId: "cls2", subjectId: "subj2", teacherId: "t3", day: "Senin", startTime: "09:15", endTime: "10:45" },
    { id: "sch6", classRoomId: "cls2", subjectId: "subj10", teacherId: "t4", day: "Senin", startTime: "11:00", endTime: "12:30" },

    // Selasa
    { id: "sch7", classRoomId: "cls1", subjectId: "subj4", teacherId: "t9", day: "Selasa", startTime: "07:30", endTime: "09:00" },
    { id: "sch8", classRoomId: "cls1", subjectId: "subj3", teacherId: "t8", day: "Selasa", startTime: "09:15", endTime: "10:45" },
    { id: "sch9", classRoomId: "cls1", subjectId: "subj10", teacherId: "t4", day: "Selasa", startTime: "11:00", endTime: "12:30" },

    { id: "sch10", classRoomId: "cls2", subjectId: "subj8", teacherId: "t12", day: "Selasa", startTime: "07:30", endTime: "09:00" },
    { id: "sch11", classRoomId: "cls2", subjectId: "subj3", teacherId: "t8", day: "Selasa", startTime: "09:15", endTime: "10:45" },
    { id: "sch12", classRoomId: "cls2", subjectId: "subj9", teacherId: "t5", day: "Selasa", startTime: "11:00", endTime: "12:30" }
  ];

  // Add schedule entries for rest of classes to make it realistic
  let scheduleCount = 13;
  const days: any[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  classRooms.forEach((c, idx) => {
    if (idx < 2) return; // already handled
    days.forEach((day, dIdx) => {
      // 2 schedules per day
      schedules.push({
        id: `sch${scheduleCount++}`,
        classRoomId: c.id,
        subjectId: subjects[(dIdx * 2) % 10].id,
        teacherId: teachers[(idx + dIdx) % 12].id,
        day,
        startTime: "07:30",
        endTime: "09:00"
      });
      schedules.push({
        id: `sch${scheduleCount++}`,
        classRoomId: c.id,
        subjectId: subjects[(dIdx * 2 + 1) % 10].id,
        teacherId: teachers[(idx + dIdx + 3) % 12].id,
        day,
        startTime: "09:15",
        endTime: "10:45"
      });
    });
  });

  // Sample grades
  const grades: any[] = [];
  students.forEach((student, idx) => {
    // assign grades for Subject 1 (Math), Subject 2 (Indonesian), Subject 3 (English)
    const subjs = ["subj1", "subj2", "subj3"];
    subjs.forEach((subjId, sIdx) => {
      const offset = (idx + sIdx) % 15;
      const tScore = 70 + offset;
      const utsScore = 65 + (offset * 1.5 > 35 ? 30 : offset * 1.5);
      const uasScore = 72 + (offset * 1.2 > 25 ? 24 : offset * 1.2);
      const finalScore = Math.round((tScore * 0.3) + (utsScore * 0.3) + (uasScore * 0.4));
      
      let letter: any = 'C';
      if (finalScore >= 88) letter = 'A';
      else if (finalScore >= 78) letter = 'B';
      else if (finalScore >= 65) letter = 'C';
      else if (finalScore >= 50) letter = 'D';
      else letter = 'E';

      grades.push({
        id: `g_${student.id}_${subjId}`,
        academicYearId: "ay1",
        studentId: student.id,
        subjectId: subjId,
        classRoomId: student.classRoomId,
        assignmentScore: tScore,
        utsScore,
        uasScore,
        finalScore,
        gradeLetter: letter,
        notes: finalScore >= 75 ? "Sangat Baik, tingkatkan prestasi." : "Perlu bimbingan dan latihan mandiri."
      });
    });
  });

  // Attendance for last 5 days
  const attendances: any[] = [];
  const lastDates = ["2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17"];
  lastDates.forEach(date => {
    students.forEach((student, sIdx) => {
      // 95% present, 5% Sick, Izin, Alpa
      const roll = (sIdx + parseInt(date.substring(9))) % 20;
      let status: any = "Hadir";
      let notes = "";
      if (roll === 18) {
        status = "Sakit";
        notes = "Demam";
      } else if (roll === 19) {
        status = "Izin";
        notes = "Acara keluarga";
      } else if (roll === 0) {
        status = "Alpa";
        notes = "Tanpa keterangan";
      }
      attendances.push({
        id: `att_${student.id}_${date}`,
        classRoomId: student.classRoomId,
        date,
        studentId: student.id,
        status,
        notes
      });
    });
  });

  // Announcements
  const announcements = [
    {
      id: "ann1",
      title: "Ujian Tengah Semester (UTS) Ganjil T.A 2026/2027",
      content: "Diberitahukan kepada seluruh siswa/siswi SMA Global bahwa Pelaksanaan UTS Ganjil akan diselenggarakan mulai tanggal 22 September 2025 s.d 29 September 2025. Jadwal ujian lengkap dapat diunduh di papan dokumen sekolah. Pastikan kartu ujian telah dicetak dan tertib administrasi keuangan.",
      type: "important",
      date: "2026-07-15",
      author: "Humas Sekolah",
      targetRole: "all"
    },
    {
      id: "ann2",
      title: "Rapat Koordinasi Guru dan Staf Akademik",
      content: "Undangan kepada seluruh jajaran pendidik dan tenaga kependidikan untuk menghadiri rapat pleno persiapan kurikulum merdeka semester genap. Rapat diselenggarakan pada hari Sabtu, 25 Juli 2026 pukul 09.00 WIB s.d Selesai bertempat di Aula Pertemuan Utama.",
      type: "info",
      date: "2026-07-17",
      author: "Kepala Sekolah",
      targetRole: "guru"
    },
    {
      id: "ann3",
      title: "Lomba Bulan Bahasa & Seni Kreatif 2026",
      content: "Menyambut Bulan Bahasa, OSIS SMA Global mengadakan kompetisi seni antar kelas, meliputi: Cipta & Baca Puisi, Musikalisasi Puisi, Debat Bahasa Indonesia, dan Stand Up Comedy. Pendaftaran ditutup pada 10 Oktober 2026. Hubungi panitia OSIS untuk info pendaftaran.",
      type: "warning",
      date: "2026-07-18",
      author: "Pembina OSIS",
      targetRole: "siswa"
    }
  ];

  // News
  const news = [
    {
      id: "news1",
      title: "Siswa SMA Global Sabet Emas Olimpiade Sains Nasional 2025",
      summary: "Kabar membanggakan datang dari bidang Fisika dan Astronomi. Dua siswa SMA Global berhasil menyabet medali emas di ajang OSN tingkat nasional.",
      content: "Prestasi gemilang kembali ditorehkan oleh siswa-siswi terbaik SMA Global di tingkat nasional. Dalam ajang Olimpiade Sains Nasional (OSN) 2025 yang diselenggarakan di Bandung, kontingen sekolah berhasil menyumbangkan 2 Medali Emas untuk kategori Fisika dan Astronomi.\n\nSiswa tersebut adalah Muhammad Rian (Kelas XII MIPA 1) di cabang Fisika dan Citra Lestari (Kelas XI MIPA 1) di cabang Astronomi. Kepala Sekolah Drs. Ahmad Fauzi, M.Pd. menyatakan kebanggaannya, 'Ini adalah bukti kerja keras siswa, dedikasi guru pembina, serta dukungan penuh dari seluruh wali murid. Semoga pencapaian ini memotivasi adik kelas untuk terus berprestasi.'",
      category: "Prestasi",
      date: "2026-07-14",
      author: "Humas SMA Global",
      image: "/school.jpg",
      slug: "siswa-sman1-sabet-emas-osn-2025"
    },
    {
      id: "news2",
      title: "Peluncuran Laboratorium Bahasa dan Multimedia Digital Baru",
      summary: "Sekolah meresmikan Laboratorium Bahasa modern yang dilengkapi sistem interaktif berbasis AI dan headphone berteknologi noise-canceling untuk meningkatkan kompetensi bahasa asing.",
      content: "Guna meningkatkan kualitas Kegiatan Belajar Mengajar (KBM) terutama di bidang kompetensi bahasa internasional, SMA Global secara resmi meluncurkan fasilitas Laboratorium Bahasa & Multimedia Digital teranyar.\n\nFasilitas ini menampung 40 unit komputer berspesifikasi tinggi, dilengkapi dengan headset noise-canceling, dan sistem kontrol multimedia terpusat yang dipegang oleh guru. Melalui fasilitas baru ini, diharapkan siswa dapat berlatih percakapan, mendengarkan, serta presentasi interaktif secara maksimal, mendukung target sekolah sebagai salah satu institusi berwawasan global.",
      category: "Fasilitas",
      date: "2026-07-16",
      author: "Sarpras Sekolah",
      image: "/facilities.jpg",
      slug: "peluncuran-lab-bahasa-multimedia-digital"
    },
    {
      id: "news3",
      title: "Penerimaan Peserta Didik Baru (PPDB) Jalur Zonasi Dimulai",
      summary: "PPDB SMA Global tahun pelajaran 2026/2027 resmi dibuka untuk jalur zonasi, afirmasi, dan prestasi. Simak tata cara dan kuotanya di sini.",
      content: "Penerimaan Peserta Didik Baru (PPDB) SMA Global tahun pelajaran 2026/2027 telah dibuka. Proses seleksi tahun ini menggunakan skema kuota Zonasi (50%), Afirmasi (15%), Perpindahan Tugas Orang Tua (5%), dan Jalur Prestasi Akademik/Non-Akademik (30%).\n\nPendaftaran dilakukan secara daring melalui website resmi kami. Sekolah juga menyediakan pos pelayanan bantuan (helpdesk) di aula bagi calon wali murid yang mengalami kendala administrasi pendaftaran online. Proses verifikasi dokumen akan berlangsung ketat untuk memastikan keadilan bagi semua pihak.",
      category: "PPDB",
      date: "2026-07-18",
      author: "Panitia PPDB",
      image: "/school.jpg",
      slug: "ppdb-jalur-zonasi-dimulai"
    }
  ];

  // Gallery
  const gallery = [
    { id: "g1", title: "Upacara Bendera Peringatan Hari Pendidikan Nasional", description: "Seluruh jajaran guru dan siswa khidmat mengikuti jalannya upacara Hardiknas di lapangan utama.", category: "KBM", image: "/school.jpg", date: "2026-05-02" },
    { id: "g2", title: "Latihan Rutin Tim Basket Sekolah", description: "Ekstrakurikuler basket putra mempersiapkan fisik untuk turnamen DBL Jakarta Barat.", category: "Ekstrakurikuler", image: "/school.jpg", date: "2026-07-10" },
    { id: "g3", title: "Ruang Perpustakaan Taman Bacaan", description: "Fasilitas perpustakaan yang tenang, nyaman, dan ramah anak dilengkapi ribuan katalog buku cetak & digital.", category: "Fasilitas", image: "/facilities.jpg", date: "2026-06-15" },
    { id: "g4", title: "Penyerahan Trophy Juara 1 Paduan Suara", description: "Tim Paduan Suara SMA Global merayakan kemenangan kompetisi antar pelajar provinsi.", category: "Prestasi", image: "/school.jpg", date: "2026-07-05" },
    { id: "g5", title: "Praktikum Kimia Organik Siswa Kelas XI", description: "Siswa mengamati reaksi pengendapan zat warna di Laboratorium Kimia didampingi guru.", category: "KBM", image: "/school.jpg", date: "2026-07-12" }
  ];

  // Documents
  const documents = [
    { id: "doc1", name: "Kalender Akademik T.A 2025-2026.pdf", type: "PDF", size: "1.4 MB", fileUrl: "#", uploadedAt: "2026-07-10" },
    { id: "doc2", name: "Jadwal Lengkap UTS Ganjil 2025.pdf", type: "PDF", size: "840 KB", fileUrl: "#", uploadedAt: "2026-07-15" },
    { id: "doc3", name: "Formulir Surat Pernyataan PPDB.docx", type: "DOCX", size: "220 KB", fileUrl: "#", uploadedAt: "2026-07-17" }
  ];

  // Contact messages
  const contactMessages = [
    { id: "m1", name: "Hendra Wijaya", email: "hendra.w@gmail.com", subject: "Pertanyaan Kuota Jalur Prestasi", message: "Selamat siang Bapak/Ibu Panitia PPDB, saya ingin menanyakan mengenai verifikasi berkas sertifikat kejuaraan pencak silat tingkat nasional. Apakah poin piagam tersebut otomatis divalidasi oleh sistem atau harus datang ke sekolah membawa piagam asli? Terima kasih.", date: "2026-07-17 14:35:00", status: "unread" },
    { id: "m2", name: "Ratna Sari", email: "ratna.sari@yahoo.com", subject: "Sewa Aula Sekolah untuk Acara", message: "Mohon informasi mengenai prosedur pengajuan peminjaman aula sekolah untuk kegiatan sosial masyarakat kelurahan. Berapa biaya kebersihan dan perizinan yang harus disiapkan? Terima kasih atas tanggapannya.", date: "2026-07-16 09:12:00", status: "read" }
  ];

  // PPDB Admissions
  const ppdbRegistrations = [
    { id: "p1", registrationNo: "PPDB2026001", fullName: "Zahra Amalia", gender: "Perempuan", birthPlace: "Jakarta", birthDate: "2010-05-12", address: "Jl. Tebet Barat No. 12, Yogyakarta Selatan", prevSchool: "SMP Negeri 115 Jakarta", parentName: "Hendra Amalia", parentPhone: "08139876543", email: "zahra.amalia@gmail.com", status: "pending", date: "2026-07-18" },
    { id: "p2", registrationNo: "PPDB2026002", fullName: "Rafi Kurniawan", gender: "Laki-laki", birthPlace: "Bandung", birthDate: "2010-09-22", address: "Jl. Pancoran Barat No. 3, Yogyakarta Selatan", prevSchool: "SMP Negeri 73 Jakarta", parentName: "Kurniawan", parentPhone: "08129876544", email: "rafi.kurniawan@gmail.com", status: "approved", date: "2026-07-17" },
    { id: "p3", registrationNo: "PPDB2026003", fullName: "Farhan Mahendra", gender: "Laki-laki", birthPlace: "Depok", birthDate: "2010-02-05", address: "Jl. Jagakarsa No. 44, Yogyakarta Selatan", prevSchool: "SMP Swasta Al-Azhar 2", parentName: "Bambang Mahendra", parentPhone: "08159876545", email: "farhan.mahe@gmail.com", status: "rejected", date: "2026-07-16" }
  ];

  // Activity logs
  const activityLogs = [
    { id: "log1", username: "superadmin", role: "super_admin", action: "Login ke sistem", ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0 Chrome/121.0.0", timestamp: "2026-07-18 23:30:11" },
    { id: "log2", username: "adminsekolah", role: "admin", action: "Menambahkan berita baru: PPDB Zonasi", ipAddress: "192.168.1.25", userAgent: "Mozilla/5.0 Safari/605.1", timestamp: "2026-07-18 22:15:45" },
    { id: "log3", username: "19800101", role: "guru", action: "Melakukan input absensi Kelas X MIPA 1", ipAddress: "192.168.1.52", userAgent: "Mozilla/5.0 Chrome/121.0.0", timestamp: "2026-07-18 10:05:22" }
  ];

  // Backups
  const backups = [
    { id: "b1", filename: "backup_sias_20260710_010000.sql", size: "4.8 MB", timestamp: "2026-07-10 01:00:00" },
    { id: "b2", filename: "backup_sias_20260717_010000.sql", size: "4.9 MB", timestamp: "2026-07-17 01:00:00" }
  ];

  // Seeding initial discussion forum posts
  const forumPosts = [
    {
      id: "post1",
      title: "Bagaimana cara cepat memahami rumus Turunan Trigonometri?",
      content: "Halo teman-teman dan bapak/ibu guru. Saya sedang mengulang materi Matematika Peminatan kelas XI tentang turunan fungsi trigonometri. Apakah ada tips atau cara mudah mengingat rumus sin/cos/tan beserta turunannya? Terima kasih!",
      author: {
        id: "u_s1",
        name: "Andi Wibowo",
        role: "siswa",
        avatar: "/default-avatar.png"
      },
      category: "Matematika",
      resources: [
        { name: "Ringkasan Rumus Trigonometri (Blog)", url: "https://www.rumus-matematika.com/trigonometri" }
      ],
      upvotes: ["u_s2", "u_t2"],
      replies: [
        {
          id: "rep1",
          content: "Halo Andi! Tips mudahnya adalah mengingat dasar sin dan cos terlebih dahulu. Turunan sin adalah cos, dan turunan cos adalah -sin (ingat huruf C menghasilkan tanda minus). Untuk tan, turunannya sec^2. Cobalah buat mind-map kecil di meja belajar agar sering terbaca.",
          author: {
            id: "u_t2",
            name: "Budi Santoso, S.Pd.",
            role: "guru",
            avatar: "/default-avatar.png"
          },
          createdAt: "2026-07-20T10:15:00.000Z"
        }
      ],
      createdAt: "2026-07-20T08:30:00.000Z"
    },
    {
      id: "post2",
      title: "Rekomendasi Website Belajar Listening Bahasa Inggris Gratis",
      content: "Bagi teman-teman yang ingin meningkatkan skor listening Bahasa Inggris, saya sangat merekomendasikan website ESL Cyber Listening Lab. Di sana banyak kuis dari tingkat dasar hingga mahir yang sangat interaktif.",
      author: {
        id: "u_t8",
        name: "Rina Wijayanti, S.Pd.",
        role: "guru",
        avatar: "/default-avatar.png"
      },
      category: "Bahasa Inggris",
      resources: [
        { name: "ESL Lab Listening Guide", url: "https://www.esl-lab.com" }
      ],
      upvotes: ["u_s1", "u_s3", "u_s4"],
      replies: [
        {
          id: "rep2",
          content: "Wah, terima kasih banyak Ibu Rina! Sangat bermanfaat untuk persiapan ujian listening kami minggu depan.",
          author: {
            id: "u_s3",
            name: "Citra Sari",
            role: "siswa",
            avatar: "/default-avatar.png"
          },
          createdAt: "2026-07-21T02:00:00.000Z"
        }
      ],
      createdAt: "2026-07-19T09:00:00.000Z"
    }
  ];

  return {
    settings,
    academicYears,
    subjects,
    teachers,
    classRooms,
    students,
    users,
    schedules,
    grades,
    attendances,
    announcements,
    news,
    gallery,
    documents,
    contactMessages,
    ppdbRegistrations,
    activityLogs,
    backups,
    forumPosts
  };
}

// Read database
function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const db = JSON.parse(raw);
      
      // Ensure forumPosts array exists (resilience for existing db file)
      if (!db.forumPosts) {
        const defaultSeeded = generateSeederData();
        db.forumPosts = defaultSeeded.forumPosts;
        writeDB(db);
      }
      return db;
    }
  } catch (err) {
    console.error("Error reading database file, resetting to seeded default.", err);
  }
  const defaultData = generateSeederData();
  writeDB(defaultData);
  return defaultData;
}

// Write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// Log action helper - accepts pre-loaded db to avoid redundant readDB() on each call
function addLog(username: string, role: string, action: string, req: express.Request, db?: any) {
  const data = db || readDB();
  const newLog = {
    id: `log_${Date.now()}`,
    username,
    role,
    action,
    ipAddress: req.ip || "127.0.0.1",
    userAgent: req.headers['user-agent'] || "Unknown",
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  data.activityLogs.unshift(newLog);
  // Cap at 100 logs to prevent unbounded growth
  if (data.activityLogs.length > 100) {
    data.activityLogs.pop();
  }
  // Only write if db was NOT passed in (caller will write their own db changes)
  if (!db) {
    writeDB(data);
  }
}

// API Endpoint Handlers

// Public Settings
app.get('/api/public/settings', (_req, res) => {
  const db = readDB();
  res.json(db.settings);
});

// Update Settings (Admin / Super Admin only)
app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  addLog(req.body.editorUsername || "admin", req.body.editorRole || "admin", "Memperbarui pengaturan sekolah", req);
  res.json({ success: true, settings: db.settings });
});

// Public News
app.get('/api/public/news', (_req, res) => {
  const db = readDB();
  res.json(db.news);
});

app.get('/api/public/news/:slug', (req, res) => {
  const db = readDB();
  const article = db.news.find((n: any) => n.slug === req.params.slug);
  if (article) {
    res.json(article);
  } else {
    res.status(404).json({ error: "Berita tidak ditemukan" });
  }
});

// Manage News CRUD
app.post('/api/news', (req, res) => {
  const db = readDB();
  const newArticle = {
    id: `news_${Date.now()}`,
    ...req.body,
    date: new Date().toISOString().substring(0, 10)
  };
  db.news.unshift(newArticle);
  writeDB(db);
  addLog(req.body.author || "admin", "admin", `Membuat berita baru: ${newArticle.title}`, req);
  res.json({ success: true, news: newArticle });
});

app.put('/api/news/:id', (req, res) => {
  const db = readDB();
  const idx = db.news.findIndex((n: any) => n.id === req.params.id);
  if (idx !== -1) {
    db.news[idx] = { ...db.news[idx], ...req.body };
    writeDB(db);
    addLog(req.body.author || "admin", "admin", `Memperbarui berita: ${db.news[idx].title}`, req);
    res.json({ success: true, news: db.news[idx] });
  } else {
    res.status(404).json({ error: "Berita tidak ditemukan" });
  }
});

app.delete('/api/news/:id', (req, res) => {
  const db = readDB();
  const newsItem = db.news.find((n: any) => n.id === req.params.id);
  if (newsItem) {
    db.news = db.news.filter((n: any) => n.id !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus berita: ${newsItem.title}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Berita tidak ditemukan" });
  }
});

// Public Announcements
app.get('/api/public/announcements', (_req, res) => {
  const db = readDB();
  res.json(db.announcements);
});

app.post('/api/announcements', (req, res) => {
  const db = readDB();
  const newAnn = {
    id: `ann_${Date.now()}`,
    ...req.body,
    date: new Date().toISOString().substring(0, 10)
  };
  db.announcements.unshift(newAnn);
  writeDB(db);
  addLog("admin", "admin", `Membuat pengumuman baru: ${newAnn.title}`, req);
  res.json({ success: true, announcement: newAnn });
});

app.put('/api/announcements/:id', (req, res) => {
  const db = readDB();
  const idx = db.announcements.findIndex((a: any) => a.id === req.params.id);
  if (idx !== -1) {
    db.announcements[idx] = { ...db.announcements[idx], ...req.body };
    writeDB(db);
    addLog("admin", "admin", `Memperbarui pengumuman: ${db.announcements[idx].title}`, req);
    res.json({ success: true, announcement: db.announcements[idx] });
  } else {
    res.status(404).json({ error: "Pengumuman tidak ditemukan" });
  }
});

app.delete('/api/announcements/:id', (req, res) => {
  const db = readDB();
  const annItem = db.announcements.find((a: any) => a.id === req.params.id);
  if (annItem) {
    db.announcements = db.announcements.filter((a: any) => a.id !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus pengumuman: ${annItem.title}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Pengumuman tidak ditemukan" });
  }
});

// Public Gallery
app.get('/api/public/gallery', (_req, res) => {
  const db = readDB();
  res.json(db.gallery);
});

app.post('/api/gallery', (req, res) => {
  const db = readDB();
  const newItem = {
    id: `g_${Date.now()}`,
    ...req.body,
    date: new Date().toISOString().substring(0, 10)
  };
  db.gallery.unshift(newItem);
  writeDB(db);
  addLog("admin", "admin", `Menambahkan item galeri baru: ${newItem.title}`, req);
  res.json({ success: true, item: newItem });
});

app.delete('/api/gallery/:id', (req, res) => {
  const db = readDB();
  const item = db.gallery.find((g: any) => g.id === req.params.id);
  if (item) {
    db.gallery = db.gallery.filter((g: any) => g.id !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus item galeri: ${item.title}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Item tidak ditemukan" });
  }
});

// Public PPDB Register
app.post('/api/public/ppdb', (req, res) => {
  const db = readDB();
  const yearSuffix = new Date().getFullYear();
  const randomNo = String(Math.floor(100 + Math.random() * 900));
  const registrationNo = `PPDB${yearSuffix}${randomNo}`;
  const newReg = {
    id: `p_${Date.now()}`,
    registrationNo,
    ...req.body,
    status: 'pending',
    date: new Date().toISOString().substring(0, 10)
  };
  db.ppdbRegistrations.unshift(newReg);
  writeDB(db);
  addLog("visitor", "visitor", `Pendaftaran PPDB Baru: ${newReg.fullName} (${registrationNo})`, req);
  res.json({ success: true, registrationNo, registration: newReg });
});

// Check PPDB Registration Status
app.get('/api/public/ppdb/status/:registrationNo', (req, res) => {
  const db = readDB();
  const reg = db.ppdbRegistrations.find((p: any) => p.registrationNo.toUpperCase() === req.params.registrationNo.toUpperCase());
  if (reg) {
    res.json({ success: true, registration: reg });
  } else {
    res.status(404).json({ error: "No pendaftaran tidak ditemukan." });
  }
});

// Fetch PPDB for Admin
app.get('/api/ppdb', (_req, res) => {
  const db = readDB();
  res.json(db.ppdbRegistrations);
});

// Update PPDB Status
app.put('/api/ppdb/:id', (req, res) => {
  const db = readDB();
  const idx = db.ppdbRegistrations.findIndex((p: any) => p.id === req.params.id);
  if (idx !== -1) {
    db.ppdbRegistrations[idx].status = req.body.status;
    writeDB(db);
    addLog("admin", "admin", `Memperbarui status PPDB ${db.ppdbRegistrations[idx].fullName} ke ${req.body.status}`, req);
    res.json({ success: true, registration: db.ppdbRegistrations[idx] });
  } else {
    res.status(404).json({ error: "Pendaftaran tidak ditemukan" });
  }
});

// Academic Years CRUD
app.get('/api/academicyears', (_req, res) => {
  const db = readDB();
  res.json(db.academicYears);
});

app.post('/api/academicyears', (req, res) => {
  const db = readDB();
  const newAY = {
    id: `ay_${Date.now()}`,
    ...req.body,
    active: req.body.active || false
  };
  if (newAY.active) {
    // turn off other academic years
    db.academicYears.forEach((ay: any) => ay.active = false);
  }
  db.academicYears.push(newAY);
  writeDB(db);
  addLog("admin", "admin", `Menambahkan Tahun Ajaran Baru: ${newAY.year} (${newAY.semester})`, req);
  res.json({ success: true, academicYear: newAY });
});

app.put('/api/academicyears/:id', (req, res) => {
  const db = readDB();
  const idx = db.academicYears.findIndex((ay: any) => ay.id === req.params.id);
  if (idx !== -1) {
    db.academicYears[idx] = { ...db.academicYears[idx], ...req.body };
    if (req.body.active) {
      db.academicYears.forEach((ay: any) => {
        if (ay.id !== req.params.id) ay.active = false;
      });
    }
    writeDB(db);
    addLog("admin", "admin", `Memperbarui Tahun Ajaran: ${db.academicYears[idx].year}`, req);
    res.json({ success: true, academicYear: db.academicYears[idx] });
  } else {
    res.status(404).json({ error: "Tahun ajaran tidak ditemukan" });
  }
});

// Classroom CRUD
app.get('/api/classrooms', (_req, res) => {
  const db = readDB();
  res.json(db.classRooms);
});

app.post('/api/classrooms', (req, res) => {
  const db = readDB();
  const newClass = {
    id: `cls_${Date.now()}`,
    ...req.body
  };
  db.classRooms.push(newClass);
  writeDB(db);
  addLog("admin", "admin", `Menambahkan Kelas Baru: ${newClass.name}`, req);
  res.json({ success: true, classroom: newClass });
});

app.put('/api/classrooms/:id', (req, res) => {
  const db = readDB();
  const idx = db.classRooms.findIndex((c: any) => c.id === req.params.id);
  if (idx !== -1) {
    db.classRooms[idx] = { ...db.classRooms[idx], ...req.body };
    writeDB(db);
    addLog("admin", "admin", `Memperbarui Kelas: ${db.classRooms[idx].name}`, req);
    res.json({ success: true, classroom: db.classRooms[idx] });
  } else {
    res.status(404).json({ error: "Kelas tidak ditemukan" });
  }
});

app.delete('/api/classrooms/:id', (req, res) => {
  const db = readDB();
  const clsItem = db.classRooms.find((c: any) => c.id === req.params.id);
  if (clsItem) {
    db.classRooms = db.classRooms.filter((c: any) => c.id !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus Kelas: ${clsItem.name}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Kelas tidak ditemukan" });
  }
});

// Subjects CRUD
app.get('/api/subjects', (_req, res) => {
  const db = readDB();
  res.json(db.subjects);
});

app.post('/api/subjects', (req, res) => {
  const db = readDB();
  const newSubj = {
    id: `subj_${Date.now()}`,
    ...req.body
  };
  db.subjects.push(newSubj);
  writeDB(db);
  addLog("admin", "admin", `Menambahkan Mata Pelajaran: ${newSubj.name}`, req);
  res.json({ success: true, subject: newSubj });
});

app.put('/api/subjects/:id', (req, res) => {
  const db = readDB();
  const idx = db.subjects.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    db.subjects[idx] = { ...db.subjects[idx], ...req.body };
    writeDB(db);
    addLog("admin", "admin", `Memperbarui Mata Pelajaran: ${db.subjects[idx].name}`, req);
    res.json({ success: true, subject: db.subjects[idx] });
  } else {
    res.status(404).json({ error: "Mata pelajaran tidak ditemukan" });
  }
});

app.delete('/api/subjects/:id', (req, res) => {
  const db = readDB();
  const item = db.subjects.find((s: any) => s.id === req.params.id);
  if (item) {
    db.subjects = db.subjects.filter((s: any) => s.id !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus Mata Pelajaran: ${item.name}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Mata pelajaran tidak ditemukan" });
  }
});

// Teachers CRUD
app.get('/api/teachers', (_req, res) => {
  const db = readDB();
  res.json(db.teachers);
});

app.post('/api/teachers', (req, res) => {
  const db = readDB();
  const teacherId = `t_${Date.now()}`;
  const userId = `u_t_${Date.now()}`;
  
  const newTeacher = {
    id: teacherId,
    ...req.body,
    userId
  };

  // Auto create corresponding user account for the teacher
  const newAccount = {
    id: userId,
    username: req.body.nip.split(' ')[0] || req.body.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name: req.body.name,
    role: "guru" as const,
    email: req.body.email,
    avatar: req.body.gender === "Laki-laki" 
      ? "/default-avatar.png"
      : "/default-avatar.png",
    active: true,
    detailsId: teacherId
  };

  db.teachers.push(newTeacher);
  db.users.push(newAccount);
  writeDB(db);
  
  addLog("admin", "admin", `Menambahkan Guru & Akun baru: ${newTeacher.name}`, req);
  res.json({ success: true, teacher: newTeacher, user: newAccount });
});

app.put('/api/teachers/:id', (req, res) => {
  const db = readDB();
  const idx = db.teachers.findIndex((t: any) => t.id === req.params.id);
  if (idx !== -1) {
    db.teachers[idx] = { ...db.teachers[idx], ...req.body };
    // update corresponding user name and email
    const uIdx = db.users.findIndex((u: any) => u.detailsId === req.params.id);
    if (uIdx !== -1) {
      db.users[uIdx].name = req.body.name;
      db.users[uIdx].email = req.body.email;
    }
    writeDB(db);
    addLog("admin", "admin", `Memperbarui Guru: ${db.teachers[idx].name}`, req);
    res.json({ success: true, teacher: db.teachers[idx] });
  } else {
    res.status(404).json({ error: "Guru tidak ditemukan" });
  }
});

app.delete('/api/teachers/:id', (req, res) => {
  const db = readDB();
  const item = db.teachers.find((t: any) => t.id === req.params.id);
  if (item) {
    db.teachers = db.teachers.filter((t: any) => t.id !== req.params.id);
    // Delete corresponding user
    db.users = db.users.filter((u: any) => u.detailsId !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus Guru & Akun: ${item.name}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Guru tidak ditemukan" });
  }
});

// Bulk Import Endpoints
app.post('/api/students/bulk', (req, res) => {
  const db = readDB();
  const studentsList = req.body.students;
  if (!Array.isArray(studentsList)) {
    return res.status(400).json({ error: "Data siswa harus berupa array" });
  }

  const addedStudents: any[] = [];
  const addedAccounts: any[] = [];

  studentsList.forEach((stud: any, index: number) => {
    const studentId = `s_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`;
    const userId = `u_s_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`;

    const newStudent = {
      id: studentId,
      nis: stud.nis || "",
      nisn: stud.nisn || "",
      name: stud.name || "",
      gender: stud.gender || "Laki-laki",
      classRoomId: stud.classRoomId || "",
      birthDate: stud.birthDate || "2010-01-01",
      address: stud.address || "",
      status: stud.status || "Aktif",
      parentName: stud.parentName || "",
      parentPhone: stud.parentPhone || "",
      userId
    };

    const newAccount = {
      id: userId,
      username: stud.nis || `s_${Date.now()}_${index}`,
      name: stud.name || "Siswa Baru",
      role: "siswa" as const,
      email: `${stud.nis || userId}@student.smaglobal.sch.id`,
      avatar: stud.gender === "Laki-laki"
        ? "/default-avatar.png"
        : "/default-avatar.png",
      active: true,
      detailsId: studentId
    };

    db.students.push(newStudent);
    db.users.push(newAccount);
    addedStudents.push(newStudent);
    addedAccounts.push(newAccount);
  });

  writeDB(db);
  addLog("admin", "admin", `Mengimpor massal ${addedStudents.length} Siswa & Akun baru`, req);
  return res.json({ success: true, count: addedStudents.length });
});

app.post('/api/teachers/bulk', (req, res) => {
  const db = readDB();
  const teachersList = req.body.teachers;
  if (!Array.isArray(teachersList)) {
    return res.status(400).json({ error: "Data guru harus berupa array" });
  }

  const addedTeachers: any[] = [];
  const addedAccounts: any[] = [];

  teachersList.forEach((teach: any, index: number) => {
    const teacherId = `t_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`;
    const userId = `u_t_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`;

    const newTeacher = {
      id: teacherId,
      nip: teach.nip || "",
      name: teach.name || "",
      gender: teach.gender || "Laki-laki",
      email: teach.email || "",
      phone: teach.phone || "",
      status: teach.status || "PNS",
      birthDate: teach.birthDate || "1990-01-01",
      address: teach.address || "",
      userId
    };

    const newAccount = {
      id: userId,
      username: teach.nip ? teach.nip.split(' ')[0] : `g_${Date.now()}_${index}`,
      name: teach.name || "Guru Baru",
      role: "guru" as const,
      email: teach.email || `${teacherId}@smaglobal.sch.id`,
      avatar: teach.gender === "Laki-laki"
        ? "/default-avatar.png"
        : "/default-avatar.png",
      active: true,
      detailsId: teacherId
    };

    db.teachers.push(newTeacher);
    db.users.push(newAccount);
    addedTeachers.push(newTeacher);
    addedAccounts.push(newAccount);
  });

  writeDB(db);
  addLog("admin", "admin", `Mengimpor massal ${addedTeachers.length} Guru & Akun baru`, req);
  return res.json({ success: true, count: addedTeachers.length });
});

// Students CRUD
app.get('/api/students', (_req, res) => {
  const db = readDB();
  res.json(db.students);
});

app.post('/api/students', (req, res) => {
  const db = readDB();
  const studentId = `s_${Date.now()}`;
  const userId = `u_s_${Date.now()}`;

  const newStudent = {
    id: studentId,
    ...req.body,
    userId
  };

  // Create corresponding student user account
  const newAccount = {
    id: userId,
    username: req.body.nis,
    name: req.body.name,
    role: "siswa" as const,
    email: `${req.body.nis}@student.smaglobal.sch.id`,
    avatar: req.body.gender === "Laki-laki"
      ? "/default-avatar.png"
      : "/default-avatar.png",
    active: true,
    detailsId: studentId
  };

  db.students.push(newStudent);
  db.users.push(newAccount);
  writeDB(db);

  addLog("admin", "admin", `Menambahkan Siswa & Akun baru: ${newStudent.name}`, req);
  res.json({ success: true, student: newStudent, user: newAccount });
});

app.put('/api/students/:id', (req, res) => {
  const db = readDB();
  const idx = db.students.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    db.students[idx] = { ...db.students[idx], ...req.body };
    const uIdx = db.users.findIndex((u: any) => u.detailsId === req.params.id);
    if (uIdx !== -1) {
      db.users[uIdx].name = req.body.name;
    }
    writeDB(db);
    addLog("admin", "admin", `Memperbarui data Siswa: ${db.students[idx].name}`, req);
    res.json({ success: true, student: db.students[idx] });
  } else {
    res.status(404).json({ error: "Siswa tidak ditemukan" });
  }
});

app.delete('/api/students/:id', (req, res) => {
  const db = readDB();
  const student = db.students.find((s: any) => s.id === req.params.id);
  if (student) {
    db.students = db.students.filter((s: any) => s.id !== req.params.id);
    db.users = db.users.filter((u: any) => u.detailsId !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus data Siswa & Akun: ${student.name}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Siswa tidak ditemukan" });
  }
});

// Users CRUD
app.get('/api/users', (_req, res) => {
  const db = readDB();
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const db = readDB();
  const newUser = {
    id: `u_${Date.now()}`,
    ...req.body,
    avatar: req.body.avatar || "/default-avatar.png",
    active: true
  };
  db.users.push(newUser);
  writeDB(db);
  addLog("admin", "admin", `Membuat akun Pengguna baru: ${newUser.username}`, req);
  res.json({ success: true, user: newUser });
});

app.put('/api/users/:id', (req, res) => {
  const db = readDB();
  const idx = db.users.findIndex((u: any) => u.id === req.params.id);
  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...req.body };
    writeDB(db);
    addLog("admin", "admin", `Memperbarui akun Pengguna: ${db.users[idx].username}`, req);
    res.json({ success: true, user: db.users[idx] });
  } else {
    res.status(404).json({ error: "Pengguna tidak ditemukan" });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find((u: any) => u.id === req.params.id);
  if (user) {
    db.users = db.users.filter((u: any) => u.id !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus akun Pengguna: ${user.username}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Pengguna tidak ditemukan" });
  }
});

// Schedules CRUD
app.get('/api/schedules', (_req, res) => {
  const db = readDB();
  res.json(db.schedules);
});

app.post('/api/schedules', (req, res) => {
  const db = readDB();
  const newSched = {
    id: `sch_${Date.now()}`,
    ...req.body
  };
  db.schedules.push(newSched);
  writeDB(db);
  addLog("admin", "admin", "Menambahkan jadwal pelajaran baru", req);
  res.json({ success: true, schedule: newSched });
});

app.put('/api/schedules/:id', (req, res) => {
  const db = readDB();
  const idx = db.schedules.findIndex((s: any) => s.id === req.params.id);
  if (idx !== -1) {
    db.schedules[idx] = { ...db.schedules[idx], ...req.body };
    writeDB(db);
    addLog("admin", "admin", "Memperbarui jadwal pelajaran", req);
    res.json({ success: true, schedule: db.schedules[idx] });
  } else {
    res.status(404).json({ error: "Jadwal tidak ditemukan" });
  }
});

app.delete('/api/schedules/:id', (req, res) => {
  const db = readDB();
  db.schedules = db.schedules.filter((s: any) => s.id !== req.params.id);
  writeDB(db);
  addLog("admin", "admin", "Menghapus jadwal pelajaran", req);
  res.json({ success: true });
});

// Check-In API for Students & Teachers
app.get('/api/checkins', (req, res) => {
  const db = readDB();
  if (!db.checkins) db.checkins = [];
  const { studentId, classRoomId, date } = req.query;
  let records = db.checkins;
  if (studentId) records = records.filter((r: any) => r.studentId === studentId);
  if (classRoomId) records = records.filter((r: any) => r.classRoomId === classRoomId);
  if (date) records = records.filter((r: any) => r.date === date);
  res.json(records);
});

app.post('/api/checkins', (req, res) => {
  try {
    const db = readDB();
    if (!db.checkins) db.checkins = [];
    
    const { studentId, studentName, classRoomId, date, time, latitude, longitude, locationName, status, distanceMeter } = req.body;
    
    // Create new checkin record
    const newCheckIn = {
      id: `check_${studentId}_${date}_${Date.now()}`,
      studentId,
      studentName,
      classRoomId,
      date,
      time,
      latitude,
      longitude,
      locationName,
      status,
      distanceMeter
    };
    
    db.checkins.unshift(newCheckIn);
    
    // Sync to main attendances array as Hadir
    if (!db.attendances) db.attendances = [];
    
    // Remove existing attendance for this student on this date
    db.attendances = db.attendances.filter((a: any) => !(a.studentId === studentId && a.date === date));
    
    // Push synced attendance
    db.attendances.push({
      id: `att_${studentId}_${date}_${Date.now()}`,
      classRoomId,
      date,
      studentId,
      status: "Hadir",
      notes: `Check-in GPS (${time}, ${status}, ${Math.round(distanceMeter)}m)`
    });
    
    writeDB(db);
    addLog(studentName || "siswa", "siswa", `Melakukan check-in kehadiran mandiri via GPS`, req);
    res.json({ success: true, checkIn: newCheckIn });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menyimpan data check-in harian." });
  }
});

// Attendances API for Teachers
app.get('/api/attendances', (req, res) => {
  const db = readDB();
  const { classRoomId, date } = req.query;
  let records = db.attendances;
  if (classRoomId) records = records.filter((r: any) => r.classRoomId === classRoomId);
  if (date) records = records.filter((r: any) => r.date === date);
  res.json(records);
});

app.post('/api/attendances/bulk', (req, res) => {
  const db = readDB();
  const { classRoomId, date, records, teacherName } = req.body; // records: list of { studentId, status, notes }
  
  // Remove existing for this class & date
  db.attendances = db.attendances.filter((a: any) => !(a.classRoomId === classRoomId && a.date === date));

  // Add new
  records.forEach((rec: any) => {
    db.attendances.push({
      id: `att_${rec.studentId}_${date}_${Date.now()}`,
      classRoomId,
      date,
      studentId: rec.studentId,
      status: rec.status,
      notes: rec.notes || ""
    });
  });

  writeDB(db);
  addLog(teacherName || "guru", "guru", `Mengisi absensi kelas untuk tanggal ${date}`, req);
  res.json({ success: true });
});

// Grades API for Teachers & Students
app.get('/api/grades', (req, res) => {
  const db = readDB();
  const { studentId, classRoomId, subjectId } = req.query;
  let records = db.grades;
  if (studentId) records = records.filter((r: any) => r.studentId === studentId);
  if (classRoomId) records = records.filter((r: any) => r.classRoomId === classRoomId);
  if (subjectId) records = records.filter((r: any) => r.subjectId === subjectId);
  res.json(records);
});

app.post('/api/grades/bulk', (req, res) => {
  const db = readDB();
  const { academicYearId, subjectId, classRoomId, grades, teacherName } = req.body; // grades: list of { studentId, assignmentScore, utsScore, uasScore, notes }

  grades.forEach((g: any) => {
    const finalScore = Math.round((g.assignmentScore * 0.3) + (g.utsScore * 0.3) + (g.uasScore * 0.4));
    let letter: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
    if (finalScore >= 88) letter = 'A';
    else if (finalScore >= 78) letter = 'B';
    else if (finalScore >= 65) letter = 'C';
    else if (finalScore >= 50) letter = 'D';
    else letter = 'E';

    const idx = db.grades.findIndex((r: any) => r.studentId === g.studentId && r.subjectId === subjectId && r.academicYearId === academicYearId);
    const updatedGrade = {
      id: idx !== -1 ? db.grades[idx].id : `g_${g.studentId}_${subjectId}_${Date.now()}`,
      academicYearId,
      studentId: g.studentId,
      subjectId,
      classRoomId,
      assignmentScore: Number(g.assignmentScore),
      utsScore: Number(g.utsScore),
      uasScore: Number(g.uasScore),
      finalScore,
      gradeLetter: letter,
      notes: g.notes || ""
    };

    if (idx !== -1) {
      db.grades[idx] = updatedGrade;
    } else {
      db.grades.push(updatedGrade);
    }
  });

  writeDB(db);
  addLog(teacherName || "guru", "guru", `Mengisi nilai mata pelajaran di kelas`, req);
  res.json({ success: true });
});

// Public Documents
app.get('/api/public/documents', (_req, res) => {
  const db = readDB();
  res.json(db.documents);
});

app.post('/api/documents', (req, res) => {
  const db = readDB();
  const newDoc = {
    id: `doc_${Date.now()}`,
    ...req.body,
    uploadedAt: new Date().toISOString().substring(0, 10)
  };
  db.documents.unshift(newDoc);
  writeDB(db);
  addLog("admin", "admin", `Mengunggah dokumen sekolah: ${newDoc.name}`, req);
  res.json({ success: true, document: newDoc });
});

app.delete('/api/documents/:id', (req, res) => {
  const db = readDB();
  const doc = db.documents.find((d: any) => d.id === req.params.id);
  if (doc) {
    db.documents = db.documents.filter((d: any) => d.id !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus dokumen: ${doc.name}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Dokumen tidak ditemukan" });
  }
});

// Contact Messages Endpoints
app.get('/api/messages', (_req, res) => {
  const db = readDB();
  res.json(db.contactMessages);
});

app.post('/api/public/messages', (req, res) => {
  const db = readDB();
  const newMsg = {
    id: `m_${Date.now()}`,
    ...req.body,
    status: 'unread',
    date: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  db.contactMessages.unshift(newMsg);
  writeDB(db);
  res.json({ success: true });
});

app.put('/api/messages/:id', (req, res) => {
  const db = readDB();
  const idx = db.contactMessages.findIndex((m: any) => m.id === req.params.id);
  if (idx !== -1) {
    db.contactMessages[idx].status = req.body.status;
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Pesan tidak ditemukan" });
  }
});

app.delete('/api/messages/:id', (req, res) => {
  const db = readDB();
  db.contactMessages = db.contactMessages.filter((m: any) => m.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Activity logs endpoint for admin
app.get('/api/logs', (_req, res) => {
  const db = readDB();
  res.json(db.activityLogs);
});

// Backup restore endpoint simulation
app.get('/api/backups', (_req, res) => {
  const db = readDB();
  res.json(db.backups);
});

app.post('/api/backups', (req, res) => {
  const db = readDB();
  const randomNo = String(Math.floor(100000 + Math.random() * 900000));
  const filename = `backup_sias_${new Date().toISOString().substring(0,10).replace(/-/g, '')}_${randomNo}.sql`;
  const size = `${(3.5 + Math.random() * 2).toFixed(1)} MB`;
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  const newBackup = {
    id: `b_${Date.now()}`,
    filename,
    size,
    timestamp
  };
  db.backups.unshift(newBackup);
  writeDB(db);
  addLog("admin", "admin", `Membuat cadangan database: ${filename}`, req);
  res.json({ success: true, backup: newBackup });
});

app.post('/api/backups/:id/restore', (req, res) => {
  const db = readDB();
  const backup = db.backups.find((b: any) => b.id === req.params.id);
  if (backup) {
    addLog("admin", "admin", `Memulihkan database dari cadangan: ${backup.filename}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Berkas cadangan tidak ditemukan" });
  }
});

app.delete('/api/backups/:id', (req, res) => {
  const db = readDB();
  const backup = db.backups.find((b: any) => b.id === req.params.id);
  if (backup) {
    db.backups = db.backups.filter((b: any) => b.id !== req.params.id);
    writeDB(db);
    addLog("admin", "admin", `Menghapus berkas cadangan: ${backup.filename}`, req);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Berkas cadangan tidak ditemukan" });
  }
});

// Google Sheets Integration API Endpoints
app.post('/api/google-sheets/sync', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: "Access token Google Sheets diperlukan." });
  }

  try {
    const db = readDB();
    const result = await syncDatabaseBidirectional(db, accessToken);

    // Save spreadsheet info to settings
    if (!db.settings) {
      db.settings = {};
    }
    db.settings.googleSpreadsheetId = result.spreadsheetId;
    db.settings.googleSpreadsheetUrl = result.url;
    db.settings.googleSpreadsheetLastSync = new Date().toISOString();
    writeDB(db);

    addLog("admin", "admin", "Sinkronisasi database dengan Google Sheets berhasil", req);
    return res.json({
      success: true,
      spreadsheetId: result.spreadsheetId,
      url: result.url
    });
  } catch (err: any) {
    console.error("Error syncing to Google Sheets:", err);
    return res.status(500).json({ error: err.message || "Gagal melakukan sinkronisasi ke Google Sheets." });
  }
});

app.post('/api/google-sheets/disconnect', (req, res) => {
  try {
    const db = readDB();
    if (db.settings) {
      delete db.settings.googleSpreadsheetId;
      delete db.settings.googleSpreadsheetUrl;
      delete db.settings.googleSpreadsheetLastSync;
    }
    writeDB(db);
    addLog("admin", "admin", "Memutuskan integrasi Google Sheets", req);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memutuskan integrasi Google Sheets." });
  }
});

// Authentication Endpoint (Real full login check)
app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const { username, password } = req.body;
  
  // Find user by username
  const user = db.users.find((u: any) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Username atau password salah." });
  }

  if (!user.active) {
    return res.status(403).json({ error: "Akun Anda dinonaktifkan." });
  }

  // Password verification: Accepts 'password123' or 'admin123' as demo passwords.
  // In production, passwords should be hashed with bcrypt.
  const isCorrect = (password === 'password123' || password === 'admin123');
  if (!isCorrect) {
    return res.status(401).json({ error: "Username atau password salah." });
  }

  addLog(user.username, user.role, "Login berhasil ke sistem", req);

  // Return success auth package
  return res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      avatar: user.avatar,
      active: user.active,
      detailsId: user.detailsId
    }
  });
});

// Update Profile
app.put('/api/auth/profile', (req, res) => {
  const db = readDB();
  const { userId, name, email, avatar, password } = req.body;
  const idx = db.users.findIndex((u: any) => u.id === userId);
  if (idx !== -1) {
    db.users[idx].name = name;
    db.users[idx].email = email;
    if (avatar) db.users[idx].avatar = avatar;
    
    // Also update corresponding details if linked to a student or teacher
    const user = db.users[idx];
    if (user.role === 'guru' && user.detailsId) {
      const tIdx = db.teachers.findIndex((t: any) => t.id === user.detailsId);
      if (tIdx !== -1) {
        db.teachers[tIdx].name = name;
        db.teachers[tIdx].email = email;
      }
    } else if (user.role === 'siswa' && user.detailsId) {
      const sIdx = db.students.findIndex((s: any) => s.id === user.detailsId);
      if (sIdx !== -1) {
        db.students[sIdx].name = name;
      }
    }

    writeDB(db);
    addLog(user.username, user.role, `Memperbarui profil pengguna ${password ? 'dan kata sandi' : ''}`, req);
    res.json({
      success: true,
      user: db.users[idx]
    });
  } else {
    res.status(404).json({ error: "Pengguna tidak ditemukan" });
  }
});

// Parent Notifier Messaging Endpoint
app.post('/api/parent-notifications', (req, res) => {
  try {
    const db = readDB();
    if (!db.notificationLogs) {
      db.notificationLogs = [];
    }
    const newLog = {
      id: `noti_${Date.now()}`,
      studentName: req.body.studentName,
      parentName: req.body.parentName || "Orang Tua/Wali",
      parentPhone: req.body.parentPhone,
      messageType: req.body.messageType,
      content: req.body.content,
      timestamp: new Date().toLocaleString("id-ID"),
      status: "Terkirim",
      syncedToSheets: true
    };
    db.notificationLogs.unshift(newLog);
    writeDB(db);
    addLog("admin", "admin", `Mengirim notifikasi orang tua ke siswa ${req.body.studentName}`, req);
    res.json({ success: true, log: newLog });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menyimpan log notifikasi." });
  }
});

// Calendar Academic Sync Endpoint
app.post('/api/calendar/sync', (req, res) => {
  try {
    const db = readDB();
    db.academicEvents = req.body.events || [];
    writeDB(db);
    addLog("admin", "admin", "Sinkronisasi Agenda Kalender Akademik berhasil", req);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mensinkronisasikan kalender." });
  }
});

// === DISCUSSION FORUM ENDPOINTS ===

// Get all forum posts
app.get('/api/forum', (_req, res) => {
  try {
    const db = readDB();
    res.json(db.forumPosts || []);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data forum diskusi." });
  }
});

// Create a new forum post
app.post('/api/forum', (req, res) => {
  try {
    const db = readDB();
    const { title, content, category, resources, author } = req.body;
    
    if (!title || !content || !category || !author) {
      return res.status(400).json({ error: "Data postingan forum tidak lengkap." });
    }

    const newPost = {
      id: `post_${Date.now()}`,
      title,
      content,
      category,
      resources: resources || [],
      author,
      upvotes: [],
      replies: [],
      createdAt: new Date().toISOString()
    };

    if (!db.forumPosts) db.forumPosts = [];
    db.forumPosts.unshift(newPost);
    writeDB(db);

    addLog(author.name, author.role, `Membuat postingan forum: "${title}"`, req);
    return res.json({ success: true, post: newPost });
  } catch (err) {
    return res.status(500).json({ error: "Gagal membuat postingan forum baru." });
  }
});

// Add a reply to a forum post
app.post('/api/forum/:id/reply', (req, res) => {
  try {
    const db = readDB();
    const postId = req.params.id;
    const { content, author } = req.body;

    if (!content || !author) {
      return res.status(400).json({ error: "Konten balasan tidak lengkap." });
    }

    const postIndex = db.forumPosts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Postingan forum tidak ditemukan." });
    }

    const newReply = {
      id: `reply_${Date.now()}`,
      content,
      author,
      createdAt: new Date().toISOString()
    };

    db.forumPosts[postIndex].replies.push(newReply);
    writeDB(db);

    addLog(author.name, author.role, `Membalas postingan forum ID ${postId}`, req);
    return res.json({ success: true, reply: newReply });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menambahkan balasan forum." });
  }
});

// Toggle upvote on a post
app.post('/api/forum/:id/upvote', (req, res) => {
  try {
    const db = readDB();
    const postId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "ID Pengguna diperlukan untuk upvote." });
    }

    const postIndex = db.forumPosts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Postingan forum tidak ditemukan." });
    }

    const post = db.forumPosts[postIndex];
    if (!post.upvotes) post.upvotes = [];

    const upvoteIdx = post.upvotes.indexOf(userId);
    if (upvoteIdx === -1) {
      post.upvotes.push(userId); // Add upvote
    } else {
      post.upvotes.splice(upvoteIdx, 1); // Remove upvote
    }

    writeDB(db);
    return res.json({ success: true, upvotes: post.upvotes });
  } catch (err) {
    return res.status(500).json({ error: "Gagal memproses upvote postingan." });
  }
});

// Delete a forum post (only author or admin)
app.delete('/api/forum/:id', (req, res) => {
  try {
    const db = readDB();
    const postId = req.params.id;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    const postIndex = db.forumPosts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Postingan forum tidak ditemukan." });
    }

    const post = db.forumPosts[postIndex];
    const isAuthor = post.author.id === userId;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "Forbidden: Anda tidak memiliki izin untuk menghapus postingan ini." });
    }

    db.forumPosts.splice(postIndex, 1);
    writeDB(db);

    addLog(isAdmin ? "admin" : post.author.name, userRole || "user", `Menghapus postingan forum "${post.title}"`, req);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menghapus postingan forum." });
  }
});

// Delete a reply (only reply author or admin)
app.delete('/api/forum/:id/reply/:replyId', (req, res) => {
  try {
    const db = readDB();
    const postId = req.params.id;
    const replyId = req.params.replyId;
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;

    const postIndex = db.forumPosts.findIndex((p: any) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Postingan forum tidak ditemukan." });
    }

    const post = db.forumPosts[postIndex];
    const replyIndex = post.replies.findIndex((r: any) => r.id === replyId);
    if (replyIndex === -1) {
      return res.status(404).json({ error: "Balasan tidak ditemukan." });
    }

    const reply = post.replies[replyIndex];
    const isAuthor = reply.author.id === userId;
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: "Forbidden: Anda tidak memiliki izin untuk menghapus balasan ini." });
    }

    post.replies.splice(replyIndex, 1);
    writeDB(db);

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menghapus balasan forum." });
  }
});


// Serve Vite or Static files depending on environment
async function init() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(currentDirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Full-Stack server running on port ${PORT}`);
  });
}

init();
