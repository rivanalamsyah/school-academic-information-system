import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Printer, ShieldCheck, ShieldAlert
} from "lucide-react";

import { usePermissions } from "../hooks/usePermissions";
import AvatarPickerModal from "../components/AvatarPickerModal";
import BulkImportModal from "../components/BulkImportModal";
import * as XLSX from "xlsx";

// Modular Sub-components
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import { AdminAcademicYears } from "../components/dashboard/AdminAcademicYears";
import { AdminClassrooms } from "../components/dashboard/AdminClassrooms";
import { AdminSubjects } from "../components/dashboard/AdminSubjects";
import { AdminTeachers } from "../components/dashboard/AdminTeachers";
import { AdminStudents } from "../components/dashboard/AdminStudents";
import { AdminSettings } from "../components/dashboard/AdminSettings";
import { TeacherAttendance } from "../components/dashboard/TeacherAttendance";
import { TeacherGrades } from "../components/dashboard/TeacherGrades";
import { CrudFormModal } from "../components/dashboard/CrudFormModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { RouteGuard } from "../core/routing/RouteGuard";

// Extracted Sub-hubs
import { DashboardStats } from "../components/DashboardStats";
import { AcademicPerformanceCharts } from "../components/AcademicPerformanceCharts";
import { ReportGenerator } from "../components/ReportGenerator";
import { DailyCheckIn } from "../components/DailyCheckIn";
import { AcademicCalendar } from "../components/AcademicCalendar";
import { ParentNotifier } from "../components/ParentNotifier";
import { DiscussionForum } from "../components/DiscussionForum";
import { StudentAchievements } from "../components/StudentAchievements";
import { StudentGradesChart } from "../components/StudentGradesChart";
import { AdminScheduleGrid } from "../components/AdminScheduleGrid";

// Skeleton Loading
import { 
  DashboardHomeSkeleton
} from "../components/Skeleton";

// Services & Helper Utilities
import { User, SchoolSettings, Student, ClassRoom, Teacher, Subject, AcademicYear, Schedule } from "../types";
import { useSchoolData } from "../hooks/useSchoolData";
import { httpClient } from "../core/api/client";
import { AuthService } from "../services/auth.service";

// ── Props ────────────────────────────────────────────────────────────────────

