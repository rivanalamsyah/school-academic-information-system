import { motion } from "motion/react";
import { ClassRoom, Student } from "../../types";

interface TeacherAttendanceProps {
  classRooms: ClassRoom[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  classStudents: Student[];
  tempAttendances: { [studentId: string]: { status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | '', notes: string } };
  setTempAttendances: React.Dispatch<React.SetStateAction<{ [studentId: string]: { status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | '', notes: string } }>>;
  handleSaveAttendance: () => void;
}

export function TeacherAttendance({
  classRooms,
  selectedClassId,
  setSelectedClassId,
  selectedDate,
  setSelectedDate,
  classStudents,
  tempAttendances,
  setTempAttendances,
  handleSaveAttendance
}: TeacherAttendanceProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="guru-attendance-view">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs grid sm:grid-cols-3 gap-4 items-end">
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
          <label className="text-xs font-bold text-slate-700">Tanggal Kehadiran</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white font-mono font-semibold"
          />
        </div>

        <button
          onClick={handleSaveAttendance}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all border border-blue-700 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Simpan Presensi Kelas
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Status Kehadiran</th>
                <th className="py-3 px-4">Keterangan Tambahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {classStudents.map((stud) => {
                const att = tempAttendances[stud.id] || { status: '', notes: '' };
                return (
                  <tr key={stud.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{stud.name}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {['Hadir', 'Sakit', 'Izin', 'Alpa'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setTempAttendances({
                                ...tempAttendances,
                                [stud.id]: { ...att, status: st as "Hadir" | "Sakit" | "Izin" | "Alpa" }
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer focus:outline-none ${
                              att.status === st
                                ? st === 'Hadir' ? 'bg-blue-600 text-white border-blue-600' :
                                  st === 'Sakit' ? 'bg-amber-500 text-white border-amber-500' :
                                  st === 'Izin' ? 'bg-indigo-600 text-white border-indigo-600' :
                                  'bg-rose-600 text-white border-rose-600'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <input
                        type="text"
                        value={att.notes}
                        placeholder="Tambahkan catatan dispensasi / kelakuan"
                        onChange={(e) => {
                          setTempAttendances({
                            ...tempAttendances,
                            [stud.id]: { ...att, notes: e.target.value }
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
                  <td colSpan={3} className="py-8 text-center text-slate-400 italic">
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
