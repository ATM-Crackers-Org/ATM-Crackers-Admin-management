import * as Yup from "yup";

export const productValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Cracker name must be at least 2 characters")
    .max(120, "Cracker name cannot exceed 120 characters")
    .required("Cracker name is required"),

  categoryId: Yup.string()
    .trim()
    .required("Please select a category"),

  slug: Yup.string()
    .trim()
    .test("is-slug-valid", "Slug must be lowercase and URL-friendly (e.g. three-sound)", (val) => {
      if (!val || val.trim() === "") return true;
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val.trim());
    })
    .optional(),

  description: Yup.string().trim().max(1000, "Description cannot exceed 1000 characters"),

  mrp: Yup.number()
    .typeError("MRP must be a valid number")
    .min(0, "MRP must be 0 or greater")
    .required("MRP is required"),

  discountPercent: Yup.number()
    .typeError("Discount percent must be a valid number")
    .min(0, "Discount percent cannot be negative")
    .max(100, "Discount percent cannot exceed 100%")
    .required("Discount percent is required"),

  stockQuantity: Yup.number()
    .typeError("Stock quantity must be a valid number")
    .integer("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative")
    .required("Stock quantity is required"),

  lowStockThreshold: Yup.number()
    .typeError("Low stock threshold must be a valid number")
    .integer("Low stock threshold must be a whole number")
    .min(0, "Low stock threshold cannot be negative")
    .default(10),

  stockStatus: Yup.string()
    .oneOf(["in_stock", "limited", "out_of_stock"], "Invalid stock status")
    .default("in_stock"),

  status: Yup.string()
    .oneOf(["ACTIVE", "INACTIVE"], "Status must be ACTIVE or INACTIVE")
    .default("ACTIVE"),

  displayOrder: Yup.number()
    .typeError("Display order must be a number")
    .min(0, "Display order must be 0 or greater")
    .default(0),
});
