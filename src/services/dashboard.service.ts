import { httpClient, APIError } from "../core/api/client";
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
} from "../types";

export interface DashboardData {
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
}

export const DashboardService = {
  async fetchAll(user: User): Promise<DashboardData> {
    const fetchJson = async <R>(url: string, defaultVal: R): Promise<R> => {
      try {
        return await httpClient<R>(url, {}, user);
      } catch (err) {
        if (err instanceof APIError) {
          if (err.status === 403 || err.status === 401) {
            return defaultVal;
          }
        }
        throw err;
      }
    };

    const [
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
    ] = await Promise.all([
      fetchJson<SchoolSettings | null>("/api/public/settings", null),
      fetchJson<AcademicYear[]>("/api/academicyears", []),
      fetchJson<ClassRoom[]>("/api/classrooms", []),
      fetchJson<Subject[]>("/api/subjects", []),
      fetchJson<Teacher[]>("/api/teachers", []),
      fetchJson<Student[]>("/api/students", []),
      fetchJson<Schedule[]>("/api/schedules", []),
      fetchJson<PPDBRegistration[]>("/api/ppdb", []),
      fetchJson<ActivityLog[]>("/api/logs", []),
      fetchJson<Backup[]>("/api/backups", []),
      fetchJson<Attendance[]>("/api/attendances", []),
      fetchJson<Grade[]>("/api/grades", []),
    ]);

    return {
      settings,
      academicYears: academicYears || [],
      classRooms: classRooms || [],
      subjects: subjects || [],
      teachers: teachers || [],
      students: students || [],
      schedules: schedules || [],
      ppdbList: ppdbList || [],
      logs: logs || [],
      backups: backups || [],
      allAttendances: allAttendances || [],
      allGrades: allGrades || [],
    };
  },

  async syncGoogleSheets(user: User): Promise<void> {
    await httpClient<void>("/api/settings/googlesheets/sync", { method: "POST" }, user);
  },

  async disconnectGoogleSheets(user: User): Promise<void> {
    await httpClient<void>("/api/settings/googlesheets/disconnect", { method: "POST" }, user);
  },

  async updateSettings(settings: SchoolSettings, user: User): Promise<void> {
    await httpClient<void>("/api/settings", {
      method: "POST",
      body: settings,
    }, user);
  },

  async crudSubmit(
    formType: string,
    formData: Record<string, unknown>,
    editingItemId: string | null,
    user: User
  ): Promise<void> {
    const url = editingItemId ? `/api/${formType}s/${editingItemId}` : `/api/${formType}s`;
    const method = editingItemId ? "PUT" : "POST";
    await httpClient<void>(url, {
      method,
      body: formData,
    }, user);
  },

  async activateAcademicYear(id: string, active: boolean, user: User): Promise<void> {
    await httpClient<void>(`/api/academicyears/${id}`, {
      method: "PUT",
      body: { active },
    }, user);
  },

  async deleteItem(type: string, id: string, user: User): Promise<void> {
    await httpClient<void>(`/api/${type}s/${id}`, {
      method: "DELETE",
    }, user);
  },

  async saveAttendance(
    classRoomId: string,
    date: string,
    records: Array<{ studentId: string; status: string; notes: string }>,
    teacherName: string,
    user: User
  ): Promise<void> {
    await httpClient<void>("/api/attendances/bulk", {
      method: "POST",
      body: { classRoomId, date, records, teacherName },
    }, user);
  },

  async saveGrades(
    classRoomId: string,
    subjectId: string,
    academicYearId: string,
    records: Array<{
      studentId: string;
      assignmentScore: number;
      utsScore: number;
      uasScore: number;
      notes: string;
    }>,
    user: User
  ): Promise<void> {
    await httpClient<void>("/api/grades/bulk", {
      method: "POST",
      body: { classRoomId, subjectId, academicYearId, records },
    }, user);
  },
};
