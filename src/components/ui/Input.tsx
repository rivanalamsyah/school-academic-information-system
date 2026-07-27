import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", type = "text", ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-slate-700 block">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full px-3 py-2 border ${
            error ? "border-rose-400 focus:ring-rose-500" : "border-slate-200 focus:ring-blue-600"
          } rounded-xl text-xs focus:ring-2 focus:outline-none bg-white transition-all ${className}`}
          {...props}
        />
        {error && <p className="text-[10px] font-bold text-rose-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
