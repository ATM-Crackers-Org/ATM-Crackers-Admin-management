"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Order, OrderItem } from "@/data/mock-data";
import { useAdminStore } from "@/context/admin-store";
import { formatINR, formatDate } from "@/lib/utils";
import { printBillElement } from "@/lib/print";

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { settings } = useAdminStore();

  if (!order) return null;

  const handlePrint = () => {
    printBillElement("printable-order-invoice", {
      isThermal: false,
      title: `A4 Tax Invoice - ${order.orderNumber}`,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tax Invoice Preview"
      maxWidth="2xl"
    >
      {/* Invoice Container - ONLY this element prints on the paper */}
      <div
        id="printable-order-invoice"
        className="printable-bill a4-mode p-6 bg-white border border-slate-300 rounded-xl space-y-6 text-slate-800"
      >
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-start gap-3">
            <img
              src="/logo.png"
              alt="ATM Crackers Logo"
              className="h-16 w-auto object-contain shrink-0"
            />
            <div>
              <h2 className="text-xl font-black text-red-600">{settings.storeName}</h2>
              <p className="text-xs text-slate-500">{settings.address}</p>
              <p className="text-xs text-slate-500">{settings.city}</p>
              <p className="text-xs text-slate-500 font-mono font-bold">GSTIN: {settings.gstin}</p>
              <p className="text-xs text-slate-500">Ph: {settings.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">
              TAX INVOICE
            </span>
            <h3 className="text-base font-bold text-slate-800 mt-2">
              #{order.orderNumber}
            </h3>
            <p className="text-xs text-slate-500">Date: {formatDate(order.createdAt)}</p>
            <p className="text-xs text-slate-500 font-semibold">Payment: {order.paymentMethod}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="text-xs">
          <span className="font-bold text-slate-400 uppercase">Bill To / Deliver To:</span>
          <p className="font-bold text-sm text-slate-800 mt-0.5">{order.customerName}</p>
          <p className="text-slate-600">{order.customerPhone}</p>
          {order.shippingAddress && (
            <p className="text-slate-600">
              {order.shippingAddress.line1}, {order.shippingAddress.city} - {order.shippingAddress.pincode}
            </p>
          )}
        </div>

        {/* Items */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-t border-slate-300 bg-slate-50">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Cracker Description</th>
              <th className="py-2 px-2 text-right">Rate</th>
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items.map((item: OrderItem, i: number) => (
              <tr key={i}>
                <td className="py-2 px-2 text-slate-400">{i + 1}</td>
                <td className="py-2 px-2 font-medium">{item.productName}</td>
                <td className="py-2 px-2 text-right">{formatINR(item.productPrice)}</td>
                <td className="py-2 px-2 text-center font-bold">{item.quantity}</td>
                <td className="py-2 px-2 text-right font-semibold">{formatINR(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total summary */}
        <div className="flex justify-end pt-2">
          <div className="w-56 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Festive Discount:</span>
                <span>- {formatINR(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-slate-300 pt-1 text-red-600">
              <span>Grand Total:</span>
              <span>{formatINR(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 text-[11px] text-center text-slate-400">
          {settings.posReceiptFooter}
        </div>
      </div>

      <div className="no-print flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handlePrint}
          className="btn btn-primary text-xs flex items-center gap-1.5 font-bold cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Tax Invoice (Sheet Only)</span>
        </button>
      </div>
    </Modal>
  );
};
