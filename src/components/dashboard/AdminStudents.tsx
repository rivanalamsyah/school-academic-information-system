import { Plus, Trash2, Edit2, Search, FileSpreadsheet } from "lucide-react";
import { motion } from "motion/react";
import { Student, ClassRoom } from "../../types";

interface AdminStudentsProps {
  students: Student[];
  classRooms: ClassRoom[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  openAddModal: (type: string) => void;
  openEditModal: (type: string, item: Student) => void;
  handleDeleteItem: (type: string, id: string) => void;
  handlePrintReport: (title: string, tableId: string) => void;
  handleExportExcel: (filename: string, tableId: string) => void;
  openBulkImport: (type: "student" | "teacher") => void;
}

export function AdminStudents({
  students,
  classRooms,
  searchTerm,
  setSearchTerm,
  selectedClassId,
  setSelectedClassId,
  openAddModal,
  openEditModal,
  handleDeleteItem,
  handlePrintReport,
  handleExportExcel,
  openBulkImport
}: AdminStudentsProps) {
  
  const filteredStudents = students
    .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm) || s.nisn.includes(searchTerm))
    .filter(s => !selectedClassId || s.classRoomId === selectedClassId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="admin-student-view">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-3 max-w-md w-full flex-wrap sm:flex-nowrap">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama/NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 left-3" />
          </div>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono font-bold"
          >
            <option value="">Semua Kelas</option>
            {classRooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handlePrintReport("Laporan Siswa SMA Global", "students-table-el")}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            Cetak Laporan
          </button>
          <button
            onClick={() => handleExportExcel("laporan_siswa.xlsx", "students-table-el")}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={() => openBulkImport("student")}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Impor Massal (.csv)
          </button>
          <button
            onClick={() => openAddModal("student")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Siswa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="students-table-el">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">NIS / NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Wali Siswa</th>
                <th className="py-3 px-4">Telepon Wali</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredStudents.map((stud) => {
                const clsName = classRooms.find(c => c.id === stud.classRoomId)?.name || "Tanpa Kelas";
                return (
                  <tr key={stud.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{stud.name}</td>
                    <td className="py-4 px-4 font-mono font-semibold text-slate-500">{stud.nis} / {stud.nisn}</td>
                    <td className="py-4 px-4 font-semibold text-blue-700 font-mono">{clsName}</td>
                    <td className="py-4 px-4 text-slate-700">{stud.parentName}</td>
                    <td className="py-4 px-4 font-mono text-slate-500">{stud.parentPhone}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal("student", stud)} 
                        className="text-slate-400 hover:text-slate-600 inline-block p-1 focus:outline-none"
                        aria-label={`Edit data siswa ${stud.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem("student", stud.id)} 
                        className="text-rose-400 hover:text-rose-600 inline-block p-1 focus:outline-none"
                        aria-label={`Hapus data siswa ${stud.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data siswa yang cocok.
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
