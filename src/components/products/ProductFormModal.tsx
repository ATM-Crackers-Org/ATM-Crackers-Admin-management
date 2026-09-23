"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import type {
  ApiProduct,
  CreateProductPayload,
  UpdateProductPayload,
  ProductStatus,
  StockStatus,
} from "@/types/product.types";
import { formatINR } from "@/lib/utils";
import { Plus, X, Image as ImageIcon, Sparkles } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ApiProduct | null;
  categories: CategoryOption[];
  onSubmit: (payload: CreateProductPayload | UpdateProductPayload) => Promise<void>;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [mrp, setMrp] = useState<number | "">("");
  const [discountPercent, setDiscountPercent] = useState<number | "">(0);
  const [stockStatus, setStockStatus] = useState<StockStatus>("in_stock");
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [displayOrder, setDisplayOrder] = useState<number | "">(0);
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to slugify a string
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setNewImageUrl("");

    if (product) {
      setName(product.name || "");
      setSlug(product.slug || "");
      const catId =
        typeof product.category === "object" && product.category
          ? product.category._id
          : typeof product.category === "string"
          ? product.category
          : "";
      setCategoryId(catId || categories[0]?.id || "");
      setMrp(product.mrp ?? "");
      setDiscountPercent(product.discountPercent ?? 0);
      setStockStatus(product.stockStatus || "in_stock");
      setStatus(product.status || "ACTIVE");
      setDisplayOrder(product.displayOrder ?? 0);
      setDescription(product.description || "");
      setImages(Array.isArray(product.images) ? [...product.images] : []);
    } else {
      setName("");
      setSlug("");
      setCategoryId(categories[0]?.id || "");
      setMrp("");
      setDiscountPercent(0);
      setStockStatus("in_stock");
      setStatus("ACTIVE");
      setDisplayOrder(0);
      setDescription("");
      setImages([
        "https://placehold.co/600x600/F5A623/111827?text=ATM+Crackers",
      ]);
    }
  }, [product, categories, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!product) {
      setSlug(slugify(val));
    }
  };

  const handleAddImage = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    if (!images.includes(trimmed)) {
      setImages((prev) => [...prev, trimmed]);
    }
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculate live selling price preview
  const numMrp = typeof mrp === "number" ? mrp : 0;
  const numDiscount = typeof discountPercent === "number" ? discountPercent : 0;
  const computedSellingPrice = Math.max(
    0,
    Math.round(numMrp - (numMrp * numDiscount) / 100)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError("Product name must be at least 2 characters.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (mrp === "" || Number(mrp) < 0) {
      setError("Please enter a valid MRP (must be 0 or higher).");
      return;
    }

    if (discountPercent === "" || Number(discountPercent) < 0 || Number(discountPercent) > 100) {
      setError("Discount percent must be between 0 and 100.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateProductPayload = {
        categoryId,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        images: images.filter((img) => img.trim() !== ""),
        mrp: Number(mrp),
        discountPercent: Number(discountPercent),
        stockStatus,
        status,
        displayOrder: displayOrder === "" ? 0 : Number(displayOrder),
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save product. Please verify all fields.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? `Edit Cracker: ${product.name}` : "Add New Cracker Listing"}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cracker Name *
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={150}
              placeholder="e.g. 1000 VARNAM"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Slug & Display Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              placeholder="e.g. 1000-varnam"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={displayOrder}
              onChange={(e) =>
                setDisplayOrder(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Pricing & Discount */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            Pricing & Customer Discount
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                MRP (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                placeholder="e.g. 450"
                value={mrp}
                onChange={(e) =>
                  setMrp(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Discount (%) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={100}
                placeholder="0"
                value={discountPercent}
                onChange={(e) =>
                  setDiscountPercent(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Selling Price (Live)
              </label>
              <div className="px-3 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                {formatINR(computedSellingPrice)}
              </div>
            </div>
          </div>
        </div>

        {/* Stock & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stock Status
            </label>
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value as StockStatus)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="in_stock">In Stock (Available)</option>
              <option value="limited">Limited Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catalog Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="ACTIVE">ACTIVE (Visible on Store)</option>
              <option value="INACTIVE">INACTIVE (Hidden)</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Product Images
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste image URL (https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="btn btn-secondary px-3 py-2 text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-2.5">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0"
                >
                  <img
                    src={img}
                    alt={`Product image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/100x100/F5A623/111827?text=No+Image";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                    title="Remove Image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Special effects, packaging details, safety notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-secondary text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary text-sm font-semibold px-5 py-2 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{product ? "Update Cracker" : "Create Cracker"}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
