"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import { Modal } from "@/components/ui/Modal";
import { categoryValidationSchema } from "@/validations/category.validation";
import type {
  ApiCategory,
  CategoryFormValues,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";
import { cleanCategoryPayload } from "@/services/category.service";
import { Layers, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, UploadCloud, Trash2 } from "lucide-react";

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ApiCategory | null;
  defaultSortOrder: number;
  onSubmit: (
    payload: CreateCategoryPayload | UpdateCategoryPayload,
    imageFile?: File | null,
    removeExistingImage?: boolean
  ) => Promise<void>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  category,
  defaultSortOrder,
  onSubmit,
}) => {
  const isEditMode = !!category;
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setRemoveExistingImage(false);
      setFilePreview(category?.imageUrl || "");
    }
  }, [isOpen, category]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setRemoveExistingImage(false);
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setFilePreview("");
    setRemoveExistingImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const initialValues: CategoryFormValues = {
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    imageUrl: category?.imageUrl || "",
    displayOrder: category?.displayOrder ?? defaultSortOrder ?? 0,
    status: category?.status || "ACTIVE",
  };

  const formik = useFormik<CategoryFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: categoryValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      try {
        if (isEditMode) {
          // Edit mode: Include status, omit empty strings
          const rawPayload: UpdateCategoryPayload = {
            name: values.name,
            slug: values.slug,
            description: values.description,
            displayOrder:
              typeof values.displayOrder === "number"
                ? values.displayOrder
                : undefined,
            status: values.status,
          };
          const cleanedPayload = cleanCategoryPayload(rawPayload);
          await onSubmit(cleanedPayload, selectedFile, removeExistingImage);
        } else {
          // Create mode: DO NOT send status, omit empty strings
          const rawPayload: CreateCategoryPayload = {
            name: values.name,
            slug: values.slug,
            description: values.description,
            displayOrder:
              typeof values.displayOrder === "number"
                ? values.displayOrder
                : undefined,
          };
          const cleanedPayload = cleanCategoryPayload(rawPayload);
          delete (cleanedPayload as Record<string, any>).status;
          await onSubmit(cleanedPayload, selectedFile, removeExistingImage);
        }
        onClose();
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to save category. Please check your inputs.";
        setServerError(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getFieldError = (field: keyof CategoryFormValues) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!formik.isSubmitting) {
          formik.resetForm();
          setServerError(null);
          onClose();
        }
      }}
      title={isEditMode ? "Edit Category" : "Add New Category"}
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            disabled={formik.isSubmitting}
            onClick={() => {
              formik.resetForm();
              setServerError(null);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={formik.isSubmitting || !formik.isValid}
            className="btn btn-primary text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-red-600/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditMode ? "Update Category" : "Create Category"}</span>
            )}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        {/* Server error alert */}
        {serverError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Submission Failed</p>
              <p className="text-red-700 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        {/* Category Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
            Category Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              minLength={2}
              maxLength={100}
              placeholder="e.g. ONE SOUND CRACKERS"
              {...formik.getFieldProps("name")}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                getFieldError("name") ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
          </div>
          {getFieldError("name") && (
            <p className="mt-1 text-[11px] text-red-500 font-medium">
              {getFieldError("name")}
            </p>
          )}
        </div>

        {/* Slug & Display Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="slug" className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Slug <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="slug"
              type="text"
              minLength={2}
              maxLength={100}
              placeholder="e.g. one-sound-crackers"
              {...formik.getFieldProps("slug")}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-mono text-xs ${
                getFieldError("slug") ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
            {getFieldError("slug") ? (
              <p className="mt-1 text-[11px] text-red-500 font-medium">
                {getFieldError("slug")}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Leave empty to auto-generate from name.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="displayOrder" className="block text-xs font-semibold text-slate-700 mb-1">
              Display Order
            </label>
            <input
              id="displayOrder"
              type="number"
              min={0}
              max={9999}
              placeholder="0"
              {...formik.getFieldProps("displayOrder")}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                getFieldError("displayOrder") ? "border-red-400 bg-red-50/30" : "border-slate-200"
              }`}
            />
            {getFieldError("displayOrder") && (
              <p className="mt-1 text-[11px] text-red-500 font-medium">
                {getFieldError("displayOrder")}
              </p>
            )}
          </div>
        </div>

        {/* Category Image Upload (Single Image, Multipart) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category Image <span className="text-slate-400 font-normal">(Single file · PNG, JPG, WEBP)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />

          {filePreview ? (
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
                <img
                  src={filePreview}
                  alt="Category Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {selectedFile ? selectedFile.name : "Current Image"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB (Ready to upload)`
                    : "Saved on server"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Change Image
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-[11px] font-semibold text-slate-500 hover:text-red-600 cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-red-400 hover:bg-red-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5"
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <UploadCloud className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Click to upload category image
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG, WEBP (Single image upload)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-[10px] text-slate-400">
              {(formik.values.description || "").length} / 500
            </span>
          </div>
          <textarea
            id="description"
            rows={2}
            maxLength={500}
            placeholder="Brief description about the crackers in this category..."
            {...formik.getFieldProps("description")}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Status: ONLY SHOWN IN EDIT MODE as requested */}
        {isEditMode && (
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Category Status <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => formik.setFieldValue("status", "ACTIVE")}
                className={`flex-1 py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formik.values.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    formik.values.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />
                <span>Active (Visible)</span>
              </button>
              <button
                type="button"
                onClick={() => formik.setFieldValue("status", "INACTIVE")}
                className={`flex-1 py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  formik.values.status === "INACTIVE"
                    ? "bg-amber-50 text-amber-700 border-amber-300 shadow-xs"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    formik.values.status === "INACTIVE" ? "bg-amber-500" : "bg-slate-300"
                  }`}
                />
                <span>Inactive (Hidden)</span>
              </button>
            </div>
            {getFieldError("status") && (
              <p className="mt-1 text-[11px] text-red-500 font-medium">
                {getFieldError("status")}
              </p>
            )}
          </div>
        )}

      </form>
    </Modal>
  );
};
