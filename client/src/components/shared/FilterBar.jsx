import { Search, X, SlidersHorizontal } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

export default function FilterBar({
  searchPlaceholder,
  filters = [],
  values,
  onChange,
  actions,
  resultCount,
}) {
  const [localSearch, setLocalSearch] = useState(values.search || "");
  const debouncedSearch = useDebounce(localSearch, 350);

  useEffect(() => {
    onChange("search", debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keeps the visible input in sync when a parent clears/resets filters
  // externally (e.g. a "Reset Filters" button setting values.search to "").
  useEffect(() => {
    if (values.search !== localSearch) setLocalSearch(values.search || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.search]);

  const hasFilters = filters.some((f) => values[f.key]);

  return (
    <div
      className="flex flex-col gap-3 px-4 sm:px-6 py-3 border-b"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            className="input w-full pl-8 pr-8"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setLocalSearch("")}
              aria-label="Clear search"
            >
              <X size={12} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          {filters.map((filter) => (
            <select
              key={filter.key}
              className="input w-auto min-w-[110px] max-w-full flex-1 xs:flex-none sm:flex-none text-[12px]"
              value={values[filter.key] || ""}
              onChange={(e) => onChange(filter.key, e.target.value)}
            >
              <option value="">All {filter.label}s</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {hasFilters && (
            <button
              type="button"
              className="btn btn-ghost btn-sm shrink-0"
              style={{ color: "var(--primary)" }}
              onClick={() => filters.forEach((f) => onChange(f.key, ""))}
            >
              <SlidersHorizontal size={12} /> Clear
            </button>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            {actions}
          </div>
        )}
      </div>

      {resultCount != null && (
        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {resultCount} {resultCount === 1 ? "result" : "results"} found
        </p>
      )}
    </div>
  );
}