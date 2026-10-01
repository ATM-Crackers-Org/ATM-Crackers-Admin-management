"use client";

import React, { useEffect } from "react";
import { useFormik } from "formik";
import { Modal } from "@/components/ui/Modal";
import type {
  ApiCoupon,
  CouponFormValues,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/coupon.types";
import {
  couponValidationSchema,
  couponInitialValues,
} from "@/validations/coupon.validation";
import { AlertCircle, Loader2, Save, Tag } from "lucide-react";

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: ApiCoupon | null;
  onSubmit: (data: CreateCouponPayload | UpdateCouponPayload) => Promise<void>;
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

export const CouponFormModal: React.FC<CouponFormModalProps> = ({
  isOpen,
  onClose,
  coupon,
  onSubmit,
  isSubmitting = false,
}) => {
  const formik = useFormik<CouponFormValues>({
    initialValues: couponInitialValues,
    validationSchema: couponValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values) => {
      const payload: CreateCouponPayload = {
        code: values.code.trim().toUpperCase(),
        description: values.description ? values.description.trim() : undefined,
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        minimumOrderValue:
          values.minimumOrderValue !== "" ? Number(values.minimumOrderValue) : 0,
        maximumDiscount:
          values.maximumDiscount !== "" && values.maximumDiscount !== null
            ? Number(values.maximumDiscount)
            : null,
        usageLimit:
          values.usageLimit !== "" && values.usageLimit !== null
            ? Number(values.usageLimit)
            : undefined,
        perCustomerLimit:
          values.perCustomerLimit !== "" ? Number(values.perCustomerLimit) : 1,
        startAt: new Date(values.startAt).toISOString(),
        expiresAt: new Date(values.expiresAt).toISOString(),
        status: values.status,
      };

      await onSubmit(payload);
    },
  });

  useEffect(() => {
    if (coupon) {
      formik.resetForm({
        values: {
          code: coupon.code,
          description: coupon.description || "",
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minimumOrderValue: coupon.minimumOrderValue ?? 0,
          maximumDiscount: coupon.maximumDiscount ?? null,
          usageLimit: coupon.usageLimit ?? "",
          perCustomerLimit: coupon.perCustomerLimit ?? 1,
          startAt: toDatetimeLocal(coupon.startAt),
          expiresAt: toDatetimeLocal(coupon.expiresAt),
          status: coupon.status,
        },
      });
    } else {
      const now = new Date();
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      formik.resetForm({
        values: {
          ...couponInitialValues,
          code: "FESTIVE" + Math.floor(100 + Math.random() * 900),
          startAt: toDatetimeLocal(now.toISOString()),
          expiresAt: toDatetimeLocal(in30Days.toISOString()),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coupon, isOpen]);

  const getFieldError = (name: keyof CouponFormValues) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coupon ? "Edit Discount Coupon" : "Create New Discount Coupon"}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="coupon-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Coupon...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{coupon ? "Update Coupon" : "Create Coupon"}</span>
              </>
            )}
          </button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={formik.handleSubmit} className="space-y-4 pt-1">
        {/* Coupon Code & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="code" className="block text-xs font-semibold text-slate-700 mb-1">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="code"
                name="code"
                type="text"
                minLength={3}
                maxLength={30}
                placeholder="e.g. DIWALI500"
                value={formik.values.code}
                onChange={(e) =>
                  formik.setFieldValue("code", e.target.value.toUpperCase().replace(/\s/g, ""))
                }
                onBlur={formik.handleBlur}
                className={`w-full px-3 py-2 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase border rounded-xl outline-none transition-colors ${
                  getFieldError("code")
                    ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                    : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                }`}
              />
            </div>
            {getFieldError("code") ? (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("code")}</span>
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-0.5">
                Voucher code customers type at POS counter or online checkout
              </p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-semibold text-slate-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white font-medium"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
              Description / Promotion Note
            </label>
            <span className="text-[10px] text-slate-400">
              {(formik.values.description || "").length} / 250
            </span>
          </div>
          <input
            id="description"
            name="description"
            type="text"
            maxLength={250}
            placeholder="e.g. Flat Diwali festive booking discount"
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

        {/* Discount Type & Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div>
            <label htmlFor="discountType" className="block text-xs font-semibold text-slate-700 mb-1">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select
              id="discountType"
              name="discountType"
              value={formik.values.discountType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white font-medium"
            >
              <option value="FIXED_AMOUNT">Flat Rupee Amount (₹)</option>
              <option value="PERCENTAGE">Percentage (%)</option>
            </select>
          </div>

          <div>
            <label htmlFor="discountValue" className="block text-xs font-semibold text-slate-700 mb-1">
              {formik.values.discountType === "FIXED_AMOUNT"
                ? "Discount Amount (₹) *"
                : "Discount Percentage (%) *"}
            </label>
            <input
              id="discountValue"
              name="discountValue"
              type="number"
              min={1}
              max={formik.values.discountType === "PERCENTAGE" ? 100 : 1000000}
              value={formik.values.discountValue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl outline-none font-bold ${
                getFieldError("discountValue")
                  ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
              }`}
            />
            {getFieldError("discountValue") && (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("discountValue")}</span>
              </p>
            )}
          </div>
        </div>

        {/* Minimum Order Value & Maximum Discount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="minimumOrderValue" className="block text-xs font-semibold text-slate-700 mb-1">
              Minimum Order Value (₹)
            </label>
            <input
              id="minimumOrderValue"
              name="minimumOrderValue"
              type="number"
              min={0}
              max={1000000}
              placeholder="0"
              value={formik.values.minimumOrderValue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white"
            />
            {getFieldError("minimumOrderValue") && (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("minimumOrderValue")}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="maximumDiscount" className="block text-xs font-semibold text-slate-700 mb-1">
              Max Cap Discount (₹) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="maximumDiscount"
              name="maximumDiscount"
              type="number"
              min={0}
              max={1000000}
              placeholder={formik.values.discountType === "PERCENTAGE" ? "e.g. 1000" : "None"}
              value={formik.values.maximumDiscount ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white"
            />
            {getFieldError("maximumDiscount") && (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("maximumDiscount")}</span>
              </p>
            )}
          </div>
        </div>

        {/* Usage Limits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="usageLimit" className="block text-xs font-semibold text-slate-700 mb-1">
              Overall Usage Limit <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="usageLimit"
              name="usageLimit"
              type="number"
              min={1}
              max={1000000}
              placeholder="e.g. 1000 redemptions"
              value={formik.values.usageLimit ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white"
            />
            {getFieldError("usageLimit") && (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("usageLimit")}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="perCustomerLimit" className="block text-xs font-semibold text-slate-700 mb-1">
              Per-Customer Limit
            </label>
            <input
              id="perCustomerLimit"
              name="perCustomerLimit"
              type="number"
              min={1}
              max={100}
              value={formik.values.perCustomerLimit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-white"
            />
            {getFieldError("perCustomerLimit") && (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("perCustomerLimit")}</span>
              </p>
            )}
          </div>
        </div>

        {/* Start Date & Expiry Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="startAt" className="block text-xs font-semibold text-slate-700 mb-1">
              Valid From (Start Date) <span className="text-red-500">*</span>
            </label>
            <input
              id="startAt"
              name="startAt"
              type="datetime-local"
              value={formik.values.startAt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl outline-none bg-white ${
                getFieldError("startAt")
                  ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              }`}
            />
            {getFieldError("startAt") && (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("startAt")}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="expiresAt" className="block text-xs font-semibold text-slate-700 mb-1">
              Valid Until (Expiry Date) <span className="text-red-500">*</span>
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              value={formik.values.expiresAt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl outline-none bg-white ${
                getFieldError("expiresAt")
                  ? "border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/20"
                  : "border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              }`}
            />
            {getFieldError("expiresAt") && (
              <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{getFieldError("expiresAt")}</span>
              </p>
            )}
          </div>
        </div>

      </form>
    </Modal>
  );
};
