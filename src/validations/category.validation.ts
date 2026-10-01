import * as Yup from "yup";
import type { CategoryFormValues } from "@/types/category.types";

export const categoryValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters")
    .required("Category name is required"),

  slug: Yup.string()
    .trim()
    .max(100, "Slug cannot exceed 100 characters")
    .test(
      "is-slug-valid",
      "Slug must be lowercase and URL-friendly (e.g., double-sound-effect)",
      (value) => {
        if (!value || value.trim() === "") return true; // optional
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
      }
    ),

  description: Yup.string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),

  imageUrl: Yup.string()
    .trim()
    .optional(),

  displayOrder: Yup.number()
    .typeError("Display order must be a number")
    .min(0, "Display order must be 0 or greater")
    .max(9999, "Display order cannot exceed 9999")
    .optional(),

  status: Yup.string()
    .oneOf(["ACTIVE", "INACTIVE"], "Status must be either ACTIVE or INACTIVE")
    .optional(),
});

export const categoryInitialValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  displayOrder: 0,
  status: "ACTIVE",
};
