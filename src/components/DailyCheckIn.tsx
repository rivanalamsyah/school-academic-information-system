import { useState, useEffect, useCallback } from "react";
import { 
  MapPin, Clock, CheckCircle2, AlertTriangle, ShieldCheck, 
  RefreshCw, Map, Sparkles, Navigation, UserCheck, CalendarDays,
  Search, Filter
} from "lucide-react";
import { User, Student, ClassRoom, CheckIn } from "../types";

// Fixed coordinates of SMA Global
const SCHOOL_LAT = -6.229728;
const SCHOOL_LON = 106.829555;

// Maximum radius allowed for on-site presence (in meters)
const MAX_RADIUS_METERS = 100;

interface DailyCheckInProps {
  user: User;
  students: Student[];
  classRooms: ClassRoom[];
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
}

export function DailyCheckIn({ user, students, classRooms, showToast }: DailyCheckInProps) {
  const isSiswa = user.role === "siswa";
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // GPS & Location Simulator States
  const [latitude, setLatitude] = useState<number>(SCHOOL_LAT);
  const [longitude, setLongitude] = useState<number>(SCHOOL_LON);
  const [distance, setDistance] = useState<number>(0);
  const [locationPreset, setLocationPreset] = useState<"school" | "home" | "cafe">("school");
  const [isLocating, setIsLocating] = useState(false);
  const [locationName, setLocationName] = useState<string>("Area SMA Global (Lobi Utama)");

  // Data States
  const [checkInLogs, setCheckInLogs] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  
  // Teacher view states
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [teacherSearch, setTeacherSearch] = useState<string>("");

  // Digital clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch student info
  useEffect(() => {
    if (isSiswa && user.detailsId) {
      const student = students.find(s => s.id === user.detailsId);
      if (student) {
        setCurrentStudent(student);
      }
    }
  }, [user, students, isSiswa]);

  // Fetch check-in logs
  const fetchCheckIns = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/checkins";
      if (isSiswa && user.detailsId) {
        url += `?studentId=${user.detailsId}`;
      } else if (!isSiswa && selectedClassId) {
        url += `?classRoomId=${selectedClassId}&date=${selectedDate}`;
      } else if (!isSiswa) {
        url += `?date=${selectedDate}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCheckInLogs(data);
      }
    } catch (err) {
      console.error("Gagal memuat log check-in:", err);
    } finally {
      setLoading(false);
    }
  }, [isSiswa, user.detailsId, selectedClassId, selectedDate]);

  useEffect(() => {
    fetchCheckIns();
  }, [fetchCheckIns]);

  // Calculate distance based on presets or coordinates
  useEffect(() => {
    let lat = SCHOOL_LAT;
    let lon = SCHOOL_LON;
    let dist = 0;
    let locName = "Area SMA Global (Lobi Utama)";

    if (locationPreset === "school") {
      lat = SCHOOL_LAT;
      lon = SCHOOL_LON;
      dist = 0;
      locName = "Area SMA Global (Lobi Utama)";
    } else if (locationPreset === "home") {
      // ~1.2 km away
      lat = SCHOOL_LAT + 0.008;
      lon = SCHOOL_LON - 0.006;
      dist = 1250;
      locName = "Kost / Rumah Tinggal Siswa";
    } else if (locationPreset === "cafe") {
      // ~240m away
      lat = SCHOOL_LAT - 0.0015;
      lon = SCHOOL_LON + 0.0011;
      dist = 230;
      locName = "Kedai Kopi & Pujasera Luar Gerbang";
    }

    setLatitude(lat);
    setLongitude(lon);
    setDistance(dist);
    setLocationName(locName);
  }, [locationPreset]);

  // Haversine formula to calculate real distance if user hits "Ambil GPS"
  const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) *
        Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  const handleGetCurrentGPS = () => {
    if (!navigator.geolocation) {
      showToast("Browser Anda tidak mendukung layanan lokasi GPS.", "warning");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        const realDist = calculateHaversine(SCHOOL_LAT, SCHOOL_LON, userLat, userLon);

        setLatitude(userLat);
        setLongitude(userLon);
        setDistance(realDist);
        setLocationPreset("school"); // Custom GPS
        setLocationName(realDist <= MAX_RADIUS_METERS ? "Lokasi Riil (Dalam Jangkauan Sekolah)" : "Lokasi Riil (Di Luar Jangkauan Sekolah)");
        setIsLocating(false);
        showToast("Koordinat GPS aktual berhasil diperoleh!", "success");
      },
      (error) => {
        console.warn("GPS error:", error);
        setIsLocating(false);
        showToast("Gagal mengakses GPS aktual (akses ditolak/diblokir iframe). Menggunakan opsi simulator.", "info");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Student Check-In Execution
  const executeCheckIn = async () => {
    if (!currentStudent) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const alreadyChecked = checkInLogs.some(log => log.date === todayStr);

    if (alreadyChecked) {
      showToast("Anda sudah melakukan check-in absensi hari ini!", "warning");
      return;
    }

    try {
      setCheckingIn(true);
      const hrs = currentTime.getHours();
      const mins = currentTime.getMinutes();
      const checkInStatus = (hrs < 8 || (hrs === 8 && mins === 0)) ? "Tepat Waktu" : "Terlambat";

      const payload = {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        classRoomId: currentStudent.classRoomId,
        date: todayStr,
        time: currentTime.toLocaleTimeString("id-ID"),
        latitude,
        longitude,
        locationName,
        status: checkInStatus,
        distanceMeter: distance
      };

      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": user.role
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(`Check-In Berhasil! Anda tercatat: ${checkInStatus}`, "success");
        fetchCheckIns();
      } else {
        showToast("Gagal melakukan absensi harian.", "error");
      }
    } catch {
      showToast("Kesalahan sistem saat check-in.", "error");
    } finally {
      setCheckingIn(false);
    }
  };

  // Filter students checked in for Teacher oversight
  const teacherFilteredLogs = checkInLogs.filter(log => {
    if (teacherSearch) {
      return log.studentName.toLowerCase().includes(teacherSearch.toLowerCase());
    }
    return true;
  });

  const todayStr = currentTime.toISOString().split("T")[0];
  const hasCheckedInToday = isSiswa && checkInLogs.some(log => log.date === todayStr);
  const todayLog = isSiswa ? checkInLogs.find(log => log.date === todayStr) : null;

  return (
    <div className="space-y-6" id="daily-checkin-module">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600 animate-pulse" />
            Absensi GPS Harian
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSiswa 
              ? "Lakukan check-in kehadiran mandiri secara berkala dengan jangkauan GPS dari koordinat sekolah." 
              : "Pantau rekapitulasi kehadiran harian siswa berbasis geofencing GPS & validasi waktu nyata."}
          </p>
        </div>

        {/* Real-time Clock Widget */}
        <div className="bg-slate-950 text-slate-100 px-4 py-2.5 rounded-2xl flex items-center gap-3.5 border border-slate-800 shadow-sm self-start md:self-auto font-mono">
          <Clock className="w-5 h-5 text-blue-400 animate-spin-slow" />
          <div className="text-right">
            <p className="text-sm font-bold tracking-widest text-white leading-none">
              {currentTime.toLocaleTimeString("id-ID", { hour12: false })}
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-bold leading-none">
              {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}
            </p>
          </div>
        </div>
      </div>

      {isSiswa ? (
        // STUDENT INTERFACE
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Check-In Action Card (Left/Top) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 relative">
              <div className="absolute top-0 right-0 p-4">
                <ShieldCheck className="w-12 h-12 text-slate-100" />
              </div>

              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-1.5 mb-5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Panel Absensi GPS
              </h2>

              {hasCheckedInToday ? (
                // Already Checked-In State
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-900">Check-In Hari Ini Berhasil!</h3>
                    <p className="text-xs text-emerald-700 mt-1">
                      Data kehadiran Anda telah tercatat dan disinkronisasikan ke data induk guru pengampu.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-white/80 rounded-xl p-3 border border-emerald-100/60 text-left font-mono text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400">Waktu Check-In</p>
                      <p className="font-bold text-slate-800">{todayLog?.time || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Status Kehadiran</p>
                      <span className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold ${
                        todayLog?.status === "Tepat Waktu" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {todayLog?.status}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-slate-100 pt-2 mt-1">
                      <p className="text-[10px] text-slate-400">Lokasi Tercatat</p>
                      <p className="font-bold text-slate-800 truncate">{todayLog?.locationName} ({Math.round(todayLog?.distanceMeter || 0)}m)</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Active Check-In Screen
                <div className="space-y-5">
                  
                  {/* Location Simulator Section for easy developer/reviewer test */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Map className="w-4 h-4 text-blue-600" /> GPS Simulator (Pilih Lokasi untuk Pengujian)
                      </span>
                      <button 
                        onClick={handleGetCurrentGPS}
                        disabled={isLocating}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer disabled:text-slate-400"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
                        Gunakan GPS HP/Browser Aktual
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setLocationPreset("school")}
                        className={`px-3 py-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                          locationPreset === "school"
                            ? "bg-blue-600 text-white border-blue-700"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Di Sekolah (0m)
                      </button>
                      <button
                        onClick={() => setLocationPreset("cafe")}
                        className={`px-3 py-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                          locationPreset === "cafe"
                            ? "bg-blue-600 text-white border-blue-700"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Warkop (230m)
                      </button>
                      <button
                        onClick={() => setLocationPreset("home")}
                        className={`px-3 py-2 rounded-lg text-xs font-bold font-mono transition-all border ${
                          locationPreset === "home"
                            ? "bg-blue-600 text-white border-blue-700"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Di Rumah (1.2km)
                      </button>
                    </div>

                    {/* Geofence Status Indicator */}
                    <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                      distance <= MAX_RADIUS_METERS
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                        : "bg-rose-50 border-rose-100 text-rose-800"
                    }`}>
                      {distance <= MAX_RADIUS_METERS ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600" />
                          <div className="text-[11px]">
                            <p className="font-extrabold">Dalam Jangkauan Sekolah</p>
                            <p className="opacity-80 mt-0.5">Jarak Anda: {Math.round(distance)}m (Maks: {MAX_RADIUS_METERS}m). Anda diperbolehkan melakukan absensi kehadiran.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                          <div className="text-[11px]">
                            <p className="font-extrabold">Di Luar Jangkauan Sekolah</p>
                            <p className="opacity-80 mt-0.5">Jarak Anda: {Math.round(distance / 100) / 10} km. Anda berada di luar radius minimun ({MAX_RADIUS_METERS}m). Mengajukan status presensi khusus.</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Coordinates Info */}
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-slate-600">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Koordinat Sekolah</p>
                      <p className="font-bold text-slate-800 mt-0.5">{SCHOOL_LAT.toFixed(6)}, {SCHOOL_LON.toFixed(6)}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Koordinat Anda</p>
                      <p className="font-bold text-slate-800 mt-0.5">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
                    </div>
                    <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Nama Lokasi GPS</p>
                      <p className="font-bold text-slate-800 mt-0.5 truncate">{locationName}</p>
                    </div>
                  </div>

                  {/* Warning regarding Late Checkins */}
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold">Ketentuan Batas Waktu Absensi</p>
                      <p className="text-slate-600 text-[10.5px] mt-0.5">
                        Batas waktu kehadiran reguler adalah sebelum **08:00 WIB**. Check-in setelah jam tersebut otomatis ditandai sistem sebagai **Terlambat**.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={executeCheckIn}
                    disabled={checkingIn}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-blue-700 shadow-sm cursor-pointer transition-all"
                  >
                    <Navigation className="w-4 h-4" /> 
                    {checkingIn ? "Memproses Check-In..." : "CHECK-IN SEKARANG"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Student's Personal Check-In History (Right/Bottom) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-1.5 mb-4">
                <CalendarDays className="w-4 h-4 text-blue-600" /> Riwayat Absensi GPS Anda
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50/50 font-mono">
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Jam</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Jarak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">Memuat riwayat...</td>
                      </tr>
                    ) : checkInLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">Belum ada riwayat check-in bulan ini.</td>
                      </tr>
                    ) : (
                      checkInLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/40">
                          <td className="py-3 px-3 font-medium text-slate-900">{log.date}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{log.time}</td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              log.status === "Tepat Waktu" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500">{Math.round(log.distanceMeter)}m</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      ) : (
        // TEACHER / ADMIN INTERFACE
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" /> Filter & Monitoring GPS Siswa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Pilih Kelas</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-600 font-semibold"
                >
                  <option value="">Semua Kelas</option>
                  {classRooms.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.major})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Pilih Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-none focus:border-blue-600 font-semibold font-mono"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2 relative">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono">Cari Nama Siswa</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Ketikkan nama siswa untuk memfilter..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table of Checked In Students */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono">
                <Filter className="w-4 h-4 text-slate-500" /> DATA LOG KEHADIRAN GPS ({teacherFilteredLogs.length} SISWA)
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full font-mono">
                Tanggal Pantau: {selectedDate}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50/30 font-mono">
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Jam Check-In</th>
                    <th className="py-3 px-4">Jarak Ke Sekolah</th>
                    <th className="py-3 px-4">Lokasi/Presensi</th>
                    <th className="py-3 px-4">Status Waktu</th>
                    <th className="py-3 px-4">Koordinat GPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-2" />
                        Sedang memproses database...
                      </td>
                    </tr>
                  ) : teacherFilteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                        <MapPin className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        Belum ada siswa yang melakukan check-in GPS pada tanggal dan kriteria filter terpilih.
                      </td>
                    </tr>
                  ) : (
                    teacherFilteredLogs.map((log) => {
                      const sClass = classRooms.find(c => c.id === log.classRoomId);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/40">
                          <td className="py-3.5 px-4 font-bold text-slate-800">{log.studentName}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                            {sClass?.name || "N/A"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 font-semibold">{log.time}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">
                            {log.distanceMeter <= MAX_RADIUS_METERS ? (
                              <span className="text-emerald-600 font-bold">{Math.round(log.distanceMeter)}m (On-site)</span>
                            ) : (
                              <span className="text-rose-600 font-bold">{Math.round(log.distanceMeter)}m (Off-site)</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 truncate max-w-xs" title={log.locationName}>
                            {log.locationName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === "Tepat Waktu" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10.5px] text-slate-400">
                            {log.latitude.toFixed(5)}, {log.longitude.toFixed(5)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
