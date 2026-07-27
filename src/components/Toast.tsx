import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export default function Toast({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = "bg-white border-gray-200 text-gray-800";
          let Icon = Info;
          let iconColor = "text-blue-500";

          if (toast.type === "success") {
            bgColor = "bg-emerald-50 border-emerald-200 text-emerald-900";
            Icon = CheckCircle;
            iconColor = "text-emerald-500";
          } else if (toast.type === "warning") {
            bgColor = "bg-amber-50 border-amber-200 text-amber-900";
            Icon = AlertTriangle;
            iconColor = "text-amber-500";
          } else if (toast.type === "error") {
            bgColor = "bg-rose-50 border-rose-200 text-rose-900";
            Icon = XCircle;
            iconColor = "text-rose-500";
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${bgColor}`}
              id={`toast-${toast.id}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium pr-2 leading-relaxed">
                {toast.text}
              </div>
              <button
                onClick={() => onClose(toast.id)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-0.5 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
