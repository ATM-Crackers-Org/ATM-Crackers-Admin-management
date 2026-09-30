"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/utils";
import type { ApiCoupon } from "@/types/coupon.types";
import { Edit, Trash2, Copy, CheckCheck, Calendar, Users, ShoppingBag, Percent, Tag, Power } from "lucide-react";
import { toast } from "react-toastify";

interface CouponCardProps {
  coupon: ApiCoupon;
  onEdit: (coupon: ApiCoupon) => void;
  onDelete: (couponId: string) => void;
  onToggleActive: (coupon: ApiCoupon) => void;
  isActionLoading?: boolean;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onEdit,
  onDelete,
  onToggleActive,
  isActionLoading = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.info(`Coupon code "${coupon.code}" copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const isActive = coupon.status === "ACTIVE";
  const isExpired = new Date(coupon.expiresAt) < new Date();
  const usagePercentage =
    coupon.usageLimit && coupon.usageLimit > 0
      ? Math.min(Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100), 100)
      : 0;

  return (
    <div className={`bg-white p-4 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${
      !isActive
        ? "border-slate-200/60 opacity-80 bg-slate-50/40"
        : isExpired
        ? "border-amber-200 bg-amber-50/20"
        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
    }`}>
      <div className="space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 font-mono font-bold text-xs bg-red-50 hover:bg-red-100/80 text-red-700 px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer group"
              title="Click to copy coupon code"
            >
              <Tag className="w-3 h-3 text-red-500" />
              <span>{coupon.code}</span>
              {copied ? (
                <CheckCheck className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-red-400 group-hover:text-red-600 opacity-60 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
            {isExpired && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                Expired
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleActive(coupon)}
              disabled={isActionLoading}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 ${
                isActive
                  ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                  : "text-slate-400 bg-slate-100 hover:bg-slate-200 border-slate-200"
              }`}
              title={isActive ? "Deactivate coupon" : "Activate coupon"}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(coupon)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Edit Coupon"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(coupon._id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
              title="Delete Coupon"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Discount Title */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <h4 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
              {coupon.discountType === "FIXED_AMOUNT" ? (
                <span>Flat {formatINR(coupon.discountValue)} OFF</span>
              ) : (
                <span className="flex items-center gap-1">
                  <span>{coupon.discountValue}% OFF</span>
                  <Percent className="w-3.5 h-3.5 text-red-500" />
                </span>
              )}
            </h4>
            {coupon.discountType === "PERCENTAGE" && coupon.maximumDiscount && (
              <span className="text-[11px] font-semibold text-slate-500">
                (Up to {formatINR(coupon.maximumDiscount)})
              </span>
            )}
          </div>
          {coupon.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {coupon.description}
            </p>
          )}
        </div>

        {/* Requirements Details */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Min Order: <strong className="text-slate-800">{formatINR(coupon.minimumOrderValue || 0)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Limit: <strong className="text-slate-800">{coupon.perCustomerLimit || 1}/customer</strong>
            </span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-slate-500 text-[10px]">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Valid: <strong>{formatDate(coupon.startAt)}</strong> – <strong>{formatDate(coupon.expiresAt)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Footer usage & status */}
      <div className="pt-3 mt-3 border-t border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            Redeemed:{" "}
            <strong className="text-slate-800">{coupon.usedCount || 0}</strong>
            {coupon.usageLimit ? ` / ${coupon.usageLimit}` : " (Unlimited)"}
          </span>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {coupon.status}
          </span>
        </div>

        {coupon.usageLimit ? (
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usagePercentage >= 90
                  ? "bg-red-500"
                  : usagePercentage >= 50
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