interface DashboardProps {
  user: User;
  onLogout: () => void;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
  onUpdateUser: (updatedUser: User) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Dashboard({ user, onLogout, showToast, onUpdateUser }: DashboardProps) {
  const { canAccess, allowedMenus } = usePermissions(user);
  
  // Local UI Layout states
  const [activeMenu, setActiveMenu] = useState<string>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<SchoolSettings | null>(null);

  // PPDB local filter & search states
  const [ppdbSearch, setPpdbSearch] = useState("");
  const [ppdbFilterStatus, setPpdbFilterStatus] = useState("all");

  // Logs local search & pagination states
  const [logsSearch, setLogsSearch] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const logsPerPage = 15;


  // Consume School Data Global State & Mutations
  const {
    settings,
    academicYears,
    classRooms,
    subjects,
    teachers,
    students,
    schedules,
    ppdbList,
    logs,
    backups,
    allAttendances,
    allGrades,
    loading,
    isSyncing,
    isDisconnecting,
    isOnline,
    searchTerm,
    setSearchTerm,
    selectedClassId,
    setSelectedClassId,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedDate,
    setSelectedDate,
    editingItem,
    setEditingItem,
    isModalOpen,
    setIsModalOpen,
    formType,
    setFormType,
    isBulkImportOpen,
    setIsBulkImportOpen,
    bulkImportType,
    setBulkImportType,
    notifications,
    setNotifications,
    notifDropdownOpen,
    setNotifDropdownOpen,
    classStudents,
    tempAttendances,
    setTempAttendances,
    tempGrades,
    setTempGrades,
    fetchData,
    handleGoogleSheetsSync,
    handleGoogleSheetsDisconnect,
    handleSettingsUpdate,
    handleCrudSubmit,
    handleActivateAcademicYear,
    handleDeleteItem,
    handleSaveAttendance,
    handleSaveGrades,
    confirmDialog,
    setConfirmDialog,
  } = useSchoolData();

  // Initialize settings local form state
  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  // Responsive sidebar initial toggle on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Session persistence & URL Hash Watcher (Sync hash change to state)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && allowedMenus.includes(hash)) {
        setActiveMenu(hash);
      } else {
        const defaultMenu = allowedMenus.includes("home") ? "home" : (allowedMenus[0] || "");
        if (defaultMenu) {
          setActiveMenu(defaultMenu);
          window.location.hash = defaultMenu;
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [allowedMenus]); // Removed activeMenu from dependencies to avoid loop

  // Sync state change back to URL hash (e.g. on sidebar menu click)
  useEffect(() => {
    if (activeMenu && window.location.hash.replace("#", "") !== activeMenu) {
      window.location.hash = activeMenu;
    }
  }, [activeMenu]);

  // Timetable calculations for students
  const studentSchedules = useMemo(() => {
    const student = students.find(s => s.id === user.detailsId);
    if (!student) return [];
    return schedules.filter(s => s.classRoomId === student.classRoomId);
  }, [schedules, students, user.detailsId]);

  // Filtered PPDB list with search query and status filter
  const filteredPPDB = useMemo(() => {
    return ppdbList.filter(p => {
      const matchSearch = 
        p.fullName.toLowerCase().includes(ppdbSearch.toLowerCase()) ||
        p.registrationNo.toLowerCase().includes(ppdbSearch.toLowerCase()) ||
        p.prevSchool.toLowerCase().includes(ppdbSearch.toLowerCase());
      
      const matchStatus = ppdbFilterStatus === "all" || p.status === ppdbFilterStatus;
      
      return matchSearch && matchStatus;
    });
  }, [ppdbList, ppdbSearch, ppdbFilterStatus]);

  // Filtered and Paginated Activity Logs
  const filteredLogsData = useMemo(() => {
    const searchFiltered = logs.filter(log => {
      return (
        log.username.toLowerCase().includes(logsSearch.toLowerCase()) ||
        log.role.toLowerCase().includes(logsSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(logsSearch.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(logsSearch.toLowerCase())
      );
    });

    const totalItems = searchFiltered.length;
    const totalPages = Math.ceil(totalItems / logsPerPage) || 1;
    
    // Slice for current page
    const startIndex = (logsPage - 1) * logsPerPage;
    const paginatedItems = searchFiltered.slice(startIndex, startIndex + logsPerPage);

    return {
      items: paginatedItems,
      totalItems,
      totalPages
    };
  }, [logs, logsSearch, logsPage]);


  // PPDB & Backup Operations (Using centralized client helper)
  const handlePpdbStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await httpClient(`/api/ppdb/${id}`, { method: "PUT", body: { status } }, user);
      showToast(`Status PPDB diperbarui ke ${status === 'approved' ? 'Disetujui' : 'Ditolak'}.`, "success");
      fetchData();
    } catch {
      showToast("Kesalahan server.", "error");
    }
  };

  const handleCreateBackup = async () => {
    try {
      await httpClient("/api/backups", { method: "POST" }, user);
      showToast("Cadangan database .sql berhasil dibuat!", "success");
      fetchData();
    } catch {
      showToast("Kesalahan server.", "error");
    }
  };

  const [pendingRestore, setPendingRestore] = useState<{ id: string; name: string } | null>(null);

  const handleRestoreBackup = async (id: string, name: string) => {
    // Use ConfirmDialog instead of window.confirm
    setConfirmDialog({ open: true, type: "restore", id, label: name });
    setPendingRestore({ id, name });
  };

  const executeRestoreBackup = async (id: string) => {
    try {
      await httpClient(`/api/backups/${id}/restore`, { method: "POST" }, user);
      showToast("Pemulihan data cadangan berhasil disimulasikan!", "success");
      fetchData();
    } catch {
      showToast("Kesalahan server.", "error");
    }
    setPendingRestore(null);
  };

  const handleDeleteBackup = async (id: string) => {
    try {
      await httpClient(`/api/backups/${id}`, { method: "DELETE" }, user);
      showToast("Berkas cadangan berhasil dihapus.", "success");
      fetchData();
    } catch {
      showToast("Kesalahan server.", "error");
    }
  };

  // Form Modal Triggers
  const openAddModal = (type: string) => {
    setFormType(type);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (type: string, item: AcademicYear | ClassRoom | Subject | Teacher | Student | Schedule) => {
    setFormType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openBulkImport = (type: "student" | "teacher") => {
    setBulkImportType(type);
    setIsBulkImportOpen(true);
  };

  // Export reports: Print & Excel
  const handlePrintReport = (title: string, tableId: string) => {
    const printableElement = document.getElementById(tableId);
    if (!printableElement) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #333; }
              h1 { font-size: 20px; margin-bottom: 5px; text-align: center; }
              h2 { font-size: 14px; margin-bottom: 20px; text-align: center; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
              th { background-color: #f5f5f5; font-weight: bold; }
              .logo { display: block; margin: 0 auto 10px; width: 60px; }
            </style>
          </head>
          <body>
            <img class="logo" src="${settings?.logo}" />
            <h1>${settings?.name}</h1>
            <h2>${title}</h2>
            ${printableElement.outerHTML}
            <div style="margin-top: 50px; text-align: right; font-size: 11px;">
              <p>${settings?.city || settings?.address?.split(',').pop()?.trim() || 'Sekolah'}, ${new Date().toLocaleDateString('id-ID')}</p>
              <br/><br/>
              <p><b>${settings?.principalName}</b></p>
              <p>Kepala Sekolah</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      window.print();
    }
  };

  const handleExportExcel = (filename: string, tableId: string) => {
    try {
      const table = document.getElementById(tableId);
      if (!table) {
        showToast("Tabel data tidak ditemukan.", "error");
        return;
      }
      const wb = XLSX.utils.table_to_book(table);
      XLSX.writeFile(wb, filename);
      showToast("Tabel berhasil diekspor ke Excel!", "success");
    } catch {
      showToast("Gagal mengekspor data ke Excel.", "error");
    }
  };

  const handlePrintTimetable = (classId: string) => {
    const classroom = classRooms.find(c => c.id === classId);
    if (!classroom) {
      showToast("Kelas tidak ditemukan.", "error");
      return;
    }
    const homeroomTeacher = teachers.find(t => t.id === classroom.homeroomTeacherId);
    const classSchedules = schedules.filter(s => s.classRoomId === classId);
    const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    
    const groupedSchedules: { [day: string]: typeof schedules } = {};
    daysOrder.forEach(day => {
      groupedSchedules[day] = classSchedules
        .filter(s => s.day === day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let rowsHtml = "";
      let hasSchedules = false;

      daysOrder.forEach(day => {
        const daySchedules = groupedSchedules[day];
        if (daySchedules.length > 0) {
          hasSchedules = true;
          rowsHtml += `
            <tr>
              <td colspan="4" class="day-header" style="background-color: #f1f5f9; font-weight: 800; color: #0f172a; border: 1.5px solid #0f172a; font-size: 10pt; padding: 6px 12px; text-align: left;">${day.toUpperCase()}</td>
            </tr>
          `;
          
          daySchedules.forEach((sc, idx) => {
            const subjName = subjects.find(s => s.id === sc.subjectId)?.name || "-";
            const teachName = teachers.find(t => t.id === sc.teacherId)?.name || "-";
            rowsHtml += `
              <tr>
                <td style="text-align: center; width: 8%; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 9.5pt;">${idx + 1}</td>
                <td style="text-align: center; font-family: monospace; font-weight: bold; width: 25%; border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 9.5pt;">${sc.startTime} - ${sc.endTime}</td>
                <td style="font-weight: bold; width: 35%; border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 9.5pt;">${subjName}</td>
                <td style="width: 32%; border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 9.5pt;">${teachName}</td>
              </tr>
            `;
          });
        }
      });

      if (!hasSchedules) {
        rowsHtml = `<tr><td colspan="4" style="text-align: center; padding: 30px; font-style: italic; border: 1px solid #cbd5e1;">Belum ada jadwal pelajaran yang diatur untuk kelas ini.</td></tr>`;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Jadwal Pelajaran Kelas ${classroom.name} - ${settings?.name}</title>
            <style>
              body { font-family: sans-serif; color: #1e293b; padding: 20px; }
              .school-header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; }
              .logo { width: 60px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 10pt; }
              th { background-color: #f1f5f9; font-weight: bold; }
              .footer-sign { display: flex; justify-content: space-between; margin-top: 40px; }
              .sign-box { text-align: center; width: 200px; }
            </style>
          </head>
          <body>
            <div class="school-header">
              <img class="logo" src="${settings?.logo}" />
              <div>
                <h2>${settings?.name}</h2>
                <p>${settings?.address || ''}</p>
              </div>
            </div>
            <h3 style="text-align: center; margin-top: 20px;">Jadwal Pelajaran Kelas ${classroom.name}</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 8%;">No</th>
                  <th style="width: 25%;">Waktu</th>
                  <th style="width: 35%;">Mata Pelajaran</th>
                  <th style="width: 32%;">Guru Pengampu</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
            <div class="footer-sign">
              <div class="sign-box">
                <p>Wali Kelas</p>
                <br/><br/>
                <p><b>${homeroomTeacher?.name || "..................."}</b></p>
              </div>
              <div class="sign-box">
                <p>Kepala Sekolah</p>
                <br/><br/>
                <p><b>${settings?.principalName || "..................."}</b></p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans" id="academic-panel-container">
      {/* Navigation Sidebar */}
      <Sidebar
        user={user}
        settings={settings}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        allowedMenus={allowedMenus}
        canAccess={canAccess}
        setActiveMenu={setActiveMenu}
        setSearchTerm={setSearchTerm}
        onLogout={onLogout}
        setIsAvatarModalOpen={setIsAvatarModalOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header
          user={user}
          activeMenu={activeMenu}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          academicYears={academicYears}
          notifications={notifications}
          setNotifications={setNotifications}
          notifDropdownOpen={notifDropdownOpen}
          setNotifDropdownOpen={setNotifDropdownOpen}
          isOnline={isOnline}
          showToast={showToast}
        />

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 relative z-10" id="main-panel-scroll">
          {loading ? (
            <DashboardHomeSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMenu}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="space-y-6 w-full"
              >
                <RouteGuard
                  user={user}
                  activeMenu={activeMenu}
                  fallbackGoHome={() => {
                    setActiveMenu("home");
                    window.location.hash = "home";
                  }}
                >
                  {/* --- ADMIN & SUPER ADMIN TABS --- */}
              {user.role !== "siswa" && user.role !== "guru" ? (
                <>
                  {activeMenu === "home" && (
                    <div className="space-y-6" id="admin-home-view">
                      <DashboardStats
                        students={students}
                        teachers={teachers}
                        classRooms={classRooms}
                        attendances={allAttendances}
                        ppdbList={ppdbList}
                      />
                      <AcademicPerformanceCharts
                        students={students}
                        grades={allGrades}
                        subjects={subjects}
                        classRooms={classRooms}
                        attendances={allAttendances}
                      />
                    </div>
                  )}

                  {activeMenu === "settings" && settingsForm && (
                    <AdminSettings
                      settingsForm={settingsForm}
                      setSettingsForm={setSettingsForm}
                      handleSettingsUpdate={async (e) => {
                        e.preventDefault();
                        await handleSettingsUpdate(settingsForm);
                      }}
                      isSyncing={isSyncing}
                      isDisconnecting={isDisconnecting}
                      handleGoogleSheetsSync={handleGoogleSheetsSync}
                      handleGoogleSheetsDisconnect={handleGoogleSheetsDisconnect}
                    />
                  )}

                  {activeMenu === "academicyear" && (
                    <AdminAcademicYears
                      academicYears={academicYears}
                      openAddModal={openAddModal}
                      openEditModal={openEditModal}
                      handleActivateAcademicYear={handleActivateAcademicYear}
                      handlePrintReport={handlePrintReport}
                      handleExportExcel={handleExportExcel}
                    />
                  )}

                  {activeMenu === "classroom" && (
                    <AdminClassrooms
                      classRooms={classRooms}
                      teachers={teachers}
                      openAddModal={openAddModal}
                      openEditModal={openEditModal}
                      handleDeleteItem={(type, id) => {
                        const cls = classRooms.find(c => c.id === id);
                        setConfirmDialog({ open: true, type, id, label: cls?.name });
                      }}
                      handlePrintReport={handlePrintReport}
                      handleExportExcel={handleExportExcel}
                    />
                  )}

                  {activeMenu === "subject" && (
                    <AdminSubjects
                      subjects={subjects}
                      openAddModal={openAddModal}
                      openEditModal={openEditModal}
                      handleDeleteItem={(type, id) => {
                        const subj = subjects.find(s => s.id === id);
                        setConfirmDialog({ open: true, type, id, label: subj?.name });
                      }}
                      handlePrintReport={handlePrintReport}
                      handleExportExcel={handleExportExcel}
                    />
                  )}

                  {activeMenu === "teacher" && (
                    <AdminTeachers
                      teachers={teachers}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      openAddModal={openAddModal}
                      openEditModal={openEditModal}
                      handleDeleteItem={(type, id) => {
                        const teacher = teachers.find(t => t.id === id);
                        setConfirmDialog({ open: true, type, id, label: teacher?.name });
                      }}
                      handlePrintReport={handlePrintReport}
                      handleExportExcel={() => handleExportExcel("data-guru.xlsx", "teacher-table")}
                      openBulkImport={openBulkImport}
                    />
                  )}

                  {activeMenu === "student" && (
                    <AdminStudents
                      students={students}
                      classRooms={classRooms}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      selectedClassId={selectedClassId}
                      setSelectedClassId={setSelectedClassId}
                      openAddModal={openAddModal}
                      openEditModal={openEditModal}
                      handleDeleteItem={(type, id) => {
                        const student = students.find(s => s.id === id);
                        setConfirmDialog({ open: true, type, id, label: student?.name });
                      }}
                      handlePrintReport={handlePrintReport}
                      handleExportExcel={() => handleExportExcel("data-siswa.xlsx", "student-table")}
                      openBulkImport={openBulkImport}
                    />
                  )}

                  {activeMenu === "schedule" && (
                    <AdminScheduleGrid
                      schedules={schedules}
                      classRooms={classRooms}
                      subjects={subjects}
                      teachers={teachers}
                      selectedClassId={selectedClassId}
                      setSelectedClassId={setSelectedClassId}
                      onRefresh={fetchData}
                      showToast={showToast}
                    />
                  )}

                  {activeMenu === "reports" && (
                    <ReportGenerator
                      students={students}
                      classRooms={classRooms}
                      teachers={teachers}
                      subjects={subjects}
                      settings={settings}
                      academicYears={academicYears}
                      userRole={user.role}
                      attendances={allAttendances}
                    />
                  )}

                  {activeMenu === "ppdb" && (
                    <div className="space-y-6" id="admin-ppdb-view">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Penerimaan Calon Siswa Baru (PPDB)</h4>
                          <p className="text-slate-400 text-[10px] font-medium font-mono">Verifikasi berkas dan registrasi PPDB</p>
                        </div>
                        {/* Search and Filter Inputs */}
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Cari nama, No. Reg, sekolah..."
                            value={ppdbSearch}
                            onChange={(e) => setPpdbSearch(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 w-full sm:w-60"
                          />
                          <select
                            value={ppdbFilterStatus}
                            onChange={(e) => setPpdbFilterStatus(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 cursor-pointer"
                          >
                            <option value="all">Semua Status</option>
                            <option value="pending">Tertunda</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                          </select>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                                <th className="py-3 px-4">No. Registrasi</th>
                                <th className="py-3 px-4">Nama Lengkap</th>
                                <th className="py-3 px-4">Sekolah Asal</th>
                                <th className="py-3 px-4">Kontak Orang Tua</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {filteredPPDB.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="py-4 px-4 font-mono font-bold text-blue-600">{p.registrationNo}</td>
                                  <td className="py-4 px-4 font-bold text-slate-800">{p.fullName}</td>
                                  <td className="py-4 px-4 text-slate-500">{p.prevSchool}</td>
                                  <td className="py-4 px-4 text-slate-600">{p.parentName} ({p.parentPhone})</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider font-mono ${
                                      p.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                      p.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                      'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                      {p.status === 'approved' ? 'Disetujui' : p.status === 'rejected' ? 'Ditolak' : 'Tertunda'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right space-x-1.5">
                                    {p.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handlePpdbStatusChange(p.id, 'approved')}
                                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg font-bold text-[10px] cursor-pointer"
                                        >
                                          Setujui
                                        </button>
                                        <button
                                          onClick={() => handlePpdbStatusChange(p.id, 'rejected')}
                                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-lg font-bold text-[10px] cursor-pointer"
                                        >
                                          Tolak
                                        </button>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              {filteredPPDB.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">Tidak ada data pendaftaran PPDB yang cocok.</td>
                                </tr>
                              )}
                            </tbody>

                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeMenu === "logs" && (
                    <div className="space-y-6" id="admin-logs-view">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Audit Trail & Log Aktivitas</h4>
                          <p className="text-slate-400 text-[10px] font-medium font-mono">Pemantauan riwayat aksi pengguna secara real-time</p>
                        </div>
                        {/* Search logs */}
                        <div className="w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Cari pengguna, aksi, IP..."
                            value={logsSearch}
                            onChange={(e) => {
                              setLogsSearch(e.target.value);
                              setLogsPage(1); // reset to page 1 on search
                            }}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 w-full sm:w-60"
                          />
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                                <th className="py-3 px-4">Pengguna</th>
                                <th className="py-3 px-4">Peran</th>
                                <th className="py-3 px-4">Aksi / Aktivitas</th>
                                <th className="py-3 px-4">IP Address</th>
                                <th className="py-3 px-4">Waktu Kejadian</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {filteredLogsData.items.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="py-4 px-4 font-bold text-slate-800">{log.username}</td>
                                  <td className="py-4 px-4 uppercase text-[10px] font-bold font-mono text-slate-400">{log.role}</td>
                                  <td className="py-4 px-4 text-slate-600 font-medium">{log.action}</td>
                                  <td className="py-4 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                                  <td className="py-4 px-4 text-slate-400 font-mono">{log.timestamp}</td>
                                </tr>
                              ))}
                              {filteredLogsData.items.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">Tidak ada log aktivitas yang cocok.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination controls */}
                        {filteredLogsData.totalPages > 1 && (
                          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-100 text-xs">
                            <button
                              disabled={logsPage === 1}
                              onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                            >
                              Sebelumnya
                            </button>
                            <span className="font-mono text-slate-500 font-bold">
                              Halaman {logsPage} dari {filteredLogsData.totalPages} ({filteredLogsData.totalItems} log)
                            </span>
                            <button
                              disabled={logsPage === filteredLogsData.totalPages}
                              onClick={() => setLogsPage(prev => Math.min(filteredLogsData.totalPages, prev + 1))}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                            >
                              Selanjutnya
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeMenu === "backups" && (
                    <div className="space-y-6" id="admin-backups-view">
                      <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Database Backup & Recovery</h4>
                          <p className="text-slate-400 text-[10px] font-medium font-mono">Pencadangan manual dan pemulihan data sistem sekolah</p>
                        </div>
                        <button
                          onClick={handleCreateBackup}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          Buat Cadangan Baru
                        </button>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                                <th className="py-3 px-4">Nama Berkas Cadangan</th>
                                <th className="py-3 px-4">Ukuran Data</th>
                                <th className="py-3 px-4">Tanggal Dibuat</th>
                                <th className="py-3 px-4 text-right">Aksi Data</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                              {backups.map((bkp) => (
                                <tr key={bkp.id} className="hover:bg-slate-50/40 transition-colors">
                                  <td className="py-4 px-4 font-mono font-bold text-slate-800">{bkp.filename}</td>
                                  <td className="py-4 px-4 font-mono text-slate-500">{bkp.size}</td>
                                  <td className="py-4 px-4 text-slate-600">{bkp.timestamp}</td>
                                  <td className="py-4 px-4 text-right space-x-2">
                                    <button
                                      onClick={() => handleRestoreBackup(bkp.id, bkp.filename)}
                                      className="text-blue-600 hover:text-blue-800 font-bold inline-block focus:outline-none cursor-pointer"
                                      title="Pulihkan cadangan database"
                                    >
                                      Pulihkan
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBackup(bkp.id)}
                                      className="text-rose-500 hover:text-rose-700 font-bold inline-block focus:outline-none cursor-pointer"
                                      title="Hapus cadangan"
                                    >
                                      Hapus
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : user.role === "guru" ? (
                /* --- GURU TABS --- */
                <>
                  {activeMenu === "home" && (
                    <div className="space-y-6" id="guru-home-view">
                      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-2 z-10">
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">Selamat Datang Kembali, {user.name}</h3>
                          <p className="text-xs text-blue-100 font-medium">Periksa absensi harian siswa dan isi rekapitulasi nilai rapor kelas Anda hari ini.</p>
                        </div>
                        <div className="flex gap-2 z-10 shrink-0">
                          <span className="inline-flex items-center gap-1 bg-white/10 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono">
                            NIP: {teachers.find(t => t.userId === user.id)?.nip || "-"}
                          </span>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-2xl" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600 font-mono">Jadwal Mengajar Hari Ini</h4>
                            <p className="text-slate-400 text-[10px] font-medium">Data jadwal sinkronisasi kalender akademik sekolah</p>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {schedules
                              .filter(s => s.teacherId === teachers.find(t => t.userId === user.id)?.id)
                              .map(s => (
                                <div key={s.id} className="py-3 flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-bold text-slate-800">{classRooms.find(c => c.id === s.classRoomId)?.name || "-"}</p>
                                    <p className="text-slate-400 font-medium text-[10px]">{subjects.find(sub => sub.id === s.subjectId)?.name || "-"}</p>
                                  </div>
                                  <span className="font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{s.startTime} - {s.endTime}</span>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-600 font-mono">Akses Cepat Pengisian</h4>
                            <p className="text-slate-400 text-[10px] font-medium">Buka absensi atau nilai rapor langsung</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setActiveMenu("attendance")}
                              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-left cursor-pointer transition-all"
                            >
                              <p className="font-bold text-slate-800 text-xs">Isi Absensi</p>
                              <p className="text-slate-400 text-[10px] mt-1">Presensi GPS kelas</p>
                            </button>
                            <button
                              onClick={() => setActiveMenu("grades")}
                              className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-left cursor-pointer transition-all"
                            >
                              <p className="font-bold text-slate-800 text-xs">Input Nilai</p>
                              <p className="text-slate-400 text-[10px] mt-1">Evaluasi & KKM siswa</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeMenu === "checkin" && (
                    <div className="space-y-6" id="guru-checkin-view">
                      <DailyCheckIn 
                        user={user} 
                        students={students} 
                        classRooms={classRooms} 
                        showToast={showToast} 
                      />
                    </div>
                  )}

                  {activeMenu === "attendance" && (
                    <TeacherAttendance
                      classRooms={classRooms}
                      selectedClassId={selectedClassId}
                      setSelectedClassId={setSelectedClassId}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      classStudents={classStudents}
                      tempAttendances={tempAttendances}
                      setTempAttendances={setTempAttendances}
                      handleSaveAttendance={handleSaveAttendance}
                    />
                  )}

                  {activeMenu === "grades" && (
                    <TeacherGrades
                      classRooms={classRooms}
                      selectedClassId={selectedClassId}
                      setSelectedClassId={setSelectedClassId}
                      subjects={subjects}
                      selectedSubjectId={selectedSubjectId}
                      setSelectedSubjectId={setSelectedSubjectId}
                      classStudents={classStudents}
                      tempGrades={tempGrades}
                      setTempGrades={setTempGrades}
                      handleSaveGrades={handleSaveGrades}
                    />
                  )}

                  {activeMenu === "reports" && (
                    <ReportGenerator
                      students={students}
                      classRooms={classRooms}
                      teachers={teachers}
                      subjects={subjects}
                      settings={settings}
                      academicYears={academicYears}
                      userRole={user.role}
                      attendances={allAttendances}
                    />
                  )}
                </>
              ) : (
                /* --- SISWA TABS --- */
                <>
                  {activeMenu === "home" && (
                    <div className="space-y-6" id="siswa-home-view">
                      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-2 z-10">
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">Halo, {user.name}</h3>
                          <p className="text-xs text-blue-100 font-medium">Selamat datang di portal akademik. Periksa rekap kehadiran dan kartu hasil evaluasi nilai Anda.</p>
                        </div>
                        <div className="flex gap-2 z-10 shrink-0">
                          <span className="inline-flex items-center gap-1 bg-white/10 px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono">
                            NISN: {students.find(s => s.userId === user.id)?.nisn || "-"}
                          </span>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/5 rounded-full blur-2xl" />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider font-mono">Kelas Anda</h4>
                            <p className="font-black text-slate-800 text-sm">
                              {classRooms.find(c => c.id === students.find(s => s.userId === user.id)?.classRoomId)?.name || "-"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider font-mono">Wali Kelas</h4>
                            <p className="font-bold text-slate-700 text-xs">
                              {teachers.find(t => t.id === classRooms.find(c => c.id === students.find(s => s.userId === user.id)?.classRoomId)?.homeroomTeacherId)?.name || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider font-mono">Persentase Kehadiran</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-black text-emerald-600 font-mono">
                                {(() => {
                                  const totalDays = allAttendances.filter(a => a.studentId === user.detailsId).length;
                                  if (totalDays === 0) return "100%";
                                  const presentDays = allAttendances.filter(a => a.studentId === user.detailsId && a.status === 'Hadir').length;
                                  return `${Math.round((presentDays / totalDays) * 100)}%`;
                                })()}
                              </span>
                              <span className="text-[9px] text-slate-400 font-medium">Hadir dari total hari belajar terdata</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider font-mono">Akun Terhubung</h4>
                            <div className="flex items-center gap-2">
                              {user.active ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                  <ShieldCheck className="w-4 h-4" /> Akun Terverifikasi
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-500 text-xs font-bold">
                                  <ShieldAlert className="w-4 h-4" /> Butuh Aktivasi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <StudentAchievements
                        studentId={user.detailsId || ""}
                        attendances={allAttendances}
                        grades={allGrades}
                        subjects={subjects}
                      />
                    </div>
                  )}

                  {activeMenu === "grades" && (
                    <div className="space-y-6" id="student-grades-view">
                      <StudentGradesChart
                        studentId={user.detailsId || ""}
                        grades={allGrades}
                        subjects={subjects}
                      />
                      <ReportGenerator
                        students={students.filter(s => s.id === user.detailsId)}
                        classRooms={classRooms}
                        teachers={teachers}
                        subjects={subjects}
                        settings={settings}
                        academicYears={academicYears}
                        userRole={user.role}
                        attendances={allAttendances}
                      />
                    </div>
                  )}

                  {activeMenu === "schedule" && (
                    <div className="space-y-6" id="student-schedule-view">
                      <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Jadwal Pelajaran Anda</h4>
                          <p className="text-slate-400 text-[10px] font-medium font-mono">Cetak atau simpan jadwal resmi resmi</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const currentStudent = students.find(s => s.id === user.detailsId);
                              if (currentStudent) handlePrintTimetable(currentStudent.classRoomId);
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs border border-slate-200"
                          >
                            <Printer className="w-4 h-4" /> Cetak Kertas (Window)
                          </button>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                              <th className="py-3 px-4">Hari</th>
                              <th className="py-3 px-4">Waktu Belajar</th>
                              <th className="py-3 px-4">Mata Pelajaran</th>
                              <th className="py-3 px-4">Guru Pengampu</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600">
                            {studentSchedules
                              .sort((a, b) => {
                                const daysOrder: { [key: string]: number } = { "Senin": 1, "Selasa": 2, "Rabu": 3, "Kamis": 4, "Jumat": 5, "Sabtu": 6 };
                                return (daysOrder[a.day] || 99) - (daysOrder[b.day] || 99);
                              })
                              .map((sc) => (
                                <tr key={sc.id} className="hover:bg-slate-50/30 transition-colors">
                                  <td className="py-4 px-4 font-bold text-slate-800">{sc.day}</td>
                                  <td className="py-4 px-4 font-mono font-bold text-slate-500">{sc.startTime} - {sc.endTime}</td>
                                  <td className="py-4 px-4 font-semibold text-slate-800">{subjects.find(s => s.id === sc.subjectId)?.name || "-"}</td>
                                  <td className="py-4 px-4 text-slate-700 font-medium">{teachers.find(t => t.id === sc.teacherId)?.name || "-"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeMenu === "checkin" && (
                    <div className="space-y-6" id="student-checkin-view">
                      <DailyCheckIn 
                        user={user} 
                        students={students} 
                        classRooms={classRooms} 
                        showToast={showToast} 
                      />
                    </div>
                  )}
                </>
              )}

              {/* --- GLOBAL TABS --- */}
              {activeMenu === "calendar" && (
                <div className="space-y-6" id="global-calendar-view">
                  <AcademicCalendar />
                </div>
              )}

              {activeMenu === "messages" && user.role !== "siswa" && (
                <div className="space-y-6" id="global-messages-view">
                  <ParentNotifier 
                    students={students} 
                    classRooms={classRooms} 
                    showToast={showToast} 
                  />
                </div>
              )}

              {activeMenu === "forum" && (
                <div className="space-y-6" id="global-forum-view">
                  <DiscussionForum 
                    user={user} 
                    showToast={showToast} 
                  />
                </div>
              )}
                </RouteGuard>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* --- ADD / EDIT FORM MODAL --- */}
      <CrudFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formType={formType}
        editingItem={editingItem}
        teachers={teachers}
        classRooms={classRooms}
        subjects={subjects}
        onSubmit={handleCrudSubmit}
      />

      {/* --- AVATAR MODAL --- */}
      <AvatarPickerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={user.avatar}
        onSave={(newAvatar) => {
          AuthService.updateProfile(user.id, { name: user.name, email: user.email, avatar: newAvatar }, user)
            .then(data => {
              if (data.success) {
                onUpdateUser(data.user);
                showToast("Foto profil Anda telah berhasil diperbarui di server!", "success");
              } else {
                showToast("Gagal menyimpan foto profil ke server.", "error");
              }
            })
            .catch(() => {
              onUpdateUser({ ...user, avatar: newAvatar });
              showToast("Foto profil Anda diperbarui secara lokal.", "warning");
            });
        }}
        showToast={showToast}
      />

      {/* --- CSV BULK IMPORT MODAL --- */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        type={bulkImportType}
        classRooms={classRooms}
        onImportSuccess={fetchData}
        showToast={showToast}
        userRole={user.role}
        userUsername={user.username}
      />

      {/* --- CONFIRM DIALOG (replaces window.confirm) --- */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.type === "restore"
          ? "Konfirmasi Pemulihan Database"
          : `Hapus Data ${confirmDialog.type ? confirmDialog.type.charAt(0).toUpperCase() + confirmDialog.type.slice(1) : ""}`}
        message={confirmDialog.type === "restore"
          ? `Yakin ingin memulihkan database ke cadangan "${confirmDialog.label}"? Semua data yang saat ini aktif akan tertimpa dan tidak dapat dikembalikan.`
          : `Apakah Anda yakin ingin menghapus "${confirmDialog.label || "data ini"}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={confirmDialog.type === "restore" ? "Ya, Pulihkan Sekarang" : "Ya, Hapus Data"}
        cancelLabel="Batal"
        variant={confirmDialog.type === "restore" ? "warning" : "danger"}
        onCancel={() => {
          setConfirmDialog({ open: false, type: "", id: "", label: undefined });
          setPendingRestore(null);
        }}
        onConfirm={async () => {
          setConfirmDialog({ open: false, type: "", id: "", label: undefined });
          if (confirmDialog.type === "restore" && pendingRestore) {
            await executeRestoreBackup(pendingRestore.id);
          } else if (confirmDialog.id && confirmDialog.type) {
            await handleDeleteItem(confirmDialog.type, confirmDialog.id);
          }
        }}
      />
    </div>

  );
}
