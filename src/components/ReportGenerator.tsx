import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FileText, Printer, Download, School, User, 
  Calendar, AlertCircle, CheckCircle, ShieldCheck,
  FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import { Student, ClassRoom, Teacher, Subject, Grade, Attendance, SchoolSettings, AcademicYear, User as UserType } from "../types";
import { ReportContentSkeleton } from "./Skeleton";

interface ReportGeneratorProps {
  students: Student[];
  classRooms: ClassRoom[];
  teachers: Teacher[];
  subjects: Subject[];
  settings: SchoolSettings | null;
  academicYears: AcademicYear[];
  userRole: string;
  attendances?: Attendance[];
}

export function ReportGenerator({
  students,
  classRooms,
  teachers,
  subjects,
  settings,
  academicYears,
  userRole,
  attendances = []
}: ReportGeneratorProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<Attendance[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [printDate, setPrintDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // CSV Export states for Administrators
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportClassId, setExportClassId] = useState<string>("all");
  const [exportStartDate, setExportStartDate] = useState<string>("");
  const [exportEndDate, setExportEndDate] = useState<string>("");
  const [exportSelectedMonth, setExportSelectedMonth] = useState<string>("07");
  const [exportSelectedYear, setExportSelectedYear] = useState<string>("2026");

  // CSV conversion helpers
  const convertToCSV = (headers: string[], rows: (string | number | boolean)[][]): string => {
    const escapeField = (field: string | number | boolean) => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      headers.map(escapeField).join(','),
      ...rows.map(row => row.map(escapeField).join(','))
    ].join('\r\n');
  };

  const downloadCSVFile = (filename: string, csvContent: string) => {
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportUsersCSV = async () => {
    try {
      setExportLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Gagal mengambil data akun");
      const usersData = await res.json();
      
      const headers = ["ID", "Username", "Nama Lengkap", "Role (Peran)", "Email", "Status Aktif"];
      const rows = usersData.map((u: UserType) => [
        u.id,
        u.username,
        u.name,
        u.role === "super_admin" ? "Super Admin" : u.role === "admin" ? "Admin" : u.role === "guru" ? "Guru" : "Siswa",
        u.email,
        u.active ? "Aktif" : "Nonaktif"
      ]);
      
      const csv = convertToCSV(headers, rows);
      downloadCSVFile("rekap_akun_pengguna_sistem.csv", csv);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengekspor data akun pengguna.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportStudentsCSV = () => {
    try {
      const headers = [
        "ID Siswa",
        "NIS",
        "NISN",
        "Nama Lengkap",
        "Jenis Kelamin",
        "ID Kelas",
        "Nama Kelas",
        "Tanggal Lahir",
        "Alamat",
        "Status",
        "Nama Orang Tua/Wali",
        "No. HP Orang Tua/Wali"
      ];
      
      const rows = students.map(s => {
        const room = classRooms.find(r => r.id === s.classRoomId);
        return [
          s.id,
          s.nis,
          s.nisn,
          s.name,
          s.gender,
          s.classRoomId,
          room ? room.name : "Tidak Diketahui",
          s.birthDate,
          s.address,
          s.status,
          s.parentName,
          s.parentPhone
        ];
      });
      
      const csv = convertToCSV(headers, rows);
      downloadCSVFile("daftar_siswa_lengkap.csv", csv);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportTeachersCSV = () => {
    try {
      const headers = [
        "ID Guru",
        "NIP",
        "Nama Lengkap",
        "Jenis Kelamin",
        "Email",
        "No. HP",
        "Status Kepegawaian",
        "Tanggal Lahir",
        "Alamat"
      ];
      
      const rows = teachers.map(t => [
        t.id,
        t.nip,
        t.name,
        t.gender,
        t.email,
        t.phone,
        t.status,
        t.birthDate,
        t.address
      ]);
      
      const csv = convertToCSV(headers, rows);
      downloadCSVFile("daftar_guru_lengkap.csv", csv);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportAttendanceCSV = () => {
    try {
      // Filter by classroom if selected
      let filteredAtt = [...attendances];
      if (exportClassId !== "all") {
        filteredAtt = filteredAtt.filter(a => a.classRoomId === exportClassId);
      }
      
      // Filter by date range if provided
      if (exportStartDate) {
        filteredAtt = filteredAtt.filter(a => a.date >= exportStartDate);
      }
      if (exportEndDate) {
        filteredAtt = filteredAtt.filter(a => a.date <= exportEndDate);
      }
      
      if (filteredAtt.length === 0) {
        alert("Tidak ada data presensi yang cocok dengan filter yang Anda tentukan.");
        return;
      }
      
      const headers = [
        "ID Presensi",
        "Tanggal",
        "ID Kelas",
        "Nama Kelas",
        "ID Siswa",
        "NIS",
        "Nama Siswa",
        "Status Kehadiran",
        "Catatan / Keterangan"
      ];
      
      const rows = filteredAtt.map(a => {
        const room = classRooms.find(r => r.id === a.classRoomId);
        const student = students.find(s => s.id === a.studentId);
        return [
          a.id,
          a.date,
          a.classRoomId,
          room ? room.name : "Tidak Diketahui",
          a.studentId,
          student ? student.nis : "-",
          student ? student.name : "Siswa Terhapus",
          a.status,
          a.notes || ""
        ];
      });
      
      const csv = convertToCSV(headers, rows);
      
      // Construct a clean descriptive filename
      const classNamePart = exportClassId === "all" ? "Semua_Kelas" : (classRooms.find(c => c.id === exportClassId)?.name || "Kelas").replace(/\s+/g, "_");
      const datePart = (exportStartDate && exportEndDate) ? `_${exportStartDate}_sd_${exportEndDate}` : "";
      
      downloadCSVFile(`rekap_kehadiran_${classNamePart}${datePart}.csv`, csv);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportAttendancePDF = () => {
    try {
      let filteredAtt = [...attendances];
      if (exportClassId !== "all") {
        filteredAtt = filteredAtt.filter(a => a.classRoomId === exportClassId);
      }
      if (exportStartDate) {
        filteredAtt = filteredAtt.filter(a => a.date >= exportStartDate);
      }
      if (exportEndDate) {
        filteredAtt = filteredAtt.filter(a => a.date <= exportEndDate);
      }

      if (filteredAtt.length === 0) {
        alert("Tidak ada data presensi yang cocok dengan filter yang Anda tentukan.");
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Kop Surat
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      const schoolName = settings?.name || "SMAN 1 NUSANTARA";
      doc.text(schoolName.toUpperCase(), 105, 18, { align: "center" });

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Alamat: ${settings?.address || 'Jl. Raya Pendidikan No. 10 Jakarta'}`, 105, 23, { align: "center" });
      doc.text(`Telepon: ${settings?.phone || '(021) 555-0199'} | Email: ${settings?.email || 'info@sekolah.sch.id'}`, 105, 27, { align: "center" });

      doc.setLineWidth(0.6);
      doc.line(14, 30, 196, 30);
      doc.setLineWidth(0.2);
      doc.line(14, 31.5, 196, 31.5);

      // Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("LAPORAN REKAPITULASI PRESENSI HARIAN SISWA", 105, 39, { align: "center" });

      // Info
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      const classNamePart = exportClassId === "all" ? "Semua Kelas" : (classRooms.find(c => c.id === exportClassId)?.name || "-");
      doc.text(`Kelas: ${classNamePart}`, 14, 46);
      doc.text(`Periode: ${exportStartDate || 'Semua'} s/d ${exportEndDate || 'Semua'}`, 120, 46);

      // Table Headers
      let y = 54;
      doc.setFillColor(240, 243, 246);
      doc.rect(14, y, 182, 8, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("No", 17, y + 5.5);
      doc.text("Tanggal", 27, y + 5.5);
      doc.text("NIS", 52, y + 5.5);
      doc.text("Nama Siswa", 77, y + 5.5);
      doc.text("Kelas", 137, y + 5.5);
      doc.text("Status", 162, y + 5.5);

      y += 8;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);

      filteredAtt.slice(0, 35).forEach((item, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const student = students.find(s => s.id === item.studentId);
        const room = classRooms.find(r => r.id === item.classRoomId);

        doc.text(`${idx + 1}`, 17, y + 5);
        doc.text(item.date, 27, y + 5);
        doc.text(student?.nis || "-", 52, y + 5);
        doc.text((student?.name || "Siswa").substring(0, 25), 77, y + 5);
        doc.text((room?.name || "-").substring(0, 15), 137, y + 5);
        doc.text(item.status, 162, y + 5);

        doc.setDrawColor(230, 230, 230);
        doc.line(14, y + 7, 196, y + 7);
        y += 7;
      });

      if (filteredAtt.length > 35) {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(8);
        doc.text(`* Menampilkan 35 dari total ${filteredAtt.length} entri presensi. Unduh CSV untuk data lengkap.`, 14, y + 6);
      }

      const safeClassName = classNamePart.replace(/\s+/g, "_");
      doc.save(`laporan_presensi_${safeClassName}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh berkas PDF presensi.");
    }
  };

  const handleExportMonthlyAttendanceSummary = (format: 'excel' | 'csv') => {
    try {
      let classStudents = [...students];
      if (exportClassId !== "all") {
        classStudents = classStudents.filter(s => s.classRoomId === exportClassId);
      }

      if (classStudents.length === 0) {
        alert("Tidak ada data siswa untuk kelas yang dipilih.");
        return;
      }

      // Filter attendance records by selected month and year prefix: YYYY-MM
      const periodPrefix = `${exportSelectedYear}-${exportSelectedMonth}`;
      const periodAttendances = (attendances || []).filter(a => a.date.startsWith(periodPrefix));

      const monthNames: Record<string, string> = {
        "01": "Januari", "02": "Februari", "03": "Maret", "04": "April",
        "05": "Mei", "06": "Juni", "07": "Juli", "08": "Agustus",
        "09": "September", "10": "Oktober", "11": "November", "12": "Desember"
      };
      const monthLabel = monthNames[exportSelectedMonth] || "Bulan";
      const classNameLabel = exportClassId === "all" ? "Semua Kelas" : (classRooms.find(c => c.id === exportClassId)?.name || "Kelas");

      // Compile monthly summary metrics for each student
      const summaryData = classStudents.map((student, index) => {
        const studentAtts = periodAttendances.filter(a => a.studentId === student.id);
        
        const counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 };
        studentAtts.forEach(a => {
          if (counts[a.status] !== undefined) {
            counts[a.status]++;
          }
        });

        const totalDays = studentAtts.length;
        const attendanceRate = totalDays > 0 ? Math.round((counts.Hadir / totalDays) * 100) : 0;
        const classRoom = classRooms.find(r => r.id === student.classRoomId);

        return {
          no: index + 1,
          nis: student.nis,
          name: student.name,
          className: classRoom ? classRoom.name : "-",
          hadir: counts.Hadir,
          sakit: counts.Sakit,
          izin: counts.Izin,
          alpa: counts.Alpa,
          total: totalDays,
          rate: `${attendanceRate}%`
        };
      });

      const headers = [
        "No",
        "NIS",
        "Nama Siswa",
        "Kelas",
        "Hadir",
        "Sakit",
        "Izin",
        "Alpa",
        "Total Hari Presensi",
        "Persentase Kehadiran"
      ];

      const rows = summaryData.map(s => [
        s.no,
        s.nis,
        s.name,
        s.className,
        s.hadir,
        s.sakit,
        s.izin,
        s.alpa,
        s.total,
        s.rate
      ]);

      if (format === 'excel') {
        const wb = XLSX.utils.book_new();
        
        const dataRows: (string | number)[][] = [
          ["REKAPITULASI BULANAN PRESENSI KEHADIRAN SISWA"],
          ["Sekolah: SMAN 1 Nusantara"],
          [`Kelas: ${classNameLabel} | Periode: ${monthLabel} ${exportSelectedYear}`],
          [],
          headers,
          ...rows
        ];

        const ws = XLSX.utils.aoa_to_sheet(dataRows);

        // Auto-fit widths
        const maxColLen: number[] = dataRows.reduce<number[]>((acc, row) => {
          row.forEach((cell, i) => {
            const len = cell ? cell.toString().length : 0;
            if (!acc[i] || len > acc[i]) {
              acc[i] = len;
            }
          });
          return acc;
        }, []);
        ws['!cols'] = maxColLen.map(len => ({ wch: Math.min(Math.max(len + 2, 8), 40) }));

        XLSX.utils.book_append_sheet(wb, ws, "Rekap Bulanan");
        XLSX.writeFile(wb, `rekap_bulanan_presensi_${classNameLabel.replace(/\s+/g, "_")}_${exportSelectedYear}_${exportSelectedMonth}.xlsx`);
      } else {
        const csv = convertToCSV(headers, rows);
        downloadCSVFile(`rekap_bulanan_presensi_${classNameLabel.replace(/\s+/g, "_")}_${exportSelectedYear}_${exportSelectedMonth}.csv`, csv);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengekspor ringkasan presensi bulanan.");
    }
  };

  // Set default class on load
  useEffect(() => {
    if (classRooms.length > 0 && !selectedClassId) {
      if (userRole === "siswa" && students.length > 0) {
        setSelectedClassId(students[0].classRoomId);
      } else {
        setSelectedClassId(classRooms[0].id);
      }
    }
  }, [classRooms, selectedClassId, userRole, students]);

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (userRole === "siswa") return students;
    if (!selectedClassId) return [];
    return students.filter(s => s.classRoomId === selectedClassId);
  }, [students, selectedClassId, userRole]);

  // Auto select first student when class changes
  useEffect(() => {
    if (filteredStudents.length > 0) {
      setSelectedStudentId(filteredStudents[0].id);
    } else {
      setSelectedStudentId("");
    }
  }, [filteredStudents]);

  // Fetch grades and attendance for the selected student
  useEffect(() => {
    if (selectedStudentId) {
      setIsFetching(true);
      const headers: Record<string, string> = {
        "x-user-role": userRole
      };
      
      Promise.all([
        fetch(`/api/grades?studentId=${selectedStudentId}`, { headers }).then(res => {
          if (!res.ok) return [];
          return res.json();
        }),
        fetch(`/api/attendances?studentId=${selectedStudentId}`, { headers }).then(res => {
          if (!res.ok) return [];
          return res.json();
        })
      ])
        .then(([gradesData, attendanceData]) => {
          setStudentGrades(gradesData || []);
          setStudentAttendance(attendanceData || []);
          setIsFetching(false);
        })
        .catch(err => {
          console.error("Error fetching report data:", err);
          setIsFetching(false);
        });
    } else {
      setStudentGrades([]);
      setStudentAttendance([]);
    }
  }, [selectedStudentId, userRole]);

  // Find active academic year
  const activeAY = useMemo(() => {
    return academicYears.find(ay => ay.active) || academicYears[0];
  }, [academicYears]);

  // Selected student details
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Selected class details
  const currentClass = useMemo(() => {
    return classRooms.find(c => c.id === selectedClassId);
  }, [classRooms, selectedClassId]);

  // Homeroom teacher (Wali Kelas) details
  const homeroomTeacher = useMemo(() => {
    if (!currentClass) return null;
    return teachers.find(t => t.id === currentClass.homeroomTeacherId);
  }, [teachers, currentClass]);

  // Calculations for report
  const reportStats = useMemo(() => {
    if (studentGrades.length === 0) return { totalScore: 0, averageScore: 0, passedCount: 0, failedCount: 0 };
    
    let total = 0;
    let passed = 0;
    let failed = 0;

    studentGrades.forEach(g => {
      total += g.finalScore;
      const subj = subjects.find(s => s.id === g.subjectId);
      const kkm = subj?.kkm || 75;
      if (g.finalScore >= kkm) {
        passed++;
      } else {
        failed++;
      }
    });

    const avg = Math.round((total / studentGrades.length) * 10) / 10;

    return {
      totalScore: total,
      averageScore: avg,
      passedCount: passed,
      failedCount: failed
    };
  }, [studentGrades, subjects]);

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 };
    studentAttendance.forEach(a => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      }
    });
    return counts;
  }, [studentAttendance]);

  // Print Rapor as pristine document
  const handlePrintPDF = () => {
    const reportElement = document.getElementById("printable-rapor-card");
    if (!reportElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Fallback: Use direct browser CSS print on current window!
      document.body.classList.add("print-mode-active");
      reportElement.classList.add("print-active-element");
      
      setTimeout(() => {
        window.print();
        document.body.classList.remove("print-mode-active");
        reportElement.classList.remove("print-active-element");
      }, 500);
      return;
    }

    const formattedDate = new Date(printDate).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Rapor Hasil Belajar - ${currentStudent?.name || 'Siswa'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              line-height: 1.5;
              font-size: 11px;
              padding: 0;
              margin: 0;
            }
            .kop-surat {
              display: flex;
              align-items: center;
              border-bottom: 3px double #0f172a;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .kop-logo {
              width: 70px;
              height: 70px;
              object-fit: contain;
              margin-right: 20px;
            }
            .kop-text {
              flex: 1;
              text-align: center;
            }
            .kop-text h1 {
              font-size: 16px;
              font-weight: 800;
              text-transform: uppercase;
              margin: 0 0 4px 0;
              letter-spacing: 0.5px;
            }
            .kop-text p {
              font-size: 10px;
              color: #475569;
              margin: 2px 0;
              font-weight: 500;
            }
            .title-section {
              text-align: center;
              margin-bottom: 25px;
            }
            .title-section h2 {
              font-size: 13px;
              font-weight: 800;
              text-transform: uppercase;
              margin: 0;
              letter-spacing: 0.5px;
              text-decoration: underline;
            }
            .title-section p {
              font-size: 11px;
              font-weight: 600;
              margin: 4px 0 0 0;
              color: #475569;
            }
            .biodata-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 16px;
            }
            .biodata-col {
              display: grid;
              grid-template-columns: 100px 10px 1fr;
              row-gap: 6px;
              align-content: start;
            }
            .biodata-label {
              color: #64748b;
              font-weight: 600;
            }
            .biodata-separator {
              color: #94a3b8;
            }
            .biodata-value {
              font-weight: 700;
              color: #0f172a;
            }
            table.rapor-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
            }
            table.rapor-table th {
              background-color: #f1f5f9;
              color: #0f172a;
              font-weight: 800;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border: 1px solid #cbd5e1;
              padding: 8px 10px;
              text-align: center;
            }
            table.rapor-table td {
              border: 1px solid #cbd5e1;
              padding: 8px 10px;
              font-size: 11px;
            }
            .text-center {
              text-align: center;
            }
            .font-mono {
              font-family: 'Courier New', Courier, monospace;
            }
            .font-bold {
              font-weight: 700;
            }
            .summary-card {
              display: grid;
              grid-template-columns: 1.5fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-box {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 16px;
              background-color: #f8fafc;
            }
            .summary-box-title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #475569;
              border-b: 1px solid #e2e8f0;
              margin-top: 0;
              margin-bottom: 8px;
              padding-bottom: 4px;
            }
            .attendance-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              text-align: center;
            }
            .attendance-item {
              background-color: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px;
            }
            .attendance-val {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
            }
            .attendance-lbl {
              font-size: 9px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
            }
            .grade-predicate {
              display: inline-block;
              font-weight: 800;
              background-color: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 1px 6px;
              border-radius: 4px;
            }
            .signature-section {
              margin-top: 50px;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              text-align: center;
              page-break-inside: avoid;
            }
            .signature-box {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              height: 100px;
            }
            .signature-title {
              font-size: 10px;
              font-weight: 600;
              color: #475569;
            }
            .signature-name {
              font-size: 11px;
              font-weight: 700;
              text-decoration: underline;
              margin-bottom: 2px;
            }
            .signature-id {
              font-size: 9px;
              color: #64748b;
              font-family: monospace;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-30deg);
              font-size: 80px;
              font-weight: 900;
              color: rgba(226, 232, 240, 0.35);
              z-index: -100;
              white-space: nowrap;
              user-select: none;
              text-transform: uppercase;
              letter-spacing: 5px;
            }
            .footer-info {
              margin-top: 40px;
              font-size: 8px;
              color: #94a3b8;
              text-align: center;
              border-top: 1px dashed #e2e8f0;
              padding-top: 10px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="watermark">DOKUMEN RESMI</div>
          
          <!-- KOP SURAT SEKOLAH -->
          <div class="kop-surat">
            <img class="kop-logo" src="${settings?.logo || '/logo.png'}" />
            <div class="kop-text">
              <h1>${settings?.name || 'SMAN 1 NUSANTARA'}</h1>
              <p>Alamat: ${settings?.address || 'Jl. Raya Pendidikan No. 10 Jakarta'}</p>
              <p>Telepon: ${settings?.phone || '(021) 555-0199'} | Email: ${settings?.email || 'info@sekolah.sch.id'}</p>
              <p>NPSN: 20103040 | Terakreditasi BAN-S/M Peringkat A (Sangat Baik)</p>
            </div>
          </div>

          <!-- RAPOR TITLE -->
          <div class="title-section">
            <h2>LAPORAN HASIL BELAJAR SISWA</h2>
            <p>(RAPOR AKADEMIK)</p>
          </div>

          <!-- BIODATA SISWA & SEKOLAH -->
          <div class="biodata-grid">
            <div class="biodata-col">
              <span class="biodata-label">Nama Siswa</span>
              <span class="biodata-separator">:</span>
              <span class="biodata-value">${currentStudent?.name || '-'}</span>

              <span class="biodata-label">NIS / NISN</span>
              <span class="biodata-separator">:</span>
              <span class="biodata-value font-mono">${currentStudent?.nis || '-'} / ${currentStudent?.nisn || '-'}</span>

              <span class="biodata-label">Kelas</span>
              <span class="biodata-separator">:</span>
              <span class="biodata-value">${currentClass?.name || '-'} (${currentClass?.major || '-'})</span>
            </div>
            
            <div class="biodata-col">
              <span class="biodata-label">Tahun Ajaran</span>
              <span class="biodata-separator">:</span>
              <span class="biodata-value">${activeAY?.year || '-'}</span>

              <span class="biodata-label">Semester</span>
              <span class="biodata-separator">:</span>
              <span class="biodata-value">${activeAY?.semester || '-'}</span>

              <span class="biodata-label">Wali Kelas</span>
              <span class="biodata-separator">:</span>
              <span class="biodata-value">${homeroomTeacher?.name || '-'}</span>
            </div>
          </div>

          <!-- TABEL RAPOR NILAI -->
          <table class="rapor-table">
            <thead>
              <tr>
                <th style="width: 5%">No</th>
                <th style="text-align: left; width: 35%">Mata Pelajaran</th>
                <th style="width: 8%">KKM</th>
                <th style="width: 10%">Tugas (30%)</th>
                <th style="width: 10%">UTS (30%)</th>
                <th style="width: 10%">UAS (40%)</th>
                <th style="width: 10%">Nilai Akhir</th>
                <th style="width: 12%">Predikat</th>
              </tr>
            </thead>
            <tbody>
              ${studentGrades.length > 0 ? (
                studentGrades.map((grade, idx) => {
                  const subj = subjects.find(s => s.id === grade.subjectId);
                  const kkm = subj?.kkm || 75;
                  const isPassed = grade.finalScore >= kkm;
                  return `
                    <tr>
                      <td class="text-center font-mono">${idx + 1}</td>
                      <td class="font-bold">${subj?.name || 'N/A'}</td>
                      <td class="text-center font-mono">${kkm}</td>
                      <td class="text-center font-mono">${grade.assignmentScore}</td>
                      <td class="text-center font-mono">${grade.utsScore}</td>
                      <td class="text-center font-mono">${grade.uasScore}</td>
                      <td class="text-center font-mono font-bold" style="color: ${isPassed ? '#1e293b' : '#ef4444'}">${grade.finalScore}</td>
                      <td class="text-center">
                        <span class="grade-predicate">${grade.gradeLetter}</span>
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td colspan="7" style="color: #475569; font-size: 9.5px; padding-top: 4px; padding-bottom: 6px; border-top: none; font-style: italic;">
                        Catatan: ${grade.notes || 'Siswa menunjukkan performa yang cukup stabil di mata pelajaran ini.'}
                      </td>
                    </tr>
                  `;
                }).join('')
              ) : `
                <tr>
                  <td colspan="8" class="text-center" style="padding: 30px; color: #64748b; font-weight: 600;">
                    Belum ada nilai akademik yang diunggah untuk siswa ini pada semester aktif.
                  </td>
                </tr>
              `}
            </tbody>
          </table>

          <!-- RINGKASAN & PRESENSI -->
          <div class="summary-card">
            <div class="summary-box">
              <h4 class="summary-box-title">Rekapitulasi Kehadiran Siswa</h4>
              <div class="attendance-grid">
                <div class="attendance-item">
                  <div class="attendance-val font-mono" style="color: #10b981;">${attendanceStats.Hadir}</div>
                  <div class="attendance-lbl">Hadir</div>
                </div>
                <div class="attendance-item">
                  <div class="attendance-val font-mono" style="color: #3b82f6;">${attendanceStats.Sakit}</div>
                  <div class="attendance-lbl">Sakit</div>
                </div>
                <div class="attendance-item">
                  <div class="attendance-val font-mono" style="color: #f59e0b;">${attendanceStats.Izin}</div>
                  <div class="attendance-lbl">Izin</div>
                </div>
                <div class="attendance-item">
                  <div class="attendance-val font-mono" style="color: #ef4444;">${attendanceStats.Alpa}</div>
                  <div class="attendance-lbl">Tanpa Alasan</div>
                </div>
              </div>
            </div>

            <div class="summary-box">
              <h4 class="summary-box-title">Pencapaian Belajar</h4>
              <div style="font-size: 10px; space-y: 4px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #475569; font-weight: 500;">Total Nilai</span>
                  <span class="font-bold font-mono">${reportStats.totalScore}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                  <span style="color: #475569; font-weight: 500;">Rata-Rata</span>
                  <span class="font-bold font-mono">${reportStats.averageScore}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                  <span style="color: #475569; font-weight: 500;">Tuntas KKM</span>
                  <span class="font-bold text-emerald-600 font-mono">${reportStats.passedCount} Mapel</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SIGNATURE SIGN BLOCK -->
          <div class="signature-section">
            <div class="signature-box">
              <span class="signature-title">Mengetahui,</span>
              <span class="signature-title" style="margin-top:-10px;">Orang Tua / Wali Siswa</span>
              <div style="height: 45px;"></div>
              <div>
                <p class="signature-name" style="text-decoration: none;">............................................</p>
              </div>
            </div>

            <div class="signature-box">
              <span></span>
              <span class="signature-title">Wali Kelas</span>
              <div style="height: 45px;"></div>
              <div>
                <p class="signature-name">${homeroomTeacher?.name || '............................................'}</p>
                ${homeroomTeacher ? `<p class="signature-id">NIP: ${homeroomTeacher.nip}</p>` : ''}
              </div>
            </div>

            <div class="signature-box">
              <span class="signature-title">Jakarta, ${formattedDate}</span>
              <span class="signature-title" style="margin-top:-10px;">Kepala Sekolah</span>
              <div style="height: 45px;"></div>
              <div>
                <p class="signature-name">${settings?.principalName || 'Drs. H. Mulyadi, M.Pd'}</p>
                <p class="signature-id">NIP: ${settings?.principalNip || '197408212001121002'}</p>
              </div>
            </div>
          </div>

          <div class="footer-info">
            Dicetak secara digital melalui SIAKAD ${settings?.name || 'SMAN 1 NUSANTARA'} - ${new Date().toLocaleString('id-ID')}
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Export individual student report card as pristine Excel file
  const handleDownloadExcel = () => {
    if (!currentStudent) return;
    
    try {
      const wb = XLSX.utils.book_new();
      
      const academicYearLabel = activeAY?.year || "2025/2026";
      const semesterLabel = activeAY?.semester || "Ganjil";
      
      const dataRows = [
        ["LAPORAN HASIL BELAJAR SISWA (RAPOR AKADEMIK)"],
        [settings?.name?.toUpperCase() || "SMAN 1 NUSANTARA"],
        [`Alamat: ${settings?.address || "Jl. Raya Nusantara No. 45"}`],
        [],
        ["IDENTITAS PESERTA DIDIK", ""],
        ["Nama Siswa", currentStudent.name],
        ["NIS / NISN", `${currentStudent.nis} / ${currentStudent.nisn || '-'}`],
        ["Kelas", `${currentClass?.name || '-'} (${currentClass?.major || '-'})`],
        ["Tahun Ajaran", academicYearLabel],
        ["Semester", semesterLabel],
        ["Wali Kelas", homeroomTeacher?.name || '-'],
        [],
        ["CAPAIAN NILAI AKADEMIK"],
        ["No", "Mata Pelajaran", "KKM", "Tugas (30%)", "UTS (30%)", "UAS (40%)", "Nilai Akhir", "Predikat", "Catatan Perkembangan"]
      ];

      studentGrades.forEach((grade, idx) => {
        const subj = subjects.find(s => s.id === grade.subjectId);
        const kkm = subj?.kkm || 75;
        dataRows.push([
          (idx + 1).toString(),
          subj?.name || "N/A",
          kkm.toString(),
          grade.assignmentScore.toString(),
          grade.utsScore.toString(),
          grade.uasScore.toString(),
          grade.finalScore.toString(),
          grade.gradeLetter,
          grade.notes || "Siswa menunjukkan perkembangan yang stabil dan motivasi belajar yang baik."
        ]);
      });

      dataRows.push([]);
      dataRows.push(["RINGKASAN KEHADIRAN"]);
      dataRows.push(["Status Presensi", "Jumlah Hari"]);
      dataRows.push(["Hadir", attendanceStats.Hadir.toString()]);
      dataRows.push(["Sakit", attendanceStats.Sakit.toString()]);
      dataRows.push(["Izin", attendanceStats.Izin.toString()]);
      dataRows.push(["Alpa", attendanceStats.Alpa.toString()]);
      
      dataRows.push([]);
      dataRows.push(["RINGKASAN AKADEMIK"]);
      dataRows.push(["Total Nilai", reportStats.totalScore.toString()]);
      dataRows.push(["Rata-Rata Nilai", reportStats.averageScore.toString()]);
      dataRows.push(["Mata Pelajaran Tuntas KKM", `${reportStats.passedCount} dari ${studentGrades.length}`]);

      const ws = XLSX.utils.aoa_to_sheet(dataRows);
      
      // Auto-fit column widths
      const maxColLen = dataRows.reduce((acc, row) => {
        row.forEach((cell, i) => {
          const len = cell ? cell.toString().length : 0;
          if (!acc[i] || len > acc[i]) {
            acc[i] = len;
          }
        });
        return acc;
      }, [] as number[]);
      ws['!cols'] = maxColLen.map(len => ({ wch: Math.min(Math.max(len + 2, 8), 40) }));

      XLSX.utils.book_append_sheet(wb, ws, "Rapor Belajar");
      
      const safeName = currentStudent.name.replace(/[^a-zA-Z0-9]/g, "_");
      XLSX.writeFile(wb, `rapor_${safeName}_${academicYearLabel.replace(/\//g, "-")}.xlsx`);

    } catch (err) {
      console.error("Export individual Excel error:", err);
    }
  };

  const handleDownloadPDFDirect = () => {
    if (!currentStudent) return;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // --- 1. KOP SURAT SEKOLAH ---
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      const schoolName = settings?.name || "SMAN 1 NUSANTARA";
      doc.text(schoolName.toUpperCase(), 105, 18, { align: "center" });

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      const address = `Alamat: ${settings?.address || 'Jl. Raya Pendidikan No. 10 Jakarta'}`;
      doc.text(address, 105, 23, { align: "center" });

      const contacts = `Telepon: ${settings?.phone || '(021) 555-0199'} | Email: ${settings?.email || 'info@sekolah.sch.id'}`;
      doc.text(contacts, 105, 27, { align: "center" });

      doc.setFontSize(8.5);
      doc.text("NPSN: 20103040 | Terakreditasi BAN-S/M Peringkat A (Sangat Baik)", 105, 31, { align: "center" });

      // Double line border under Kop Surat
      doc.setLineWidth(0.6);
      doc.line(14, 34, 196, 34);
      doc.setLineWidth(0.2);
      doc.line(14, 35.5, 196, 35.5);

      // --- 2. JUDUL RAPOR ---
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.text("LAPORAN HASIL BELAJAR SISWA (RAPOR AKADEMIK)", 105, 43, { align: "center" });

      // --- 3. BIODATA SISWA & SEKOLAH ---
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      
      // Column Left
      doc.text("Nama Siswa", 14, 52);
      doc.text(":", 42, 52);
      doc.setFont("Helvetica", "bold");
      doc.text(currentStudent.name || "-", 45, 52);

      doc.setFont("Helvetica", "normal");
      doc.text("NIS / NISN", 14, 57);
      doc.text(":", 42, 57);
      doc.text(`${currentStudent.nis} / ${currentStudent.nisn || "-"}`, 45, 57);

      doc.text("Kelas", 14, 62);
      doc.text(":", 42, 62);
      doc.text(`${currentClass?.name || "-"} (${currentClass?.major || "-"})`, 45, 62);

      // Column Right
      doc.text("Tahun Ajaran", 120, 52);
      doc.text(":", 148, 52);
      doc.text(activeAY?.year || "-", 151, 52);

      doc.text("Semester", 120, 57);
      doc.text(":", 148, 57);
      doc.text(activeAY?.semester || "-", 151, 57);

      doc.text("Wali Kelas", 120, 62);
      doc.text(":", 148, 62);
      doc.text(homeroomTeacher?.name || "-", 151, 62);

      // --- 4. TABEL NILAI ---
      const tableBody: string[][] = [];
      studentGrades.forEach((grade, index) => {
        const subj = subjects.find(s => s.id === grade.subjectId);
        const kkm = subj?.kkm || 75;
        
        // Add grade row
        tableBody.push([
          (index + 1).toString(),
          subj?.name || "N/A",
          kkm.toString(),
          grade.assignmentScore.toString(),
          grade.utsScore.toString(),
          grade.uasScore.toString(),
          grade.finalScore.toString(),
          grade.gradeLetter,
          grade.notes || "Belajar dengan baik"
        ]);
      });

      // Draw autoTable
      autoTable(doc, {
        startY: 68,
        head: [['No', 'Mata Pelajaran', 'KKM', 'Tugas', 'UTS', 'UAS', 'N.A.', 'Pred', 'Catatan Perkembangan']],
        body: tableBody.length > 0 ? tableBody : [['-', 'Belum ada data nilai', '-', '-', '-', '-', '-', '-', '-']],
        theme: "grid",
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 8.5,
          halign: "center",
          valign: "middle"
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [15, 23, 42]
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 8 },
          1: { cellWidth: 40, fontStyle: "bold" },
          2: { halign: "center", cellWidth: 10 },
          3: { halign: "center", cellWidth: 14 },
          4: { halign: "center", cellWidth: 14 },
          5: { halign: "center", cellWidth: 14 },
          6: { halign: "center", cellWidth: 14, fontStyle: "bold" },
          7: { halign: "center", cellWidth: 11, fontStyle: "bold" },
          8: { fontSize: 7.5 }
        },
        styles: {
          cellPadding: 2
        }
      });

      // Get Y-coord after table
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // --- 5. KEHADIRAN & IKHTISAR ---
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.text("REKAPITULASI KEHADIRAN", 14, finalY);

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, finalY + 1.5, 85, 18, "F");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Hadir : ${attendanceStats.Hadir} Hari`, 18, finalY + 6);
      doc.text(`Sakit : ${attendanceStats.Sakit} Hari`, 18, finalY + 12);
      doc.text(`Izin  : ${attendanceStats.Izin} Hari`, 58, finalY + 6);
      doc.text(`Alpa  : ${attendanceStats.Alpa} Hari`, 58, finalY + 12);

      // Averages box
      doc.setFont("Helvetica", "bold");
      doc.text("IKHTISAR CAPAIAN", 110, finalY);

      doc.setFillColor(248, 250, 252);
      doc.rect(110, finalY + 1.5, 86, 18, "F");

      doc.setFont("Helvetica", "normal");
      doc.text(`Total Nilai Rapor : ${reportStats.totalScore}`, 114, finalY + 6);
      doc.text(`Rata-Rata Nilai    : ${reportStats.averageScore}`, 114, finalY + 12);
      doc.text(`Tuntas KKM         : ${reportStats.passedCount} Mata Pelajaran`, 114, finalY + 17);

      // --- 6. SIGNATURE BLOCK ---
      const sigY = finalY + 28;
      doc.setFontSize(8.5);
      doc.text("Mengetahui,", 14, sigY);
      doc.text("Orang Tua / Wali Siswa", 14, sigY + 4);
      doc.text("............................................", 14, sigY + 22);

      doc.text("Wali Kelas,", 80, sigY + 4);
      doc.setFont("Helvetica", "bold");
      doc.text(homeroomTeacher?.name || "............................................", 80, sigY + 22);
      if (homeroomTeacher?.nip) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(`NIP. ${homeroomTeacher.nip}`, 80, sigY + 25);
      }

      doc.setFontSize(8.5);
      const formattedDate = new Date(printDate).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Jakarta, ${formattedDate}`, 145, sigY);
      doc.text("Kepala Sekolah,", 145, sigY + 4);
      doc.setFont("Helvetica", "bold");
      doc.text(settings?.principalName || "Dr. H. Ahmad Wijaya, M.Pd.", 145, sigY + 22);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(`NIP. ${settings?.principalNip || '197508122001121002'}`, 145, sigY + 25);

      // --- 7. SAVE ---
      const safeName = currentStudent.name.replace(/[^a-zA-Z0-9]/g, "_");
      doc.save(`rapor_${safeName}.pdf`);

    } catch (err) {
      console.error("Direct PDF export error:", err);
    }
  };

  return (
    <div className="space-y-6" id="report-generator-container">
      
      {/* Search and Filters */}
      <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 ${userRole === "siswa" ? "md:grid-cols-4" : "md:grid-cols-6"} gap-4 items-end`}>
        {userRole !== "siswa" && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-600" /> Pilih Kelas
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white font-mono font-bold"
              >
                {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Pilih Siswa
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white font-bold"
                disabled={filteredStudents.length === 0}
              >
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name} (NIS: {s.nis})</option>)
                ) : (
                  <option value="">Tidak ada siswa</option>
                )}
              </select>
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Tanggal Cetak Rapor
          </label>
          <input
            type="date"
            value={printDate}
            onChange={(e) => setPrintDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white font-semibold font-mono"
          />
        </div>

        <button
          onClick={handlePrintPDF}
          disabled={!selectedStudentId || studentGrades.length === 0 || isFetching}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
        >
          <Printer className="w-4 h-4" /> Cetak Rapor
        </button>

        <button
          onClick={handleDownloadPDFDirect}
          disabled={!selectedStudentId || studentGrades.length === 0 || isFetching}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 text-white rounded-xl text-xs font-bold border border-indigo-700 shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" /> Unduh PDF
        </button>

        <button
          onClick={handleDownloadExcel}
          disabled={!selectedStudentId || studentGrades.length === 0 || isFetching}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 text-white rounded-xl text-xs font-bold border border-emerald-700 shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" /> Unduh Excel
        </button>
      </div>

      {/* CSV EXPORT DASHBOARD FOR ADMINISTRATORS */}
      {(userRole === "super_admin" || userRole === "admin") && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 animate-in fade-in duration-200" id="admin-csv-export-panel">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Ekspor Data CSV Offline
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Ekspor database pengguna sistem dan riwayat presensi ke berkas CSV standar untuk pelaporan offline.</p>
            </div>
            <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-mono font-bold uppercase">
              Hanya Administrator
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COLUMN 1: USERS DATA */}
            <div className="space-y-4 bg-slate-50/50 rounded-xl p-4 border border-slate-200/60">
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">
                  1. Basis Data Pengguna & Akun
                </h4>
                <p className="text-[10px] text-slate-400">Unduh data entitas primer sistem lengkap dengan format kolom terstandarisasi.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Export Students */}
                <button
                  onClick={handleExportStudentsCSV}
                  className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      S
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">Daftar Siswa Lengkap</p>
                      <p className="text-[9px] text-slate-400 font-mono">Total: {students.length} Siswa</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                {/* Export Teachers */}
                <button
                  onClick={handleExportTeachersCSV}
                  className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs">
                      G
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">Daftar Guru & Kepegawaian</p>
                      <p className="text-[9px] text-slate-400 font-mono">Total: {teachers.length} Guru</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </button>

                {/* Export Account Credentials */}
                <button
                  onClick={handleExportUsersCSV}
                  disabled={exportLoading}
                  className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-left cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                      U
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800">Semua Akun Login Pengguna</p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        {exportLoading ? "Mengambil data..." : "Pengguna sistem aktif & nonaktif"}
                      </p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* COLUMN 2: ATTENDANCE REKAP */}
            <div className="space-y-4 bg-slate-50/50 rounded-xl p-4 border border-slate-200/60 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-800 tracking-tight uppercase">
                    2. Rekapitulasi Presensi Kehadiran
                  </h4>
                  <p className="text-[10px] text-slate-400">Filter riwayat kehadiran siswa sebelum mengekspor dokumen offline.</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* Select classroom */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700">Pilih Kelas</label>
                    <select
                      value={exportClassId}
                      onChange={(e) => setExportClassId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">Semua Kelas</option>
                      {classRooms.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date range filters */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-semibold bg-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700">Tanggal Selesai</label>
                      <input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-semibold bg-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    onClick={handleExportAttendancePDF}
                    className="py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-extrabold border border-rose-700 shadow-xs cursor-pointer flex items-center justify-center gap-1 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> Ekspor Log (PDF)
                  </button>
                  <button
                    onClick={handleExportAttendanceCSV}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold border border-emerald-700 shadow-xs cursor-pointer flex items-center justify-center gap-1 transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Ekspor Log (CSV)
                  </button>
                </div>
              </div>

              {/* SECTION B: MONTHLY SUMMARY MATRIX EXPORT */}
              <div className="border-t border-slate-200/80 pt-4 mt-4 space-y-3">
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-extrabold text-slate-800 tracking-tight uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> 3. Ringkasan Presensi Bulanan
                  </h5>
                  <p className="text-[9px] text-slate-400 leading-relaxed">Ekspor rekapitulasi statistika bulanan siswa per kelas (Hadir, Sakit, Izin, Alpa & % Kehadiran).</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-700">Pilih Bulan</label>
                    <select
                      value={exportSelectedMonth}
                      onChange={(e) => setExportSelectedMonth(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="01">Januari</option>
                      <option value="02">Februari</option>
                      <option value="03">Maret</option>
                      <option value="04">April</option>
                      <option value="05">Mei</option>
                      <option value="06">Juni</option>
                      <option value="07">Juli</option>
                      <option value="08">Agustus</option>
                      <option value="09">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-700">Pilih Tahun</label>
                    <select
                      value={exportSelectedYear}
                      onChange={(e) => setExportSelectedYear(e.target.value)}
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[10px] bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleExportMonthlyAttendanceSummary('excel')}
                    className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-extrabold border border-blue-700 shadow-xs cursor-pointer flex items-center justify-center gap-1 transition-all"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> Unduh Excel
                  </button>
                  <button
                    onClick={() => handleExportMonthlyAttendanceSummary('csv')}
                    className="py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-[10px] font-extrabold border border-slate-800 shadow-xs cursor-pointer flex items-center justify-center gap-1 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> Unduh CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFetching ? (
        <ReportContentSkeleton />
      ) : selectedStudentId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* A4 PAPER PREVIEW (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Pratinjau Lembar Rapor</span>
              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 font-mono font-bold px-2 py-0.5 rounded-lg flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Simulasi Kertas A4
              </span>
            </div>

            {/* A4 paper lookalike container */}
            <div 
              id="printable-rapor-card" 
              className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 md:p-12 overflow-hidden relative select-none"
            >
              {/* Kop Surat */}
              <div className="flex items-center border-b-2 border-slate-900 pb-5 mb-6 gap-6">
                <img 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain shrink-0" 
                  src={settings?.logo || '/logo.png'} 
                  alt="School Logo"
                />
                <div className="min-w-0 flex-1 text-center">
                  <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight leading-snug">{settings?.name || 'SMAN 1 NUSANTARA'}</h3>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium mt-1">Alamat: {settings?.address || 'Jl. Raya Pendidikan No. 10 Jakarta'}</p>
                  <p className="text-[10px] text-slate-400 font-semibold font-mono mt-0.5">Telp: {settings?.phone || '(021) 555-0199'} | Email: {settings?.email || 'info@sekolah.sch.id'}</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1 mb-6">
                <h4 className="text-sm font-black text-slate-950 tracking-wide uppercase border-b border-slate-900 inline-block pb-0.5">LAPORAN HASIL BELAJAR SISWA</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">(RAPOR AKADEMIK)</p>
              </div>

              {/* Student Biodata Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-24 text-slate-400 font-semibold">Nama Siswa</span>
                    <span className="px-2 text-slate-400">:</span>
                    <span className="font-extrabold text-slate-900">{currentStudent?.name || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-400 font-semibold">NIS / NISN</span>
                    <span className="px-2 text-slate-400">:</span>
                    <span className="font-bold text-slate-700 font-mono">{currentStudent?.nis || '-'} / {currentStudent?.nisn || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-400 font-semibold">Kelas</span>
                    <span className="px-2 text-slate-400">:</span>
                    <span className="font-bold text-blue-700 font-mono">{currentClass?.name || '-'} ({currentClass?.major || '-'})</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex">
                    <span className="w-24 text-slate-400 font-semibold">Tahun Ajaran</span>
                    <span className="px-2 text-slate-400">:</span>
                    <span className="font-bold text-slate-700">{activeAY?.year || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-400 font-semibold">Semester</span>
                    <span className="px-2 text-slate-400">:</span>
                    <span className="font-bold text-slate-700">{activeAY?.semester || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-400 font-semibold">Wali Kelas</span>
                    <span className="px-2 text-slate-400">:</span>
                    <span className="font-bold text-slate-700">{homeroomTeacher?.name || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Rapor Grades Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                      <th className="py-2.5 px-3 text-center w-12">No</th>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3 text-center w-16">KKM</th>
                      <th className="py-2.5 px-3 text-center w-16">Tugas</th>
                      <th className="py-2.5 px-3 text-center w-16">UTS</th>
                      <th className="py-2.5 px-3 text-center w-16">UAS</th>
                      <th className="py-2.5 px-3 text-center w-20">Nilai Akhir</th>
                      <th className="py-2.5 px-3 text-center w-16">Predikat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {studentGrades.length > 0 ? (
                      studentGrades.map((grade, idx) => {
                        const subj = subjects.find(s => s.id === grade.subjectId);
                        const kkm = subj?.kkm || 75;
                        const isPassed = grade.finalScore >= kkm;
                        return (
                          <React.Fragment key={grade.id}>
                            <tr className="hover:bg-slate-50/50">
                              <td className="py-3 px-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-3">
                                <p className="font-extrabold text-slate-900">{subj?.name || "N/A"}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{subj?.code || ""}</p>
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">{kkm}</td>
                              <td className="py-3 px-3 text-center font-mono font-semibold text-slate-500">{grade.assignmentScore}</td>
                              <td className="py-3 px-3 text-center font-mono font-semibold text-slate-500">{grade.utsScore}</td>
                              <td className="py-3 px-3 text-center font-mono font-semibold text-slate-500">{grade.uasScore}</td>
                              <td className={`py-3 px-3 text-center font-mono text-sm font-black ${isPassed ? 'text-blue-600' : 'text-rose-600'}`}>
                                {grade.finalScore}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 font-bold font-mono text-[10px] border rounded ${
                                  grade.gradeLetter === 'A' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                  grade.gradeLetter === 'B' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                  grade.gradeLetter === 'C' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                  'bg-rose-50 text-rose-700 border-rose-100'
                                }`}>
                                  {grade.gradeLetter}
                                </span>
                              </td>
                            </tr>
                            <tr className="bg-slate-50/30">
                              <td />
                              <td colSpan={7} className="py-2 px-3 text-[10px] text-slate-500 font-medium italic border-t-0">
                                <span className="font-bold text-slate-400 not-italic uppercase tracking-wider text-[8px] mr-1">Catatan Wali:</span>
                                {grade.notes || "Siswa berpartisipasi aktif dalam kegiatan diskusi kelas."}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 font-medium space-y-1">
                          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-xs font-bold text-slate-500">Nilai Belum Tersedia</p>
                          <p className="text-[10px] text-slate-400">Guru mata pelajaran belum mengentri nilai rapor siswa ini.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Attendance and stats rekap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Kehadiran Siswa</h5>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white border border-slate-200 rounded-lg p-2">
                      <p className="text-sm font-black text-emerald-600 font-mono">{attendanceStats.Hadir}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">Hadir</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2">
                      <p className="text-sm font-black text-blue-600 font-mono">{attendanceStats.Sakit}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">Sakit</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2">
                      <p className="text-sm font-black text-amber-500 font-mono">{attendanceStats.Izin}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">Izin</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-2">
                      <p className="text-sm font-black text-rose-500 font-mono">{attendanceStats.Alpa}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase font-mono">Alpa</p>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Ikhtisar Capaian</h5>
                  <div className="space-y-1.5 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between items-center border-b border-white/50 pb-1">
                      <span className="text-slate-400">Kumulatif Nilai Rapor</span>
                      <span className="text-slate-900 font-bold font-mono">{reportStats.totalScore}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/50 pb-1">
                      <span className="text-slate-400">Rata-Rata Nilai</span>
                      <span className="text-slate-900 font-bold font-mono">{reportStats.averageScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Pencapaian KKM</span>
                      <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-mono text-[10px]">
                        {reportStats.passedCount} Tuntas
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sim signatures */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-600 pt-6 border-t border-dashed border-slate-200">
                <div className="space-y-10">
                  <p className="font-semibold text-slate-400">Orang Tua / Wali Siswa</p>
                  <p className="font-bold text-slate-800">............................................</p>
                </div>
                <div className="space-y-10">
                  <p className="font-semibold text-slate-400">Wali Kelas</p>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 underline decoration-slate-300">{homeroomTeacher?.name || 'Belum Ditentukan'}</p>
                    {homeroomTeacher && <p className="text-[9px] font-mono text-slate-400">NIP: {homeroomTeacher.nip}</p>}
                  </div>
                </div>
                <div className="space-y-10">
                  <p className="font-semibold text-slate-400">Kepala Sekolah</p>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 underline decoration-slate-300">{settings?.principalName || 'Drs. H. Mulyadi, M.Pd'}</p>
                    <p className="text-[9px] font-mono text-slate-400">NIP: {settings?.principalNip || '197408212001121002'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION GUIDE (Col span 1) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Panduan Cetak Rapor
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Sistem Rapor Digital ini memformat seluruh data siswa, nilai mata pelajaran, catatan perkembangan, dan rekam absensi semester langsung ke dalam template siap cetak standar nasional.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold shrink-0 font-mono">1</span>
                  <p className="text-slate-600 font-medium">Pilih <b>Kelas</b> dan <b>Nama Siswa</b> yang ingin diekspor pada panel atas.</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold shrink-0 font-mono">2</span>
                  <p className="text-slate-600 font-medium">Periksa pratinjau lembar kertas di sebelah kiri untuk memastikan kelayakan entri.</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold shrink-0 font-mono">3</span>
                  <p className="text-slate-600 font-medium">Klik tombol <b>Cetak Rapor PDF</b> untuk membuka dialog cetak browser.</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold shrink-0 font-mono">4</span>
                  <p className="text-slate-600 font-medium">Pada jendela cetak, pilih <b>Save as PDF</b> atau printer fisik Anda, aktifkan opsi <i>"Background graphics"</i> untuk kualitas terbaik.</p>
                </div>
              </div>
            </div>

            {/* School stamp & authority validator info */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-sm border border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h4 className="font-extrabold text-sm tracking-tight">Otoritas Validasi Data</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium font-sans">
                Dokumen hasil cetak dari sistem ini dianggap sah dan disinkronkan langsung dengan basis data <b>Sistem Informasi Akademik Sekolah</b>.
              </p>
              <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-400 font-mono space-y-1">
                <p>NPSN SEKOLAH: <b className="text-slate-200">20103040</b></p>
                <p>STATUS RAPOR: <b className="text-emerald-400">SINKRON & SAH</b></p>
                <p>STANDAR: <b className="text-slate-200">KURIKULUM MERDEKA</b></p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto animate-pulse mb-2" />
          <p className="text-sm font-bold text-slate-500">Pilih Siswa Terlebih Dahulu</p>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed font-medium mt-1">
            Gunakan dropdown di bagian atas untuk memuat daftar kelas dan mencari siswa yang ingin dicetak rapor akademiknya.
          </p>
        </div>
      )}

    </div>
  );
}
