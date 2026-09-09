"use client";

import React from "react";
import { Order } from "@/data/mock-data";
import { formatINR, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Eye, Printer } from "lucide-react";

interface OrderTableProps {
  orders: Order[];
  onViewOrder: (order: Order) => void;
  onPrintOrder: (order: Order) => void;
}

export function OrderTable({ orders, onViewOrder, onPrintOrder }: OrderTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Customer Details</th>
              <th className="py-3.5 px-4">Channel & Payment</th>
              <th className="py-3.5 px-4">Items</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 font-mono text-xs block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 text-xs">{order.customerName}</p>
                    <p className="text-[11px] text-slate-400">{order.customerPhone}</p>
                    {order.shippingAddress && (
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">
                        {order.shippingAddress.city}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded mr-1.5 ${
                        order.channel === "POS"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {order.channel}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {order.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-xs text-slate-700 font-medium">
                      {totalItems} cracker{totalItems !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      ({order.items.length} variety)
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 text-sm block">
                      {formatINR(order.grandTotal)}
                    </span>
                    {order.discountAmount > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold block">
                        Saved {formatINR(order.discountAmount)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewOrder(order)}
                        title="View details & status"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onPrintOrder(order)}
                        title="Print tax invoice"
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No orders found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
