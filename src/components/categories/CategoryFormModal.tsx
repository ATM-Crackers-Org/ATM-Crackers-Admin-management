"use client";

import React, { useState } from "react";
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
import { Layers, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ApiCategory | null;
  defaultSortOrder: number;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => Promise<void>;
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
            imageUrl: values.imageUrl,
            displayOrder:
              typeof values.displayOrder === "number"
                ? values.displayOrder
                : undefined,
            status: values.status,
          };
          const cleanedPayload = cleanCategoryPayload(rawPayload);
          await onSubmit(cleanedPayload);
        } else {
          // Create mode: DO NOT send status, omit empty strings
          const rawPayload: CreateCategoryPayload = {
            name: values.name,
            slug: values.slug,
            description: values.description,
            imageUrl: values.imageUrl,
            displayOrder:
              typeof values.displayOrder === "number"
                ? values.displayOrder
                : undefined,
          };
          const cleanedPayload = cleanCategoryPayload(rawPayload);
          delete (cleanedPayload as Record<string, any>).status;
          await onSubmit(cleanedPayload);
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
    >
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
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

        {/* Image URL */}
        <div>
          <label htmlFor="imageUrl" className="block text-xs font-semibold text-slate-700 mb-1">
            Category Image URL <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/category-image.jpg"
                {...formik.getFieldProps("imageUrl")}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all ${
                  getFieldError("imageUrl") ? "border-red-400 bg-red-50/30" : "border-slate-200"
                }`}
              />
            </div>
            {formik.values.imageUrl && !getFieldError("imageUrl") && (
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                <img
                  src={formik.values.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
          {getFieldError("imageUrl") && (
            <p className="mt-1 text-[11px] text-red-500 font-medium">
              {getFieldError("imageUrl")}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1">
            Description <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            rows={2}
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

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
        </div>
      </form>
    </Modal>
  );
};
