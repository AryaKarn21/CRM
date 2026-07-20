import { ChevronUp, ChevronDown, ChevronsUpDown, RefreshCw } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { SkeletonTableRows } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function DataTable({
  columns, // [{ key, label, render, sortable, width, hideOnMobile }]
  data = [],
  loading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  emptyTitle = "No records found",
  emptyDescription = "",
  onRowClick,
  actions,
  onRetry,
  mobileCard, // optional (row) => ReactNode for a compact mobile card layout
}) {
  const handleSort = (key) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortDir === "asc" ? "desc" : "asc");
    } else {
      onSort(key, "asc");
    }
  };

  if (error)
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center py-16 px-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "var(--danger-bg)" }}
        >
          <RefreshCw size={18} style={{ color: "var(--danger)" }} />
        </div>
        <div>
          <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Couldn't load data
          </p>
          <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>
            {error?.response?.data?.message || "Something went wrong. Please try again."}
          </p>
        </div>
        {onRetry && (
          <button className="btn btn-secondary btn-sm" onClick={onRetry}>
            <RefreshCw size={13} /> Retry
          </button>
        )}
      </div>
    );

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    col.sortable && "cursor-pointer select-none hover:bg-[var(--border)]",
                    col.hideOnMobile && "hidden md:table-cell",
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    {col.label}
                    {col.sortable &&
                      (sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} className="opacity-40" />
                      ))}
                  </div>
                </th>
              ))}
              {actions && <th className="text-center" style={{ width: 120 }}>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SkeletonTableRows rows={6} columns={columns.length + (actions ? 1 : 0)} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id || i}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn(col.hideOnMobile && "hidden md:table-cell")}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                  {actions && <td className="text-center">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — avoids horizontal scrolling below sm breakpoint */}
      <div className="sm:hidden divide-y" style={{ borderColor: "var(--border)" }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 rounded-full" style={{ background: "var(--surface-2)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded" style={{ background: "var(--surface-2)" }} />
                <div className="h-2.5 w-1/3 rounded" style={{ background: "var(--surface-2)" }} />
              </div>
            </div>
          ))
        ) : data.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          data.map((row, i) =>
            mobileCard ? (
              <div
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={cn("p-4", onRowClick && "cursor-pointer active:bg-[var(--surface-2)]")}
              >
                {mobileCard(row)}
              </div>
            ) : (
              <div
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={cn("p-4 space-y-1.5", onRowClick && "cursor-pointer active:bg-[var(--surface-2)]")}
              >
                {columns.slice(0, 3).map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-3 text-[12px]">
                    <span style={{ color: "var(--text-muted)" }}>{col.label}</span>
                    <span style={{ color: "var(--text-primary)" }} className="text-right truncate">
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                    </span>
                  </div>
                ))}
              </div>
            ),
          )
        )}
      </div>

      {total > pageSize && (
        <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <Pagination total={total} page={page} pageSize={pageSize} onChange={onPageChange} />
        </div>
      )}
    </div>
  );
}