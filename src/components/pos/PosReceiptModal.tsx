"use client";

import React, { useState } from "react";
import { Order, StoreSettings } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { printBillElement } from "@/lib/print";
import { Printer } from "lucide-react";

interface POSReceiptModalProps {
  order: Order | null;
  settings: StoreSettings;
  onClose: () => void;
}

export function POSReceiptModal({ order, settings, onClose }: POSReceiptModalProps) {
  const [printFormat, setPrintFormat] = useState<"thermal" | "a4">("thermal");

  if (!order) return null;

  const handlePrint = () => {
    printBillElement("printable-pos-bill", {
      isThermal: printFormat === "thermal",
      title: `Bill-${order.orderNumber}`,
    });
  };

  return (
    <Modal
      isOpen={!!order}
      onClose={onClose}
      title="Print Customer Bill"
      maxWidth={printFormat === "thermal" ? "md" : "2xl"}
    >
      <div className="space-y-4">
        {/* Print Controls (Excluded from print) */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPrintFormat("thermal")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                printFormat === "thermal"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🧾 80mm Thermal
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat("a4")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                printFormat === "a4"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📄 A4 Tax Sheet
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto btn btn-primary text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 shadow-md shadow-red-900/20 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Bill (Sheet Only)</span>
          </button>
        </div>

        {/* The ONLY element that prints on the paper */}
        <div
          id="printable-pos-bill"
          className={`printable-bill ${printFormat === "thermal" ? "thermal-mode" : "a4-mode"} bg-white p-4 sm:p-6 border border-slate-300 rounded-xl text-slate-900 shadow-sm`}
        >
          {printFormat === "thermal" ? (
            /* Thermal 80mm Layout */
            <div className="text-center font-mono text-xs space-y-2 text-slate-900">
              <div className="border-b-2 border-dashed border-slate-400 pb-2">
                <h2 className="text-base font-black tracking-wider uppercase">
                  {settings.storeName}
                </h2>
                <p className="text-[10px]">{settings.address}</p>
                <p className="text-[10px]">Ph: {settings.phone}</p>
                <p className="text-[10px] font-bold mt-0.5">GSTIN: {settings.gstin}</p>
                <p className="text-[10px] font-semibold mt-1 bg-slate-100 py-0.5">
                  *** RETAIL CASH MEMO ***
                </p>
              </div>

              <div className="text-left text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>
                    BILL NO: <strong>{order.orderNumber}</strong>
                  </span>
                  <span>{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    TIME:{" "}
                    {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>
                    MODE: <strong>{order.paymentMethod}</strong>
                  </span>
                </div>
                <div>
                  CUSTOMER: {order.customerName}{" "}
                  {order.customerPhone !== "-" && `(${order.customerPhone})`}
                </div>
              </div>

              {/* Items List */}
              <div className="text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between font-bold border-b border-slate-300 pb-1 mb-1">
                  <span className="w-1/2 text-left">ITEM</span>
                  <span className="w-1/4 text-center">QTY</span>
                  <span className="w-1/4 text-right">AMT</span>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 text-left">
                    <div className="w-1/2 truncate font-medium">{item.productName}</div>
                    <div className="w-1/4 text-center">
                      {item.quantity} × {item.productPrice}
                    </div>
                    <div className="w-1/4 text-right font-bold">{formatINR(item.lineTotal)}</div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="text-right text-xs space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span>Subtotal:</span>
                  <span>{formatINR(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                    <span>Festive Discount:</span>
                    <span>- {formatINR(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black border-t-2 border-dashed border-slate-800 pt-1.5 text-slate-950">
                  <span>NET AMOUNT:</span>
                  <span>{formatINR(order.grandTotal)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-400 pt-3 text-center text-[10px] space-y-1">
                <p className="font-bold">
                  {settings.posReceiptFooter ||
                    "Wish You A Sparkling Diwali & Prosperous Celebrations!"}
                </p>
                <p className="text-[9px] text-slate-500">
                  Items once sold cannot be returned • Sivakasi Crackers
                </p>
              </div>
            </div>
          ) : (
            /* A4 Standard Tax Invoice Layout */
            <div className="space-y-6 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b pb-4">
                <div className="flex items-start gap-3">
                  <img
                    src="/logo.png"
                    alt="ATM Crackers Logo"
                    className="h-16 w-auto object-contain shrink-0"
                  />
                  <div>
                    <h2 className="text-xl font-black text-red-600 tracking-tight">
                      {settings.storeName}
                    </h2>
                    <p className="text-xs text-slate-600">{settings.address}</p>
                    <p className="text-xs text-slate-600">{settings.city} - Sivakasi Region</p>
                    <p className="text-xs font-mono font-bold text-slate-800">
                      GSTIN: {settings.gstin}
                    </p>
                    <p className="text-xs text-slate-600">Ph: {settings.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded">
                    TAX INVOICE / CASH MEMO
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-2">
                    {order.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-600">
                    Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-xs text-slate-600 font-bold">
                    Payment: {order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Customer Details:
                </span>
                <p className="font-bold text-sm text-slate-900 mt-0.5">{order.customerName}</p>
                <p className="text-xs text-slate-600">Phone: {order.customerPhone}</p>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-t border-slate-300 bg-slate-100">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Cracker Item</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 text-slate-400">{i + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatINR(item.productPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                        {formatINR(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatINR(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Discount:</span>
                      <span className="font-mono">- {formatINR(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black border-t-2 border-slate-800 pt-2 text-slate-950">
                    <span>Grand Total:</span>
                    <span className="font-mono text-red-600">{formatINR(order.grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 text-center text-xs text-slate-500">
                <p className="font-semibold">
                  {settings.posReceiptFooter || "Thank you for shopping with ATM Crackers Sivakasi!"}
                </p>
                <p className="text-[10px] mt-1 text-slate-400">
                  Subject to Sivakasi Jurisdiction • Computer Generated Receipt
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
