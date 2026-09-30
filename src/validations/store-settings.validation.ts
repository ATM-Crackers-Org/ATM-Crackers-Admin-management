import * as Yup from "yup";
import type { StoreSettingsFormValues } from "@/types/settings.types";

/**
 * Regular expressions for Indian GSTIN and phone numbers
 */
// 15-digit Indian GSTIN format: e.g. 33AAAAA0000A1Z5
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Phone: 10-digit Indian mobile (starts with 6-9), optionally with +91 or 0 prefix, spaces or dashes, or standard landline
const PHONE_REGEX = /^(?:(?:\+91|91|0)[\s\-]?)?[6-9]\d{4}[\s\-]?\d{5}$|^(?:(?:\+91|91|0)[\s\-]?)?\d{3,5}[\s\-]?\d{6,8}$/;

export const storeSettingsValidationSchema = Yup.object({
  storeName: Yup.string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name cannot exceed 100 characters")
    .required("Store name is required"),

  tagline: Yup.string()
    .trim()
    .max(150, "Tagline cannot exceed 150 characters"),

  gstin: Yup.string()
    .trim()
    .test("is-valid-gstin", "GSTIN must be a valid 15-character format (e.g. 33AAAAA0000A1Z5)", (val) => {
      if (!val || val.trim() === "") return true; // Optional if not registered yet
      return GSTIN_REGEX.test(val.trim().toUpperCase());
    }),

  supportPhone: Yup.string()
    .trim()
    .test("is-valid-phone", "Enter a valid phone number (e.g. +91 94431 88990 or 10-digit mobile)", (val) => {
      if (!val || val.trim() === "") return true;
      return PHONE_REGEX.test(val.trim());
    }),

  address: Yup.string()
    .trim()
    .test("min-address-length", "Address should be at least 5 characters", (val) => {
      if (!val || val.trim() === "") return true;
      return val.trim().length >= 5;
    })
    .max(250, "Address cannot exceed 250 characters"),

  receiptFooterMessage: Yup.string()
    .trim()
    .max(250, "Receipt footer message cannot exceed 250 characters"),
});

export const storeSettingsInitialValues: StoreSettingsFormValues = {
  storeName: "",
  tagline: "",
  gstin: "",
  supportPhone: "",
  address: "",
  receiptFooterMessage: "",
};
