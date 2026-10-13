"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
}

function DataTableComponent<T extends Record<string, any>>({
  columns,
  data,
  keyExtractor = (_, index) => index,
  isLoading = false,
  emptyMessage = "No records found",
  sortColumn,
  sortDirection,
  onSort,
  className,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className={cn("table-container", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && onSort?.(col.key)}
                    className={cn(
                      "table-header",
                      col.sortable && "cursor-pointer select-none hover:bg-gray-100",
                      col.align === "center" && "text-center",
                      col.align === "right" && "text-right",
                      col.className
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.align === "right" && "justify-end",
                        col.align === "center" && "justify-center"
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="flex flex-col text-[10px] text-gray-400">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <span>▲</span>
                            ) : (
                              <span>▼</span>
                            )
                          ) : (
                            <span className="opacity-40">⇅</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={`loading-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`loading-${rIdx}-${cIdx}`} className="table-cell">
                      <div className="skeleton h-4 w-3/4 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <svg
                      className="h-10 w-10 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={keyExtractor(row, index)}
                  onClick={() => onRowClick?.(row, index)}
                  className={cn(
                    "hover:bg-gray-50/80 transition-colors duration-150",
                    onRowClick && "cursor-pointer active:bg-gray-100 fast-tap touch-manipulation"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "table-cell",
                        col.align === "center" && "text-center",
                        col.align === "right" && "text-right",
                        col.className
                      )}
                    >
                      {col.render
                        ? col.render(row, index)
                        : (row as any)[col.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Low-level primitive table sub-components
export const Table = React.memo(function Table({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="table-container">
      <div className="overflow-x-auto w-full">
        <table
          className={cn("min-w-full min-w-max divide-y divide-gray-200 border-collapse", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    </div>
  );
});

export const TableHeader = React.memo(function TableHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("bg-gray-50", className)} {...props}>
      {children}
    </thead>
  );
});

export const TableBody = React.memo(function TableBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("divide-y divide-gray-200 bg-white", className)} {...props}>
      {children}
    </tbody>
  );
});

export const TableRow = React.memo(function TableRow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("hover:bg-gray-50/80 transition-colors duration-150", className)} {...props}>
      {children}
    </tr>
  );
});

export const TableCell = React.memo(function TableCell({
  className,
  children,
  isHeader = false,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { isHeader?: boolean }) {
  if (isHeader) {
    return (
      <th className={cn("table-header", className)} {...(props as any)}>
        {children}
      </th>
    );
  }
  return (
    <td className={cn("table-cell", className)} {...props}>
      {children}
    </td>
  );
});

export const TableEmpty = React.memo(function TableEmpty({
  colSpan,
  message = "No records found",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-sm text-gray-500">
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg
            className="h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p>{message}</p>
        </div>
      </td>
    </tr>
  );
});

export const DataTable = React.memo(DataTableComponent) as <T extends Record<string, any>>(
  props: DataTableProps<T>
) => React.ReactElement;

export default DataTable;

// TableHead renders a <th> header cell — NOT the thead wrapper.
// TableHeader is the <thead> wrapper (kept for backward compat).
export const TableHead = React.memo(function TableHead({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap bg-gray-50 border-b border-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
});
