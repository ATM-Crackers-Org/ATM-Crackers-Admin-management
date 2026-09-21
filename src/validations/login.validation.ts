import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export type LoginFormValues = {
  email: string;
  password: string;
};

export const loginInitialValues: LoginFormValues = {
  email: "",
  password: "",
};
