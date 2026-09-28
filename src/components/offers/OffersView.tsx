"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Offer } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus } from "lucide-react";
import { OfferCard } from "./OfferCard";
import { OfferFormModal, OfferFormData } from "./OfferFormModal";

export const OffersView: React.FC = () => {
  const { offers, addOffer, updateOffer, deleteOffer, toggleOfferActive } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: OfferFormData) => {
    if (editingOffer) {
      updateOffer(editingOffer.id, formData);
    } else {
      addOffer(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Promotions & Offers"
        description="Publish festival season discount deals, combo packages, and promotional banners."
        actions={
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Festive Offer</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {offers.map((off) => (
          <OfferCard
            key={off.id}
            offer={off}
            onEdit={handleOpenEdit}
            onDelete={(id) => setDeleteTargetId(id)}
            onToggleActive={toggleOfferActive}
          />
        ))}
      </div>

      <OfferFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        offer={editingOffer}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteOffer(deleteTargetId);
        }}
        title="Delete Offer"
        message="Are you sure you want to delete this promotional offer?"
      />
    </div>
  );
};
