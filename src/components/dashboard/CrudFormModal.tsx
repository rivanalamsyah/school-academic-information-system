import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Teacher, ClassRoom, Subject, AcademicYear, Student, Schedule } from "../../types";

interface CrudFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: string;
  editingItem: AcademicYear | ClassRoom | Subject | Teacher | Student | Schedule | null;
  teachers: Teacher[];
  classRooms: ClassRoom[];
  subjects: Subject[];
  onSubmit: (formData: Record<string, unknown>) => void;
}

export function CrudFormModal({
  isOpen,
  onClose,
  formType,
  editingItem,
  teachers,
  classRooms,
  subjects,
  onSubmit
}: CrudFormModalProps) {
  // State definitions for all forms
  const [ayForm, setAyForm] = useState({ year: "2025/2026", semester: "Ganjil" as "Ganjil" | "Genap" });
  const [classForm, setClassForm] = useState({ name: "", gradeLevel: "X" as "X" | "XI" | "XII", major: "IPA" as "IPA" | "IPS" | "Umum" | "Kejuruan", homeroomTeacherId: "" });
  const [subjectForm, setSubjectForm] = useState({ code: "", name: "", kkm: 75 });
  const [teacherForm, setTeacherForm] = useState({ nip: "", name: "", gender: "Laki-laki" as "Laki-laki" | "Perempuan", email: "", phone: "", status: "PNS" as "PNS" | "Honororer" | "Yayasan", birthDate: "", address: "" });
  const [studentForm, setStudentForm] = useState({ nis: "", nisn: "", name: "", gender: "Laki-laki" as "Laki-laki" | "Perempuan", classRoomId: "", birthDate: "", address: "", status: "Aktif" as "Aktif" | "Lulus" | "Pindah" | "Alumni", parentName: "", parentPhone: "" });
  const [scheduleForm, setScheduleForm] = useState({ classRoomId: "", subjectId: "", teacherId: "", day: "Senin" as "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu", startTime: "07:30", endTime: "09:00" });

  // Initialize/Reset forms when editingItem or formType changes
  useEffect(() => {
    if (!isOpen) return;

    if (formType === "academicyear") {
      const item = editingItem as AcademicYear | null;
      setAyForm({
        year: item?.year || "2025/2026",
        semester: item?.semester || "Ganjil"
      });
    } else if (formType === "classroom") {
      const item = editingItem as ClassRoom | null;
      setClassForm({
        name: item?.name || "",
        gradeLevel: item?.gradeLevel || "X",
        major: item?.major || "IPA",
        homeroomTeacherId: item?.homeroomTeacherId || (teachers[0]?.id || "")
      });
    } else if (formType === "subject") {
      const item = editingItem as Subject | null;
      setSubjectForm({
        code: item?.code || "",
        name: item?.name || "",
        kkm: item?.kkm || 75
      });
    } else if (formType === "teacher") {
      const item = editingItem as Teacher | null;
      setTeacherForm({
        nip: item?.nip || "",
        name: item?.name || "",
        gender: item?.gender || "Laki-laki",
        email: item?.email || "",
        phone: item?.phone || "",
        status: item?.status || "PNS",
        birthDate: item?.birthDate || "1990-01-01",
        address: item?.address || ""
      });
    } else if (formType === "student") {
      const item = editingItem as Student | null;
      setStudentForm({
        nis: item?.nis || "",
        nisn: item?.nisn || "",
        name: item?.name || "",
        gender: item?.gender || "Laki-laki",
        classRoomId: item?.classRoomId || (classRooms[0]?.id || ""),
        birthDate: item?.birthDate || "2010-01-01",
        address: item?.address || "",
        status: item?.status || "Aktif",
        parentName: item?.parentName || "",
        parentPhone: item?.parentPhone || ""
      });
    } else if (formType === "schedule") {
      const item = editingItem as Schedule | null;
      setScheduleForm({
        classRoomId: item?.classRoomId || (classRooms[0]?.id || ""),
        subjectId: item?.subjectId || (subjects[0]?.id || ""),
        teacherId: item?.teacherId || (teachers[0]?.id || ""),
        day: item?.day || "Senin",
        startTime: item?.startTime || "07:30",
        endTime: item?.endTime || "09:00"
      });
    }
  }, [isOpen, formType, editingItem, teachers, classRooms, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formType === "academicyear") {
      const item = editingItem as AcademicYear | null;
      onSubmit({ ...ayForm, active: item ? item.active : false });
    } else if (formType === "classroom") {
      onSubmit(classForm);
    } else if (formType === "subject") {
      onSubmit(subjectForm);
    } else if (formType === "teacher") {
      onSubmit(teacherForm);
    } else if (formType === "student") {
      onSubmit(studentForm);
    } else if (formType === "schedule") {
      onSubmit(scheduleForm);
    }
  };

  const getMenuLabel = (type: string) => {
    switch (type) {
      case "academicyear": return "Tahun Ajaran";
      case "classroom": return "Kelas";
      case "subject": return "Mata Pelajaran";
      case "teacher": return "Data Guru";
      case "student": return "Data Siswa";
      case "schedule": return "Jadwal Pelajaran";
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 relative"
        id="crud-dialog-modal"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50 rounded-lg cursor-pointer focus:outline-none"
          aria-label="Tutup dialog"
        >
          ✕
        </button>

        <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-3 tracking-tight">
          {editingItem ? 'Edit Data' : 'Tambah Data'} {getMenuLabel(formType)}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* FORM: ACADEMIC YEAR */}
          {formType === "academicyear" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tahun Pelajaran</label>
                <input
                  type="text"
                  required
                  value={ayForm.year}
                  onChange={(e) => setAyForm({ ...ayForm, year: e.target.value })}
                  placeholder="Contoh: 2025/2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Semester</label>
                <select
                  value={ayForm.semester}
                  onChange={(e) => setAyForm({ ...ayForm, semester: e.target.value as "Ganjil" | "Genap" })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
            </>
          )}

          {/* FORM: CLASSROOM */}
          {formType === "classroom" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Kelas</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="Contoh: XI MIPA 1"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tingkat</label>
                <select
                  value={classForm.gradeLevel}
                  onChange={(e) => setClassForm({ ...classForm, gradeLevel: e.target.value as "X" | "XI" | "XII" })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jurusan</label>
                <select
                  value={classForm.major}
                  onChange={(e) => setClassForm({ ...classForm, major: e.target.value as "IPA" | "IPS" | "Umum" | "Kejuruan" })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="IPA">MIPA / Sains</option>
                  <option value="IPS">IPS / Sosial</option>
                  <option value="Umum">Umum</option>
                  <option value="Kejuruan">Kejuruan</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Wali Kelas</label>
                <select
                  value={classForm.homeroomTeacherId}
                  onChange={(e) => setClassForm({ ...classForm, homeroomTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">Pilih Guru Pengampu</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </>
          )}

          {/* FORM: SUBJECT */}
          {formType === "subject" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kode Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  placeholder="Contoh: MAT-10"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Pelajaran</label>
                <input
                  type="text"
                  required
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  placeholder="Contoh: Matematika"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kriteria Ketuntasan Minimal (KKM)</label>
                <input
                  type="number"
                  required
                  value={subjectForm.kkm}
                  onChange={(e) => setSubjectForm({ ...subjectForm, kkm: Number(e.target.value) })}
                  placeholder="75"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                />
              </div>
            </>
          )}

          {/* FORM: TEACHER */}
          {formType === "teacher" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">NIP Guru</label>
                <input
                  type="text"
                  required
                  value={teacherForm.nip}
                  onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jenis Kelamin</label>
                <select
                  value={teacherForm.gender}
                  onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value as "Laki-laki" | "Perempuan" })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">E-mail</label>
                <input
                  type="email"
                  required
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">No. HP / WA</label>
                <input
                  type="tel"
                  required
                  value={teacherForm.phone}
                  onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-slate-700">Alamat Tempat Tinggal</label>
                <textarea
                  rows={2}
                  value={teacherForm.address}
                  onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* FORM: STUDENT */}
          {formType === "student" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  required
                  value={studentForm.nis}
                  onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">NISN Siswa</label>
                <input
                  type="text"
                  required
                  value={studentForm.nisn}
                  onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pilih Kelas</label>
                <select
                  value={studentForm.classRoomId}
                  onChange={(e) => setStudentForm({ ...studentForm, classRoomId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                >
                  {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jenis Kelamin</label>
                <select
                  value={studentForm.gender}
                  onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as "Laki-laki" | "Perempuan" })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Wali / Orang Tua</label>
                <input
                  type="text"
                  required
                  value={studentForm.parentName}
                  onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">No. HP Orang Tua / WA</label>
                <input
                  type="tel"
                  required
                  value={studentForm.parentPhone}
                  onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* FORM: SCHEDULE */}
          {formType === "schedule" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kelas</label>
                <select
                  value={scheduleForm.classRoomId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, classRoomId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono font-bold"
                >
                  {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Mata Pelajaran</label>
                <select
                  value={scheduleForm.subjectId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Guru Pengampu</label>
                <select
                  value={scheduleForm.teacherId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hari Belajar</label>
                <select
                  value={scheduleForm.day}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value as "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jam Mulai</label>
                <input
                  type="time"
                  required
                  value={scheduleForm.startTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jam Selesai</label>
                <input
                  type="time"
                  required
                  value={scheduleForm.endTime}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer focus:outline-none"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
