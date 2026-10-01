"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number | "all";
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number | "all") => void;
  pageSizeOptions?: (number | "all")[];
  itemLabel?: string;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100, "all"],
  itemLabel = "items",
  className = "",
}) => {
  const numericPageSize = pageSize === "all" ? totalItems : pageSize;
  const activePage = Math.min(currentPage, Math.max(1, totalPages));

  const startIndex =
    pageSize === "all" || totalItems === 0
      ? 0
      : (activePage - 1) * (numericPageSize || 1);

  const endIndex =
    pageSize === "all"
      ? totalItems
      : Math.min(startIndex + (numericPageSize || 1), totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];

    if (activePage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (activePage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = activePage - 1; i <= activePage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-xs ${className}`}
    >
      {/* Items Summary & Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <div>
          Showing{" "}
          <span className="font-bold text-slate-900">
            {totalItems === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to <span className="font-bold text-slate-900">{endIndex}</span> of{" "}
          <span className="font-bold text-slate-900">{totalItems}</span>{" "}
          {itemLabel}
        </div>

        <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
          <span className="text-slate-400 font-medium">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const val =
                e.target.value === "all" ? "all" : Number(e.target.value);
              onPageSizeChange(val);
              onPageChange(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "all" ? `All (${totalItems})` : `${opt} / page`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Page Navigation Controls */}
      {pageSize !== "all" && totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={activePage === 1}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => onPageChange(activePage - 1)}
            disabled={activePage === 1}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((item, idx) => {
              if (item === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-slate-400 font-bold text-xs"
                  >
                    …
                  </span>
                );
              }

              const pageNum = Number(item);
              const isActive = pageNum === activePage;

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-7 h-7 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center px-1.5 ${
                    isActive
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(activePage + 1)}
            disabled={activePage === totalPages}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={activePage === totalPages}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
