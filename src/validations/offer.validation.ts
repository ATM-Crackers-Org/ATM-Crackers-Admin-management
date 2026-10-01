import * as Yup from "yup";
import type { OfferFormValues } from "@/types/offer.types";

export const offerValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Offer name must be at least 2 characters")
    .max(100, "Offer name cannot exceed 100 characters")
    .required("Offer name is required"),

  description: Yup.string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  discountPercent: Yup.number()
    .typeError("Discount percentage must be a number")
    .min(0, "Discount cannot be less than 0%")
    .max(100, "Discount cannot exceed 100%")
    .required("Discount percentage is required"),

  scope: Yup.string()
    .oneOf(["GLOBAL", "CATEGORY", "PRODUCT"], "Invalid offer scope")
    .required("Offer scope is required"),

  categoryIds: Yup.array()
    .of(Yup.string().required())
    .when("scope", {
      is: "CATEGORY",
      then: (schema) =>
        schema.min(1, "Please select at least one category for this offer"),
      otherwise: (schema) => schema.notRequired(),
    }),

  productIds: Yup.array()
    .of(Yup.string().required())
    .when("scope", {
      is: "PRODUCT",
      then: (schema) =>
        schema.min(1, "Please select at least one product for this offer"),
      otherwise: (schema) => schema.notRequired(),
    }),

  startAt: Yup.string().required("Start date & time is required"),

  expiresAt: Yup.string()
    .required("Expiry date & time is required")
    .test("is-after-start", "Expiry date must be after start date", function (value) {
      const { startAt } = this.parent;
      if (!startAt || !value) return true;
      return new Date(value) > new Date(startAt);
    }),

  status: Yup.string()
    .oneOf(["ACTIVE", "INACTIVE"], "Status must be ACTIVE or INACTIVE")
    .default("ACTIVE"),
});

export const offerInitialValues: OfferFormValues = {
  name: "",
  description: "",
  discountPercent: 50,
  scope: "GLOBAL",
  categoryIds: [],
  productIds: [],
  startAt: new Date().toISOString().slice(0, 16),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
  status: "ACTIVE",
};
