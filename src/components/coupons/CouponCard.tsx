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
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono font-bold text-sm bg-red-50 text-red-700 px-3 py-1 rounded-lg border border-red-200">
            {coupon.code}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(coupon)}
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg cursor-pointer"
              title="Edit Coupon"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(coupon.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
              title="Delete Coupon"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h4 className="font-bold text-base text-slate-800">
          {coupon.discountType === "FLAT"
            ? `Flat ${formatINR(coupon.discountValue)} OFF`
            : `${coupon.discountValue}% OFF`}
        </h4>
        <p className="text-xs text-slate-500 mt-1">{coupon.description}</p>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Min Order: {formatINR(coupon.minOrderValue)} • Expires {coupon.expiryDate}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Used: <strong className="text-slate-800">{coupon.usageCount}</strong> / {coupon.usageLimit}
        </span>
        <button
          onClick={() => onToggleActive(coupon.id)}
          className={`badge cursor-pointer ${
            coupon.isActive ? "badge-success" : "badge-neutral"
          }`}
        >
          {coupon.isActive ? "Active" : "Disabled"}
        </button>
      </div>
    </div>
  );
};
