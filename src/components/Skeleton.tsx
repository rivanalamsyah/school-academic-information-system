import React from "react";

interface SkeletonProps {
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  count = 1
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-slate-200/80 rounded-lg dark:bg-slate-700/50";
  
  const variantClasses = {
    text: "h-3.5 w-full my-1.5",
    rect: "w-full",
    circle: "rounded-full shrink-0"
  };

  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (width !== undefined) {
      style.width = typeof width === "number" ? `${width}px` : width;
    }
    if (height !== undefined) {
      style.height = typeof height === "number" ? `${height}px` : height;
    }
    return style;
  };

  const renderSingle = (index: number) => {
    let classes = `${baseClasses} ${variantClasses[variant]} ${className}`;
    
    // Slight width variation for multi-line text to make it look like a natural paragraph
    if (variant === "text" && count > 1 && index === count - 1 && !width) {
      classes += " w-3/4";
    }

    return (
      <div
        key={index}
        className={classes}
        style={getStyle()}
        id={`skeleton-item-${index}`}
      />
    );
  };

  if (count > 1) {
    return (
      <div className="w-full space-y-1">
        {Array.from({ length: count }).map((_, idx) => renderSingle(idx))}
      </div>
    );
  }

  return renderSingle(0);
}

// 1. STATS GRID SKELETON
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" id="skeleton-stats-grid">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <Skeleton variant="circle" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" className="h-2.5" />
            <Skeleton variant="text" width="80%" className="h-5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 2. TABLE SKELETON
interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeaderButton?: boolean;
}

// Pre-calculated deterministic widths to avoid Math.random() in render
const SKELETON_CELL_WIDTHS = ["55%", "70%", "45%", "80%", "60%", "50%", "75%", "65%", "85%", "40%"];

export function TableSkeleton({ columns = 5, rows = 6, showHeaderButton = true }: TableSkeletonProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-6" id="skeleton-table-container">
      {/* Table Header Filter controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
          <Skeleton variant="rect" width={200} height={36} className="rounded-xl" />
          <Skeleton variant="rect" width={120} height={36} className="rounded-xl" />
        </div>
        {showHeaderButton && (
          <Skeleton variant="rect" width={140} height={36} className="rounded-xl shrink-0" />
        )}
      </div>

      {/* Table body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="py-3 px-4">
                  <Skeleton variant="text" width={i === 0 ? "40px" : i === 1 ? "120px" : "80px"} className="h-3" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50/30">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="py-4 px-4">
                    {colIndex === 0 ? (
                      <Skeleton variant="text" width="30px" />
                    ) : colIndex === 1 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton variant="circle" width={32} height={32} />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton variant="text" width="130px" className="h-3 font-bold" />
                          <Skeleton variant="text" width="90px" className="h-2.5" />
                        </div>
                      </div>
                    ) : (
                      <Skeleton variant="text" width={SKELETON_CELL_WIDTHS[(rowIndex * columns + colIndex) % SKELETON_CELL_WIDTHS.length]} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3. RAPOR / REPORT SKELETON
export function ReportContentSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse" id="skeleton-report-content">
      {/* Main report card */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="140px" className="h-3" />
          <Skeleton variant="rect" width="120px" height={22} className="rounded-lg" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 md:p-12 space-y-6">
          {/* Kop Surat */}
          <div className="flex items-center border-b-2 border-slate-200 pb-5 gap-6">
            <Skeleton variant="rect" width={64} height={64} className="rounded-xl shrink-0" />
            <div className="flex-1 space-y-2 text-center flex flex-col items-center">
              <Skeleton variant="text" width="60%" className="h-5" />
              <Skeleton variant="text" width="80%" className="h-3" />
              <Skeleton variant="text" width="50%" className="h-2.5" />
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col items-center space-y-1.5 py-2">
            <Skeleton variant="text" width={200} className="h-4" />
            <Skeleton variant="text" width={100} className="h-3" />
          </div>

          {/* Biodata */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Skeleton variant="text" width="90%" className="h-3" />
              <Skeleton variant="text" width="80%" className="h-3" />
              <Skeleton variant="text" width="85%" className="h-3" />
            </div>
            <div className="space-y-2.5">
              <Skeleton variant="text" width="75%" className="h-3" />
              <Skeleton variant="text" width="80%" className="h-3" />
              <Skeleton variant="text" width="70%" className="h-3" />
            </div>
          </div>

          {/* Grades Table placeholder */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50/80 p-3 flex justify-between border-b border-slate-200">
              <Skeleton variant="text" width={30} className="h-3" />
              <Skeleton variant="text" width={150} className="h-3" />
              <Skeleton variant="text" width={40} className="h-3" />
              <Skeleton variant="text" width={40} className="h-3" />
              <Skeleton variant="text" width={40} className="h-3" />
            </div>
            <div className="p-4 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 flex-1" id={`report-grade-row-${i}`}>
                  <div className="flex justify-between items-center">
                    <Skeleton variant="text" width={15} className="h-3" />
                    <Skeleton variant="text" width={180} className="h-3.5" />
                    <Skeleton variant="text" width={30} className="h-3" />
                    <Skeleton variant="text" width={30} className="h-3" />
                    <Skeleton variant="text" width={40} className="h-4" />
                  </div>
                  <Skeleton variant="text" width="95%" className="h-2.5 ml-8 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <Skeleton variant="text" width="60%" className="h-4" />
          <Skeleton variant="text" count={4} className="h-3" />
        </div>
        <div className="bg-slate-900 rounded-2xl p-6 space-y-4">
          <Skeleton variant="text" width="50%" className="h-4 bg-slate-800" />
          <Skeleton variant="text" count={3} className="h-3 bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="space-y-6" id="skeleton-report-container">
      {/* Top filter row */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton variant="text" width="40%" className="h-2.5" />
            <Skeleton variant="rect" height={36} className="rounded-xl" />
          </div>
        ))}
      </div>

      <ReportContentSkeleton />
    </div>
  );
}

