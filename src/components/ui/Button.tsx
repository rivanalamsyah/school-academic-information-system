import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "ghost";
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  isLoading = false,
  size = "md",
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center gap-1.5 font-bold rounded-xl transition-all cursor-pointer border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-xs focus:ring-blue-500",
    secondary: "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300 focus:ring-slate-400",
    danger: "bg-rose-600 hover:bg-rose-700 text-white border-rose-700 focus:ring-rose-500",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 focus:ring-emerald-500",
    warning: "bg-amber-500 hover:bg-amber-600 text-white border-amber-600 focus:ring-amber-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 border-transparent focus:ring-slate-300",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-[10px]",
    md: "px-4 py-2 text-xs",
    lg: "px-5 py-2.5 text-sm",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-current"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
