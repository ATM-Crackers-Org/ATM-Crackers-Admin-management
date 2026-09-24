"use client";

import React from "react";
import { Printer } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ApiOrder, ApiOrderItem } from "@/types/order.types";
import { useAdminStore } from "@/context/admin-store";
import { formatINR, formatDate } from "@/lib/utils";
import { printBillElement } from "@/lib/print";

interface OrderInvoiceModalProps {
  order: ApiOrder | null;
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
      title: `Tax Invoice - ${order.orderNumber}`,
    });
  };

  const customerName =
    order.customer?.name || order.shippingAddress?.fullName || "Walk-in Customer";
  const customerMobile =
    order.customerMobile || order.customer?.mobile || "—";
  const customerEmail = order.customer?.email;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tax Invoice Preview - ${order.orderNumber}`}
      maxWidth="2xl"
    >
      {/* Printable Invoice Container */}
      <div
        id="printable-order-invoice"
        className="printable-bill a4-mode p-6 bg-white border border-slate-300 rounded-xl space-y-6 text-slate-800 font-sans"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-4">
          <div className="flex items-start gap-3">
            <img
              src="/logo.png"
              alt="ATM Crackers Logo"
              className="h-16 w-auto object-contain shrink-0"
              onError={(e) => {
                // If logo.png is missing, hide or show fallback text
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <h2 className="text-xl font-black text-red-600 tracking-tight">
                {settings.storeName || "ATM CRACKERS"}
              </h2>
              <p className="text-xs text-slate-500">{settings.address}</p>
              <p className="text-xs text-slate-500">{settings.city}</p>
              <p className="text-xs text-slate-500 font-mono font-bold">
                GSTIN: {settings.gstin}
              </p>
              <p className="text-xs text-slate-500">Ph: {settings.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded inline-block border border-slate-200">
              ORIGINAL TAX INVOICE
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-2 font-mono">
              #{order.orderNumber}
            </h3>
            <p className="text-xs text-slate-500">Date: {formatDate(order.createdAt)}</p>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Payment: {order.paymentMethod || "MANUAL"} ({order.paymentStatus})
            </p>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Customer Details:
            </span>
            <p className="font-bold text-sm text-slate-900 mt-0.5">{customerName}</p>
            <p className="text-slate-600">Mobile: {customerMobile}</p>
            {customerEmail && <p className="text-slate-600">Email: {customerEmail}</p>}
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Delivery Destination:
            </span>
            {order.shippingAddress ? (
              <div className="mt-0.5 space-y-0.5 text-slate-600">
                <p className="font-medium text-slate-800">
                  {order.shippingAddress.fullName || customerName}
                </p>
                <p className="whitespace-pre-line">{order.shippingAddress.streetAddress}</p>
                <p className="font-medium">
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>
                {order.shippingAddress.landmark && (
                  <p className="text-[11px] text-slate-400">
                    Landmark: {order.shippingAddress.landmark}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic mt-0.5">Counter Pick-up / Standard Delivery</p>
            )}
          </div>
        </div>

        {/* Ordered Items Table */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-t border-slate-300 bg-slate-50 font-bold text-slate-600">
              <th className="py-2.5 px-2">#</th>
              <th className="py-2.5 px-2">Cracker Description</th>
              <th className="py-2.5 px-2 text-right">MRP</th>
              <th className="py-2.5 px-2 text-right">Rate</th>
              <th className="py-2.5 px-2 text-center">Qty</th>
              <th className="py-2.5 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: ApiOrderItem, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-2 px-2 text-slate-400 font-mono">{i + 1}</td>
                  <td className="py-2 px-2">
                    <span className="font-medium text-slate-900 block">
                      {item.productName}
                    </span>
                    {item.categoryName && (
                      <span className="text-[10px] text-slate-400">
                        {item.categoryName}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-400">
                    {formatINR(item.mrp)}
                  </td>
                  <td className="py-2 px-2 text-right font-medium text-slate-700">
                    {formatINR(item.sellingPrice)}
                  </td>
                  <td className="py-2 px-2 text-center font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {formatINR(item.itemTotal)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400">
                  No items listed.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Calculations / Summary */}
        <div className="flex justify-end pt-2 border-t">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-medium">{formatINR(order.subtotal)}</span>
            </div>

            {order.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Festival Discount:</span>
                <span>- {formatINR(order.totalDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Delivery Charges:</span>
              <span className="font-medium">
                {order.deliveryCharge > 0 ? formatINR(order.deliveryCharge) : "FREE"}
              </span>
            </div>

            <div className="flex justify-between text-sm font-bold border-t border-slate-300 pt-2 text-red-600">
              <span>Grand Total:</span>
              <span className="text-base">{formatINR(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer info & sign-off */}
        <div className="border-t pt-4 text-[11px] text-center text-slate-400 space-y-1">
          <p>{settings.posReceiptFooter || "Thank you for shopping with ATM Crackers!"}</p>
          <p className="text-[10px] text-slate-400">
            This is a computer-generated tax invoice and requires no physical signature.
          </p>
        </div>
      </div>

      {/* Modal Actions */}
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
