"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/context/admin-store";
import { SuperAdminLoginForm } from "./SuperAdminLoginForm";

export const LoginView: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated } = useAdminStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLogin = (email: string) => {
    const adminName = email.toLowerCase().includes("owner")
      ? "Managing Director"
      : "Super Admin Officer";

    login(email.trim(), "SUPER_ADMIN", adminName);
    router.push("/");
  };

  const handleQuickAccess = () => {
    login("admin@atmcrackers.com", "SUPER_ADMIN", "Super Admin Officer");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Brand Header with Exact Official Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="mb-3 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="ATM Crackers Sivakasi Official Logo"
              className="h-28 sm:h-32 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ATM Crackers Sivakasi
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-xs">
            Central Management & POS Terminal System
          </p>
        </div>

        {/* Modular Login Form */}
        <SuperAdminLoginForm
          onSubmit={handleLogin}
          onQuickAccess={handleQuickAccess}
        />

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500">
          ATM Crackers © 2026 • Sivakasi, Tamil Nadu • Super Admin Security
        </p>
      </div>
    </div>
  );
};
