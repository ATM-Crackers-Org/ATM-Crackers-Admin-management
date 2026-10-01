"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { getPosBills, cancelPosBill } from "@/services/pos.service";
import type { PosBill, PosBillStatus, PosPaymentMethod } from "@/types/pos.types";
import { formatINR, formatDate } from "@/lib/utils";
import { printBillElement } from "@/lib/print";
import { getStoreSettings } from "@/services/settings.service";
import type { ApiStoreSettings } from "@/types/settings.types";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  ShoppingCart,
  Receipt,
  RotateCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Printer,
  Ban,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  ChevronDown,
  AlertCircle,
  Copy,
  Check,
  Tag,
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS: Array<PosPaymentMethod | "ALL"> = [
  "ALL", "CASH", "UPI", "CARD", "BANK_TRANSFER", "CREDIT",
];
const BILL_STATUSES: Array<PosBillStatus | "ALL"> = ["ALL", "COMPLETED", "CANCELLED"];
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

// ─── Small Badges ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PosBillStatus }) {
  const cfg = {
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${cfg[status]}`}>
      {status === "COMPLETED" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
      {status}
    </span>
  );
}

function PaymentMethodBadge({ method }: { method: PosPaymentMethod }) {
  const cfg: Record<PosPaymentMethod, string> = {
    CASH: "bg-green-50 text-green-700 border-green-200",
    UPI: "bg-violet-50 text-violet-700 border-violet-200",
    CARD: "bg-blue-50 text-blue-700 border-blue-200",
    BANK_TRANSFER: "bg-sky-50 text-sky-700 border-sky-200",
    CREDIT: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${cfg[method]}`}>
      {method.replace("_", " ")}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${
      status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      {status === "PAID" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
      {status}
    </span>
  );
}

// ─── Pagination Bar ───────────────────────────────────────────────────────────

