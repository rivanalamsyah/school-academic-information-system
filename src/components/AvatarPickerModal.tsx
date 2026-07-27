import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, X, RefreshCw, Check, Image, AlertCircle } from "lucide-react";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSave: (newAvatar: string) => void;
  showToast: (text: string, type: "success" | "warning" | "error" | "info") => void;
}

export default function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatar: _currentAvatar,
  onSave,
  showToast
}: AvatarPickerModalProps) {
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Camera States
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    setCameraLoading(true);
    setCameraError(null);
    setCameraActive(false);
    
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: "user"
        },
        audio: false
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
        });
      }
    } catch (err) {
      console.error("Camera access error:", err);
      let errorMsg = "Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera.";
      const errorName = err instanceof Error ? err.name : "";
      if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
        errorMsg = "Izin akses kamera ditolak. Silakan aktifkan izin kamera di peramban Anda.";
      } else if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
        errorMsg = "Perangkat kamera tidak ditemukan pada sistem Anda.";
      }
      setCameraError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setCameraLoading(false);
    }
  }, [stream, showToast]);

  // Auto clean-up camera stream when modal is closed
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPreviewImage(null);
      setMode("upload");
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  // Handle camera start/stop on mode change
  useEffect(() => {
    if (mode === "camera" && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [mode, isOpen, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      
      // We want a square crop for the avatar
      const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);
      canvas.width = 400;
      canvas.height = 400;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const sx = ((video.videoWidth || 480) - size) / 2;
        const sy = ((video.videoHeight || 480) - size) / 2;
        
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setPreviewImage(dataUrl);
        stopCamera();
        showToast("Foto berhasil diambil!", "success");
      }
    } catch (err) {
      console.error("Error capturing photo:", err);
      showToast("Gagal mengambil foto dari kamera.", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Berkas harus berupa gambar (JPG, PNG, WEBP).", "error");
      return;
    }

    // Limit to 4MB for localStorage comfort
    if (file.size > 4 * 1024 * 1024) {
      showToast("Ukuran gambar terlalu besar. Maksimum 4MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result as string);
        showToast("Gambar berhasil diunggah!", "success");
      }
    };
    reader.onerror = () => {
      showToast("Gagal membaca file gambar.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    if (previewImage) {
      onSave(previewImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]" id="avatar-picker-modal">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-400" />
            <h3 className="font-extrabold text-sm tracking-tight">Perbarui Foto Profil</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "upload"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Upload className="w-4 h-4" /> Unggah Foto
          </button>
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "camera"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Camera className="w-4 h-4" /> Ambil dari Kamera
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Main Preview Block */}
          {previewImage ? (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Avatar Preview"
                  className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-md"
                />
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute bottom-0 right-0 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-full shadow-lg border-2 border-white cursor-pointer transition-transform hover:scale-105"
                  title="Hapus dan ulangi"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-medium">Pratinjau foto profil baru Anda</p>
            </div>
          ) : (
            <>
              {/* UPLOAD MODE */}
              {mode === "upload" && (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-300 hover:border-slate-400 hover:bg-slate-50/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
                    <Image className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1">
                    Tarik & Lepas gambar di sini, atau <span className="text-blue-600 hover:underline">Pilih File</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">JPG, PNG atau WEBP (Maks. 4MB)</p>
                </div>
              )}

              {/* CAMERA MODE */}
              {mode === "camera" && (
                <div className="flex flex-col items-center justify-center">
                  {cameraError ? (
                    <div className="w-full bg-rose-50 border border-rose-100 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-3">
                      <AlertCircle className="w-8 h-8 text-rose-500" />
                      <p className="text-xs font-semibold text-rose-800 leading-relaxed">{cameraError}</p>
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold border border-rose-700 shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Hubungkan Ulang Kamera
                      </button>
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center space-y-4">
                      {/* Camera Viewfinder */}
                      <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-slate-200 bg-slate-950 relative shadow-inner">
                        {cameraLoading && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs space-y-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                            <span>Mengaktifkan kamera...</span>
                          </div>
                        )}
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover scale-x-[-1] ${
                            cameraActive ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </div>

                      {cameraActive && (
                        <button
                          onClick={capturePhoto}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold border border-blue-700 shadow-md cursor-pointer flex items-center gap-2 transition-transform hover:scale-105"
                        >
                          <Camera className="w-4 h-4" /> Ambil Foto
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!previewImage}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 text-white font-bold text-xs rounded-xl border border-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Check className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
}
