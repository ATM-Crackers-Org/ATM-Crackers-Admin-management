import * as Yup from "yup";

export const updateProfileValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),

  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  currentPassword: Yup.string()
    .required("Current password is required to confirm changes"),
});

export interface UpdateProfileFormValues {
  name: string;
  email: string;
  currentPassword: string;
}

export const updateProfileInitialValues = (
  name = "",
  email = ""
): UpdateProfileFormValues => ({
  name,
  email,
  currentPassword: "",
});
