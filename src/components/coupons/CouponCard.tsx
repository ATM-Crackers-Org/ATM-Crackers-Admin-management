"use client";

import React from "react";
import { formatINR } from "@/lib/utils";
import { Coupon } from "@/data/mock-data";
import { Edit, Trash2 } from "lucide-react";

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (couponId: string) => void;
  onToggleActive: (couponId: string) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-mono font-bold text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
            {coupon.code}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onEdit(coupon)}
              className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
              title="Edit Coupon"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(coupon.id)}
              className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
              title="Delete Coupon"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h4 className="font-bold text-sm text-slate-800">
          {coupon.discountType === "FLAT"
            ? `Flat ${formatINR(coupon.discountValue)} OFF`
            : `${coupon.discountValue}% OFF`}
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5">{coupon.description}</p>
        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
          Min Order: {formatINR(coupon.minOrderValue)} • Expires {coupon.expiryDate}
        </p>
      </div>

      <div className="pt-2.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500">
          Used: <strong className="text-slate-800">{coupon.usageCount}</strong> / {coupon.usageLimit}
        </span>
        <button
          onClick={() => onToggleActive(coupon.id)}
          className={`badge text-[10px] cursor-pointer ${
            coupon.isActive ? "badge-success" : "badge-neutral"
          }`}
        >
          {coupon.isActive ? "Active" : "Disabled"}
        </button>
      </div>
    </div>
  );
};