function PaginationBar({
  total, page, pageSize, onPageChange, onPageSizeChange,
}: {
  total: number; page: number; pageSize: PageSize;
  onPageChange: (p: number) => void; onPageSizeChange: (ps: PageSize) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-100">
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of{" "}
          <span className="font-semibold text-slate-700">{total}</span> bills
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Per page</span>
          <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 font-medium outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 cursor-pointer">
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(1)} disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`el-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-400">…</span>
          ) : (
            <button key={p} type="button" onClick={() => onPageChange(p as number)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                p === page ? "bg-red-600 border-red-600 text-white shadow-sm shadow-red-600/30" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>{p}</button>
          )
        )}
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Print Receipt Modal ──────────────────────────────────────────────────────

function PosPrintModal({
  bill,
  isOpen,
  onClose,
}: {
  bill: PosBill | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [storeSettings, setStoreSettings] = useState<ApiStoreSettings | null>(null);

  useEffect(() => {
    if (isOpen) {
      getStoreSettings()
        .then((data) => setStoreSettings(data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !bill) return null;

  const totalSaved = bill.items.reduce((s, i) => s + (i.mrp - i.sellingPrice) * i.quantity, 0);
  const totalUnits = bill.items.reduce((s, i) => s + i.quantity, 0);

  const handlePrint = () => {
    printBillElement("pos-print-area", {
      isThermal: false,
      title: `Bill_${bill.billNumber}`,
    });
  };

  const storeName = storeSettings?.storeName || "ATM CRACKERS";
  const tagline = storeSettings?.tagline || "Quality Fireworks Since 1985";
  const address = storeSettings?.address || "Sivakasi, Tamil Nadu";
  const phone = storeSettings?.supportPhone || "+91 98765 43210";
  const gstin = storeSettings?.gstin || "";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Print Receipt — {bill.billNumber}</h2>
              <p className="text-[11px] text-slate-400">Preview before printing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handlePrint}
              className="btn btn-primary text-xs flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="pos-print-area" className="relative overflow-y-auto p-6 a4-mode">
          {/* Background Watermark Logo */}
          <div
            className="print-watermark absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden"
            aria-hidden="true"
          >
            <img src="/logo.png" alt="" className="w-80 max-w-[65%] object-contain" />
          </div>

          {/* Store Header */}
          <div className="text-center mb-5 pb-4 border-b-2 border-slate-900">
            <h1 className="text-2xl font-black text-red-600 tracking-tight uppercase">{storeName}</h1>
            {tagline && <p className="text-xs text-slate-600 font-semibold mt-0.5">{tagline}</p>}
            {address && <p className="text-xs text-slate-500 mt-0.5">{address}</p>}
            <p className="text-xs text-slate-500 mt-0.5">
              {gstin && <span className="font-mono">GSTIN: {gstin} | </span>}
              <span>Ph: {phone}</span>
            </p>
          </div>

          {/* Bill Info */}
          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Bill No:</span>
                <span className="font-bold text-slate-900 font-mono">{bill.billNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Date:</span>
                <span className="text-slate-700">{formatDate(bill.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-1">
                <StatusBadge status={bill.status} />
                <PaymentMethodBadge method={bill.paymentMethod} />
                <PaymentStatusBadge status={bill.paymentStatus} />
              </div>
            </div>

            {/* Customer */}
            <div className="text-right space-y-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Customer</p>
              <div className="flex items-center justify-end gap-1.5 text-xs">
                <User className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-800">{bill.customerName}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600">{bill.customerMobile}</span>
              </div>
              {bill.customerEmail && (
                <div className="flex items-center justify-end gap-1.5 text-xs">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-600">{bill.customerEmail}</span>
                </div>
              )}
              {bill.shippingAddress?.city && (
                <div className="flex items-center justify-end gap-1.5 text-xs">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-600">
                    {[bill.shippingAddress.streetAddress, bill.shippingAddress.city, bill.shippingAddress.pincode].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-xs">
              <thead className="bg-slate-800 text-white text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="text-left py-2.5 px-3 font-semibold">Product</th>
                  <th className="text-center py-2.5 px-2 font-semibold">Qty</th>
                  <th className="text-right py-2.5 px-3 font-semibold">MRP</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Disc%</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Price</th>
                  <th className="text-right py-2.5 px-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.items.map((item, i) => {
                  const disc = item.discountPercent ?? (item.mrp > 0 ? Math.round(((item.mrp - item.sellingPrice) / item.mrp) * 100) : 0);
                  const saved = (item.mrp - item.sellingPrice) * item.quantity;
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800 leading-snug">{item.productName}</p>
                        {item.categoryName && <p className="text-[10px] text-slate-400">{item.categoryName}</p>}
                        {item.offerName && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md mt-0.5">
                            🎉 {item.offerName}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-slate-400 line-through text-[11px]">{formatINR(item.mrp)}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {disc > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                            <Tag className="w-2.5 h-2.5" />
                            -{disc}%
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{formatINR(item.sellingPrice)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <p className="font-bold text-slate-900">{formatINR(item.itemTotal)}</p>
                        {saved > 0 && (
                          <p className="text-[10px] text-emerald-600 font-medium">saved {formatINR(saved)}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200">
                <tr>
                  <td colSpan={5} className="py-2 px-3 text-xs text-slate-500">
                    {totalUnits} unit{totalUnits !== 1 ? "s" : ""} · {bill.items.length} item{bill.items.length !== 1 ? "s" : ""}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900 text-xs">{formatINR(bill.subtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1.5 text-xs text-slate-600 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-800">{formatINR(bill.subtotal)}</span>
            </div>
            {bill.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Product Discounts</span>
                <span>− {formatINR(bill.totalDiscount)}</span>
              </div>
            )}
            {totalSaved > 0 && bill.totalDiscount === 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Total Savings</span>
                <span>− {formatINR(totalSaved)}</span>
              </div>
            )}
            {bill.couponDiscount > 0 && (
              <div className="flex justify-between text-violet-600 font-semibold">
                <span>Coupon {bill.couponCode ? `(${bill.couponCode})` : ""}</span>
                <span>− {formatINR(bill.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1 font-bold text-sm text-slate-900">
              <span>Grand Total</span>
              <span className="text-red-700">{formatINR(bill.grandTotal)}</span>
            </div>
            {bill.paymentMethod === "CASH" && bill.amountReceived > 0 && (
              <>
                <div className="flex justify-between text-slate-500 border-t border-slate-100 pt-1.5">
                  <span>Amount Received (Cash)</span>
                  <span className="font-semibold">{formatINR(bill.amountReceived)}</span>
                </div>
                {bill.changeAmount > 0 && (
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>Change Returned</span>
                    <span>{formatINR(bill.changeAmount)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Savings Highlight */}
          {(bill.totalDiscount > 0 || totalSaved > 0) && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wide">You Saved!</p>
                  <p className="text-xs text-emerald-600">
                    Total discount applied on this bill
                  </p>
                </div>
              </div>
              <p className="text-lg font-black text-emerald-700">
                {formatINR(bill.totalDiscount > 0 ? bill.totalDiscount : totalSaved)}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-[10px] text-slate-400 space-y-0.5 pt-3 border-t border-slate-100">
            <p className="font-semibold text-slate-600">Thank you for shopping at ATM Crackers! 🎆</p>
            <p>Goods once sold will not be taken back. Subject to Sivakasi jurisdiction.</p>
            <p className="text-slate-300">Generated on {new Date().toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bill Detail Modal ────────────────────────────────────────────────────────

function PosBillDetailModal({
  bill, isOpen, onClose, onPrint,
}: {
  bill: PosBill | null; isOpen: boolean; onClose: () => void; onPrint: (b: PosBill) => void;
}) {
  if (!isOpen || !bill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Receipt className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">{bill.billNumber}</h2>
              <p className="text-[11px] text-slate-400">{formatDate(bill.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onPrint(bill)}
              className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Status row */}
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={bill.status} />
            <PaymentMethodBadge method={bill.paymentMethod} />
            <PaymentStatusBadge status={bill.paymentStatus} />
          </div>

          {/* Customer card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-1.5"><User className="w-3 h-3 text-slate-400" /><span className="font-semibold">{bill.customerName}</span></div>
              <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /><span>{bill.customerMobile}</span></div>
              {bill.customerEmail && (
                <div className="col-span-2 flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /><span>{bill.customerEmail}</span></div>
              )}
              {bill.shippingAddress?.streetAddress && (
                <div className="col-span-2 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{bill.shippingAddress.streetAddress}, {bill.shippingAddress.city} — {bill.shippingAddress.pincode}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table with discount columns */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-800 text-white text-[10px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="text-left py-2.5 px-3">Product</th>
                  <th className="text-center py-2.5 px-2">Qty</th>
                  <th className="text-right py-2.5 px-3">MRP</th>
                  <th className="text-right py-2.5 px-3">Disc%</th>
                  <th className="text-right py-2.5 px-3">Price</th>
                  <th className="text-right py-2.5 px-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bill.items.map((item, i) => {
                  const disc = item.discountPercent ??
                    (item.mrp > 0 ? Math.round(((item.mrp - item.sellingPrice) / item.mrp) * 100) : 0);
                  const saved = (item.mrp - item.sellingPrice) * item.quantity;
                  return (
                    <tr key={i} className={`hover:bg-slate-50/70 transition-colors ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800 leading-snug">{item.productName}</p>
                        {item.categoryName && <p className="text-[10px] text-slate-400 mt-0.5">{item.categoryName}</p>}
                        {item.offerName && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                            🎉 {item.offerName}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-700">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-slate-400 line-through">{formatINR(item.mrp)}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {disc > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md">
                            <Tag className="w-2.5 h-2.5" />-{disc}%
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700">
                        {formatINR(item.sellingPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <p className="font-bold text-slate-900">{formatINR(item.itemTotal)}</p>
                        {saved > 0 && (
                          <p className="text-[10px] text-emerald-600 font-medium">saved {formatINR(saved)}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatINR(bill.subtotal)}</span>
            </div>
            {bill.totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" />Product Discounts</span>
                <span>− {formatINR(bill.totalDiscount)}</span>
              </div>
            )}
            {bill.couponDiscount > 0 && (
              <div className="flex justify-between text-violet-600 font-semibold">
                <span>Coupon {bill.couponCode ? `(${bill.couponCode})` : ""}</span>
                <span>− {formatINR(bill.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-1 font-bold text-sm text-slate-900">
              <span>Grand Total</span>
              <span className="text-red-700">{formatINR(bill.grandTotal)}</span>
            </div>
            {bill.amountReceived > 0 && (
              <>
                <div className="flex justify-between text-slate-500 border-t border-slate-100 pt-1">
                  <span>Amount Received</span>
                  <span className="font-semibold">{formatINR(bill.amountReceived)}</span>
                </div>
                {bill.changeAmount > 0 && (
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>Change Returned</span>
                    <span>{formatINR(bill.changeAmount)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Savings highlight */}
          {bill.totalDiscount > 0 && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Customer Saved</p>
                  <p className="text-[11px] text-emerald-600">Across {bill.items.length} item(s)</p>
                </div>
              </div>
              <p className="text-xl font-black text-emerald-700">{formatINR(bill.totalDiscount)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main PosBillsView ────────────────────────────────────────────────────────

export function PosBillsView() {
  const [bills, setBills] = useState<PosBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PosBillStatus | "ALL">("ALL");
  const [methodFilter, setMethodFilter] = useState<PosPaymentMethod | "ALL">("ALL");

  // Refs for stable loadBills
  const searchRef = useRef(search);
  const statusRef = useRef(statusFilter);
  const methodRef = useRef(methodFilter);
  searchRef.current = search;
  statusRef.current = statusFilter;
  methodRef.current = methodFilter;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);

  // Modals
  const [selectedBill, setSelectedBill] = useState<PosBill | null>(null);
  const [printBill, setPrintBill] = useState<PosBill | null>(null);
  const [cancelTarget, setCancelTarget] = useState<PosBill | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copiedBillNumber, setCopiedBillNumber] = useState<string | null>(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const loadBills = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);
    try {
      const data = await getPosBills({
        search: searchRef.current.trim() || undefined,
        status: statusRef.current !== "ALL" ? statusRef.current : undefined,
        paymentMethod: methodRef.current !== "ALL" ? methodRef.current : undefined,
      });
      setBills(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load POS bills.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadBills(); }, [loadBills]);

  useEffect(() => {
    const t = setTimeout(() => { setCurrentPage(1); loadBills(); }, 350);
    return () => clearTimeout(t);
  }, [search, statusFilter, methodFilter]); // eslint-disable-line

  // ─── Metrics ──────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = bills.length;
    const completed = bills.filter((b) => b.status === "COMPLETED").length;
    const cancelled = bills.filter((b) => b.status === "CANCELLED").length;
    const revenue = bills.filter((b) => b.status === "COMPLETED").reduce((s, b) => s + b.grandTotal, 0);
    return { total, completed, cancelled, revenue };
  }, [bills]);

  // ─── Pagination slice ─────────────────────────────────────────────────────
  const paginatedBills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return bills.slice(start, start + pageSize);
  }, [bills, currentPage, pageSize]);

  // ─── Cancel ───────────────────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await cancelPosBill(cancelTarget.billNumber);
      toast.success(`Bill ${cancelTarget.billNumber} cancelled successfully`);
      setBills((prev) =>
        prev.map((b) => b.billNumber === cancelTarget.billNumber ? { ...b, status: "CANCELLED" } : b)
      );
      if (selectedBill?.billNumber === cancelTarget.billNumber) {
        setSelectedBill((prev) => prev ? { ...prev, status: "CANCELLED" } : prev);
      }
      setCancelTarget(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel bill.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBillNumber(text);
      setTimeout(() => setCopiedBillNumber(null), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Bills", value: metrics.total, icon: <Receipt className="w-4 h-4" />, color: "blue", textColor: "text-slate-900" },
          { label: "Completed", value: metrics.completed, icon: <CheckCircle2 className="w-4 h-4" />, color: "emerald", textColor: "text-emerald-600" },
          { label: "Cancelled", value: metrics.cancelled, icon: <XCircle className="w-4 h-4" />, color: "red", textColor: "text-red-600" },
          { label: "Revenue", value: formatINR(metrics.revenue), icon: <DollarSign className="w-4 h-4" />, color: "purple", textColor: "text-slate-900" },
        ].map((m) => (
          <div key={m.label} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg bg-${m.color}-50 text-${m.color}-600 flex items-center justify-center shrink-0`}>
              {m.icon}
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">{m.label}</span>
              <span className={`text-lg font-bold ${m.textColor}`}>{m.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /><span>{errorMessage}</span></div>
          <button type="button" onClick={() => loadBills()} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bill number or customer..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-100 transition-all" />
          {search && (
            <button type="button" onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative flex items-center">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as PosBillStatus | "ALL"); setCurrentPage(1); }}
            className="text-xs border border-slate-200 rounded-lg pl-2.5 pr-7 py-2 bg-white text-slate-700 font-medium outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 cursor-pointer appearance-none">
            {BILL_STATUSES.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Status" : s}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative flex items-center">
          <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value as PosPaymentMethod | "ALL"); setCurrentPage(1); }}
            className="text-xs border border-slate-200 rounded-lg pl-2.5 pr-7 py-2 bg-white text-slate-700 font-medium outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 cursor-pointer appearance-none">
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === "ALL" ? "All Methods" : m.replace("_", " ")}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        <button type="button" onClick={() => loadBills(true)} disabled={refreshing || loading}
          className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ml-auto">
          <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-3 font-semibold">Bill No.</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Items</th>
                <th className="py-3 px-3 font-semibold">Payment</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Discount</th>
                <th className="py-3 px-3 font-semibold text-right">Amount</th>
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="py-3 px-3"><div className="h-3 bg-slate-100 rounded-md w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : paginatedBills.length > 0 ? (
                paginatedBills.map((bill) => {
                  const totalDiscount = bill.totalDiscount > 0 ? bill.totalDiscount
                    : bill.items.reduce((s, i) => s + (i.mrp - i.sellingPrice) * i.quantity, 0);
                  return (
                    <tr key={bill._id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Bill Number */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-800">{bill.billNumber}</span>
                          <button type="button" onClick={() => handleCopy(bill.billNumber)}
                            className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-all cursor-pointer text-slate-400">
                            {copiedBillNumber === bill.billNumber ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800 truncate max-w-[120px]">{bill.customerName}</p>
                        <p className="text-[10px] text-slate-400">{bill.customerMobile}</p>
                      </td>

                      {/* Items */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                          <Package className="w-3 h-3 text-slate-400" />
                          {bill.items.length} item{bill.items.length !== 1 ? "s" : ""}
                        </span>
                        <p className="text-[10px] text-slate-400">{bill.items.reduce((s, i) => s + i.quantity, 0)} units</p>
                      </td>

                      {/* Payment */}
                      <td className="py-2.5 px-3">
                        <PaymentMethodBadge method={bill.paymentMethod} />
                        <div className="mt-1"><PaymentStatusBadge status={bill.paymentStatus} /></div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3"><StatusBadge status={bill.status} /></td>

                      {/* Discount column */}
                      <td className="py-2.5 px-3 text-right">
                        {totalDiscount > 0 ? (
                          <div>
                            <p className="font-bold text-emerald-600 text-xs">− {formatINR(totalDiscount)}</p>
                            {bill.couponDiscount > 0 && (
                              <p className="text-[10px] text-violet-500">+coupon {formatINR(bill.couponDiscount)}</p>
                            )}
                          </div>
                        ) : <span className="text-slate-300 text-[10px]">No discount</span>}
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-3 text-right">
                        <p className="font-bold text-slate-900 text-xs">{formatINR(bill.grandTotal)}</p>
                        {bill.subtotal !== bill.grandTotal && (
                          <p className="text-[10px] text-slate-400 line-through">{formatINR(bill.subtotal)}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">{formatDate(bill.createdAt)}</td>

                      {/* Actions */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button type="button" onClick={() => setSelectedBill(bill)} title="View bill"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-pointer hover:scale-105 active:scale-95">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => setPrintBill(bill)} title="Print receipt"
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer hover:scale-105 active:scale-95">
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {bill.status === "COMPLETED" && (
                            <button type="button" onClick={() => setCancelTarget(bill)} title="Cancel bill"
                              className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer hover:scale-105 active:scale-95">
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">No POS bills found</p>
                      <p className="text-xs text-slate-400">No bills match your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && bills.length > 0 && (
          <PaginationBar
            total={bills.length}
            page={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(ps) => { setPageSize(ps); setCurrentPage(1); }}
          />
        )}
      </div>

      {/* Detail Modal */}
      <PosBillDetailModal
        bill={selectedBill}
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        onPrint={(b) => { setSelectedBill(null); setPrintBill(b); }}
      />

      {/* Print Modal */}
      <PosPrintModal
        bill={printBill}
        isOpen={!!printBill}
        onClose={() => setPrintBill(null)}
      />

      {/* Cancel Confirmation */}
      <ConfirmationModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel POS Bill"
        message={
          <div>
            Are you sure you want to cancel bill{" "}
            <strong className="font-mono text-slate-900">#{cancelTarget?.billNumber}</strong>?
            <p className="text-xs text-slate-500 mt-1">
              Customer: {cancelTarget?.customerName}. This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Yes, Cancel Bill"
        cancelText="Keep Active"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}
