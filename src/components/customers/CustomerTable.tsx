"use client";

import React from "react";
import { formatINR } from "@/lib/utils";
import { Customer } from "@/data/mock-data";

interface CustomerTableProps {
  customers: Customer[];
  onToggleActive: (customerId: string) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onToggleActive,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Total Orders</th>
              <th className="py-3 px-4">Lifetime Spent</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 font-bold flex items-center justify-center text-xs">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div>{c.name}</div>
                      <div className="text-xs text-slate-400">
                        Joined {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs">
                  <div className="text-slate-800 font-medium">{c.phone}</div>
                  {c.email && <div className="text-slate-400">{c.email}</div>}
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                  {c.city}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  {c.totalOrders}
                </td>
                <td className="py-3.5 px-4 font-bold text-red-600">
                  {formatINR(c.totalSpent)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`badge ${
                      c.isActive ? "badge-success" : "badge-neutral"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onToggleActive(c.id)}
                    className="btn btn-secondary text-xs px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No customers found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
