"use client";

import React, { useState, useEffect } from "react";
import { Order, StoreSettings } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { printBillElement } from "@/lib/print";
import { getStoreSettings } from "@/services/settings.service";
import type { ApiStoreSettings } from "@/types/settings.types";
import { Printer } from "lucide-react";

interface POSReceiptModalProps {
  order: Order | null;
  settings: StoreSettings;
  onClose: () => void;
}

export function POSReceiptModal({ order, settings, onClose }: POSReceiptModalProps) {
  const [storeSettings, setStoreSettings] = useState<ApiStoreSettings | null>(null);

  useEffect(() => {
    if (order) {
      getStoreSettings()
        .then((data) => setStoreSettings(data))
        .catch(() => {});
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    printBillElement("printable-pos-bill", {
      isThermal: false,
      title: `Bill_${order.orderNumber}`,
    });
  };

  const storeName = storeSettings?.storeName || settings.storeName || "ATM CRACKERS";
  const tagline = storeSettings?.tagline || settings.tagline;
  const address = storeSettings?.address || settings.address || settings.city || "";
  const phone = storeSettings?.supportPhone || settings.phone || "";
  const gstin = storeSettings?.gstin || settings.gstin || "";
  const footerMessage =
    storeSettings?.receiptFooterMessage ||
    settings.posReceiptFooter ||
    "Thank you for shopping with ATM Crackers! Happy and safe celebrations!";

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title="Print Customer Bill"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Print Controls (Excluded from print) */}
        <div className="no-print flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              📄 Standard Tax Invoice Receipt (Sheet)
            </span>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary text-xs font-bold px-5 py-2 flex items-center justify-center gap-2 shadow-sm shadow-red-600/20 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* The ONLY element that prints on paper */}
        <div
          id="printable-pos-bill"
          className="printable-bill a4-mode relative bg-white p-6 border border-slate-300 rounded-xl text-slate-900 shadow-sm overflow-hidden"
        >
          {/* Background Watermark Logo */}
          <div
            className="print-watermark absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden"
            aria-hidden="true"
          >
            <img src="/logo.png" alt="" className="w-80 max-w-[65%] object-contain" />
          </div>

          {/* Printable Content Layer */}
          <div className="printable-content-layer relative z-1 space-y-5 text-xs text-slate-800">
            {/* Header - Clean Store Profile Typography */}
            <div className="invoice-header flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-2xl font-black text-red-600 tracking-tight uppercase">
                  {storeName}
                </h2>
                {tagline && (
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{tagline}</p>
                )}
                {address && (
                  <p className="text-xs text-slate-600 mt-1 max-w-sm leading-relaxed">{address}</p>
                )}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-700">
                  {phone && (
                    <span>
                      <strong className="text-slate-900">Phone:</strong> {phone}
                    </span>
                  )}
                  {gstin && (
                    <span className="font-mono">
                      <strong className="text-slate-900">GSTIN:</strong> {gstin}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded uppercase tracking-wider inline-block">
                  TAX INVOICE / CASH MEMO
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2 font-mono">
                  {order.orderNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </p>
                <p className="text-xs text-slate-700 font-bold mt-1 flex items-center justify-end gap-1.5">
                  <span>Payment: <strong className="uppercase">{order.paymentMethod}</strong></span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wide ${
                      order.paymentStatus === "PENDING"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {order.paymentStatus || "PAID"}
                  </span>
                </p>
              </div>
            </div>

            {/* Customer Details Box */}
            <div className="invoice-section p-3 bg-slate-50/70 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Customer Details:
              </span>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{order.customerName}</p>
              <p className="text-xs text-slate-600">Phone: {order.customerPhone}</p>
              {order.shippingAddress?.line1 && (
                <p className="text-xs text-slate-600">Address: {order.shippingAddress.line1}</p>
              )}
            </div>

            {/* Items Table with MRP, Disc%, Selling Rate, Qty, Amount */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-t-2 border-slate-900 bg-slate-100 font-bold text-slate-800">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Cracker Item</th>
                  <th className="py-2 px-3 text-right">MRP</th>
                  <th className="py-2 px-3 text-center">Disc%</th>
                  <th className="py-2 px-3 text-right">Rate</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, i) => {
                  const mrp = item.originalPrice && item.originalPrice > item.productPrice ? item.originalPrice : item.productPrice;
                  const discPct = item.discountPercent && item.discountPercent > 0
                    ? item.discountPercent
                    : mrp > item.productPrice
                    ? Math.round(((mrp - item.productPrice) / mrp) * 100)
                    : 0;

                  return (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {mrp > item.productPrice ? (
                          <span className="line-through">{formatINR(mrp)}</span>
                        ) : (
                          formatINR(mrp)
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                        {discPct > 0 ? `${discPct}%` : "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatINR(item.productPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                        {formatINR(item.lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div className="invoice-summary flex justify-end pt-2">
              <div className="w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatINR(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Savings:</span>
                    <span className="font-mono">- {formatINR(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black border-t-2 border-slate-900 pt-2 text-slate-950">
                  <span>Grand Total:</span>
                  <span className="font-mono text-red-600">{formatINR(order.grandTotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded text-center mt-2">
                    🎉 You Saved {formatINR(order.discountAmount)} on this Order!
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer border-t border-slate-300 pt-4 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700">{footerMessage}</p>
              <p className="text-[10px] mt-1 text-slate-400">
                Subject to Sivakasi Jurisdiction • Computer Generated Receipt
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
