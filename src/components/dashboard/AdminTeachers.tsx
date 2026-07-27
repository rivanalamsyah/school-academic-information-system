import { Plus, Trash2, Edit2, Search, FileSpreadsheet } from "lucide-react";
import { motion } from "motion/react";
import { Teacher } from "../../types";

interface AdminTeachersProps {
  teachers: Teacher[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  openAddModal: (type: string) => void;
  openEditModal: (type: string, item: Teacher) => void;
  handleDeleteItem: (type: string, id: string) => void;
  handlePrintReport: (title: string, tableId: string) => void;
  handleExportExcel: (filename: string, tableId: string) => void;
  openBulkImport: (type: "student" | "teacher") => void;
}

export function AdminTeachers({
  teachers,
  searchTerm,
  setSearchTerm,
  openAddModal,
  openEditModal,
  handleDeleteItem,
  handlePrintReport,
  handleExportExcel,
  openBulkImport
}: AdminTeachersProps) {
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.nip.includes(searchTerm)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="admin-teacher-view">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Cari guru berdasarkan nama atau NIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-2.5 left-3" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handlePrintReport("Laporan Data Guru SMAN 1 Nusantara", "teachers-table-el")}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            Cetak Laporan
          </button>
          <button
            onClick={() => handleExportExcel("laporan_guru.xlsx", "teachers-table-el")}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={() => openBulkImport("teacher")}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Impor Massal (.csv)
          </button>
          <button
            onClick={() => openAddModal("teacher")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Data Guru
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="teachers-table-el">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">NIP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Telepon</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredTeachers.map((teach) => (
                <tr key={teach.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-800">{teach.name}</td>
                  <td className="py-4 px-4 font-mono font-semibold">{teach.nip}</td>
                  <td className="py-4 px-4">
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold font-mono">{teach.status}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500">{teach.phone}</td>
                  <td className="py-4 px-4 text-slate-600">{teach.email}</td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal("teacher", teach)} 
                      className="text-slate-400 hover:text-slate-600 inline-block p-1 focus:outline-none"
                      aria-label={`Edit data guru ${teach.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem("teacher", teach.id)} 
                      className="text-rose-400 hover:text-rose-600 inline-block p-1 focus:outline-none"
                      aria-label={`Hapus data guru ${teach.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Tidak ada data guru yang cocok dengan pencarian.
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
