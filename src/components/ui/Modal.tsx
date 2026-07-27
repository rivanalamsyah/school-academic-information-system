import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidthClassName?: string;
  id?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClassName = "max-w-lg",
  id = "modal-container",
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-xl ${maxWidthClassName} w-full max-h-[85vh] overflow-y-auto border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 relative z-10`}
            id={id}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50 rounded-lg cursor-pointer focus:outline-none"
              aria-label="Tutup dialog"
            >
              ✕
            </button>

            <h3
              id={`${id}-title`}
              className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-3 tracking-tight"
            >
              {title}
            </h3>

            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
