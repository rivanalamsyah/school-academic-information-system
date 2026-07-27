import React, { useState } from "react";
import { 
  Clock, User, Layers,
  Move, RefreshCw, AlertCircle
} from "lucide-react";
import { Schedule, Subject, Teacher, ClassRoom } from "../types";

// Standard school days and time slots
const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
type DayType = typeof DAYS[number];

const TIME_SLOTS = [
  { label: "Sesi 1 (07:30 - 09:00)", start: "07:30", end: "09:00" },
  { label: "Sesi 2 (09:00 - 10:30)", start: "09:00", end: "10:30" },
  { label: "Sesi 3 (10:45 - 12:15)", start: "10:45", end: "12:15" },
  { label: "Sesi 4 (13:00 - 14:30)", start: "13:00", end: "14:30" }
];

interface AdminScheduleGridProps {
  schedules: Schedule[];
  subjects: Subject[];
  teachers: Teacher[];
  classRooms: ClassRoom[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  onRefresh: () => void;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
}

export function AdminScheduleGrid({
  schedules,
  subjects,
  teachers,
  classRooms,
  selectedClassId,
  setSelectedClassId,
  onRefresh,
  showToast
}: AdminScheduleGridProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Filter schedules for the currently selected class
  const classSchedules = schedules.filter(s => s.classRoomId === selectedClassId);

  // HTML5 Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetDay: DayType, targetSlot: typeof TIME_SLOTS[0]) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingId;
    if (!id) return;

    setDraggingId(null);
    const scheduleToUpdate = schedules.find(s => s.id === id);
    if (!scheduleToUpdate) return;

    // Check if anything actually changed
    if (scheduleToUpdate.day === targetDay && scheduleToUpdate.startTime === targetSlot.start) {
      return; // No change
    }

    // Check collision for teacher on target day & time slot (except self)
    const teacherCollision = schedules.find(
      s => s.id !== id && 
           s.teacherId === scheduleToUpdate.teacherId && 
           s.day === targetDay && 
           s.startTime === targetSlot.start
    );

    if (teacherCollision) {
      const collidingTeacher = teachers.find(t => t.id === scheduleToUpdate.teacherId);
      const collidingClass = classRooms.find(c => c.id === teacherCollision.classRoomId);
      showToast(
        `Bentrokan Jadwal! Guru ${collidingTeacher?.name || "terkait"} sudah mengajar di kelas ${collidingClass?.name || "lain"} pada hari ${targetDay} sesi ini.`, 
        "error"
      );
      return;
    }

    // Check collision for classroom on target day & time slot (except self)
    const classCollision = classSchedules.find(
      s => s.id !== id && 
           s.day === targetDay && 
           s.startTime === targetSlot.start
    );

    if (classCollision) {
      showToast(
        `Sesi tabrakan! Kelas ini sudah memiliki mata pelajaran lain pada hari ${targetDay} sesi ini.`, 
        "warning"
      );
      return;
    }

    try {
      setUpdating(true);
      const updatedSchedule = {
        ...scheduleToUpdate,
        day: targetDay,
        startTime: targetSlot.start,
        endTime: targetSlot.end
      };

      const res = await fetch(`/api/schedules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": "admin"
        },
        body: JSON.stringify(updatedSchedule)
      });

      if (res.ok) {
        showToast("Jadwal pelajaran berhasil dipindahkan!", "success");
        onRefresh();
      } else {
        showToast("Gagal memperbarui jadwal.", "error");
      }
    } catch {
      showToast("Kesalahan jaringan saat memperbarui jadwal.", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4" id="admin-schedule-grid-component">
      
      {/* Upper Selector Menu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" /> Pengaturan Jadwal Interaktif
          </h2>
          <p className="text-slate-500 text-[11px]">
            Sesuaikan jadwal pelajaran dengan metode seret-dan-lepas (drag-and-drop) pada grid mingguan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold text-slate-800 font-mono focus:outline-none focus:border-blue-500"
          >
            {classRooms.map(c => (
              <option key={c.id} value={c.id}>Kelas: {c.name}</option>
            ))}
          </select>

          <button 
            onClick={onRefresh}
            disabled={updating}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Muat Ulang Jadwal"
          >
            <RefreshCw className={`w-4 h-4 ${updating ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Drag instructions */}
      <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs font-medium">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="leading-snug">
          **Petunjuk**: Tekan dan geser kartu mata pelajaran di bawah ini ke slot waktu atau hari lain yang Anda kehendaki dalam tabel grid mingguan. Sistem akan mendeteksi bentrokan jadwal guru secara otomatis.
        </p>
      </div>

      {/* Grid Table Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200 uppercase text-[10px] font-bold text-slate-400 font-mono bg-slate-50">
                <th className="py-3 px-4 w-[160px] border-r border-slate-200">Sesi Waktu</th>
                {DAYS.map(day => (
                  <th key={day} className="py-3 px-4 text-center border-r border-slate-100 last:border-r-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-600">
              {TIME_SLOTS.map((slot) => (
                <tr key={slot.label} className="hover:bg-slate-50/30">
                  
                  {/* Y-Axis Label: Session / Time */}
                  <td className="py-4 px-4 font-bold text-slate-800 border-r border-slate-200 bg-slate-50/20">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <p className="text-[11px] leading-tight text-slate-700">{slot.label.split(" ")[0]} {slot.label.split(" ")[1]}</p>
                        <p className="text-[10px] font-mono text-slate-400 font-medium mt-0.5">{slot.start} - {slot.end}</p>
                      </div>
                    </div>
                  </td>

                  {/* Calendar Cells for each Day */}
                  {DAYS.map((day) => {
                    // Find schedule in this day and timeslot (e.g. starting at slot.start)
                    const cellSched = classSchedules.find(
                      s => s.day === day && s.startTime === slot.start
                    );

                    const subj = cellSched ? subjects.find(sub => sub.id === cellSched.subjectId) : null;
                    const teach = cellSched ? teachers.find(t => t.id === cellSched.teacherId) : null;

                    return (
                      <td
                        key={day}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day, slot)}
                        className={`p-3 border-r border-slate-100 last:border-r-0 align-top h-[115px] transition-all relative ${
                          draggingId ? "bg-blue-50/10 border-dashed border-blue-200" : ""
                        } hover:bg-slate-50`}
                      >
                        {cellSched ? (
                          // Draggable Schedule Card
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, cellSched.id)}
                            className={`p-3 bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative group border-l-4 border-l-blue-600 ${
                              draggingId === cellSched.id ? "opacity-40" : ""
                            }`}
                          >
                            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Move className="w-3 h-3 text-slate-400" />
                            </div>

                            <div className="space-y-1.5">
                              <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 font-mono text-[8px] font-extrabold rounded-md uppercase">
                                {subj?.code || "MAPEL"}
                              </span>
                              
                              <p className="text-[11px] font-extrabold text-slate-900 leading-snug truncate">
                                {subj?.name || "Mata Pelajaran"}
                              </p>

                              <div className="flex items-center gap-1 text-[9.5px] text-slate-500 font-medium truncate">
                                <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">{teach?.name || "Guru"}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Empty drop target
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300 font-semibold font-mono border border-dashed border-transparent hover:border-slate-200 hover:text-slate-400 rounded-xl transition-all">
                            Kosong
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
