"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { InventoryLog } from "@/data/mock-data";
import { Pagination } from "@/components/ui/Pagination";

interface InventoryMovementTableProps {
  logs: InventoryLog[];
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number | "all";
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number | "all") => void;
}

export const InventoryMovementTable: React.FC<InventoryMovementTableProps> = ({
  logs,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-xs sm:text-sm text-slate-800">
              Stock Movement Audit Trail
            </h3>
            <p className="text-[11px] text-slate-400">
              Track warehouse replenishments, retail POS sales, and manual reconciliations
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {totalCount ?? logs.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3.5">Date & Time</th>
                <th className="py-2.5 px-3">Cracker</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Change</th>
                <th className="py-2.5 px-3">New Balance</th>
                <th className="py-2.5 px-3">Reference / Notes</th>
                <th className="py-2.5 px-3.5">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-2 px-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    {log.productName}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        log.type === "IN"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : log.type === "SALE"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-800">
                    <span
                      className={
                        log.quantity > 0
                          ? "text-emerald-600 font-bold"
                          : "text-red-600 font-bold"
                      }
                    >
                      {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-bold">
                    {log.newStock}
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    <span className="font-mono text-slate-700 font-medium">
                      {log.reference}
                    </span>
                    {log.notes && (
                      <span className="text-slate-400 block text-[10px] mt-0.5">
                        {log.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3.5 text-slate-600 font-medium">
                    {log.performedBy}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-400 text-xs"
                  >
                    No stock movement records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Movement Pagination */}
      {typeof totalCount === "number" &&
        typeof currentPage === "number" &&
        typeof totalPages === "number" &&
        typeof pageSize !== "undefined" &&
        onPageChange &&
        onPageSizeChange && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 25, 50, 100, "all"]}
            itemLabel="audit records"
          />
        )}
    </div>
  );
};
