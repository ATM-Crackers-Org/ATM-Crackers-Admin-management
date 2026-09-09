"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Product, Category } from "@/data/mock-data";

export interface ProductFormData {
  name: string;
  nameTamil: string;
  sku: string;
  price: number;
  originalPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryId: string;
  unit: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSubmit: (formData: ProductFormData) => void;
}

const DEFAULT_FORM: ProductFormData = {
  name: "",
  nameTamil: "",
  sku: "",
  price: 150,
  originalPrice: 500,
  stockQuantity: 100,
  lowStockThreshold: 20,
  categoryId: "",
  unit: "1 Box",
  description: "Authentic Sivakasi festive cracker with vibrant sound and effects.",
  imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=60",
  isActive: true,
  isFeatured: false,
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        nameTamil: product.nameTamil || "",
        sku: product.sku,
        price: product.price,
        originalPrice: product.originalPrice,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        categoryId: product.categoryId,
        unit: product.unit,
        description: product.description,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      });
    } else {
      setFormData({
        ...DEFAULT_FORM,
        sku: "CRK-" + Math.floor(100 + Math.random() * 900),
        categoryId: categories[0]?.id || "",
      });
    }
  }, [product, categories, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Edit Cracker Listing" : "Add New Cracker"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Product Name (English) *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              placeholder='e.g. 4" GOLD LAXMI'
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
              placeholder='e.g. 4" கோல்ட் லட்சுமி'
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              SKU Code *
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-mono"
              placeholder="LAX-001"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Category *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Offer / Selling Price (₹) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Original MRP (₹)
            </label>
            <input
              type="number"
              min={0}
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData({ ...formData, originalPrice: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              min={0}
              value={formData.stockQuantity}
              onChange={(e) =>
                setFormData({ ...formData, stockQuantity: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              min={1}
              value={formData.lowStockThreshold}
              onChange={(e) =>
                setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })
              }
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Unit Description
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="1 Pkt, 1 Box (10 pcs), 1 Master Hamper"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Image URL (Direct link or unsplash demo)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            {product ? "Save Changes" : "Create Cracker"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
