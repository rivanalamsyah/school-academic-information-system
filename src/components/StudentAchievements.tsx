import React, { useMemo } from "react";
import { 
  ShieldCheck, Star, Sparkles, BookOpen, 
  Activity, Compass, Flame, Trophy, CheckCircle2 
} from "lucide-react";
import { Attendance, Grade, Subject } from "../types";

interface StudentAchievementsProps {
  studentId: string;
  attendances: Attendance[];
  grades: Grade[];
  subjects: Subject[];
}

export function StudentAchievements({ studentId, attendances, grades, subjects: _subjects }: StudentAchievementsProps) {
  
  // 1. Calculate Real Statistics
  const stats = useMemo(() => {
    const studentAtts = attendances.filter(a => a.studentId === studentId);
    const totalDays = studentAtts.length;
    const hadirCount = studentAtts.filter(a => a.status === "Hadir").length;
    const sakitCount = studentAtts.filter(a => a.status === "Sakit").length;
    const izinCount = studentAtts.filter(a => a.status === "Izin").length;
    const alpaCount = studentAtts.filter(a => a.status === "Alpa").length;

    const attendanceRate = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 100;

    const studentGrades = grades.filter(g => g.studentId === studentId);
    const totalSubjects = studentGrades.length;
    const sumScore = studentGrades.reduce((acc, g) => acc + g.finalScore, 0);
    const averageScore = totalSubjects > 0 ? Math.round((sumScore / totalSubjects) * 10) / 10 : 0;

    // Calculate dynamic "XP" for leveling up
    // Formula: Hadir days * 50XP + Average Score * 25XP
    const xpFromAttendance = hadirCount * 50;
    const xpFromGrades = Math.round(averageScore * 25);
    const totalXP = xpFromAttendance + xpFromGrades;
    
    // Level is totalXP / 1000 + 1
    const currentLevel = Math.floor(totalXP / 1000) + 1;
    const xpForNextLevel = 1000;
    const xpProgress = totalXP % 1000;
    const progressPercent = Math.min(Math.round((xpProgress / xpForNextLevel) * 100), 100);

    return {
      totalDays,
      hadirCount,
      sakitCount,
      izinCount,
      alpaCount,
      attendanceRate,
      totalSubjects,
      averageScore,
      totalXP,
      currentLevel,
      xpProgress,
      progressPercent
    };
  }, [studentId, attendances, grades]);

  // 2. Configure Badges
  const badgesList = [
    {
      id: "b_perfect_att",
      name: "Benteng Absensi",
      description: "Mencapai presensi kehadiran 100% sempurna tanpa alpa atau izin.",
      requirement: "Presensi Hadir = 100%",
      unlocked: stats.attendanceRate === 100 && stats.totalDays > 0,
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600 shadow-emerald-200/50 text-white"
    },
    {
      id: "b_high_att",
      name: "Siswa Konsisten",
      description: "Memiliki kehadiran yang konsisten di atas 90%.",
      requirement: "Presensi Hadir ≥ 90%",
      unlocked: stats.attendanceRate >= 90 && stats.totalDays > 0,
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "from-green-400 to-emerald-500 shadow-green-200/50 text-white"
    },
    {
      id: "b_academic_star",
      name: "Cendekiawan Emas",
      description: "Meraih rata-rata nilai akademik rapor 85 ke atas.",
      requirement: "Rata-rata Nilai ≥ 85",
      unlocked: stats.averageScore >= 85,
      icon: <Star className="w-6 h-6" />,
      color: "from-amber-400 to-orange-500 shadow-amber-200/50 text-white"
    },
    {
      id: "b_academic_silver",
      name: "Bintang Cerdas",
      description: "Meraih rata-rata nilai akademik rapor di atas KKM umum (75).",
      requirement: "Rata-rata Nilai ≥ 75",
      unlocked: stats.averageScore >= 75,
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-indigo-400 to-blue-500 shadow-indigo-200/50 text-white"
    },
    {
      id: "b_first_step",
      name: "Pencari Ilmu",
      description: "Telah tuntas menginputkan seluruh mata pelajaran terdaftar.",
      requirement: "Sudah diinput minimal 3 Mapel",
      unlocked: stats.totalSubjects >= 3,
      icon: <BookOpen className="w-6 h-6" />,
      color: "from-violet-500 to-purple-600 shadow-violet-200/50 text-white"
    },
    {
      id: "b_active_attendance",
      name: "Darah Juang",
      description: "Aktif mengikuti kegiatan kelas tanpa satu pun catatan Alpa.",
      requirement: "Tanpa catatan ketidakhadiran Alpa (0 Alpa)",
      unlocked: stats.alpaCount === 0 && stats.totalDays > 0,
      icon: <Activity className="w-6 h-6" />,
      color: "from-rose-500 to-pink-600 shadow-rose-200/50 text-white"
    },
    {
      id: "b_perintis",
      name: "Lentera Belajar",
      description: "Mempunyai antusiasme tinggi dalam berpartisipasi di kelas digital.",
      requirement: "Rata-rata Nilai ≥ 70",
      unlocked: stats.averageScore >= 70,
      icon: <Compass className="w-6 h-6" />,
      color: "from-cyan-400 to-sky-500 shadow-cyan-200/50 text-white"
    },
    {
      id: "b_streak",
      name: "Semangat Membara",
      description: "Mendapatkan rata-rata nilai gemilang di atas 80 secara stabil.",
      requirement: "Rata-rata Nilai ≥ 80",
      unlocked: stats.averageScore >= 80,
      icon: <Flame className="w-6 h-6" />,
      color: "from-orange-500 to-red-600 shadow-orange-200/50 text-white"
    }
  ];

  const unlockedCount = badgesList.filter(b => b.unlocked).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6" id="gamification-achievement-section">
      
      {/* 1. Header Level Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 relative shrink-0">
            <Trophy className="w-7 h-7" />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {stats.currentLevel}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">Level {stats.currentLevel} - Pelajar Teladan</h4>
            <p className="text-[10px] text-slate-400 font-medium">Kumpulkan XP dengan menjaga kehadiran konsisten dan meningkatkan nilai akademik rapor Anda.</p>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="flex-1 max-w-md w-full space-y-1.5 md:pl-6">
          <div className="flex justify-between text-[10px] font-extrabold uppercase tracking-wider font-mono">
            <span className="text-slate-400">Kemajuan Level</span>
            <span className="text-blue-600">{stats.xpProgress} / 1000 XP ({stats.progressPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Key Statistics Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Persentase Presensi</p>
          <p className="text-lg font-extrabold text-slate-800 font-mono">{stats.attendanceRate}%</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Rata-rata Nilai</p>
          <p className="text-lg font-extrabold text-slate-800 font-mono">{stats.averageScore}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Badge Terbuka</p>
          <p className="text-lg font-extrabold text-slate-800 font-mono">{unlockedCount} / {badgesList.length}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Akumulasi XP</p>
          <p className="text-lg font-extrabold text-slate-800 font-mono">{stats.totalXP} XP</p>
        </div>
      </div>

      {/* 3. Badges Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
            Lemari Piagam Pencapaian (Badges Showcase)
          </span>
          <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase font-mono">
            Kategori: Presensi & Nilai
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {badgesList.map((badge) => (
            <div 
              key={badge.id}
              className={`relative border rounded-2xl p-4 flex flex-col items-center text-center transition-all group ${
                badge.unlocked 
                  ? "bg-white border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300" 
                  : "bg-slate-50/50 border-slate-100 opacity-60 select-none"
              }`}
            >
              {/* Badge Icon circle */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-3 border-white shadow-md relative transition-transform group-hover:scale-110 duration-200 ${
                badge.unlocked 
                  ? `bg-gradient-to-br ${badge.color}` 
                  : "bg-slate-200 text-slate-400 border-slate-100"
              }`}>
                {badge.icon}
              </div>

              {/* Badge Name & Desc */}
              <div className="mt-3.5 space-y-1">
                <h5 className="text-[11px] font-black text-slate-800 tracking-tight uppercase">
                  {badge.name}
                </h5>
                <p className="text-[9px] text-slate-400 leading-normal font-medium px-1">
                  {badge.description}
                </p>
              </div>

              {/* Requirement badge / lock overlay */}
              <div className="mt-4 pt-2.5 border-t border-slate-100/70 w-full flex justify-center">
                <span className={`text-[8px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded-md ${
                  badge.unlocked 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "bg-slate-200/60 text-slate-500"
                }`}>
                  {badge.unlocked ? "Terbuka" : badge.requirement}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