// 4. CHART & STATS PAGE SKELETON (Full home page)
export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-8" id="skeleton-dashboard-home">
      {/* Stats row */}
      <StatsSkeleton />

      {/* Charts & admissions row */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Class distribution chart skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-2">
            <Skeleton variant="text" width="200px" className="h-4 font-extrabold" />
            <Skeleton variant="rect" width="80px" height={24} className="rounded-lg" />
          </div>
          
          <div className="space-y-5 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton variant="text" width="100px" className="h-3" />
                  <Skeleton variant="text" width="50px" className="h-3" />
                </div>
                <Skeleton variant="rect" height={8} className="rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Admissions summary box skeleton */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <Skeleton variant="text" width="120px" className="h-3.5 bg-slate-800" />
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <Skeleton variant="text" width="90px" className="h-3 bg-slate-800" />
                <Skeleton variant="text" width="40px" className="h-3 bg-slate-800" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton variant="text" width="80px" className="h-3 bg-slate-800" />
                <Skeleton variant="text" width="40px" className="h-3 bg-slate-800" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton variant="text" width="70px" className="h-3 bg-slate-800" />
                <Skeleton variant="text" width="40px" className="h-3 bg-slate-800" />
              </div>
            </div>
          </div>
          <Skeleton variant="rect" height={36} className="rounded-xl bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

// 5. SETTINGS / FORM SKELETON
export function FormSkeleton() {
  return (
    <div className="max-w-4xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6" id="skeleton-form-view">
      <div className="border-b border-slate-150 pb-2 flex items-center justify-between">
        <Skeleton variant="text" width="200px" className="h-4" />
        <Skeleton variant="circle" width={16} height={16} />
      </div>
      
      <div className="grid sm:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width="80px" className="h-2.5" />
            <Skeleton variant="rect" height={36} className="rounded-xl" />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton variant="text" width="120px" className="h-2.5" />
        <Skeleton variant="rect" height={80} className="rounded-xl" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Skeleton variant="rect" width={90} height={36} className="rounded-xl" />
        <Skeleton variant="rect" width={130} height={36} className="rounded-xl" />
      </div>
    </div>
  );
}
