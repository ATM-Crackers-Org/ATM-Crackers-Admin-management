"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import type { ApiProduct } from "@/types/product.types";
import {
  uploadProductImages,
  deleteProductImage,
  getProductById,
} from "@/services/product.service";
import {
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

interface ProductImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ApiProduct | null;
  onProductUpdated: (updatedProduct: ApiProduct) => void;
}

export const ProductImagesModal: React.FC<ProductImagesModalProps> = ({
  isOpen,
  onClose,
  product,
  onProductUpdated,
}) => {
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && product) {
      setCurrentImages(Array.isArray(product.images) ? [...product.images] : []);
      setSelectedFiles([]);
      setErrorMessage(null);
      setDeletingKey(null);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const productId = product._id || product.id || "";

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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Filter valid image files & under 10MB
    const validFiles: File[] = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        setErrorMessage("Only image files (PNG, JPG, JPEG, WEBP) are allowed.");
        continue;
      }
      if (f.size > 10 * 1024 * 1024) {
        setErrorMessage("Each image file should be under 10MB.");
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length > 0) {
      setErrorMessage(null);
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage("Please select at least one image file to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Post multipart upload (field: 'files')
      const uploadRes = await uploadProductImages(productId, selectedFiles);

      // 2. Fetch fresh product from server to get all updated image URLs
      let updatedProd: ApiProduct;
      try {
        updatedProd = await getProductById(productId);
      } catch {
        // Fallback: merge existing with any returned URLs or local
        const returnedImages: string[] = Array.isArray(uploadRes?.data)
          ? uploadRes.data
          : Array.isArray(uploadRes?.data?.images)
          ? uploadRes.data.images
          : [];
        updatedProd = {
          ...product,
          images: returnedImages.length > 0 ? returnedImages : currentImages,
        };
      }

      // 3. Update view and clear pending files
      setCurrentImages(updatedProd.images || []);
      setSelectedFiles([]);
      onProductUpdated(updatedProd);

      toast.success(
        uploadRes?.message || `${selectedFiles.length} image(s) uploaded successfully!`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload product images. Please try again.";
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : msg);
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imgUrl: string) => {
    const key = extractImageKey(imgUrl);
    if (!key) {
      toast.error("Could not determine image key.");
      return;
    }

    if (!confirm("Are you sure you want to delete this product image?")) return;

    setDeletingKey(key);
    setErrorMessage(null);

    try {
      // 1. Fire delete API call
      await deleteProductImage(productId, key);

      // 2. Fetch fresh product data
      let updatedProd: ApiProduct;
      try {
        updatedProd = await getProductById(productId);
      } catch {
        updatedProd = {
          ...product,
          images: currentImages.filter((u) => u !== imgUrl),
        };
      }

      setCurrentImages(updatedProd.images || []);
      onProductUpdated(updatedProd);

      toast.success("Product image deleted successfully!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete product image.";
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : msg);
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isUploading && !deletingKey) {
          onClose();
        }
      }}
      title={`Product Images: ${product.name}`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500">
            {currentImages.length} image{currentImages.length === 1 ? "" : "s"} saved on server
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading || !!deletingKey}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading || !!deletingKey}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading {selectedFiles.length} file(s)...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>
                    Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""} Images
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* Existing Images Gallery */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-800">
              Current Gallery Images
            </label>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {currentImages.length} active
            </span>
          </div>

          {currentImages.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-400">
              <ImageIcon className="w-8 h-8 mx-auto mb-1 text-slate-300" />
              <p className="text-xs font-medium">No images uploaded for this cracker yet.</p>
              <p className="text-[10px] mt-0.5">Use the dropzone below to add product images.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentImages.map((imgUrl, idx) => {
                const key = extractImageKey(imgUrl);
                const isThisDeleting = deletingKey === key;

                return (
                  <div
                    key={`img-${idx}`}
                    className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-100 aspect-square flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/600x600/F5A623/111827?text=ATM+Crackers";
                      }}
                    />

                    {/* Image badge */}
                    <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs">
                      #{idx + 1}
                    </div>

                    {/* Delete Image button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(imgUrl)}
                      disabled={isUploading || !!deletingKey}
                      className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                      title="Delete Image"
                    >
                      {isThisDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload Multi-Files Dropzone */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Add More Images <span className="text-slate-400 font-normal">(Multiple files allowed)</span>
            </label>
            {selectedFiles.length > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {selectedFiles.length} file(s) selected
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFilesChange}
            className="hidden"
          />

          {/* Pending files list */}
          {selectedFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2.5">
              {selectedFiles.map((file, idx) => {
                const preview = URL.createObjectURL(file);
                return (
                  <div
                    key={`file-${idx}`}
                    className="relative group rounded-xl border-2 border-emerald-400 overflow-hidden bg-slate-50 aspect-square flex flex-col justify-between"
                  >
                    <img
                      src={preview}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                      Ready
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(idx)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-lg p-1 transition-all cursor-pointer shadow-sm active:scale-95"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs px-1.5 py-0.5 text-white text-[9px] truncate">
                      {file.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dropzone button */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50/20 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group"
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center text-slate-500 group-hover:text-red-600 transition-colors">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 group-hover:text-red-700">
                Click to browse or drop product images
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                PNG, JPG, JPEG, WEBP · Select multiple files at once
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
