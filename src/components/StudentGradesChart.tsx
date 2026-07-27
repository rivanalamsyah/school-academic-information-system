import { useState, useMemo } from "react";
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts";
import { 
  TrendingUp, Award, CheckCircle2, AlertTriangle,
  LineChart as LineIcon, BarChart3
} from "lucide-react";
import { Grade, Subject } from "../types";

interface StudentGradesChartProps {
  studentId: string;
  grades: Grade[];
  subjects: Subject[];
}

export function StudentGradesChart({ studentId, grades, subjects }: StudentGradesChartProps) {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // Filter and enrich grades for the logged-in student
  const studentGradesData = useMemo(() => {
    const studentGrades = grades.filter(g => g.studentId === studentId);
    return studentGrades.map(g => {
      const subj = subjects.find(s => s.id === g.subjectId);
      return {
        id: g.id,
        subjectCode: subj?.code || "MAPEL",
        subjectName: subj?.name || "Mata Pelajaran",
        kkm: subj?.kkm || 75,
        tugas: g.assignmentScore,
        uts: g.utsScore,
        uas: g.uasScore,
        akhir: g.finalScore,
        gradeLetter: g.gradeLetter
      };
    });
  }, [grades, subjects, studentId]);

  // Calculations for KPI Cards
  const stats = useMemo(() => {
    if (studentGradesData.length === 0) return { avg: 0, passedCount: 0, total: 0 };
    const total = studentGradesData.length;
    const sum = studentGradesData.reduce((acc, g) => acc + g.akhir, 0);
    const avg = Math.round((sum / total) * 10) / 10;
    const passedCount = studentGradesData.filter(g => g.akhir >= g.kkm).length;
    return { avg, passedCount, total };
  }, [studentGradesData]);

  if (studentGradesData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Visualisasi Nilai Belum Tersedia</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Guru belum menginputkan nilai rapor untuk semester aktif. Grafik perkembangan akan tampil otomatis setelah nilai diunggah.
        </p>
      </div>
    );
  }

  // Custom Tooltip component for recharts
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: Record<string, string | number> }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 p-3 rounded-xl font-mono text-xs shadow-md space-y-1">
          <p className="font-bold text-white border-b border-slate-800 pb-1 mb-1">{data.subjectName}</p>
          <p className="flex justify-between gap-4"><span className="text-slate-400">Nilai Tugas:</span> <span className="font-bold text-blue-400">{data.tugas}</span></p>
          <p className="flex justify-between gap-4"><span className="text-slate-400">Nilai UTS:</span> <span className="font-bold text-amber-400">{data.uts}</span></p>
          <p className="flex justify-between gap-4"><span className="text-slate-400">Nilai UAS:</span> <span className="font-bold text-indigo-400">{data.uas}</span></p>
          <p className="flex justify-between gap-4 border-t border-slate-800 pt-1 mt-1 font-bold text-white"><span className="text-slate-300">Nilai Akhir:</span> <span className="text-emerald-400">{data.akhir} ({data.gradeLetter})</span></p>
          <p className="flex justify-between gap-4 text-[10px]"><span className="text-slate-500">KKM Minimal:</span> <span className="text-slate-400">{data.kkm}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="student-grades-visualization">
      
      {/* Top statistics summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI: Indeks Rata-rata */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Rata-rata Nilai</p>
            <h4 className="text-xl font-black text-blue-900 mt-0.5">{stats.avg}</h4>
          </div>
        </div>

        {/* KPI: Ketuntasan Belajar */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Tuntas KKM</p>
            <h4 className="text-xl font-black text-emerald-900 mt-0.5">{stats.passedCount} / {stats.total} <span className="text-xs text-slate-400 font-medium font-sans">Mapel</span></h4>
          </div>
        </div>

        {/* KPI: Predikat Akademik */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-600/10 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">Predikat Umum</p>
            <h4 className="text-xl font-black text-amber-900 mt-0.5">
              {stats.avg >= 88 ? "Sangat Baik (A)" : stats.avg >= 78 ? "Baik (B)" : stats.avg >= 65 ? "Cukup (C)" : "Perlu Bimbingan"}
            </h4>
          </div>
        </div>

      </div>

      {/* Recharts Canvas Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase flex items-center gap-1.5 tracking-tight font-mono">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Analisis Kompetensi Rapor Nilai
            </h3>
            <p className="text-[10px] text-slate-500">
              Grafik komparasi komponen nilai ujian (Tugas, UTS, UAS) terhadap Nilai Akhir & ambang batas kelulusan KKM.
            </p>
          </div>

          {/* Chart selector buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                chartType === "bar" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Bar Chart
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                chartType === "line" ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <LineIcon className="w-3.5 h-3.5" /> Trend Line
            </button>
          </div>
        </div>

        {/* Main Canvas rendering */}
        <div className="w-full h-[280px] font-mono text-[10px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={studentGradesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subjectCode" stroke="#94a3b8" tickSize={6} tickMargin={6} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} iconType="rect" wrapperStyle={{ paddingTop: 10 }} />
                <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "Ambang KKM", position: "insideBottomRight", fill: "#f43f5e", fontSize: 9, fontWeight: "bold" }} />
                
                <Bar name="Tugas" dataKey="tugas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar name="UTS" dataKey="uts" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar name="UAS" dataKey="uas" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar name="Nilai Akhir" dataKey="akhir" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            ) : (
              <LineChart data={studentGradesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="subjectCode" stroke="#94a3b8" tickSize={6} tickMargin={6} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ paddingTop: 10 }} />
                <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: "Ambang KKM", position: "insideBottomRight", fill: "#f43f5e", fontSize: 9, fontWeight: "bold" }} />
                
                <Line name="Nilai Akhir" type="monotone" dataKey="akhir" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                <Line name="Tugas" type="monotone" dataKey="tugas" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
                <Line name="UTS" type="monotone" dataKey="uts" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
                <Line name="UAS" type="monotone" dataKey="uas" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3 }} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
}
