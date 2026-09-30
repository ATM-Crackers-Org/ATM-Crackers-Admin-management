import * as Yup from "yup";
import type { CouponFormValues } from "@/types/coupon.types";

export const couponValidationSchema = Yup.object({
  code: Yup.string()
    .trim()
    .min(3, "Coupon code must be at least 3 characters")
    .max(30, "Coupon code cannot exceed 30 characters")
    .matches(/^[A-Z0-9_-]+$/, "Code can only contain uppercase letters, numbers, hyphens, and underscores")
    .required("Coupon code is required"),

  description: Yup.string().trim().max(250, "Description cannot exceed 250 characters"),

  discountType: Yup.string()
    .oneOf(["FIXED_AMOUNT", "PERCENTAGE"], "Invalid discount type")
    .required("Discount type is required"),

  discountValue: Yup.number()
    .typeError("Discount value must be a number")
    .positive("Discount value must be greater than 0")
    .required("Discount value is required")
    .when("discountType", {
      is: "PERCENTAGE",
      then: (schema) => schema.max(100, "Percentage discount cannot exceed 100%"),
    }),

  minimumOrderValue: Yup.number()
    .typeError("Minimum order value must be a number")
    .min(0, "Minimum order value cannot be negative")
    .default(0),

  maximumDiscount: Yup.number()
    .nullable()
    .transform((val, orig) => (orig === "" || orig === undefined ? null : val))
    .typeError("Maximum discount must be a number")
    .min(0, "Maximum discount cannot be negative"),

  usageLimit: Yup.number()
    .nullable()
    .transform((val, orig) => (orig === "" || orig === undefined ? null : val))
    .typeError("Usage limit must be a number")
    .min(1, "Usage limit must be at least 1"),

  perCustomerLimit: Yup.number()
    .typeError("Per-customer limit must be a number")
    .min(1, "Per-customer limit must be at least 1")
    .default(1),

  startAt: Yup.string()
    .required("Start date is required"),

  expiresAt: Yup.string()
    .required("Expiry date is required")
    .test("is-after-start", "Expiry date must be after start date", function (value) {
      const { startAt } = this.parent;
      if (!startAt || !value) return true;
      return new Date(value) > new Date(startAt);
    }),

  status: Yup.string()
    .oneOf(["ACTIVE", "INACTIVE"], "Status must be ACTIVE or INACTIVE")
    .default("ACTIVE"),
});

export const couponInitialValues: CouponFormValues = {
  code: "",
  description: "",
  discountType: "FIXED_AMOUNT",
  discountValue: 100,
  minimumOrderValue: 1000,
  maximumDiscount: null,
  usageLimit: 100,
  perCustomerLimit: 1,
  startAt: new Date().toISOString().slice(0, 16),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  status: "ACTIVE",
};
