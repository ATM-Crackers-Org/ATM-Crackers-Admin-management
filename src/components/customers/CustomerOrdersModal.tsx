"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import type { AggregatedCustomer } from "@/types/customer.types";
import { formatINR, formatDate } from "@/lib/utils";
import { ShoppingBag, Calendar, CheckCircle2, Clock, MapPin, Phone, Mail } from "lucide-react";

interface CustomerOrdersModalProps {
  customer: AggregatedCustomer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Orders History - ${customer.name}`}
      maxWidth="2xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        {/* Customer Summary Header */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">{customer.name}</h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-slate-400" />
                {customer.mobile}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {customer.email}
                </span>
              )}
              {customer.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {customer.city}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Total Orders
              </span>
              <span className="text-base font-black text-slate-900">
                {customer.totalOrders}
              </span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Total Spent
              </span>
              <span className="text-base font-black text-red-600">
                {formatINR(customer.totalSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Order Number</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Items</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {customer.orders.map((ord, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-3 font-mono font-bold text-slate-900">
                    {ord.orderNumber}
                  </td>
                  <td className="py-2 px-3 text-slate-500 text-[11px]">
                    {formatDate(ord.createdAt)}
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-medium">
                    {ord.itemsCount} {ord.itemsCount === 1 ? "item" : "items"}
                  </td>
                  <td className="py-2 px-3 font-bold text-red-600">
                    {formatINR(ord.grandTotal)}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ord.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ord.orderStatus === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700"
                          : ord.orderStatus === "CANCELLED"
                          ? "bg-red-50 text-red-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {customer.orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                    No orders found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
