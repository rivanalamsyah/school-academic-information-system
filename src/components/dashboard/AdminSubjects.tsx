import { Plus, Trash2, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import { Subject } from "../../types";

interface AdminSubjectsProps {
  subjects: Subject[];
  openAddModal: (type: string) => void;
  openEditModal: (type: string, item: Subject) => void;
  handleDeleteItem: (type: string, id: string) => void;
  handlePrintReport: (title: string, tableId: string) => void;
  handleExportExcel: (filename: string, tableId: string) => void;
}

export function AdminSubjects({
  subjects,
  openAddModal,
  openEditModal,
  handleDeleteItem,
  handlePrintReport,
  handleExportExcel
}: AdminSubjectsProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="admin-subject-view">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="font-extrabold text-slate-950 text-sm tracking-tight">Mata Pelajaran & KKM</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handlePrintReport("Laporan Mata Pelajaran SMA Global", "subjects-table-el")}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            Cetak Laporan
          </button>
          <button
            onClick={() => handleExportExcel("laporan_mapel.xlsx", "subjects-table-el")}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={() => openAddModal("subject")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Mata Pelajaran
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="subjects-table-el">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                <th className="py-3 px-4">Kode Mapel</th>
                <th className="py-3 px-4">Nama Mata Pelajaran</th>
                <th className="py-3 px-4">KKM</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {subjects.map((subj) => (
                <tr key={subj.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-800">{subj.code}</td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{subj.name}</td>
                  <td className="py-4 px-4 font-mono font-bold text-blue-600">{subj.kkm}</td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal("subject", subj)} 
                      className="text-slate-400 hover:text-slate-600 inline-block p-1 focus:outline-none"
                      aria-label={`Edit mata pelajaran ${subj.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem("subject", subj.id)} 
                      className="text-rose-400 hover:text-rose-600 inline-block p-1 focus:outline-none"
                      aria-label={`Hapus mata pelajaran ${subj.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
