import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: ReactNode;
}

export function Card({
  children,
  title,
  subtitle,
  className = "",
  headerAction,
}: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-xs p-6 ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
          <div className="space-y-1">
            {title && (
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
