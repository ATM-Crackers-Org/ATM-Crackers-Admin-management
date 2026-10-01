"use client";

import React, { useState, useRef, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import type { ApiCategory } from "@/types/category.types";
import {
  uploadCategoryImage,
  deleteCategoryImage,
  getCategoryById,
} from "@/services/category.service";
import {
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";

interface CategoryImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ApiCategory | null;
  onCategoryUpdated: (updatedCategory: ApiCategory) => void;
}

export const CategoryImageModal: React.FC<CategoryImageModalProps> = ({
  isOpen,
  onClose,
  category,
  onCategoryUpdated,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && category) {
      setCurrentImageUrl(category.imageUrl || "");
      setSelectedFile(null);
      setPreviewUrl("");
      setErrorMessage(null);
    }
  }, [isOpen, category]);

  if (!category) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
        return;
      }
      // Validate max size 10MB
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Image file size should be less than 10MB.");
        return;
      }

      setErrorMessage(null);
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select an image file to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Fire upload API call (POST /admin/categories/{id}/image)
      const uploadRes = await uploadCategoryImage(category._id, selectedFile);

      // 2. Fetch fresh updated category to get exact server image URL
      let updatedCat: ApiCategory;
      try {
        updatedCat = await getCategoryById(category._id);
      } catch {
        // Fallback to response payload if getCategoryById fails
        const returnedUrl =
          uploadRes?.data?.imageUrl ||
          uploadRes?.data?.data?.imageUrl ||
          uploadRes?.data?.url ||
          previewUrl;
        updatedCat = { ...category, imageUrl: returnedUrl };
      }

      // 3. Update view and local state
      setCurrentImageUrl(updatedCat.imageUrl || "");
      setSelectedFile(null);
      setPreviewUrl("");
      onCategoryUpdated(updatedCat);

      toast.success(uploadRes?.message || "Category image uploaded successfully!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to upload category image. Please try again.";
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : msg);
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentImageUrl) return;

    if (!confirm("Are you sure you want to delete this category image?")) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteCategoryImage(category._id);

      let updatedCat: ApiCategory;
      try {
        updatedCat = await getCategoryById(category._id);
      } catch {
        updatedCat = { ...category, imageUrl: "" };
      }

      setCurrentImageUrl("");
      setSelectedFile(null);
      setPreviewUrl("");
      onCategoryUpdated(updatedCat);

      toast.success("Category image removed successfully!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete category image.";
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : msg);
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isUploading && !isDeleting) {
          onClose();
        }
      }}
      title={`Category Image: ${category.name}`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {currentImageUrl && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Image</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading || isDeleting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || isDeleting}
              className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
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

        {/* Current Image Display */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Current Category Image
          </label>
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              {currentImageUrl ? (
                <img
                  src={currentImageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 gap-1">
                  <Layers className="w-6 h-6" />
                  <span className="text-[10px] text-slate-400">No Image</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs text-slate-900 truncate">
                {category.name}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                /{category.slug}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    currentImageUrl
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {currentImageUrl ? "Image Active" : "No Image Uploaded"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload New Image Dropzone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Upload New Image <span className="text-slate-400 font-normal">(Single file)</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl && selectedFile ? (
            <div className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-emerald-300 bg-white shrink-0">
                <img
                  src={previewUrl}
                  alt="New Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-emerald-800 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB · Ready to upload
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1.5 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  Choose Different File
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50/20 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-red-50 flex items-center justify-center text-slate-500 group-hover:text-red-600 transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-red-700">
                  Click to browse or drop category image here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, JPEG, WEBP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
