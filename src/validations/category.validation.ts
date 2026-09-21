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
    .test(
      "is-slug-valid",
      "Slug must be lowercase and URL-friendly (e.g., double-sound-effect)",
      (value) => {
        if (!value || value.trim() === "") return true; // optional
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
      }
    ),

  description: Yup.string().trim(),

  imageUrl: Yup.string()
    .trim()
    .test("is-valid-url", "Must be a valid image URL (http:// or https://)", (value) => {
      if (!value || value.trim() === "") return true; // optional
      return /^(https?:\/\/).+/.test(value.trim());
    }),

  displayOrder: Yup.number()
    .typeError("Display order must be a number")
    .min(0, "Display order must be 0 or greater")
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
