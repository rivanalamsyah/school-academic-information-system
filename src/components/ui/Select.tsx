import React, { SelectHTMLAttributes, forwardRef } from "react";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = "", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-700 block">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 border ${
            error ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-blue-600"
          } rounded-xl text-xs focus:ring-2 focus:outline-none bg-white transition-all ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] font-bold text-rose-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
