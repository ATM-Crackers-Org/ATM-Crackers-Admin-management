"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Offer } from "@/data/mock-data";

export interface OfferFormData {
  title: string;
  subtitle: string;
  badge: string;
  discountPercent: number;
  bannerUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  onSubmit: (data: OfferFormData) => void;
}

const DEFAULT_OFFER_FORM: OfferFormData = {
  title: "",
  subtitle: "",
  badge: "Diwali Dhamaka",
  discountPercent: 80,
  bannerUrl:
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1000&auto=format&fit=crop&q=80",
  linkUrl: "/products",
  startDate: "2026-06-01",
  endDate: "2026-11-15",
  isActive: true,
};

export const OfferFormModal: React.FC<OfferFormModalProps> = ({
  isOpen,
  onClose,
  offer,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<OfferFormData>(DEFAULT_OFFER_FORM);

  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title,
        subtitle: offer.subtitle,
        badge: offer.badge,
        discountPercent: offer.discountPercent,
        bannerUrl: offer.bannerUrl,
        linkUrl: offer.linkUrl,
        startDate: offer.startDate,
        endDate: offer.endDate,
        isActive: offer.isActive,
      });
    } else {
      setFormData(DEFAULT_OFFER_FORM);
    }
  }, [offer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={offer ? "Edit Offer" : "Add Festive Offer"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Offer Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="e.g. Diwali Mega Advance Dhamaka"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Subtitle / Punchline
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Direct wholesale price savings"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Badge Tag
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Discount %
            </label>
            <input
              type="number"
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({ ...formData, discountPercent: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Banner Image URL
          </label>
          <input
            type="url"
            value={formData.bannerUrl}
            onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          />
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
            Save Offer
          </button>
        </div>
      </form>
    </Modal>
  );
};
