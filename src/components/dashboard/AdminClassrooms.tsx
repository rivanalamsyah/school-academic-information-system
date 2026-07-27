import { Plus, Trash2, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import { ClassRoom, Teacher } from "../../types";

interface AdminClassroomsProps {
  classRooms: ClassRoom[];
  teachers: Teacher[];
  openAddModal: (type: string) => void;
  openEditModal: (type: string, item: ClassRoom) => void;
  handleDeleteItem: (type: string, id: string) => void;
  handlePrintReport: (title: string, tableId: string) => void;
  handleExportExcel: (filename: string, tableId: string) => void;
}

export function AdminClassrooms({
  classRooms,
  teachers,
  openAddModal,
  openEditModal,
  handleDeleteItem,
  handlePrintReport,
  handleExportExcel
}: AdminClassroomsProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="admin-classroom-view">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="font-extrabold text-slate-950 text-sm tracking-tight">Daftar Kelas Terdaftar</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handlePrintReport("Laporan Data Kelas SMA Global", "classrooms-table-el")}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            Cetak Laporan
          </button>
          <button
            onClick={() => handleExportExcel("laporan_kelas.xlsx", "classrooms-table-el")}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={() => openAddModal("classroom")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Kelas
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="classrooms-table-el">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                <th className="py-3 px-4">Nama Kelas</th>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4">Jurusan</th>
                <th className="py-3 px-4">Wali Kelas</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {classRooms.map((cls) => {
                const tName = teachers.find(t => t.id === cls.homeroomTeacherId)?.name || "Belum Ditentukan";
                return (
                  <tr key={cls.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{cls.name}</td>
                    <td className="py-4 px-4 font-semibold">{cls.gradeLevel}</td>
                    <td className="py-4 px-4">{cls.major}</td>
                    <td className="py-4 px-4 text-slate-700 font-medium">{tName}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal("classroom", cls)}
                        className="text-slate-400 hover:text-slate-600 inline-block p-1 focus:outline-none"
                        aria-label={`Edit kelas ${cls.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem("classroom", cls.id)}
                        className="text-rose-400 hover:text-rose-600 inline-block p-1 focus:outline-none"
                        aria-label={`Hapus kelas ${cls.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
