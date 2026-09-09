"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Banner } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus } from "lucide-react";
import { BannerCard } from "./BannerCard";
import { BannerFormModal, BannerFormData } from "./BannerFormModal";

export const BannersView: React.FC = () => {
  const { banners, addBanner, updateBanner, deleteBanner, toggleBannerActive } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ban: Banner) => {
    setEditingBanner(ban);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: BannerFormData) => {
    if (editingBanner) {
      updateBanner(editingBanner.id, formData);
    } else {
      addBanner(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home & Promo Banners"
        description="Control the hero carousel and banner slides visible on the customer portal."
        actions={
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b) => (
          <BannerCard
            key={b.id}
            banner={b}
            onEdit={handleOpenEdit}
            onDelete={(id) => setDeleteTargetId(id)}
            onToggleActive={toggleBannerActive}
          />
        ))}
      </div>

      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={editingBanner}
        defaultSortOrder={banners.length + 1}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteBanner(deleteTargetId);
        }}
        title="Delete Banner"
        message="Are you sure you want to delete this homepage slide?"
      />
    </div>
  );
};
