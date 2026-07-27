import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Auto-focus cancel button when dialog opens (safer default)
  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard handler: Escape to cancel
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const variantConfig = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-rose-600" />,
      iconBg: "bg-rose-50 border border-rose-100",
      confirmClass: "bg-rose-600 hover:bg-rose-700 border-rose-700 text-white focus:ring-rose-500",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: "bg-amber-50 border border-amber-100",
      confirmClass: "bg-amber-500 hover:bg-amber-600 border-amber-600 text-white focus:ring-amber-400",
    },
    info: {
      icon: <AlertTriangle className="w-6 h-6 text-blue-600" />,
      iconBg: "bg-blue-50 border border-blue-100",
      confirmClass: "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white focus:ring-blue-500",
    },
  };

  const config = variantConfig[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-[100]"
            onClick={onCancel}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${config.iconBg}`}>
                  {config.icon}
                </div>
                <button
                  onClick={onCancel}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
                  aria-label="Tutup dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 pt-4 pb-6">
                <h2
                  id="confirm-dialog-title"
                  className="text-base font-extrabold text-slate-900 tracking-tight"
                >
                  {title}
                </h2>
                <p
                  id="confirm-dialog-desc"
                  className="mt-2 text-sm text-slate-500 leading-relaxed"
                >
                  {message}
                </p>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <button
                    ref={cancelBtnRef}
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    ref={confirmBtnRef}
                    onClick={onConfirm}
                    className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl border transition-colors cursor-pointer focus:outline-none focus:ring-2 ${config.confirmClass}`}
                  >
                    {confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
