import React, { useMemo } from "react";
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { 
  GraduationCap, Users, School, CheckSquare, 
  TrendingUp, Activity, AlertCircle, UserCheck
} from "lucide-react";
import { Student, Teacher, ClassRoom, Attendance, PPDBRegistration } from "../types";

interface DashboardStatsProps {
  students: Student[];
  teachers: Teacher[];
  classRooms: ClassRoom[];
  attendances: Attendance[];
  ppdbList: PPDBRegistration[];
}

export function DashboardStats({
  students,
  teachers,
  classRooms,
  attendances,
  ppdbList
}: DashboardStatsProps) {

  // 1. KPI Calculations
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalClasses = classRooms.length;

  // Compute attendance rate
  const attendanceStats = useMemo(() => {
    if (!attendances || attendances.length === 0) {
      return {
        overallRate: 0,
        statusCounts: { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 },
        trendData: []
      };
    }

    // Overall rate
    const totalRecords = attendances.length;
    const presentRecords = attendances.filter(a => a.status === "Hadir").length;
    const overallRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    // Counts by status
    const statusCounts = attendances.reduce(
      (acc, curr) => {
        const s = curr.status as "Hadir" | "Sakit" | "Izin" | "Alpa";
        if (acc[s] !== undefined) {
          acc[s]++;
        } else {
          acc[s] = 1;
        }
        return acc;
      },
      { Hadir: 0, Sakit: 0, Izin: 0, Alpa: 0 }
    );

    // Group by Date for Trend
    const groupedByDate: Record<string, { total: number; present: number }> = {};
    attendances.forEach(a => {
      const dateStr = a.date; // e.g. "2026-07-19"
      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = { total: 0, present: 0 };
      }
      groupedByDate[dateStr].total++;
      if (a.status === "Hadir") {
        groupedByDate[dateStr].present++;
      }
    });

    // Format dates for Indonesian/simple presentation sorted ascending
    const trendData = Object.keys(groupedByDate)
      .sort()
      .map(date => {
        const { total, present } = groupedByDate[date];
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;
        // Format date to "DD/MM"
        const parts = date.split("-");
        const formattedDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
        return {
          date: formattedDate,
          rawDate: date,
          "Persentase Hadir": rate,
          "Total Absen": total
        };
      })
      .slice(-7); // Keep last 7 days

    return { overallRate, statusCounts, trendData };
  }, [attendances]);

  // Distribution of students per classroom
  const classDistributionData = useMemo(() => {
    return classRooms.map(cls => {
      const count = students.filter(s => s.classRoomId === cls.id).length;
      return {
        name: cls.name,
        "Jumlah Siswa": count
      };
    });
  }, [classRooms, students]);

  // PPDB Status breakdown
  const ppdbStats = useMemo(() => {
    const pending = ppdbList.filter(p => p.status === "pending").length;
    const approved = ppdbList.filter(p => p.status === "approved").length;
    const rejected = ppdbList.filter(p => p.status === "rejected").length;
    return [
      { name: "Menunggu", value: pending, color: "#eab308" },
      { name: "Disetujui", value: approved, color: "#3b82f6" },
      { name: "Ditolak", value: rejected, color: "#f43f5e" }
    ].filter(item => item.value > 0);
  }, [ppdbList]);

  // Status breakdown of attendance for PieChart
  const attendancePieData = useMemo(() => {
    const { statusCounts } = attendanceStats;
    return [
      { name: "Hadir", value: statusCounts.Hadir, color: "#10b981" },
      { name: "Sakit", value: statusCounts.Sakit, color: "#3b82f6" },
      { name: "Izin", value: statusCounts.Izin, color: "#f59e0b" },
      { name: "Alpa", value: statusCounts.Alpa, color: "#ef4444" }
    ].filter(item => item.value > 0);
  }, [attendanceStats]);

  return (
    <div className="space-y-8" id="dashboard-stats-component">
      
      {/* 1. TOP CARDS / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Siswa Aktif</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalStudents}</h3>
              <span className="text-xs font-semibold text-slate-400">Siswa</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Tersebar di {totalClasses} rombongan belajar</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Tenaga Pendidik</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalTeachers}</h3>
              <span className="text-xs font-semibold text-slate-400">Guru</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Aktif mengajar kurikulum nasional</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Rata-Rata Kehadiran</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                {attendanceStats.overallRate}%
              </h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> Stabil
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Kumulatif seluruh absensi kelas</p>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* PPDB Admissions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Penerimaan PPDB</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{ppdbList.length}</h3>
              <span className="text-xs font-semibold text-slate-400">Berkas</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {ppdbList.filter(p => p.status === 'pending').length} berkas menunggu verifikasi
            </p>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Rate Trend (AreaChart) - spans 2 columns */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Tren Persentase Kehadiran Siswa</h4>
              <p className="text-[10px] text-slate-500 font-medium">Berdasarkan data 7 pencatatan absensi terakhir</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-mono">
              Live Rate
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            {attendanceStats.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceStats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600, fontFamily: "monospace" }} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "10px", fontWeight: "bold", fontFamily: "monospace" }}
                    itemStyle={{ color: "#ffffff", fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Persentase Hadir" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorAttendance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-400 animate-pulse" />
                <p className="text-xs font-bold text-slate-500">Data Tren Belum Tersedia</p>
                <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed font-medium">
                  Belum ada data rekapan absensi kelas harian yang diisi oleh guru pengampu pelajaran.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Breakdown (PieChart) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Komposisi Status Absensi</h4>
            <p className="text-[10px] text-slate-500 font-medium">Total seluruh akumulasi kehadiran siswa</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            {attendancePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                    itemStyle={{ color: "#ffffff", fontSize: "11px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-1">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Absensi Kosong</p>
              </div>
            )}
            
            {attendancePieData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Present</span>
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {attendanceStats.overallRate}%
                </span>
              </div>
            )}
          </div>

          {/* Legend Table */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {attendancePieData.length > 0 ? (
              attendancePieData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2 border border-slate-100 rounded-lg p-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-700 leading-tight">{entry.name}</p>
                    <p className="text-[9px] font-mono font-medium text-slate-400">{entry.value} Kali</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-[10px] text-slate-400 py-2">
                Tidak ada data absensi terekam.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. LOWER SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Class distribution (BarChart) - spans 2 columns */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Kepadatan & Distribusi Siswa per Rombel</h4>
            <p className="text-[10px] text-slate-500 font-medium">Menampilkan perbandingan kapasitas jumlah siswa terdaftar pada setiap kelas</p>
          </div>

          <div className="h-72 w-full pt-2">
            {classDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600, fontFamily: "monospace" }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                    itemStyle={{ color: "#ffffff", fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Bar 
                    dataKey="Jumlah Siswa" 
                    fill="#4f46e5" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2">
                <School className="w-8 h-8 text-slate-400" />
                <p className="text-xs font-bold text-slate-500">Belum ada Kelas Terdaftar</p>
              </div>
            )}
          </div>
        </div>

        {/* PPDB Funnel / Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Rasio Berkas PPDB</h4>
            <p className="text-[10px] text-slate-500 font-medium">Berdasarkan data seleksi administrasi pendaftaran siswa baru</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            {ppdbStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ppdbStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={75}
                    dataKey="value"
                  >
                    {ppdbStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                    itemStyle={{ color: "#ffffff", fontSize: "11px", fontWeight: "bold" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center space-y-1">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Belum Ada Pendaftar PPDB</p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            {ppdbList.length > 0 ? (
              [
                { name: "Menunggu Review", count: ppdbList.filter(p => p.status === 'pending').length, color: "bg-amber-500" },
                { name: "Disetujui / Lulus", count: ppdbList.filter(p => p.status === 'approved').length, color: "bg-blue-500" },
                { name: "Ditolak / Gagal", count: ppdbList.filter(p => p.status === 'rejected').length, color: "bg-rose-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-50 pb-1 last:border-0 last:pb-0 font-medium text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">{item.count} Berkas</span>
                </div>
              ))
            ) : (
              <div className="text-center text-[10px] text-slate-400 py-2">
                Tidak ada data pendaftaran PPDB.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
