"use client";

import React from "react";
import { Product, Order } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Package,
  CheckCircle2,
  Banknote,
  QrCode,
  CreditCard,
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
    <div className="w-full lg:w-96 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Cart Header */}
      <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          {onBackToCatalog && (
            <button
              type="button"
              onClick={onBackToCatalog}
              className="lg:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Back to products"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h3 className="font-bold text-sm text-slate-800">Active Bill Items</h3>
            <span className="text-xs text-slate-400">
              {cart.length} crackers ({totalCartUnits} units)
            </span>
          </div>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClearCart}
            className="text-xs text-red-600 font-semibold hover:underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customer Info Inputs */}
      <div className="p-3 bg-slate-50/30 border-b border-slate-100 grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-red-500 outline-none"
        />
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/40 flex items-center justify-between gap-2"
          >
            <div className="min-w-0 flex-1">
              <h5 className="font-semibold text-xs text-slate-800 truncate">
                {product.name}
              </h5>
              <span className="text-[11px] text-slate-500">
                {formatINR(product.price)} × {quantity} ={" "}
                <strong className="text-slate-800 font-bold">
                  {formatINR(product.price * quantity)}
                </strong>
              </span>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, -1)}
                className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-slate-800 w-5 text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, 1)}
                className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveItem(product.id)}
                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {cart.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <span>Cart is empty. Click any cracker from the catalog to start billing.</span>
          </div>
        )}
      </div>

      {/* Coupon Application */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <form onSubmit={onApplyCoupon} className="flex gap-2">
          <input
            type="text"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none uppercase font-mono"
          />
          <button type="submit" className="btn btn-secondary text-xs px-3 py-1.5">
            Apply
          </button>
        </form>
        {appliedCoupon && (
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center justify-between">
            <span>
              Applied {appliedCoupon.code}: -{formatINR(couponDiscount)}
            </span>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-red-500 hover:underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Payment & Checkout Footer */}
      <div className="p-4 border-t border-slate-200 bg-white space-y-3">
        {/* Payment Method Selector */}
        <div className="grid grid-cols-3 gap-1.5">
          {(["CASH", "UPI", "CARD"] as Order["paymentMethod"][]).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => onPaymentMethodChange(method)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                paymentMethod === method
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {method === "CASH" && <Banknote className="w-3.5 h-3.5" />}
              {method === "UPI" && <QrCode className="w-3.5 h-3.5" />}
              {method === "CARD" && <CreditCard className="w-3.5 h-3.5" />}
              <span>{method}</span>
            </button>
          ))}
        </div>

        {/* Subtotal & Total Summary */}
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-800">{formatINR(subtotal)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount:</span>
              <span>- {formatINR(couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
            <span>Grand Total:</span>
            <span className="text-red-600">{formatINR(grandTotal)}</span>
          </div>
        </div>

        {/* Submit Checkout */}
        <button
          type="button"
          onClick={onCheckout}
          disabled={cart.length === 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm shadow-lg shadow-red-900/20 hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Complete Sale & Print Bill</span>
        </button>
      </div>
    </div>
  );
}
