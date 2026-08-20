"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { TableSkeleton } from "@/components/ui/Skeleton";

export type Align = "left" | "right" | "center";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessor: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null | undefined;
  align?: Align;
  className?: string;
  width?: string | number;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  compact?: boolean;
};

type SortState = { id: string; dir: "asc" | "desc" } | null;

const alignClass: Record<Align, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

function defaultSearch<T>(row: T, query: string) {
  return JSON.stringify(row).toLowerCase().includes(query.toLowerCase());
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  searchable = false,
  searchPlaceholder = "Search…",
  searchFilter,
  emptyTitle = "No records",
  emptyDescription = "Nothing matches the current filters.",
  onRowClick,
  toolbar,
  compact = true,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>(null);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return data;
    const fn = searchFilter ?? defaultSearch;
    return data.filter((row) => fn(row, q));
  }, [data, query, searchFilter]);

  const rows = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sort, columns]);

  function toggleSort(col: DataTableColumn<T>) {
    if (!col.sortValue) return;
    setSort((prev) => {
      if (prev?.id !== col.id) return { id: col.id, dir: "asc" };
      if (prev.dir === "asc") return { id: col.id, dir: "desc" };
      return null;
    });
  }

  const cellPad = compact ? "px-2.5 py-1.5" : "px-3 py-2.5";

  return (
    <div>
      {(searchable || toolbar) && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          {searchable ? (
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-faint" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-7"
                aria-label="Search table"
              />
            </div>
          ) : (
            <div />
          )}
          {toolbar}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={Math.min(columns.length, 8)} />
      ) : rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-max text-xs">
            <thead>
              <tr className="border-b border-border bg-white">
                {columns.map((col) => {
                  const sortable = Boolean(col.sortValue);
                  const active = sort?.id === col.id;
                  return (
                    <th
                      key={col.id}
                      style={col.width ? { width: col.width } : undefined}
                      className={cn(
                        cellPad,
                        "text-2xs font-semibold uppercase tracking-label text-muted whitespace-nowrap select-none",
                        alignClass[col.align ?? "left"],
                        sortable && "cursor-pointer hover:text-ink",
                        col.className,
                      )}
                      onClick={() => toggleSort(col)}
                      aria-sort={
                        active
                          ? sort?.dir === "asc"
                            ? "ascending"
                            : "descending"
                          : undefined
                      }
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          (col.align ?? "left") === "right" && "flex-row-reverse",
                          (col.align ?? "left") === "center" && "justify-center w-full",
                        )}
                      >
                        {col.header}
                        {sortable ? (
                          active ? (
                            sort?.dir === "asc" ? (
                              <ArrowUp className="size-3 text-ubs-red" />
                            ) : (
                              <ArrowDown className="size-3 text-ubs-red" />
                            )
                          ) : (
                            <ArrowUp className="size-3 text-border" />
                          )
                        ) : null}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    onRowClick && "cursor-pointer hover:bg-black/[0.02]",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        cellPad,
                        "text-ink tabular-nums whitespace-nowrap",
                        alignClass[col.align ?? "left"],
                        col.className,
                      )}
                    >
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
