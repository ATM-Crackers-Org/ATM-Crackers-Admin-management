"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import {
  Store,
  Save,
  Pencil,
  X,
  Phone,
  FileText,
  MapPin,
  Receipt,
  Sparkles,
  Clock,
  RefreshCw,
  Copy,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { getStoreSettings, updateStoreSettings } from "@/services/settings.service";
import type { ApiStoreSettings, StoreSettingsFormValues } from "@/types/settings.types";
import {
  storeSettingsValidationSchema,
  storeSettingsInitialValues,
} from "@/validations/store-settings.validation";
import { useAdminStore } from "@/context/admin-store";

export const StoreProfileForm: React.FC = () => {
  const { updateSettings: syncAdminStoreSettings } = useAdminStore();

  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copiedGstin, setCopiedGstin] = useState<boolean>(false);
  const [storeData, setStoreData] = useState<ApiStoreSettings | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // ─── Fetch store settings from API ─────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getStoreSettings();
      setStoreData(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load store settings from server.";
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ─── Formik for Edit Mode ──────────────────────────────────────────────────
  const formik = useFormik<StoreSettingsFormValues>({
    initialValues: storeSettingsInitialValues,
    validationSchema: storeSettingsValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      try {
        const updated = await updateStoreSettings({
          storeName: values.storeName,
          tagline: values.tagline,
          gstin: values.gstin,
          supportPhone: values.supportPhone,
          address: values.address,
          receiptFooterMessage: values.receiptFooterMessage,
        });

        setStoreData(updated);
        syncAdminStoreSettings({
          storeName: updated.storeName || values.storeName,
          tagline: updated.tagline || values.tagline,
          phone: updated.supportPhone || values.supportPhone,
          address: updated.address || values.address,
          gstin: updated.gstin || values.gstin,
          posReceiptFooter: updated.receiptFooterMessage || values.receiptFooterMessage,
        });

        toast.success("Store settings updated successfully!");
        setIsEditing(false); // Return to read-only flow upon successful update
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to update store settings. Please check your inputs.";
        setServerError(msg);
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // When entering edit mode, populate Formik with current data
  const handleStartEditing = () => {
    if (storeData) {
      formik.resetForm({
        values: {
          storeName: storeData.storeName || "",
          tagline: storeData.tagline || "",
          gstin: storeData.gstin || "",
          supportPhone: storeData.supportPhone || "",
          address: storeData.address || "",
          receiptFooterMessage: storeData.receiptFooterMessage || "",
        },
      });
    }
    setServerError(null);
    setIsEditing(true);
  };

  // When canceling edit mode, revert to read-only view
  const handleCancelEditing = () => {
    formik.resetForm();
    setServerError(null);
    setIsEditing(false);
  };

  // Helper for copying GSTIN
  const handleCopyGstin = (gstinText: string) => {
    if (!gstinText) return;
    navigator.clipboard.writeText(gstinText);
    setCopiedGstin(true);
    toast.info("GSTIN copied to clipboard");
    setTimeout(() => setCopiedGstin(false), 2000);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // ─── 1. LOADING STATE ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-44 bg-slate-200 rounded" />
              <div className="h-3 w-64 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="h-20 bg-slate-100 rounded-xl" />
          <div className="sm:col-span-2 h-20 bg-slate-100 rounded-xl" />
          <div className="sm:col-span-2 h-24 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // ─── 2. ERROR STATE ────────────────────────────────────────────────────────
  if (fetchError && !storeData) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Unable to Load Store Settings</h3>
          <p className="text-xs text-slate-500 mt-1">{fetchError}</p>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  // Current display values
  const currentSettings = storeData || {
    storeName: "ATM Crackers Sivakasi",
    tagline: "Wholesale Fireworks Specialists",
    gstin: "33AAAAA0000A1Z5",
    supportPhone: "+91 94431 88990",
    address: "128, By-Pass Road, Near Old Bus Stand, Sivakasi",
    receiptFooterMessage:
      "Thank you for shopping with ATM Crackers! Happy and safe celebrations!",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200">
      {/* ─── CARD HEADER ─────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50/70 via-white to-red-50/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Store Profile & Settings
              </h2>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isEditing
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {isEditing ? "Editing Mode" : "Read-Only"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? "Update your official store profile and customer thermal receipt footer."
                : "Official registered store profile, GSTIN identity, and receipt footer."}
            </p>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={fetchSettings}
                title="Refresh store settings from server"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleStartEditing}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Settings</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={formik.isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={() => formik.handleSubmit()}
                disabled={formik.isSubmitting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-70"
              >
                {formik.isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── SERVER ERROR BANNER ────────────────────────────────────────── */}
      {serverError && (
        <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Update Error:</span> {serverError}
          </div>
        </div>
      )}

      {/* ─── EDITING NOTICE BANNER ──────────────────────────────────────── */}
      {isEditing && (
        <div className="mx-4 sm:mx-5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Interactive Edit Mode:</span> You can now modify the store credentials and thermal receipt footer message. Click <strong>Save Changes</strong> to submit to the server, or <strong>Cancel</strong> to discard edits.
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* ════════════════════════════════════════════════════════════════════
            READ-ONLY MODE (DEFAULT FLOW)
            ════════════════════════════════════════════════════════════════════ */}
        {!isEditing ? (
          <div className="space-y-4">
            {/* Top Brand Banner */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden shadow-xs">
              <div className="absolute right-0 top-0 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-medium">
                    <Building2 className="w-3 h-3" />
                    <span>Store Key: {currentSettings.key || "default"}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                    {currentSettings.storeName || "ATM Crackers Sivakasi"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 italic flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>"{currentSettings.tagline || "Wholesale Fireworks Specialists"}"</span>
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block">GSTIN Status</span>
                  <div className="inline-flex items-center gap-1.5 mt-0.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 font-mono text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Registered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Read-Only Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Store Name Readonly */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>Store Name</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {currentSettings.storeName || "—"}
                </p>
              </div>

              {/* Tagline Readonly */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tagline / Slogan</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {currentSettings.tagline || "—"}
                </p>
              </div>

              {/* GSTIN Readonly with Copy */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>GSTIN Number</span>
                  </div>
                  {currentSettings.gstin && (
                    <button
                      type="button"
                      onClick={() => handleCopyGstin(currentSettings.gstin || "")}
                      className="text-[11px] text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy GSTIN"
                    >
                      {copiedGstin ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-mono font-bold text-slate-800 tracking-wide">
                  {currentSettings.gstin || "—"}
                </p>
              </div>

              {/* Support Phone Readonly */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer Support Phone</span>
                </div>
                {currentSettings.supportPhone ? (
                  <a
                    href={`tel:${currentSettings.supportPhone}`}
                    className="text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                  >
                    <span>{currentSettings.supportPhone}</span>
                  </a>
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">—</p>
                )}
              </div>

              {/* Address Readonly */}
              <div className="sm:col-span-2 p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sivakasi Street Address</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {currentSettings.address || "—"}
                </p>
              </div>

              {/* Receipt Footer Message Readonly with POS preview */}
              <div className="sm:col-span-2 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                    <Receipt className="w-3.5 h-3.5 text-slate-400" />
                    <span>Thermal Receipt Footer Message</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    Prints at bottom of thermal slips & invoices
                  </span>
                </div>

                {/* Miniature Thermal Receipt Slip Preview */}
                <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-white shadow-2xs font-mono text-center space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                    ── RECEIPT FOOTER PREVIEW ──
                  </p>
                  <p className="text-xs text-slate-700 font-medium italic">
                    "{currentSettings.receiptFooterMessage || "Thank you for shopping with ATM Crackers! Happy and safe celebrations!"}"
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Meta Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last updated: {formatDate(storeData?.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartEditing}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Click to modify details</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════════════════
             EDITABLE MODE (TRIGGERED BY EDIT BUTTON)
             ════════════════════════════════════════════════════════════════════ */
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Store Name Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="storeName"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Store Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formik.values.storeName.length}/100
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="storeName"
                    name="storeName"
                    type="text"
                    placeholder="e.g. ATM Crackers Sivakasi"
                    value={formik.values.storeName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                      formik.touched.storeName && formik.errors.storeName
                        ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                        : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                    }`}
                  />
                </div>
                {formik.touched.storeName && formik.errors.storeName ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formik.errors.storeName}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Official business brand name shown on header & invoices
                  </p>
                )}
              </div>

              {/* Tagline Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="tagline"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Tagline / Business Slogan
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formik.values.tagline.length}/150
                  </span>
                </div>
                <input
                  id="tagline"
                  name="tagline"
                  type="text"
                  placeholder="e.g. Wholesale Fireworks Specialists"
                  value={formik.values.tagline}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                    formik.touched.tagline && formik.errors.tagline
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                  }`}
                />
                {formik.touched.tagline && formik.errors.tagline ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formik.errors.tagline}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Short marketing slogan (e.g. Wholesale Fireworks Specialists)
                  </p>
                )}
              </div>

              {/* GSTIN Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="gstin"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    GSTIN Number
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    15 characters
                  </span>
                </div>
                <input
                  id="gstin"
                  name="gstin"
                  type="text"
                  maxLength={15}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  value={formik.values.gstin}
                  onChange={(e) =>
                    formik.setFieldValue("gstin", e.target.value.toUpperCase().replace(/\s/g, ""))
                  }
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 text-xs sm:text-sm font-mono border rounded-lg outline-none transition-colors uppercase tracking-wider ${
                    formik.touched.gstin && formik.errors.gstin
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                  }`}
                />
                {formik.touched.gstin && formik.errors.gstin ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formik.errors.gstin}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Format: 2 digits state + 10 char PAN + 1 entity + Z + 1 check digit
                  </p>
                )}
              </div>

              {/* Support Phone Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="supportPhone"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Customer Support Phone
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Indian Mobile / Landline
                  </span>
                </div>
                <input
                  id="supportPhone"
                  name="supportPhone"
                  type="text"
                  placeholder="e.g. +91 94431 88990 or 9443188990"
                  value={formik.values.supportPhone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                    formik.touched.supportPhone && formik.errors.supportPhone
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                  }`}
                />
                {formik.touched.supportPhone && formik.errors.supportPhone ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formik.errors.supportPhone}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Contact number printed on customer bills and WhatsApp enquiries
                  </p>
                )}
              </div>

              {/* Address Input */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="address"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Sivakasi Street Address
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {formik.values.address.length}/250
                  </span>
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="e.g. 128, By-Pass Road, Near Old Bus Stand, Sivakasi"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                    formik.touched.address && formik.errors.address
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                  }`}
                />
                {formik.touched.address && formik.errors.address ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formik.errors.address}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Physical store address printed on bill invoices & parcel slips
                  </p>
                )}
              </div>

              {/* Receipt Footer Message Input */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="receiptFooterMessage"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Thermal Receipt Footer Message
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {formik.values.receiptFooterMessage.length}/250 characters
                  </span>
                </div>
                <textarea
                  id="receiptFooterMessage"
                  name="receiptFooterMessage"
                  rows={3}
                  placeholder="e.g. Thank you for shopping with ATM Crackers! Happy and safe celebrations!"
                  value={formik.values.receiptFooterMessage}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg outline-none transition-colors ${
                    formik.touched.receiptFooterMessage && formik.errors.receiptFooterMessage
                      ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                      : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                  }`}
                />
                {formik.touched.receiptFooterMessage && formik.errors.receiptFooterMessage ? (
                  <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formik.errors.receiptFooterMessage}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Greeting or festive note printed at bottom of customer receipt paper
                  </p>
                )}
              </div>
            </div>

            {/* Editable Form Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={formik.isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Discard & Return
              </button>
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-70"
              >
                {formik.isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Server...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
