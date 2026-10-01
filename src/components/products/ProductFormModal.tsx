"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import type {
  ApiProduct,
  CreateProductPayload,
  UpdateProductPayload,
  ProductStatus,
  StockStatus,
} from "@/types/product.types";
import { productValidationSchema } from "@/validations/product.validation";
import { formatINR } from "@/lib/utils";
import { Plus, X, Image as ImageIcon, Sparkles, Boxes, UploadCloud, Trash2 } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ApiProduct | null;
  categories: CategoryOption[];
  onSubmit: (
    payload: CreateProductPayload | UpdateProductPayload,
    newFiles?: File[],
    deletedImageKeys?: string[]
  ) => Promise<void>;
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
  const [stockQuantity, setStockQuantity] = useState<number | "">(100);
  const [lowStockThreshold, setLowStockThreshold] = useState<number | "">(10);
  const [stockStatus, setStockStatus] = useState<StockStatus>("in_stock");
  const [status, setStatus] = useState<ProductStatus>("ACTIVE");
  const [displayOrder, setDisplayOrder] = useState<number | "">(0);
  const [description, setDescription] = useState("");

  // Multi-image state: existing saved image URLs vs new File objects to upload
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedImageKeys, setDeletedImageKeys] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Helper to extract image key from URL (e.g. products/1790841838915-image.png)
  const extractImageKey = (imageUrl: string): string => {
    if (!imageUrl) return "";
    const match = imageUrl.match(/(products\/[^?#]+)/);
    if (match) return match[1];
    try {
      const parsed = new URL(imageUrl);
      return parsed.pathname.replace(/^\/+/, "");
    } catch {
      return imageUrl;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setNewFiles([]);
    setDeletedImageKeys([]);

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
      const currentMrp = product.mrp ?? "";
      setMrp(currentMrp);
      let disc = typeof product.discountPercent === "number" ? product.discountPercent : 0;
      if (
        disc === 0 &&
        typeof product.mrp === "number" &&
        typeof product.sellingPrice === "number" &&
        product.sellingPrice < product.mrp &&
        product.mrp > 0
      ) {
        disc = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);
      }
      setDiscountPercent(disc);
      setStockQuantity(typeof product.stockQuantity === "number" ? product.stockQuantity : 100);
      setLowStockThreshold(typeof product.lowStockThreshold === "number" ? product.lowStockThreshold : 10);
      setStockStatus(product.stockStatus || "in_stock");
      setStatus(product.status || "ACTIVE");
      setDisplayOrder(product.displayOrder ?? 0);
      setDescription(product.description || "");
      setExistingImages(Array.isArray(product.images) ? [...product.images] : []);
    } else {
      setName("");
      setSlug("");
      setCategoryId(categories[0]?.id || "");
      setMrp("");
      setDiscountPercent(0);
      setStockQuantity(100);
      setLowStockThreshold(10);
      setStockStatus("in_stock");
      setStatus("ACTIVE");
      setDisplayOrder(0);
      setDescription("");
      setExistingImages([]);
    }
  }, [product, categories, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!product) {
      setSlug(slugify(val));
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imgUrl: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== imgUrl));
    const key = extractImageKey(imgUrl);
    if (key) {
      setDeletedImageKeys((prev) => [...prev, key]);
    }
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

    // Validate using Yup schema
    try {
      await productValidationSchema.validate(
        {
          name: name.trim(),
          categoryId,
          slug: slug.trim() || undefined,
          description: description.trim(),
          mrp: mrp === "" ? undefined : Number(mrp),
          discountPercent: discountPercent === "" ? undefined : Number(discountPercent),
          stockQuantity: stockQuantity === "" ? undefined : Number(stockQuantity),
          lowStockThreshold: lowStockThreshold === "" ? undefined : Number(lowStockThreshold),
          stockStatus,
          status,
          displayOrder: displayOrder === "" ? 0 : Number(displayOrder),
        },
        { abortEarly: false }
      );
    } catch (valErr: any) {
      if (valErr.inner && valErr.inner.length > 0) {
        setError(valErr.inner[0].message);
        return;
      }
      setError(valErr.message || "Please fix validation errors.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateProductPayload = {
        categoryId,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        images: existingImages,
        mrp: Number(mrp),
        sellingPrice: computedSellingPrice,
        discountPercent: Number(discountPercent),
        stockStatus,
        stockQuantity: Number(stockQuantity),
        lowStockThreshold: Number(lowStockThreshold),
        status,
        displayOrder: displayOrder === "" ? 0 : Number(displayOrder),
      };

      await onSubmit(payload, newFiles, deletedImageKeys);
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
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="btn btn-secondary text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
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
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
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
              maxLength={120}
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
              minLength={2}
              maxLength={100}
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
              max={9999}
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
                max={1000000}
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
              <div className="px-3 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <span>{formatINR(computedSellingPrice)}</span>
                {numDiscount > 0 && numMrp > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded">
                    Save {formatINR(Math.max(0, numMrp - computedSellingPrice))} ({numDiscount}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory & Stock Levels */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
            <Boxes className="w-3.5 h-3.5 text-red-500" />
            Inventory & Stock Settings
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min={0}
                max={1000000}
                step={1}
                placeholder="100"
                value={stockQuantity}
                onChange={(e) =>
                  setStockQuantity(
                    e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10) || 0)
                  )
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Total units available</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Low Stock Threshold *
              </label>
              <input
                type="number"
                required
                min={0}
                max={100000}
                step={1}
                placeholder="10"
                value={lowStockThreshold}
                onChange={(e) =>
                  setLowStockThreshold(
                    e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value, 10) || 0)
                  )
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Alert when stock &le; value</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Stock Status *
              </label>
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="in_stock">In Stock (Available)</option>
                <option value="limited">Limited Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Storefront availability</span>
            </div>
          </div>
        </div>

        {/* Catalog Status */}
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

        {/* Images (Multiple Multipart File Upload) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Product Images <span className="text-slate-400 font-normal">(Multiple files · PNG, JPG, WEBP)</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {existingImages.length + newFiles.length} image{existingImages.length + newFiles.length === 1 ? "" : "s"}
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFilesSelected}
            className="hidden"
          />

          {/* Grid of Images: Existing Saved + New Files */}
          <div className="space-y-2">
            {(existingImages.length > 0 || newFiles.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-square flex flex-col justify-between"
                  >
                    <img
                      src={img}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/100x100/F5A623/111827?text=No+Image";
                      }}
                    />
                    <div className="absolute top-1 left-1 bg-slate-900/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                      Saved
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-lg p-1 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* New Pending Files to Upload */}
                {newFiles.map((file, idx) => {
                  const previewUrl = URL.createObjectURL(file);
                  return (
                    <div
                      key={`new-${idx}`}
                      className="relative group rounded-xl border-2 border-emerald-400 overflow-hidden bg-slate-50 aspect-square flex flex-col justify-between"
                    >
                      <img
                        src={previewUrl}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        New (Upload)
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(idx)}
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-lg p-1 transition-all cursor-pointer shadow-sm active:scale-95"
                        title="Remove new file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs px-1.5 py-1 text-white text-[9px] truncate">
                        {file.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload Button Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-red-400 hover:bg-red-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <UploadCloud className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Click to browse or drop product images
              </p>
              <p className="text-[10px] text-slate-400">
                Supports multiple files at once · PNG, JPG, JPEG, WEBP
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Description
            </label>
            <span className="text-[10px] text-slate-400">
              {description.length} / 1000
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={1000}
            placeholder="Special effects, packaging details, safety notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white resize-none"
          />
        </div>

      </form>
    </Modal>
  );
};
