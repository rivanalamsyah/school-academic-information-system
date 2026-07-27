import React from "react";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { AcademicYear } from "../../types";

interface AdminAcademicYearsProps {
  academicYears: AcademicYear[];
  openAddModal: (type: string) => void;
  openEditModal: (type: string, item: AcademicYear) => void;
  handleActivateAcademicYear: (id: string, year: string) => void;
  handlePrintReport: (title: string, tableId: string) => void;
  handleExportExcel: (filename: string, tableId: string) => void;
}

export function AdminAcademicYears({
  academicYears,
  openAddModal,
  openEditModal,
  handleActivateAcademicYear,
  handlePrintReport,
  handleExportExcel
}: AdminAcademicYearsProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" id="admin-ay-view">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="font-extrabold text-slate-950 text-sm tracking-tight">Tahun Ajaran & Semester</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handlePrintReport("Laporan Tahun Ajaran SMAN 1 Nusantara", "academicyears-table-el")}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            Cetak Laporan
          </button>
          <button
            onClick={() => handleExportExcel("laporan_tahun_ajaran.xlsx", "academicyears-table-el")}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={() => openAddModal("academicyear")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Tahun Ajaran
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="academicyears-table-el">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
                <th className="py-3 px-4">Tahun Ajaran</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {academicYears.map((ay) => (
                <tr key={ay.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-800">{ay.year}</td>
                  <td className="py-4 px-4 font-semibold">{ay.semester}</td>
                  <td className="py-4 px-4">
                    {ay.active ? (
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 font-mono font-bold px-2.5 py-0.5 rounded text-[10px]">Aktif Saat Ini</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 border border-slate-200 font-mono px-2.5 py-0.5 rounded text-[10px]">Non-aktif</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    {!ay.active && (
                      <button
                        onClick={() => handleActivateAcademicYear(ay.id, ay.year)}
                        className="text-xs text-blue-600 font-bold hover:underline cursor-pointer focus:outline-none"
                      >
                        Aktifkan
                      </button>
                    )}
                    <button 
                      onClick={() => openEditModal("academicyear", ay)} 
                      className="text-slate-400 hover:text-slate-600 inline-block p-1 focus:outline-none"
                      aria-label={`Edit tahun ajaran ${ay.year}`}
                    >
                      Edit
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
