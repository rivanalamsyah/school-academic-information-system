import { createContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { DashboardService } from "../services/dashboard.service";
import { initAuthListener } from "../utils/firebaseAuth";
import {
  User,
  SchoolSettings,
  AcademicYear,
  ClassRoom,
  Subject,
  Teacher,
  Student,
  Schedule,
  PPDBRegistration,
  ActivityLog,
  Backup,
  Attendance,
  Grade,
  NotificationItem,
  TempAttendanceRecord,
  TempGradeRecord,
} from "../types";

interface SchoolDataContextType {
  // DB Lists
  settings: SchoolSettings | null;
  academicYears: AcademicYear[];
  classRooms: ClassRoom[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  schedules: Schedule[];
  ppdbList: PPDBRegistration[];
  logs: ActivityLog[];
  backups: Backup[];
  allAttendances: Attendance[];
  allGrades: Grade[];

  // DB Sync / Mutate Statuses
  loading: boolean;
  isSyncing: boolean;
  isDisconnecting: boolean;
  isOnline: boolean;

  // Filter & Search criteria states
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  // Form controls
  editingItem: AcademicYear | ClassRoom | Subject | Teacher | Student | Schedule | null;
  setEditingItem: (item: AcademicYear | ClassRoom | Subject | Teacher | Student | Schedule | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  formType: string;
  setFormType: (type: string) => void;
  isBulkImportOpen: boolean;
  setIsBulkImportOpen: (open: boolean) => void;
  bulkImportType: "student" | "teacher";
  setBulkImportType: (type: "student" | "teacher") => void;

  // Confirm dialog state (replaces window.confirm)
  confirmDialog: { open: boolean; type: string; id: string; label?: string };
  setConfirmDialog: React.Dispatch<React.SetStateAction<{ open: boolean; type: string; id: string; label?: string }>>;

  // Notification pool
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  notifDropdownOpen: boolean;
  setNotifDropdownOpen: (open: boolean) => void;

  // Guru helper items
  classStudents: Student[];
  tempAttendances: TempAttendanceRecord;
  setTempAttendances: React.Dispatch<React.SetStateAction<TempAttendanceRecord>>;
  tempGrades: TempGradeRecord;
  setTempGrades: React.Dispatch<React.SetStateAction<TempGradeRecord>>;

  // Actions
  fetchData: () => Promise<void>;
  handleGoogleSheetsSync: () => Promise<void>;
  handleGoogleSheetsDisconnect: () => Promise<void>;
  handleSettingsUpdate: (settingsForm: SchoolSettings) => Promise<void>;
  handleCrudSubmit: (formData: Record<string, unknown>) => Promise<void>;
  handleActivateAcademicYear: (id: string, year: string) => Promise<void>;
  handleDeleteItem: (type: string, id: string) => Promise<void>;
  handleSaveAttendance: () => Promise<void>;
  handleSaveGrades: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

interface SchoolDataProviderProps {
  user: User;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
  children: ReactNode;
}

export function SchoolDataProvider({ user, showToast, children }: SchoolDataProviderProps) {
  // DB State lists
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classRooms, setClassRooms] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [ppdbList, setPpdbList] = useState<PPDBRegistration[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [allAttendances, setAllAttendances] = useState<Attendance[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);

  // DB Sync statuses
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Search & filter configs
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().substring(0, 10));

  // Modals & controls
  const [editingItem, setEditingItem] = useState<AcademicYear | ClassRoom | Subject | Teacher | Student | Schedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<string>("");
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportType, setBulkImportType] = useState<"student" | "teacher">("student");

  // Confirm dialog state — replaces window.confirm() throughout the app
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: string; id: string; label?: string }>({ open: false, type: "", id: "", label: undefined });

  // Notifications pool
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Persist notification read state to localStorage whenever it changes
  useEffect(() => {
    if (!user?.id || notifications.length === 0) return;
    const storageKey = `sias_notif_read_${user.id}`;
    const readIds = notifications.filter(n => n.read).map(n => n.id);
    localStorage.setItem(storageKey, JSON.stringify(readIds));
  }, [notifications, user?.id]);

  // Guru dashboard helpers
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [tempAttendances, setTempAttendances] = useState<TempAttendanceRecord>({});
  const [tempGrades, setTempGrades] = useState<TempGradeRecord>({});

  // Online status effect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Koneksi internet terhubung kembali! Sinkronisasi portal aktif.", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast("Koneksi internet terputus. Menggunakan data portal yang tersimpan di cache.", "warning");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast]);

  // Load notifications
  useEffect(() => {
    let initialNotifs: NotificationItem[] = [];
    const storageKey = `sias_notif_read_${user.id}`;
    const readIds: string[] = JSON.parse(localStorage.getItem(storageKey) || "[]");

    if (user.role === "siswa") {
      initialNotifs = [
        {
          id: "notif-1",
          title: "Kartu Ujian Semester Ganjil",
          message: "Kartu peserta Ujian Tengah Semester Anda telah dicetak dan siap diunduh di menu Rapor.",
          type: "success",
          time: "10 menit yang lalu",
          read: readIds.includes("notif-1"),
          category: "umum",
        },
        {
          id: "notif-2",
          title: "Verifikasi Soal Ujian Kimia",
          message: "Draf lembar soal ujian kimia kelas XI IPA telah diunggah dan membutuhkan persetujuan Anda.",
          type: "warning",
          time: "3 jam yang lalu",
          read: readIds.includes("notif-2"),
          category: "ujian",
        },
        {
          id: "notif-3",
          title: "Rapat Koordinasi Evaluasi Kurikulum",
          message: "Rapat koordinasi dewan guru dijadwalkan sore ini pukul 14:00 WIB di Ruang Rapat Utama.",
          type: "info",
          time: "6 jam yang lalu",
          read: readIds.includes("notif-3"),
          category: "umum",
        },
      ];
    } else {
      initialNotifs = [
        {
          id: "notif-1",
          title: "Pengaturan Tahun Pelajaran Baru",
          message: "Kalender akademik dan tahun pelajaran baru membutuhkan aktivasi kurikulum final.",
          type: "warning",
          time: "30 menit yang lalu",
          read: readIds.includes("notif-1"),
          category: "umum",
        },
        {
          id: "notif-2",
          title: "Verifikasi Berkas PPDB Mandiri",
          message: "Terdapat 6 berkas registrasi calon siswa baru yang belum diverifikasi di dasbor PPDB.",
          type: "info",
          time: "2 jam yang lalu",
          read: readIds.includes("notif-2"),
          category: "tugas",
        },
        {
          id: "notif-3",
          title: "Pencadangan Otomatis Selesai",
          message: "Pencadangan basis data sistem akademik mingguan telah berhasil disimpan di server utama.",
          type: "success",
          time: "4 jam yang lalu",
          read: readIds.includes("notif-3"),
          category: "umum",
        },
      ];
    }
    setNotifications(initialNotifs);
  }, [user.role]);

  // Fetch all db lists
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DashboardService.fetchAll(user);
      setSettings(data.settings);
      setAcademicYears(data.academicYears);
      setClassRooms(data.classRooms);
      setSubjects(data.subjects);
      setTeachers(data.teachers);
      setStudents(data.students);
      setSchedules(data.schedules);
      setPpdbList(data.ppdbList);
      setLogs(data.logs);
      setBackups(data.backups);
      setAllAttendances(data.allAttendances);
      setAllGrades(data.allGrades);
    } catch {
      showToast("Gagal mengambil data sistem dari server.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // Set default selection values once loaded
  useEffect(() => {
    if (classRooms.length > 0 && !selectedClassId) {
      setSelectedClassId(classRooms[0].id);
    }
  }, [classRooms, selectedClassId]);

  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  // Initialize
  useEffect(() => {
    fetchData();
    const unsubscribe = initAuthListener(
      () => {
        console.warn("Google Account Connected successfully!");
      },
      () => {
        console.warn("Google Account is disconnected");
      }
    );
    return () => unsubscribe();
  }, [fetchData]);

  // Synchronize student and grades state for guru inputs
  useEffect(() => {
    if (selectedClassId) {
      const filtered = students.filter((s) => s.classRoomId === selectedClassId);
      setClassStudents(filtered);

      const attMap: Record<string, { status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | '', notes: string }> = {};
      const grMap: Record<string, { assignmentScore: number, utsScore: number, uasScore: number, notes: string }> = {};
      filtered.forEach((s) => {
        const keyDate = selectedDate;
        const record = allAttendances.find(
          (a) => a.studentId === s.id && a.date === keyDate && a.classRoomId === selectedClassId
        );
        attMap[s.id] = { status: record?.status || "", notes: record?.notes || "" };

        const activeAY = academicYears.find((ay) => ay.active);
        const score = allGrades.find(
          (g) =>
            g.studentId === s.id &&
            g.subjectId === selectedSubjectId &&
            g.classRoomId === selectedClassId &&
            g.academicYearId === activeAY?.id
        );
        grMap[s.id] = {
          assignmentScore: score?.assignmentScore ?? 80,
          utsScore: score?.utsScore ?? 80,
          uasScore: score?.uasScore ?? 80,
          notes: score?.notes ?? "",
        };
      });
      setTempAttendances(attMap);
      setTempGrades(grMap);
    }
  }, [
    selectedClassId,
    selectedDate,
    selectedSubjectId,
    students,
    allAttendances,
    allGrades,
    academicYears,
  ]);

  // Sheets Sync Actions
  const handleGoogleSheetsSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await DashboardService.syncGoogleSheets(user);
      showToast("Sinkronisasi database sekolah ke Google Sheets cloud berhasil!", "success");
      await fetchData();
    } catch {
      showToast("Gagal melakukan sinkronisasi dengan Google Sheets.", "error");
    } finally {
      setIsSyncing(false);
    }
  }, [user, showToast, fetchData]);

  const handleGoogleSheetsDisconnect = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      await DashboardService.disconnectGoogleSheets(user);
      showToast("Sambungan integrasi Google Sheets berhasil diputus.", "success");
      await fetchData();
    } catch {
      showToast("Kesalahan koneksi.", "error");
    } finally {
      setIsDisconnecting(false);
    }
  }, [user, showToast, fetchData]);

  // Settings Actions
  const handleSettingsUpdate = useCallback(async (settingsForm: SchoolSettings) => {
    try {
      await DashboardService.updateSettings(settingsForm, user);
      showToast("Identitas dan pengaturan sekolah berhasil diperbarui!", "success");
      await fetchData();
    } catch {
      showToast("Gagal menyimpan identitas sekolah.", "error");
    }
  }, [user, showToast, fetchData]);

  // Generic CRUD Save
  const handleCrudSubmit = useCallback(async (formData: Record<string, unknown>) => {
    const bodyData = { ...formData };
    if (formType === "classroom") {
      bodyData.homeroomTeacherId = formData.homeroomTeacherId;
    }

    try {
      await DashboardService.crudSubmit(formType, bodyData, editingItem?.id || null, user);
      showToast(`${editingItem ? "Memperbarui" : "Menambahkan"} data berhasil!`, "success");
      setIsModalOpen(false);
      setEditingItem(null);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan data.";
      showToast(msg, "error");
    }
  }, [formType, editingItem, user, showToast, fetchData]);

  // Activate Academic Year
  const handleActivateAcademicYear = useCallback(async (id: string, year: string) => {
    try {
      await DashboardService.activateAcademicYear(id, true, user);
      showToast(`Tahun Ajaran ${year} diaktifkan!`, "success");
      await fetchData();
    } catch {
      showToast("Gagal mengaktifkan tahun pelajaran.", "error");
    }
  }, [user, showToast, fetchData]);

  // Generic CRUD Delete — no longer uses window.confirm(); caller must show ConfirmDialog
  const handleDeleteItem = useCallback(async (type: string, id: string) => {
    try {
      await DashboardService.deleteItem(type, id, user);
      showToast("Data berhasil dihapus dari sistem.", "success");
      await fetchData();
    } catch {
      showToast("Gagal menghapus data.", "error");
    }
  }, [user, showToast, fetchData]);

  // Save Attendance
  const handleSaveAttendance = useCallback(async () => {
    const studentIds = Object.keys(tempAttendances);
    
    // Check if any student has not been marked
    const unselectedStudentIds = studentIds.filter(id => tempAttendances[id].status === "");
    if (unselectedStudentIds.length > 0) {
      showToast("Harap tentukan status kehadiran untuk semua siswa terlebih dahulu.", "warning");
      return;
    }

    const records = studentIds.map((studentId) => ({
      studentId,
      status: tempAttendances[studentId].status as 'Hadir' | 'Sakit' | 'Izin' | 'Alpa',
      notes: tempAttendances[studentId].notes,
    }));

    try {
      await DashboardService.saveAttendance(
        selectedClassId,
        selectedDate,
        records,
        user.name,
        user
      );
      showToast("Data absensi siswa berhasil disimpan!", "success");
      await fetchData();
    } catch {
      showToast("Gagal menyimpan absensi.", "error");
    }
  }, [tempAttendances, selectedClassId, selectedDate, user, showToast, fetchData]);

  // Save Grades
  const handleSaveGrades = useCallback(async () => {
    const activeAY = academicYears.find((ay) => ay.active);
    if (!activeAY) {
      showToast("Tidak ada tahun ajaran yang sedang aktif.", "warning");
      return;
    }

    const gradeRecords = Object.keys(tempGrades).map((studentId) => ({
      studentId,
      assignmentScore: tempGrades[studentId].assignmentScore,
      utsScore: tempGrades[studentId].utsScore,
      uasScore: tempGrades[studentId].uasScore,
      notes: tempGrades[studentId].notes,
    }));

    try {
      await DashboardService.saveGrades(
        selectedClassId,
        selectedSubjectId,
        activeAY.id,
        gradeRecords,
        user
      );
      showToast("Data evaluasi nilai siswa berhasil disimpan!", "success");
      await fetchData();
    } catch {
      showToast("Gagal menyimpan rekapitulasi nilai.", "error");
    }
  }, [academicYears, tempGrades, selectedClassId, selectedSubjectId, user, showToast, fetchData]);

  const value = useMemo(
    () => ({
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
      confirmDialog,
      setConfirmDialog,
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
    }),
    [
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
      selectedClassId,
      selectedSubjectId,
      selectedDate,
      editingItem,
      isModalOpen,
      formType,
      isBulkImportOpen,
      bulkImportType,
      confirmDialog,
      notifications,
      notifDropdownOpen,
      classStudents,
      tempAttendances,
      tempGrades,
      fetchData,
      handleGoogleSheetsSync,
      handleGoogleSheetsDisconnect,
      handleSettingsUpdate,
      handleCrudSubmit,
      handleActivateAcademicYear,
      handleDeleteItem,
      handleSaveAttendance,
      handleSaveGrades,
    ]
  );

  return <SchoolDataContext.Provider value={value}>{children}</SchoolDataContext.Provider>;
}
