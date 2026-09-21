import * as Yup from "yup";

export const changePasswordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required("Current password is required"),

  newPassword: Yup.string()
    .min(8, "New password must be at least 8 characters")
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])/,
      "Must contain at least one uppercase letter and one number"
    )
    .notOneOf(
      [Yup.ref("currentPassword")],
      "New password must be different from current password"
    )
    .required("New password is required"),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your new password"),
});

export interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePasswordInitialValues: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
