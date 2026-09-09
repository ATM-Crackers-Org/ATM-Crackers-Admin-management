"use client";

import React from "react";
import { Order } from "@/data/mock-data";
import { formatINR, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Printer, Phone, MapPin } from "lucide-react";

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: Order["status"]) => void;
  onOpenInvoice: (order: Order) => void;
}

export function OrderDetailsModal({
  order,
  onClose,
  onUpdateStatus,
  onOpenInvoice,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title={`Order Details #${order.orderNumber}`}
      maxWidth="xl"
    >
      <div className="space-y-5 text-sm">
        {/* Top Status & Overview */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-xs text-slate-400 block">Placed on</span>
            <span className="font-semibold text-slate-700 text-xs">
              {formatDate(order.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Payment Mode</span>
            <span className="font-bold text-slate-800 text-xs">
              {order.paymentMethod} • {order.channel}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Status</span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {/* Customer & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Customer Details
            </span>
            <h4 className="font-bold text-slate-800 text-sm">{order.customerName}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{order.customerPhone}</span>
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Delivery Destination
            </span>
            {order.shippingAddress ? (
              <div className="text-xs text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {order.shippingAddress.line1}, {order.shippingAddress.city} -{" "}
                  {order.shippingAddress.pincode}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">In-store counter purchase (POS)</p>
            )}
          </div>
        </div>

        {/* Items List */}
        <div>
          <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
            Ordered Crackers ({order.items.length})
          </h5>
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">{item.productName}</span>
                  <span className="text-slate-400 text-[11px]">
                    {formatINR(item.productPrice)} × {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-slate-800">{formatINR(item.lineTotal)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium text-slate-800">{formatINR(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Festival Discount:</span>
              <span>- {formatINR(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
            <span>Grand Total:</span>
            <span className="text-red-600">{formatINR(order.grandTotal)}</span>
          </div>
        </div>

        {/* Status Workflow Action */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-700 block mb-2">
            Advance Order Status:
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              ["CONFIRMED", "PACKING", "SHIPPED", "DELIVERED", "CANCELLED"] as Order["status"][]
            ).map((st) => (
              <button
                key={st}
                type="button"
                disabled={order.status === st}
                onClick={() => onUpdateStatus(order.id, st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  order.status === st
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Mark as {st}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onOpenInvoice(order)}
            className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Open Printable Invoice</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary text-xs px-4 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
