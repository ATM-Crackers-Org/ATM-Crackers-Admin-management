"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Banner } from "@/data/mock-data";

export interface BannerFormData {
  title: string;
  tagline: string;
  buttonText: string;
  linkUrl: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: Banner | null;
  defaultSortOrder: number;
  onSubmit: (data: BannerFormData) => void;
}

const DEFAULT_BANNER_FORM: BannerFormData = {
  title: "",
  tagline: "",
  buttonText: "Explore Crackers",
  linkUrl: "/products",
  imageUrl:
    "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=1200&auto=format&fit=crop&q=80",
  sortOrder: 1,
  isActive: true,
};

export const BannerFormModal: React.FC<BannerFormModalProps> = ({
  isOpen,
  onClose,
  banner,
  defaultSortOrder,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<BannerFormData>(DEFAULT_BANNER_FORM);

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title,
        tagline: banner.tagline,
        buttonText: banner.buttonText,
        linkUrl: banner.linkUrl,
        imageUrl: banner.imageUrl,
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
      });
    } else {
      setFormData({
        ...DEFAULT_BANNER_FORM,
        sortOrder: defaultSortOrder,
      });
    }
  }, [banner, defaultSortOrder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={banner ? "Edit Banner" : "Create Banner Slide"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Banner Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Tagline
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Image URL
          </label>
          <input
            type="url"
            required
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Button Text
            </label>
            <input
              type="text"
              value={formData.buttonText}
              onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: Number(e.target.value) })
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
            Save Banner
          </button>
        </div>
      </form>
    </Modal>
  );
};
