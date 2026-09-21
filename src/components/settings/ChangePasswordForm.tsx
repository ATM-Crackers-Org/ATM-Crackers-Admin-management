"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { changePassword } from "@/services/auth.service";
import {
  changePasswordValidationSchema,
  changePasswordInitialValues,
  type ChangePasswordFormValues,
} from "@/validations/change-password.validation";

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formik = useFormik<ChangePasswordFormValues>({
    initialValues: changePasswordInitialValues,
    validationSchema: changePasswordValidationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setServerError(null);
      setSuccessMessage(null);
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        toast.success("Security password changed successfully!");
        setSuccessMessage("Your password has been updated securely. Please remember your new password.");
        resetForm();
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to update password. Please verify your current password.";
        setServerError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const getFieldError = (field: keyof ChangePasswordFormValues) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : undefined;

  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">
              Change Admin Password
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ensure your administrative account uses a strong, unique password
            </p>
          </div>
        </div>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-900">Password Updated</p>
            <p className="text-emerald-700 mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Server error alert */}
      {serverError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Change Password Failed</p>
            <p className="text-red-700 mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your existing password"
              {...formik.getFieldProps("currentPassword")}
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                getFieldError("currentPassword")
                  ? "border-red-400 bg-red-50/20"
                  : "border-slate-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {getFieldError("currentPassword") && (
            <p className="mt-1 text-[11px] text-red-500 font-medium">
              {getFieldError("currentPassword")}
            </p>
          )}
        </div>

        {/* Grid for New Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                {...formik.getFieldProps("newPassword")}
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  getFieldError("newPassword")
                    ? "border-red-400 bg-red-50/20"
                    : "border-slate-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {getFieldError("newPassword") ? (
              <p className="mt-1 text-[11px] text-red-500 font-medium">
                {getFieldError("newPassword")}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Min 8 characters, with at least 1 uppercase and 1 number.
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                {...formik.getFieldProps("confirmPassword")}
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                  getFieldError("confirmPassword")
                    ? "border-red-400 bg-red-50/20"
                    : "border-slate-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {getFieldError("confirmPassword") && (
              <p className="mt-1 text-[11px] text-red-500 font-medium">
                {getFieldError("confirmPassword")}
              </p>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              formik.resetForm();
              setServerError(null);
              setSuccessMessage(null);
            }}
            disabled={formik.isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={formik.isSubmitting || !formik.dirty}
            className="btn btn-primary text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-red-600/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {formik.isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
