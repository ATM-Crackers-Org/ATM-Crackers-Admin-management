"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { InventoryLog } from "@/data/mock-data";

interface InventoryMovementTableProps {
  logs: InventoryLog[];
}

export const InventoryMovementTable: React.FC<InventoryMovementTableProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-xs sm:text-sm text-slate-800">Stock Movement Audit Trail</h3>
        <span className="text-[11px] text-slate-400">{logs.length} Records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3">Date & Time</th>
              <th className="py-2.5 px-3">Cracker</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Change</th>
              <th className="py-2.5 px-3">New Balance</th>
              <th className="py-2.5 px-3">Reference / Notes</th>
              <th className="py-2.5 px-3">Performed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2 px-3 text-[11px] text-slate-400">
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
                  {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                </td>
                <td className="py-2 px-3 text-slate-500 font-semibold">
                  {log.newStock}
                </td>
                <td className="py-2 px-3 text-slate-500">
                  <span className="font-mono text-slate-700">{log.reference}</span>
                  <span className="text-slate-400 block text-[10px]">{log.notes}</span>
                </td>
                <td className="py-2 px-3 text-slate-500">
                  {log.performedBy}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                  No stock movement records logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
