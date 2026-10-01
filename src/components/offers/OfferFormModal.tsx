"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { Modal } from "@/components/ui/Modal";
import type {
  ApiOffer,
  CreateOfferPayload,
  OfferFormValues,
  UpdateOfferPayload,
} from "@/types/offer.types";
import {
  offerValidationSchema,
  offerInitialValues,
} from "@/validations/offer.validation";
import { getCategories } from "@/services/category.service";
import { getProducts } from "@/services/product.service";
import type { ApiCategory } from "@/types/category.types";
import type { ApiProduct } from "@/types/product.types";
import {
  AlertCircle,
  Calendar,
  Check,
  Edit,
  Globe,
  Layers,
  Loader2,
  Package,
  Percent,
  Sparkles,
} from "lucide-react";

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: ApiOffer | null;
  onSubmit: (data: CreateOfferPayload | UpdateOfferPayload) => Promise<void>;
  isSubmitting?: boolean;
}

// Convert ISO string to HTML datetime-local format (YYYY-MM-DDTHH:mm)
function toDatetimeLocal(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  } catch {
    return "";
  }
}

export const OfferFormModal: React.FC<OfferFormModalProps> = ({
  isOpen,
  onClose,
  offer,
  onSubmit,
  isSubmitting = false,
}) => {
  const isEditing = !!offer;

  // Related data for scope targeting
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search filters for category and product pickers
  const [categorySearch, setCategorySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Load categories and products when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchData() {
      setLoadingData(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories().catch(() => []),
          getProducts().catch(() => []),
        ]);
        if (isMounted) {
          setCategories(Array.isArray(cats) ? cats : []);
          setProducts(Array.isArray(prods) ? prods : []);
        }
      } catch {
        // Fallback silently if either fails to load
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const formik = useFormik<OfferFormValues>({
    initialValues: offerInitialValues,
    validationSchema: offerValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      const payload: CreateOfferPayload = {
        name: values.name.trim().toUpperCase(),
        description: values.description?.trim() || "",
        discountPercent: Number(values.discountPercent),
        scope: values.scope,
        startAt: new Date(values.startAt).toISOString(),
        expiresAt: new Date(values.expiresAt).toISOString(),
        status: values.status,
      };

      if (values.scope === "CATEGORY") {
        payload.categoryIds = values.categoryIds;
        payload.productIds = [];
      } else if (values.scope === "PRODUCT") {
        payload.productIds = values.productIds;
        payload.categoryIds = [];
      } else {
        payload.categoryIds = [];
        payload.productIds = [];
      }

      await onSubmit(payload);
    },
  });

  // Reset or populate form when opened or offer changes
  useEffect(() => {
    if (!isOpen) return;

    if (offer) {
      formik.resetForm({
        values: {
          name: offer.name || "",
          description: offer.description || "",
          discountPercent: offer.discountPercent ?? 50,
          scope: offer.scope || "GLOBAL",
          categoryIds: offer.categoryIds || [],
          productIds: offer.productIds || [],
          startAt: toDatetimeLocal(offer.startAt),
          expiresAt: toDatetimeLocal(offer.expiresAt),
          status: offer.status || "ACTIVE",
        },
      });
    } else {
      const now = new Date();
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      formik.resetForm({
        values: {
          ...offerInitialValues,
          name: "DIWALI " + new Date().getFullYear(),
          startAt: toDatetimeLocal(now.toISOString()),
          expiresAt: toDatetimeLocal(in30Days.toISOString()),
        },
      });
    }
    setCategorySearch("");
    setProductSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, offer]);

  const getFieldError = (name: keyof OfferFormValues) =>
    formik.touched[name] && formik.errors[name] ? (formik.errors[name] as string) : undefined;

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    const q = categorySearch.toLowerCase().trim();
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, categorySearch]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase().trim();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, productSearch]);

  // Quick preset dates
  const setQuickDuration = (days: number) => {
    const now = new Date();
    const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    formik.setFieldValue("startAt", toDatetimeLocal(now.toISOString()));
    formik.setFieldValue("expiresAt", toDatetimeLocal(future.toISOString()));
  };

  const setYearEnd = () => {
    const now = new Date();
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    formik.setFieldValue("startAt", toDatetimeLocal(now.toISOString()));
    formik.setFieldValue("expiresAt", toDatetimeLocal(yearEnd.toISOString()));
  };

  // Toggle category ID
  const toggleCategoryId = (id: string) => {
    const current = formik.values.categoryIds;
    if (current.includes(id)) {
      formik.setFieldValue(
        "categoryIds",
        current.filter((cId) => cId !== id)
      );
    } else {
      formik.setFieldValue("categoryIds", [...current, id]);
    }
  };

  // Toggle product ID
  const toggleProductId = (id: string) => {
    const current = formik.values.productIds;
    if (current.includes(id)) {
      formik.setFieldValue(
        "productIds",
        current.filter((pId) => pId !== id)
      );
    } else {
      formik.setFieldValue("productIds", [...current, id]);
    }
  };

  const selectAllCategories = () => {
    formik.setFieldValue(
      "categoryIds",
      categories.map((c) => c._id)
    );
  };

  const clearAllCategories = () => {
    formik.setFieldValue("categoryIds", []);
  };

  const selectAllProducts = () => {
    formik.setFieldValue(
      "productIds",
      products.map((p) => p._id)
    );
  };

  const clearAllProducts = () => {
    formik.setFieldValue("productIds", []);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Seasonal Offer" : "Create Seasonal Offer"}
      maxWidth="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="offer-form"
            disabled={isSubmitting || !formik.isValid}
            className="btn btn-primary text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEditing ? "Saving Changes..." : "Creating Offer..."}</span>
              </>
            ) : isEditing ? (
              <>
                <Edit className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Create Seasonal Offer</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form id="offer-form" onSubmit={formik.handleSubmit} className="space-y-5 pt-1">
        {/* Banner Preview Highlight */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 p-4 text-white shadow-lg shadow-red-500/10">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  {isEditing ? "Editing Offer" : "Live Preview"}
                </span>
                <span className="text-[11px] font-semibold text-white/90">
                  {formik.values.scope === "GLOBAL"
                    ? "Store-Wide Offer"
                    : formik.values.scope === "CATEGORY"
                    ? `Category Specific (${formik.values.categoryIds.length} Selected)`
                    : `Product Specific (${formik.values.productIds.length} Selected)`}
                </span>
              </div>
              <h4 className="text-lg font-black tracking-tight drop-shadow-xs">
                {formik.values.name || "OFFER NAME"}
              </h4>
              <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                {formik.values.description ||
                  "Seasonal festive crackers celebration discount"}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl px-3 py-1.5 text-center">
                <div className="text-2xl font-black text-amber-200 leading-none">
                  {formik.values.discountPercent || 0}%
                </div>
                <div className="text-[9px] uppercase tracking-wider text-white/90 font-bold mt-0.5">
                  OFF
                </div>
              </div>
              <div
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                  formik.values.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-100 border-emerald-300/40"
                    : "bg-slate-800/40 text-slate-200 border-slate-600/40"
                }`}
              >
                {formik.values.status}
              </div>
            </div>
          </div>
        </div>

        {/* Offer Name & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Offer Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              minLength={2}
              maxLength={100}
              placeholder="e.g. DIWALI 2026"
              value={formik.values.name}
              onChange={(e) =>
                formik.setFieldValue("name", e.target.value.toUpperCase())
              }
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 text-xs sm:text-sm font-bold tracking-wide uppercase border rounded-xl outline-none transition-colors ${
                getFieldError("name")
                  ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
              }`}
            />
            {getFieldError("name") ? (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("name")}</span>
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-0.5">
                Seasonal campaign identifier (e.g. DIWALI 2026, PONGAL 2027)
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white font-medium cursor-pointer"
            >
              <option value="ACTIVE">ACTIVE (Live)</option>
              <option value="INACTIVE">INACTIVE (Draft / Paused)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-slate-700"
            >
              Description / Promo Punchline
            </label>
            <span className="text-[10px] text-slate-400">
              {(formik.values.description || "").length} / 500
            </span>
          </div>
          <input
            id="description"
            name="description"
            type="text"
            maxLength={500}
            placeholder="e.g. Grand Festive Season Mega Discount on Sparklers & Aerial Fireworks"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white"
          />
          {getFieldError("description") && (
            <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{getFieldError("description")}</span>
            </p>
          )}
        </div>

        {/* Discount Percentage Section */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="discountPercent"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Percent className="w-3.5 h-3.5 text-red-500" />
              Discount Percentage (%) <span className="text-red-500">*</span>
            </label>
            <span className="text-xs font-black text-red-600">
              {formik.values.discountPercent}% OFF
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            <div className="sm:col-span-3 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={formik.values.discountPercent || 0}
                onChange={(e) =>
                  formik.setFieldValue("discountPercent", Number(e.target.value))
                }
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
            <div className="sm:col-span-1">
              <div className="relative">
                <input
                  id="discountPercent"
                  name="discountPercent"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="50"
                  value={formik.values.discountPercent}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-1.5 text-sm font-bold text-center border rounded-xl outline-none ${
                    getFieldError("discountPercent")
                      ? "border-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-red-500 bg-white"
                  }`}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Quick Discount Presets */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-medium mr-1">
              Quick Presets:
            </span>
            {[10, 20, 25, 50, 70, 80, 90].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => formik.setFieldValue("discountPercent", val)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                  formik.values.discountPercent === val
                    ? "bg-red-600 text-white"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {val}%
              </button>
            ))}
          </div>

          {getFieldError("discountPercent") && (
            <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{getFieldError("discountPercent")}</span>
            </p>
          )}
        </div>

        {/* Offer Scope Selector (GLOBAL, CATEGORY, PRODUCT) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Offer Scope / Target <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* GLOBAL */}
            <button
              type="button"
              onClick={() => {
                formik.setFieldValue("scope", "GLOBAL");
                formik.setFieldValue("categoryIds", []);
                formik.setFieldValue("productIds", []);
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                formik.values.scope === "GLOBAL"
                  ? "border-red-500 bg-red-50/40 ring-1 ring-red-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Globe
                  className={`w-4 h-4 ${
                    formik.values.scope === "GLOBAL"
                      ? "text-red-600"
                      : "text-slate-400"
                  }`}
                />
                {formik.values.scope === "GLOBAL" && (
                  <Check className="w-3.5 h-3.5 text-red-600" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Global (All Items)
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Applies store-wide across all products
                </div>
              </div>
            </button>

            {/* CATEGORY */}
            <button
              type="button"
              onClick={() => {
                formik.setFieldValue("scope", "CATEGORY");
                formik.setFieldValue("productIds", []);
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                formik.values.scope === "CATEGORY"
                  ? "border-red-500 bg-red-50/40 ring-1 ring-red-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Layers
                  className={`w-4 h-4 ${
                    formik.values.scope === "CATEGORY"
                      ? "text-red-600"
                      : "text-slate-400"
                  }`}
                />
                {formik.values.scope === "CATEGORY" && (
                  <Check className="w-3.5 h-3.5 text-red-600" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  By Category
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Applies to specific selected categories
                </div>
              </div>
            </button>

            {/* PRODUCT */}
            <button
              type="button"
              onClick={() => {
                formik.setFieldValue("scope", "PRODUCT");
                formik.setFieldValue("categoryIds", []);
              }}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                formik.values.scope === "PRODUCT"
                  ? "border-red-500 bg-red-50/40 ring-1 ring-red-500/20 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Package
                  className={`w-4 h-4 ${
                    formik.values.scope === "PRODUCT"
                      ? "text-red-600"
                      : "text-slate-400"
                  }`}
                />
                {formik.values.scope === "PRODUCT" && (
                  <Check className="w-3.5 h-3.5 text-red-600" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  By Product
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  Applies to specific chosen products
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* CATEGORY TARGET PICKER */}
        {formik.values.scope === "CATEGORY" && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700">
                  Select Applicable Categories ({formik.values.categoryIds.length}{" "}
                  selected) <span className="text-red-500">*</span>
                </span>
                <p className="text-[10px] text-slate-500">
                  Choose which cracker categories qualify for this discount
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllCategories}
                  className="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300 text-xs">|</span>
                <button
                  type="button"
                  onClick={clearAllCategories}
                  className="text-[10px] font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <input
              type="text"
              maxLength={100}
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-red-500 bg-white"
            />

            {loadingData ? (
              <div className="py-6 flex items-center justify-center text-xs text-slate-400 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Loading categories...</span>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredCategories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No categories found.
                  </p>
                ) : (
                  filteredCategories.map((cat) => {
                    const isChecked = formik.values.categoryIds.includes(cat._id);
                    return (
                      <label
                        key={cat._id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-red-50 text-red-900 font-semibold border border-red-200"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCategoryId(cat._id)}
                            className="rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                          />
                          <span>{cat.name}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {cat.slug}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            )}

            {getFieldError("categoryIds") && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("categoryIds")}</span>
              </p>
            )}
          </div>
        )}

        {/* PRODUCT TARGET PICKER */}
        {formik.values.scope === "PRODUCT" && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700">
                  Select Applicable Products ({formik.values.productIds.length}{" "}
                  selected) <span className="text-red-500">*</span>
                </span>
                <p className="text-[10px] text-slate-500">
                  Choose which individual items or gift boxes qualify
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllProducts}
                  className="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300 text-xs">|</span>
                <button
                  type="button"
                  onClick={clearAllProducts}
                  className="text-[10px] font-semibold text-slate-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <input
              type="text"
              maxLength={100}
              placeholder="Search products by name..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:border-red-500 bg-white"
            />

            {loadingData ? (
              <div className="py-6 flex items-center justify-center text-xs text-slate-400 gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                <span>Loading products...</span>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {filteredProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">
                    No products found.
                  </p>
                ) : (
                  filteredProducts.map((prod) => {
                    const isChecked = formik.values.productIds.includes(prod._id);
                    return (
                      <label
                        key={prod._id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-red-50 text-red-900 font-semibold border border-red-200"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductId(prod._id)}
                            className="rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
                          />
                          <span>{prod.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            ₹{prod.sellingPrice ?? prod.mrp}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            )}

            {getFieldError("productIds") && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("productIds")}</span>
              </p>
            )}
          </div>
        )}

        {/* Validity Dates (startAt & expiresAt) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-500" />
              Campaign Validity Schedule <span className="text-red-500">*</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="startAt"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Starts On (Date & Time) <span className="text-red-500">*</span>
              </label>
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                value={formik.values.startAt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 text-xs border rounded-xl outline-none ${
                  getFieldError("startAt")
                    ? "border-red-500 bg-red-50/20"
                    : "border-slate-300 focus:border-red-500 bg-white"
                }`}
              />
              {getFieldError("startAt") && (
                <p className="text-[10px] text-red-600 mt-1 font-medium">
                  {getFieldError("startAt")}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="expiresAt"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Expires On (Date & Time) <span className="text-red-500">*</span>
              </label>
              <input
                id="expiresAt"
                name="expiresAt"
                type="datetime-local"
                value={formik.values.expiresAt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 text-xs border rounded-xl outline-none ${
                  getFieldError("expiresAt")
                    ? "border-red-500 bg-red-50/20"
                    : "border-slate-300 focus:border-red-500 bg-white"
                }`}
              />
              {getFieldError("expiresAt") && (
                <p className="text-[10px] text-red-600 mt-1 font-medium">
                  {getFieldError("expiresAt")}
                </p>
              )}
            </div>
          </div>

          {/* Quick Schedule Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60">
            <span className="text-[10px] text-slate-400 font-medium mr-1">
              Presets:
            </span>
            <button
              type="button"
              onClick={() => setQuickDuration(7)}
              className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Next 7 Days
            </button>
            <button
              type="button"
              onClick={() => setQuickDuration(14)}
              className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Next 14 Days
            </button>
            <button
              type="button"
              onClick={() => setQuickDuration(30)}
              className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Diwali Season (30 Days)
            </button>
            <button
              type="button"
              onClick={setYearEnd}
              className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              Year End (Dec 31)
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
