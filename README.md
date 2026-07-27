# 🎓 SIAS — Sistem Informasi Akademik Sekolah

> **Versi:** 1.0.0
> **Platform:** Full-Stack TypeScript · React · Vite · Express
> **Lisensi:** MIT

---

## 📋 Daftar Isi

1. [Deskripsi Proyek](#-deskripsi-proyek)
2. [Fitur Utama](#-fitur-utama)
3. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
4. [Arsitektur Sistem](#-arsitektur-sistem)
5. [Struktur Folder](#-struktur-folder)
6. [Persyaratan Sistem](#-persyaratan-sistem)
7. [Cara Instalasi](#-cara-instalasi)
8. [Menjalankan Aplikasi](#-menjalankan-aplikasi)
9. [Panduan Konfigurasi](#-panduan-konfigurasi)
10. [Panduan Pengguna](#-panduan-pengguna)
11. [API & Backend Layer](#-api--backend-layer)
12. [Manajemen Data](#-manajemen-data)
13. [Keamanan & Autentikasi](#-keamanan--autentikasi)
14. [Build & Deployment](#-build--deployment)
15. [Kontribusi](#-kontribusi)
16. [Kontak Developer](#-kontak-developer)

---

## 📖 Deskripsi Proyek

**SIAS (Sistem Informasi Akademik Sekolah)** adalah aplikasi web full-stack modern yang dirancang untuk mengelola seluruh proses akademik sekolah menengah atas secara digital, terintegrasi, dan efisien.

Aplikasi ini terdiri dari dua sisi utama:

- **Portal Publik** — Website resmi sekolah yang dapat diakses oleh masyarakat umum, calon siswa, dan orang tua, menampilkan informasi profil sekolah, berita, fasilitas, program unggulan, dan sistem PPDB online.
- **Dashboard Akademik** — Panel manajemen khusus untuk administrator, kepala sekolah, guru, dan siswa, dengan fitur lengkap pengelolaan data akademik, penilaian, jadwal, absensi, laporan, dan komunikasi.

Dibangun mengikuti prinsip arsitektur enterprise:
- ✅ **Clean Architecture** — Pemisahan jelas antara domain, aplikasi, infrastruktur, dan presentasi
- ✅ **Feature-Based Architecture** — Setiap fitur dikelompokkan dalam modul mandiri
- ✅ **Domain-Driven Design (DDD)** — Model data merepresentasikan domain bisnis akademik secara akurat
- ✅ **SOLID & DRY Principles** — Kode yang bersih, tidak repetitif, mudah di-extend
- ✅ **TypeScript Strict Mode** — Type-safety penuh, tanpa penggunaan ny

---

## ✨ Fitur Utama

### 🌐 Portal Publik

| Fitur | Deskripsi |
|---|---|
| **HomeHub** | Hero, statistik, pesan kepsek, program unggulan, testimoni, CTA |
| **AboutHub** | Visi-misi, struktur organisasi, profil guru, akreditasi, prestasi |
| **CampusLifeHub** | Fasilitas, perpustakaan digital, olahraga, seni, ekstrakurikuler |
| **AdmissionHub** | PPDB online, persyaratan, alur pendaftaran, tracker status |
| **ContactHub** | Formulir kontak, peta lokasi, FAQ, pengaduan |
| **Forum Diskusi** | Tanya-jawab, kategori topik, upvote, balasan |

### 📊 Dashboard Akademik

| Modul | Deskripsi |
|---|---|
| **Dashboard Admin** | Statistik sekolah, grafik, aktivitas terbaru |
| **Tahun Ajaran** | CRUD tahun ajaran dan semester aktif |
| **Kelas** | CRUD kelas, tingkat, jurusan, wali kelas |
| **Mata Pelajaran** | CRUD mapel beserta KKM |
| **Guru** | CRUD data guru lengkap (NIP, status, kontak) |
| **Siswa** | CRUD data siswa (NIS, NISN, kelas, orang tua) |
| **Jadwal** | Pembuatan jadwal per kelas, hari, dan jam |
| **Penilaian** | Input dan rekap nilai harian, UTS, UAS |
| **Absensi** | Pencatatan kehadiran siswa per pelajaran |
| **Rapor & Laporan** | Generator rapor PDF, laporan absensi, ekspor data |
| **Pengaturan Sekolah** | Logo, nama, kontak, visi-misi, SEO |
| **Integrasi Spreadsheet** | Sinkronisasi data dengan Google Spreadsheet |

---

## 🛠 Teknologi yang Digunakan

### Frontend

| Teknologi | Versi | Fungsi |
|---|---|---|
| React | ^19.1.0 | Library UI utama |
| TypeScript | ^5.8.3 | Type-safety & developer experience |
| Vite | ^6.4.3 | Build tool & dev server |
| Motion (Framer Motion) | ^12.23.6 | Animasi & transisi halaman |
| Recharts | ^2.15.4 | Grafik & visualisasi data |
| Lucide React | ^0.525.0 | Icon set modern |
| DOMPurify | ^3.2.6 | Sanitasi HTML, cegah XSS |

### Backend

| Teknologi | Versi | Fungsi |
|---|---|---|
| Express.js | ^5.1.0 | HTTP server & REST API |
| tsx | ^4.20.3 | Jalankan TypeScript di Node.js |
| esbuild | ^0.25.5 | Bundler server produksi |

### Tooling & Quality

| Alat | Fungsi |
|---|---|
| ESLint | Linting kode TypeScript/React |
| TypeScript Strict | Type-checking ketat, tanpa ny |
| jsPDF + html2canvas | Generator PDF untuk rapor & laporan |

---

## 🏗 Arsitektur Sistem

`
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                       │
│                                                             │
│   ┌─────────────────┐    ┌───────────────────────────────┐ │
│   │  Portal Publik   │    │     Dashboard Akademik        │ │
│   │  (Public Site)   │    │  (Admin/Guru/Siswa/Ortu)     │ │
│   └────────┬─────────┘    └────────────────┬──────────────┘ │
│            └────────────────┬──────────────┘               │
│                 React + TypeScript + Vite                   │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/REST API
┌─────────────────────────────▼───────────────────────────────┐
│                  EXPRESS.JS API SERVER                       │
│  ┌─────────┐   ┌──────────┐   ┌────────────────────────┐   │
│  │Auth API │   │CRUD APIs │   │  Static File Server    │   │
│  └─────────┘   └────┬─────┘   └────────────────────────┘   │
│                     ▼                                        │
│              src/db/data.json  (File-based DB)              │
└──────────────────────────────────────────────────────────────┘
`

### Layer Penjelasan

| Layer | Lokasi | Tanggung Jawab |
|---|---|---|
| Presentation | src/components/ src/pages/ | Rendering UI, handle event |
| Application | src/hooks/ | Custom hooks, business logic |
| Domain | src/types.ts | Interface & kontrak tipe data |
| Infrastructure | src/core/api/ | HTTP client, komunikasi server |
| Data | src/db/data.json | Penyimpanan data JSON |
| Server | server.ts | Express REST API + static files |

---

## 📁 Struktur Folder

`
sistem-informasi-akademik-sekolah/
│
├── public/                       # Aset statis
│   ├── logo.png                  # Logo sekolah
│   ├── principal.jpg             # Foto kepala sekolah
│   ├── school.jpg                # Foto gedung sekolah
│   ├── facilities.jpg            # Foto fasilitas
│   └── default-avatar.png       # Avatar pengguna default
│
├── src/
│   ├── components/
│   │   ├── dashboard/            # Komponen dashboard akademik
│   │   │   ├── CrudFormModal.tsx # Modal CRUD generik
│   │   │   ├── Sidebar.tsx       # Navigasi sidebar
│   │   │   └── Admin*.tsx        # Halaman CRUD per entitas
│   │   ├── public/               # Komponen portal publik
│   │   │   ├── HomeHub.tsx
│   │   │   ├── AboutHub.tsx
│   │   │   ├── CampusLifeHub.tsx
│   │   │   ├── AdmissionHub.tsx
│   │   │   └── ContactHub.tsx
│   │   ├── DiscussionForum.tsx   # Forum diskusi
│   │   ├── ReportGenerator.tsx   # Generator rapor PDF
│   │   └── ErrorBoundary.tsx     # Error boundary React
│   │
│   ├── core/api/
│   │   └── client.ts             # HTTP client terpusat
│   │
│   ├── hooks/
│   │   ├── useSchoolData.ts      # Hook utama data sekolah
│   │   └── useAuth.ts            # Hook autentikasi
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx         # Halaman dashboard
│   │   ├── Login.tsx             # Halaman login
│   │   └── PublicWebsite.tsx     # Halaman portal publik
│   │
│   ├── services/
│   │   └── auth.service.ts       # Layanan autentikasi
│   │
│   ├── db/
│   │   └── data.json             # Database JSON
│   │
│   ├── types.ts                  # Definisi tipe global
│   └── main.tsx                  # Entry point React
│
├── server.ts                     # Server Express.js
├── vite.config.ts                # Konfigurasi Vite
├── tsconfig.json                 # Konfigurasi TypeScript
├── package.json                  # Dependensi & script npm
└── README.md                     # Dokumentasi ini
`

---

## 💻 Persyaratan Sistem

| Kebutuhan | Versi Minimum |
|---|---|
| Node.js | v18.x atau lebih baru |
| npm | v9.x atau lebih baru |
| RAM | 4 GB (rekomendasi 8 GB) |
| OS | Windows 10+, macOS 12+, Ubuntu 20.04+ |
| Browser | Chrome 100+, Firefox 110+, Edge 100+ |

---

## 🚀 Cara Instalasi

### Langkah 1 — Clone Repositori

`ash
git clone https://github.com/rivanalamsyah/sistem-informasi-akademik-sekolah.git
cd sistem-informasi-akademik-sekolah
`

### Langkah 2 — Instalasi Dependensi

`ash
npm install
`

### Langkah 3 — Verifikasi

`ash
npm run type-check
`

---

## ▶️ Menjalankan Aplikasi

### Mode Pengembangan

`ash
npm run dev
`

Buka: **http://localhost:3000**

### Mode Produksi

`ash
npm run build
node dist/server.mjs
`

### Perintah Lain

`ash
npm run type-check   # Cek TypeScript
npm run lint         # ESLint
npm run lint:fix     # Perbaiki otomatis
`

---

## ⚙️ Panduan Konfigurasi

### Informasi Sekolah (src/db/data.json)

`json
{
  "settings": {
    "name": "Nama Sekolah Anda",
    "logo": "/logo.png",
    "phone": "(021) 000-0000",
    "email": "info@sekolah.sch.id",
    "address": "Alamat lengkap sekolah",
    "principalName": "Nama Kepala Sekolah",
    "principalImage": "/principal.jpg",
    "seoTitle": "Judul SEO Sekolah"
  }
}
`

### Mengganti Gambar

| File | Ukuran | Keterangan |
|---|---|---|
| public/logo.png | 200×200 px | Logo/emblem sekolah |
| public/principal.jpg | 400×400 px | Foto kepala sekolah |
| public/school.jpg | 1200×800 px | Foto gedung/kampus |
| public/facilities.jpg | 800×600 px | Foto fasilitas |
| public/default-avatar.png | 150×150 px | Avatar pengguna default |

---

## 👥 Panduan Pengguna

### Akun Bawaan untuk Testing

| Role | Username | Password | Akses |
|---|---|---|---|
| Super Admin | dmin | dmin123 | Akses penuh |
| Kepala Sekolah | kepala | kepala123 | Laporan & statistik |
| Guru | guru001 | guru123 | Nilai & absensi |
| Siswa | siswa001 | siswa123 | Nilai & jadwal |
| Orang Tua | ortu001 | ortu123 | Pantau perkembangan |

> ⚠️ Segera ganti password sebelum deploy ke produksi!

### Alur Administrator

1. Login → **Tahun Ajaran** (buat tahun ajaran aktif)
2. **Kelas** → tambah kelas dan jurusan
3. **Mata Pelajaran** → tambah mapel + KKM
4. **Guru** → input data seluruh guru
5. **Siswa** → input data seluruh siswa
6. **Jadwal** → susun jadwal pelajaran
7. **Penilaian** → input nilai per semester
8. **Rapor** → cetak rapor PDF akhir semester

---

## 🔌 API & Backend Layer

### Endpoint Utama

`
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET/POST/PUT/DELETE   /api/settings
GET/POST/PUT/DELETE   /api/academic-years
GET/POST/PUT/DELETE   /api/classrooms
GET/POST/PUT/DELETE   /api/subjects
GET/POST/PUT/DELETE   /api/teachers
GET/POST/PUT/DELETE   /api/students
GET/POST/PUT/DELETE   /api/schedules
GET/POST/PUT/DELETE   /api/grades
GET/POST/PUT/DELETE   /api/attendances
GET/POST/PUT/DELETE   /api/news
`

### Format Respons

`json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Pesan error" }
`

---

## 🗄 Manajemen Data

Database berbasis file JSON di src/db/data.json.

### Backup Manual

`ash
copy src\db\data.json src\db\backup_20260727.json
`

### Struktur Data Utama

`json
{
  "settings": {},
  "users": [],
  "academicYears": [],
  "classRooms": [],
  "subjects": [],
  "teachers": [],
  "students": [],
  "schedules": [],
  "grades": [],
  "attendances": [],
  "news": [],
  "forumPosts": [],
  "ppdbApplications": []
}
`

---

## 🔒 Keamanan & Autentikasi

- **Session-based auth** dengan cookie HTTP-only
- **Role-based access control (RBAC)** — 5 level pengguna
- **DOMPurify** — sanitasi input HTML, cegah XSS
- **TypeScript strict** — keamanan tipe di seluruh aplikasi
- Validasi input di sisi client dan server

### Rekomendasi Produksi

- Aktifkan HTTPS dengan sertifikat SSL/TLS
- Gunakan reverse proxy Nginx di depan Express
- Simpan secret di environment variables
- Jalankan 
pm audit secara berkala

---

## 🚢 Build & Deployment

`ash
# Build produksi
npm run build

# Jalankan dengan PM2
npm install -g pm2
pm2 start dist/server.mjs --name "sias-akademik"
pm2 save && pm2 startup
`

### Output Build

`
dist/
├── index.html
├── assets/        # CSS & JS ter-bundle
├── server.mjs     # Server Express produksi
└── server.mjs.map
`

---

## 🤝 Kontribusi

1. **Fork** repositori ini
2. Buat branch: git checkout -b fitur/nama-fitur
3. Commit: git commit -m "feat: tambah fitur X"
4. Push: git push origin fitur/nama-fitur
5. Buka **Pull Request**

### Standar Kode

- Hindari ny — gunakan tipe eksplisit
- Ikuti konvensi penamaan yang ada
- Pastikan 
pm run lint dan 
pm run type-check bersih

---

## 📞 Kontak Developer

Proyek ini dikembangkan oleh:

**Rivan Alamsyah** — *Full-Stack Developer & Software Architect*

| Platform | Informasi |
|---|---|
| 📧 Email | alamsyahrivan14@gmail.com |
| 🐙 GitHub | https://github.com/rivanalamsyah |

---

## 📄 Lisensi

MIT License — Copyright (c) 2025 Rivan Alamsyah

Izin diberikan secara gratis kepada siapa saja yang mendapatkan salinan perangkat lunak ini untuk digunakan, disalin, dimodifikasi, digabungkan, diterbitkan, didistribusikan, disublisensikan, dan/atau dijual, dengan syarat pemberitahuan hak cipta di atas dan izin ini disertakan dalam semua salinan.

---

*Dibuat dengan ❤️ oleh Rivan Alamsyah — Mendukung transformasi digital pendidikan Indonesia*
