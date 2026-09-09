"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Coupon } from "@/data/mock-data";

export interface CouponFormData {
  code: string;
  description: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  usageLimit: number;
  isActive: boolean;
}

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onSubmit: (data: CouponFormData) => void;
}

const DEFAULT_COUPON_FORM: CouponFormData = {
  code: "",
  description: "Festive discount voucher",
  discountType: "FLAT",
  discountValue: 300,
  minOrderValue: 3000,
  expiryDate: "2026-11-30",
  usageLimit: 500,
  isActive: true,
};

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  coupon,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CouponFormData>(DEFAULT_COUPON_FORM);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        expiryDate: coupon.expiryDate,
        usageLimit: coupon.usageLimit,
        isActive: coupon.isActive,
      });
    } else {
      setFormData({
        ...DEFAULT_COUPON_FORM,
        code: "FESTIVE" + Math.floor(10 + Math.random() * 90),
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coupon ? "Edit Coupon" : "Create Promo Coupon"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Coupon Code *
          </label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none uppercase font-mono font-bold"
            placeholder="DIWALI500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Description
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Discount Type
            </label>
            <select
              value={formData.discountType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountType: e.target.value as "FLAT" | "PERCENTAGE",
                })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="FLAT">Flat Amount (₹)</option>
              <option value="PERCENTAGE">Percentage (%)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Discount Value *
            </label>
            <input
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Min Order Amount (₹)
            </label>
            <input
              type="number"
              value={formData.minOrderValue}
              onChange={(e) =>
                setFormData({ ...formData, minOrderValue: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) =>
                setFormData({ ...formData, expiryDate: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary text-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary text-sm font-semibold cursor-pointer"
          >
            Save Coupon
          </button>
        </div>
      </form>
    </Modal>
  );
};
