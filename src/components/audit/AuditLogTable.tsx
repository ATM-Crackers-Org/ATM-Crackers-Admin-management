"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { AuditLog } from "@/data/mock-data";

interface AuditLogTableProps {
  logs: AuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Module</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Admin User</th>
              <th className="py-3 px-4 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 text-xs text-slate-400 font-mono">
                  {formatDate(log.timestamp)}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-xs text-slate-800">
                  {log.action}
                </td>
                <td className="py-3 px-4">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {log.module}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-slate-700">
                  {log.description}
                </td>
                <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                  {log.userName}
                </td>
                <td className="py-3 px-4 text-right text-xs font-mono text-slate-400">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                  No audit log entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
