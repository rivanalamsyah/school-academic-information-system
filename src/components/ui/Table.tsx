
export interface TableColumn<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  id?: string;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Tidak ada data yang cocok dengan pencarian.",
  id,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8 bg-white border border-slate-200 rounded-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs" id={id}>
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50 font-mono">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3 px-4 ${col.headerClassName || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {data.map((item, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50/40 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`py-4 px-4 ${col.className || ""}`}>
                    {col.accessor(item)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-slate-400 italic">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
