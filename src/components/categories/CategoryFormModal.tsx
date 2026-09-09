"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Category } from "@/data/mock-data";

export interface CategoryFormData {
  name: string;
  nameTamil: string;
  slug: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  defaultSortOrder: number;
  onSubmit: (data: CategoryFormData) => void;
}

const DEFAULT_CATEGORY_FORM: CategoryFormData = {
  name: "",
  nameTamil: "",
  slug: "",
  icon: "🎆",
  sortOrder: 1,
  isActive: true,
};

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  category,
  defaultSortOrder,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>(DEFAULT_CATEGORY_FORM);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        nameTamil: category.nameTamil || "",
        slug: category.slug,
        icon: category.icon,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      setFormData({
        ...DEFAULT_CATEGORY_FORM,
        sortOrder: defaultSortOrder,
      });
    }
  }, [category, defaultSortOrder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Add New Category"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Category Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="e.g. Super Sonic Bombs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Tamil Name (Optional)
          </label>
          <input
            type="text"
            value={formData.nameTamil}
            onChange={(e) => setFormData({ ...formData, nameTamil: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="e.g. சூப்பர் சோனிக் பாம்ஸ்"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Emoji / Icon
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Display Order
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
          <button type="submit" className="btn btn-primary text-sm font-semibold cursor-pointer">
            Save Category
          </button>
        </div>
      </form>
    </Modal>
  );
};
