"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Coupon } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus } from "lucide-react";
import { CouponCard } from "./CouponCard";
import { CouponFormModal, CouponFormData } from "./CouponFormModal";

export const CouponsView: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponActive } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coup: Coupon) => {
    setEditingCoupon(coup);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: CouponFormData) => {
    if (editingCoupon) {
      updateCoupon(editingCoupon.id, formData);
    } else {
      addCoupon(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discount Coupons"
        description="Create and manage promo vouchers for POS billing counter and online checkouts."
        actions={
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <CouponCard
            key={c.id}
            coupon={c}
            onEdit={handleOpenEdit}
            onDelete={(id) => setDeleteTargetId(id)}
            onToggleActive={toggleCouponActive}
          />
        ))}
      </div>

      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={editingCoupon}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteCoupon(deleteTargetId);
        }}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon code?"
      />
    </div>
  );
};
