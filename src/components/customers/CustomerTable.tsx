"use client";

import React from "react";
import { formatINR, formatDate } from "@/lib/utils";
import type { AggregatedCustomer } from "@/types/customer.types";
import {
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";

interface CustomerTableProps {
  customers: AggregatedCustomer[];
  onOpenWhatsApp: (customer: AggregatedCustomer) => void;
  onViewOrders: (customer: AggregatedCustomer) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  onOpenWhatsApp,
  onViewOrders,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="py-3 px-3.5">Customer Profile</th>
              <th className="py-3 px-3.5">Mobile & Contact</th>
              <th className="py-3 px-3.5">Location</th>
              <th className="py-3 px-3.5 text-center">Orders</th>
              <th className="py-3 px-3.5 text-right">Lifetime Spent</th>
              <th className="py-3 px-3.5">Recent Activity</th>
              <th className="py-3 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => {
              const initials = (c.name || "CU")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "CU";

              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Customer Profile */}
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-100 font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0 max-w-[180px]">
                        <div className="font-bold text-slate-900 truncate">
                          {c.name}
                        </div>
                        {c.orders.length > 1 && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded">
                            ★ Repeat Buyer ({c.orders.length})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-2.5 px-3.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono text-slate-900 font-bold text-xs">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{c.mobile}</span>
                      </div>
                      {c.email && (
                        <div className="text-slate-400 text-[10px] truncate max-w-[160px]">
                          {c.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[130px]" title={c.city || "Sivakasi"}>
                        {c.city || "Sivakasi"}
                      </span>
                    </div>
                    {c.pincode && (
                      <span className="text-[10px] text-slate-400 font-mono ml-4 block">
                        Pin: {c.pincode}
                      </span>
                    )}
                  </td>

                  {/* Total Orders */}
                  <td className="py-2.5 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onViewOrders(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                      title="Click to view all orders"
                    >
                      <ShoppingBag className="w-3 h-3 text-slate-500" />
                      <span>{c.totalOrders}</span>
                    </button>
                  </td>

                  {/* Lifetime Spent */}
                  <td className="py-2.5 px-3.5 text-right font-black text-red-600 text-xs">
                    {formatINR(c.totalSpent)}
                  </td>

                  {/* Recent Activity */}
                  <td className="py-2.5 px-3.5">
                    {c.lastOrderDate ? (
                      <div className="space-y-0.5">
                        <div className="text-[11px] font-mono font-medium text-slate-700">
                          {c.lastOrderNumber || "—"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatDate(c.lastOrderDate)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[10px]">No orders</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* WhatsApp Button */}
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(c)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95"
                        title="Send WhatsApp Greeting & Catalog"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      {/* View Orders History */}
                      <button
                        type="button"
                        onClick={() => onViewOrders(c)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
                        title="View Orders History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {customers.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-slate-400 text-xs space-y-1"
                >
                  <p className="font-semibold text-slate-600">
                    No customers found matching your criteria.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Customers will be automatically populated as orders arrive through the store or counter POS.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
