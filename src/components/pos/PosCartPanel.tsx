"use client";

import React from "react";
import { Product, Order } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  Banknote,
  QrCode,
  CreditCard,
  Tag,
  X,
} from "lucide-react";

export interface BillCartItem {
  product: Product;
  quantity: number;
}

interface POSCartPanelProps {
  cart: BillCartItem[];
  totalCartUnits: number;
  subtotal: number;
  couponDiscount: number;
  grandTotal: number;
  customerName: string;
  onCustomerNameChange: (val: string) => void;
  customerPhone: string;
  onCustomerPhoneChange: (val: string) => void;
  couponCode: string;
  onCouponCodeChange: (val: string) => void;
  appliedCoupon: any | null;
  onApplyCoupon: (e: React.FormEvent) => void;
  onRemoveCoupon: () => void;
  paymentMethod: Order["paymentMethod"];
  onPaymentMethodChange: (method: Order["paymentMethod"]) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  onBackToCatalog?: () => void;
}

const PAYMENT_METHODS = [
  { method: "CASH" as const, icon: Banknote, label: "Cash" },
  { method: "UPI" as const, icon: QrCode, label: "UPI" },
  { method: "CARD" as const, icon: CreditCard, label: "Card" },
];

export function POSCartPanel({
  cart,
  totalCartUnits,
  subtotal,
  couponDiscount,
  grandTotal,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  couponCode,
  onCouponCodeChange,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  paymentMethod,
  onPaymentMethodChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  onBackToCatalog,
}: POSCartPanelProps) {
  return (
    <div className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden h-full">
      {/* ── Header ─────────────────────────────── */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {onBackToCatalog && (
            <button
              type="button"
              onClick={onBackToCatalog}
              className="lg:hidden p-1 -ml-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <ShoppingCart className="w-4 h-4 text-slate-700" />
          <div>
            <h3 className="font-semibold text-sm text-slate-900 leading-tight">
              Current Bill
            </h3>
            <p className="text-[10px] text-slate-400">
              {cart.length > 0 ? `${cart.length} items · ${totalCartUnits} units` : "Empty"}
            </p>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-[11px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* ── Customer Info ───────────────────────── */}
      <div className="px-3 py-2.5 border-b border-slate-100 grid grid-cols-2 gap-2 shrink-0 bg-slate-50/40">
        <input
          type="text"
          placeholder="Customer name"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none placeholder:text-slate-400"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* ── Cart Items ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Cart is empty</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Click any product to add it
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2.5 space-y-1.5">
            {cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:border-slate-200 bg-white transition-colors"
              >
                {/* Name & Price */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800 truncate leading-tight">
                    {product.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatINR(product.price)} ×{" "}
                    <span className="font-bold text-slate-600">{quantity}</span>
                    {" = "}
                    <span className="font-bold text-slate-800">
                      {formatINR(product.price * quantity)}
                    </span>
                  </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(product.id, -1)}
                    className="w-5 h-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-800 w-5 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(product.id, 1)}
                    className="w-5 h-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(product.id)}
                    className="w-5 h-5 rounded text-slate-300 hover:text-red-500 flex items-center justify-center cursor-pointer transition-colors ml-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer Section ──────────────────────── */}
      <div className="shrink-0 border-t border-slate-100 bg-slate-50/30">
        {/* Coupon */}
        <div className="px-3 py-2 border-b border-slate-100">
          {appliedCoupon ? (
            <div className="flex items-center justify-between text-[11px] bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Tag className="w-3 h-3" />
                {appliedCoupon.code}: -{formatINR(couponDiscount)}
              </div>
              <button
                type="button"
                onClick={onRemoveCoupon}
                className="text-emerald-600 hover:text-red-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <form onSubmit={onApplyCoupon} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
                className="flex-1 px-2.5 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg outline-none uppercase font-mono focus:ring-1 focus:ring-red-500 placeholder:normal-case placeholder:font-sans"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Apply
              </button>
            </form>
          )}
        </div>

        {/* Payment Method */}
        <div className="px-3 py-2 border-b border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium mb-1.5 uppercase tracking-wider">Payment</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PAYMENT_METHODS.map(({ method, icon: Icon, label }) => (
              <button
                key={method}
                type="button"
                onClick={() => onPaymentMethodChange(method)}
                className={`py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMethod === method
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="px-3 py-2.5 space-y-1 border-b border-slate-100">
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Subtotal</span>
            <span className="font-medium text-slate-700">{formatINR(subtotal)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-[11px] text-emerald-600 font-medium">
              <span>Discount</span>
              <span>− {formatINR(couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200 mt-1">
            <span>Total</span>
            <span className="text-red-600">{formatINR(grandTotal)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <div className="px-3 py-3">
          <button
            type="button"
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Sale & Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}
