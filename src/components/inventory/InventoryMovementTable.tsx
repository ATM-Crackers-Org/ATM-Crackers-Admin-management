"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { InventoryLog } from "@/data/mock-data";

interface InventoryMovementTableProps {
  logs: InventoryLog[];
}

export const InventoryMovementTable: React.FC<InventoryMovementTableProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-800">Stock Movement Audit Trail</h3>
        <span className="text-xs text-slate-400">{logs.length} Records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Cracker</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Change</th>
              <th className="py-3 px-4">New Balance</th>
              <th className="py-3 px-4">Reference / Notes</th>
              <th className="py-3 px-4">Performed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 text-xs text-slate-400">
                  {formatDate(log.createdAt)}
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800">
                  {log.productName}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                <td className="py-3 px-4 font-bold text-slate-800">
                  {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                </td>
                <td className="py-3 px-4 text-xs text-slate-500 font-semibold">
                  {log.newStock}
                </td>
                <td className="py-3 px-4 text-xs text-slate-500">
                  <span className="font-mono text-slate-700">{log.reference}</span>
                  <span className="text-slate-400 block">{log.notes}</span>
                </td>
                <td className="py-3 px-4 text-xs text-slate-500">
                  {log.performedBy}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
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
