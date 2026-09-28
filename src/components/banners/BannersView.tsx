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
    <div className="space-y-4">
      <PageHeader
        title="Home & Promo Banners"
        description="Control the hero carousel and banner slides visible on the customer portal."
        actions={
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Banner</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
