"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { Mail, Lock, ArrowRight, Eye, EyeOff, KeyRound } from "lucide-react";
import { login } from "@/services/auth.service";
import {
  loginValidationSchema,
  loginInitialValues,
} from "@/validations/login.validation";
import { useAdminStore } from "@/context/admin-store";

export function LoginForm() {
  const router = useRouter();
  const { login: storeLogin } = useAdminStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: loginInitialValues,
    validationSchema: loginValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError(null);
      try {
        const profile = await login(values);
        // Sync into the existing admin store so isAuthenticated flips
        storeLogin(profile.email, "SUPER_ADMIN", profile.name || profile.email);
        router.push("/");
      } catch (err) {
        setServerError(
          err instanceof Error ? err.message : "Login failed. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fieldError = (name: "email" | "password") =>
    formik.touched[name] && formik.errors[name]
      ? formik.errors[name]
      : undefined;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md py-6 sm:py-8 px-5 sm:px-8 shadow-2xl rounded-3xl border border-slate-800">
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            Super Admin Login
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Enter your administrative credentials to continue
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <KeyRound className="w-4 h-4" />
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
          {serverError}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-4 sm:space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Admin Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@atmcrackers.com"
              {...formik.getFieldProps("email")}
              className={`w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800/90 border rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                fieldError("email")
                  ? "border-red-500/60"
                  : "border-slate-700"
              }`}
            />
          </div>
          {fieldError("email") && (
            <p className="mt-1.5 text-[11px] text-red-400 font-medium">
              {fieldError("email")}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...formik.getFieldProps("password")}
              className={`w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-800/90 border rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${
                fieldError("password")
                  ? "border-red-500/60"
                  : "border-slate-700"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {fieldError("password") && (
            <p className="mt-1.5 text-[11px] text-red-400 font-medium">
              {fieldError("password")}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {formik.isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Authorize &amp; Enter Admin Suite</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
