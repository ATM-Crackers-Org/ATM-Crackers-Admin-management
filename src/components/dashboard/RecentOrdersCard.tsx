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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Recent Customer Orders</h3>
          <p className="text-xs text-slate-400">Latest online bookings and counter transactions</p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4">Items</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  {ord.orderNumber}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800">{ord.customerName}</div>
                  <div className="text-xs text-slate-400">{ord.customerPhone}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ord.channel === "ONLINE"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {ord.channel}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-500">
                  {ord.items.length} crackers
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  {formatINR(ord.grandTotal)}
                </td>
                <td className="py-3.5 px-4">
                  <OrderStatusBadge status={ord.status} />
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href="/orders"
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Inspect →
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
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
