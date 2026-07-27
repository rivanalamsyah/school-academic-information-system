import { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Download, CheckCircle, AlertTriangle, Play, HelpCircle } from "lucide-react";

interface ClassRoom {
  id: string;
  name: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "student" | "teacher";
  classRooms: ClassRoom[];
  onImportSuccess: () => void;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
  userRole: string;
  userUsername: string;
}

interface ParsedRecord {
  originalIndex: number;
  data: Record<string, string>;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export default function BulkImportModal({
  isOpen,
  onClose,
  type,
  classRooms,
  onImportSuccess,
  showToast,
  userRole,
  userUsername
}: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRecord[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Custom CSV parser
  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/);
    return lines
      .map(line => {
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      })
      .filter(row => row.length > 0 && row.some(cell => cell !== ""));
  };

  // Generate and download CSV template locally
  const downloadTemplate = () => {
    let headers = "";
    let rows = "";
    let filename = "";

    if (type === "student") {
      headers = "nis,nisn,name,gender,class_name,birth_date,address,status,parent_name,parent_phone";
      rows = `102502,00912234,Budi Santoso,Laki-laki,X IPA 1,2010-02-15,Jl. Merdeka No. 10,Aktif,Slamet Santoso,08123456789\n102503,00912235,Siti Aminah,Perempuan,X IPA 1,2010-05-20,Jl. Mawar No. 4,Aktif,Rahmat Aminah,08129876543`;
      filename = "templat_impor_siswa.csv";
    } else {
      headers = "nip,name,gender,email,phone,status,birth_date,address";
      rows = `19820512,Rudi Hermawan,Laki-laki,rudi@sman1nusantara.sch.id,0811223344,PNS,1982-05-12,Jl. Diponegoro No. 8\n19850918,Dewi Lestari,Perempuan,dewi@sman1nusantara.sch.id,0811556677,Honororer,1985-09-18,Jl. Sudirman No. 12`;
      filename = "templat_impor_guru.csv";
    }

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".csv")) {
        processFile(droppedFile);
      } else {
        showToast("Format file harus berupa .csv", "error");
      }
    }
  };

  // Handle Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process and validate local file
  const processFile = (file: File) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);

      if (rows.length < 2) {
        showToast("File CSV kosong atau tidak memiliki baris data.", "error");
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase());
      const dataRows = rows.slice(1);

      // Validate header mapping
      if (type === "student") {
        const required = ["nis", "name", "gender"];
        const missing = required.filter(field => !headers.includes(field));
        if (missing.length > 0) {
          showToast(`Header CSV tidak valid. Kolom wajib yang hilang: ${missing.join(", ")}`, "error");
          return;
        }
      } else {
        const required = ["nip", "name", "gender"];
        const missing = required.filter(field => !headers.includes(field));
        if (missing.length > 0) {
          showToast(`Header CSV tidak valid. Kolom wajib yang hilang: ${missing.join(", ")}`, "error");
          return;
        }
      }

      // Parse records based on header names
      const records = dataRows.map((row, rIdx) => {
        const obj: Record<string, string> = {};
        headers.forEach((header, colIdx) => {
          if (colIdx < row.length) {
            obj[header] = row[colIdx];
          }
        });

        // Validation status
        const errors: string[] = [];
        const warnings: string[] = [];

        if (type === "student") {
          if (!obj.nis) errors.push("NIS kosong");
          if (!obj.name) errors.push("Nama kosong");
          
          const rawGender = obj.gender || "";
          let validGender = "Laki-laki";
          if (rawGender.toLowerCase() === "perempuan" || rawGender.toLowerCase() === "p") {
            validGender = "Perempuan";
          } else if (rawGender.toLowerCase() === "laki-laki" || rawGender.toLowerCase() === "l") {
            validGender = "Laki-laki";
          } else {
            warnings.push("Gender tidak dikenali, diset ke 'Laki-laki'");
          }
          obj.validatedGender = validGender;

          // Resolve classRoom ID from class_name
          const className = obj.class_name || "";
          const foundClass = classRooms.find(c => c.name.toLowerCase().trim() === className.toLowerCase().trim());
          if (foundClass) {
            obj.classRoomId = foundClass.id;
            obj.resolvedClassName = foundClass.name;
          } else {
            // Assign default class if available, else empty with warning
            if (classRooms.length > 0) {
              obj.classRoomId = classRooms[0].id;
              obj.resolvedClassName = classRooms[0].name;
              warnings.push(`Kelas "${className || 'Kosong'}" tidak cocok. Dialihkan ke "${classRooms[0].name}"`);
            } else {
              obj.classRoomId = "";
              obj.resolvedClassName = "Belum Ada Kelas";
              errors.push("Tidak ada kelas yang terdaftar di sistem");
            }
          }
          obj.birthDate = obj.birth_date || "2010-01-01";
          obj.parentName = obj.parent_name || "";
          obj.parentPhone = obj.parent_phone || "";
        } else {
          // Teacher validation
          if (!obj.nip) errors.push("NIP kosong");
          if (!obj.name) errors.push("Nama kosong");

          const rawGender = obj.gender || "";
          let validGender = "Laki-laki";
          if (rawGender.toLowerCase() === "perempuan" || rawGender.toLowerCase() === "p") {
            validGender = "Perempuan";
          } else if (rawGender.toLowerCase() === "laki-laki" || rawGender.toLowerCase() === "l") {
            validGender = "Laki-laki";
          } else {
            warnings.push("Gender tidak dikenali, diset ke 'Laki-laki'");
          }
          obj.validatedGender = validGender;
          obj.birthDate = obj.birth_date || "1990-01-01";
        }

        return {
          originalIndex: rIdx + 2,
          data: obj,
          errors,
          warnings,
          isValid: errors.length === 0
        };
      });

      setParsedData(records);
      setStep(2);
    };
    reader.readAsText(file);
  };

  // Perform bulk POST request to server
  const handleImport = async () => {
    const validRecords = parsedData.filter(r => r.isValid).map(r => {
      const d = r.data;
      if (type === "student") {
        return {
          nis: d.nis,
          nisn: d.nisn || "",
          name: d.name,
          gender: d.validatedGender,
          classRoomId: d.classRoomId,
          birthDate: d.birthDate,
          address: d.address || "",
          status: d.status || "Aktif",
          parentName: d.parentName,
          parentPhone: d.parentPhone
        };
      } else {
        return {
          nip: d.nip,
          name: d.name,
          gender: d.validatedGender,
          email: d.email || `${d.nip}@sman1nusantara.sch.id`,
          phone: d.phone || "",
          status: d.status || "PNS",
          birthDate: d.birthDate,
          address: d.address || ""
        };
      }
    });

    if (validRecords.length === 0) {
      showToast("Tidak ada baris data valid yang siap diimpor.", "warning");
      return;
    }

    setLoading(true);
    try {
      const url = type === "student" ? "/api/students/bulk" : "/api/teachers/bulk";
      const bodyKey = type === "student" ? "students" : "teachers";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": userRole,
          "x-user-username": userUsername
        },
        body: JSON.stringify({ [bodyKey]: validRecords })
      });

      if (res.ok) {
        showToast(`Impor massal berhasil! ${validRecords.length} data baru ditambahkan ke database.`, "success");
        onImportSuccess();
        onClose();
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal mengimpor data massal.", "error");
      }
    } catch {
      showToast("Kesalahan koneksi ke server.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="bulk-import-modal-overlay">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up" id="bulk-import-modal-content">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Impor Massal Data {type === "student" ? "Siswa" : "Guru"} (.CSV)
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Unggah berkas untuk mempercepat dan merampingkan registrasi data pengguna</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {step === 1 ? (
            <div className="space-y-6">
              
              {/* Instructions and Guidelines */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" /> Panduan & Struktur Berkas CSV
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Harap pastikan file Anda berekstensi <b>.csv</b> dengan pembatas koma (<b>,</b>) dan baris pertama berisi tajuk (header) kolom persis seperti panduan di bawah ini:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wajib Diisi (Mandatory)</p>
                    <p className="text-xs font-mono font-bold text-slate-800">
                      {type === "student" ? "nis, name, gender" : "nip, name, gender"}
                    </p>
                    <p className="text-[9px] text-slate-400">NIS/NIP akan digunakan sebagai username default untuk akun login.</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opsional / Tambahan</p>
                    <p className="text-xs font-mono font-bold text-blue-600">
                      {type === "student" 
                        ? "nisn, class_name, birth_date, address, status, parent_name, parent_phone"
                        : "email, phone, status, birth_date, address"
                      }
                    </p>
                    <p className="text-[9px] text-slate-400">Jika kosong, sistem akan melengkapi dengan nilai default standar sekolah.</p>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={downloadTemplate}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Templat CSV Contoh
                  </button>
                </div>
              </div>

              {/* Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? "border-blue-500 bg-blue-50/20 scale-[0.99]" 
                    : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-xs border border-blue-100">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Tarik & Lepas berkas CSV di sini, atau cari secara manual</p>
                  <p className="text-[10px] text-slate-400">Hanya berkas CSV yang diizinkan (maksimal 5MB)</p>
                </div>

                {file && (
                  <div className="mt-2 text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold font-mono">
                    Berkas terpilih: {file.name}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Preview Statistics */}
              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="flex gap-4">
                  <div className="text-center bg-white px-4 py-1.5 rounded-lg border border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Baris</p>
                    <p className="text-sm font-black text-slate-700">{parsedData.length}</p>
                  </div>
                  <div className="text-center bg-white px-4 py-1.5 rounded-lg border border-slate-100">
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Siap Diimpor</p>
                    <p className="text-sm font-black text-emerald-600">{parsedData.filter(r => r.isValid).length}</p>
                  </div>
                  <div className="text-center bg-white px-4 py-1.5 rounded-lg border border-slate-100">
                    <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">Bermasalah</p>
                    <p className="text-sm font-black text-rose-600">{parsedData.filter(r => !r.isValid).length}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                    setStep(1);
                  }}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  Ganti Berkas
                </button>
              </div>

              {/* Data Table Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 font-bold font-mono uppercase text-slate-500 text-[10px]">
                        <th className="py-2.5 px-3">Baris</th>
                        <th className="py-2.5 px-3">{type === "student" ? "NIS" : "NIP"}</th>
                        <th className="py-2.5 px-3">Nama Lengkap</th>
                        <th className="py-2.5 px-3">Gender</th>
                        {type === "student" && <th className="py-2.5 px-3">Kelas Hasil Pemetaan</th>}
                        <th className="py-2.5 px-3 text-right">Status Validasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {parsedData.map((row, idx) => {
                        const hasErrors = row.errors.length > 0;
                        const hasWarnings = row.warnings.length > 0;
                        
                        return (
                          <tr key={idx} className={hasErrors ? "bg-rose-50/20" : hasWarnings ? "bg-amber-50/20" : ""}>
                            <td className="py-2 px-3 text-[10px] font-mono text-slate-400 font-bold">#{row.originalIndex}</td>
                            <td className="py-2 px-3 font-mono font-bold text-slate-700">
                              {type === "student" ? row.data.nis : row.data.nip}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-800">{row.data.name}</td>
                            <td className="py-2 px-3">{row.data.validatedGender}</td>
                            {type === "student" && (
                              <td className="py-2 px-3">
                                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[10px]">
                                  {row.data.resolvedClassName}
                                </span>
                              </td>
                            )}
                            <td className="py-2 px-3 text-right space-y-1">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-100 text-[9px] uppercase">
                                  <CheckCircle className="w-3 h-3" /> Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-rose-700 font-bold rounded-md border border-rose-100 text-[9px] uppercase">
                                  <AlertTriangle className="w-3 h-3" /> Error
                                </span>
                              )}
                              
                              {/* Display specific error/warning messages */}
                              {(hasErrors || hasWarnings) && (
                                <div className="text-[9px] text-slate-400 font-medium space-y-0.5">
                                  {row.errors.map((e: string, i: number) => (
                                    <p key={i} className="text-rose-500 font-semibold">• {e}</p>
                                  ))}
                                  {row.warnings.map((w: string, i: number) => (
                                    <p key={i} className="text-amber-600 font-semibold">• {w}</p>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
          
          {step === 2 && (
            <button
              onClick={handleImport}
              disabled={loading || parsedData.filter(r => r.isValid).length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl border border-blue-700 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Mengimpor...
                </span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-blue-200 fill-blue-200" />
                  Impor {parsedData.filter(r => r.isValid).length} Baris Valid
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
