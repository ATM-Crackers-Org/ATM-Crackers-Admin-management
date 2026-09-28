"use client";

import React from "react";
import Link from "next/link";
import { Order } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

interface RecentOrdersCardProps {
  orders: Order[];
}

export const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({ orders }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800">Recent Customer Orders</h3>
          <p className="text-[11px] text-slate-400">Latest online bookings and counter transactions</p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3">Order ID</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Channel</th>
              <th className="py-2.5 px-3">Items</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono">
                  {ord.orderNumber}
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-slate-800">{ord.customerName}</div>
                  <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                </td>
                <td className="py-2.5 px-3">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ord.channel === "ONLINE"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {ord.channel}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-500">
                  {ord.items.length} items
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-800">
                  {formatINR(ord.grandTotal)}
                </td>
                <td className="py-2.5 px-3">
                  <OrderStatusBadge status={ord.status} />
                </td>
                <td className="py-2.5 px-3 text-right">
                  <Link
                    href="/orders"
                    className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                  No orders recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
