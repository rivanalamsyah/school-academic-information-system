import React from "react";
import { motion } from "motion/react";
import { ClassRoom, Subject, Student } from "../../types";

interface TeacherGradesProps {
  classRooms: ClassRoom[];
  subjects: Subject[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  classStudents: Student[];
  tempGrades: { [studentId: string]: { assignmentScore: number, utsScore: number, uasScore: number, notes: string } };
  setTempGrades: React.Dispatch<React.SetStateAction<{ [studentId: string]: { assignmentScore: number, utsScore: number, uasScore: number, notes: string } }>>;
  handleSaveGrades: () => void;
}

export function TeacherGrades({
  classRooms,
  subjects,
  selectedClassId,
  setSelectedClassId,
  selectedSubjectId,
  setSelectedSubjectId,
  classStudents,
  tempGrades,
  setTempGrades,
  handleSaveGrades
}: TeacherGradesProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="guru-grades-view">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs grid sm:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Pilih Kelas</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white font-mono font-bold"
          >
            {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Mata Pelajaran</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white font-bold"
          >
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <button
          onClick={handleSaveGrades}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs transition-all cursor-pointer sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Simpan Rekap Nilai Rapor Kelas
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Nilai Harian / Tugas (30%)</th>
                <th className="py-3 px-4">Nilai UTS (30%)</th>
                <th className="py-3 px-4">Nilai UAS (40%)</th>
                <th className="py-3 px-4">Catatan Perkembangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {classStudents.map((stud) => {
                const score = tempGrades[stud.id] || { assignmentScore: 80, utsScore: 80, uasScore: 80, notes: '' };
                return (
                  <tr key={stud.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{stud.name}</td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score.assignmentScore}
                        onChange={(e) => {
                          setTempGrades({
                            ...tempGrades,
                            [stud.id]: { ...score, assignmentScore: Number(e.target.value) }
                          });
                        }}
                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs text-center bg-slate-50/50 font-mono font-bold"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score.utsScore}
                        onChange={(e) => {
                          setTempGrades({
                            ...tempGrades,
                            [stud.id]: { ...score, utsScore: Number(e.target.value) }
                          });
                        }}
                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs text-center bg-slate-50/50 font-mono font-bold"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score.uasScore}
                        onChange={(e) => {
                          setTempGrades({
                            ...tempGrades,
                            [stud.id]: { ...score, uasScore: Number(e.target.value) }
                          });
                        }}
                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs text-center bg-slate-50/50 font-mono font-bold"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="text"
                        value={score.notes}
                        placeholder="Contoh: Sangat baik dalam nalar kalkulus..."
                        onChange={(e) => {
                          setTempGrades({
                            ...tempGrades,
                            [stud.id]: { ...score, notes: e.target.value }
                          });
                        }}
                        className="w-full max-w-xs px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-slate-50/50"
                      />
                    </td>
                  </tr>
                );
              })}
              {classStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    Pilih kelas yang memiliki siswa aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
