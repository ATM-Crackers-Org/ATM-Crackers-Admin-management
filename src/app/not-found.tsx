"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Compass, LogIn } from "lucide-react";
import { useAdminStore } from "@/context/admin-store";

export default function NotFound() {
  const router = useRouter();
  const { isAuthenticated } = useAdminStore();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-red-950/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg mx-auto relative z-10 text-center">
        {/* Brand logo & title */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="ATM Crackers Sivakasi Logo"
            className="h-20 sm:h-24 w-auto object-contain drop-shadow-2xl mb-3"
          />
          <span className="text-xs font-semibold tracking-widest text-red-400 uppercase">
            ATM Crackers Sivakasi • Admin Portal
          </span>
        </div>

        {/* 404 Glassmorphic Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-red-600 via-amber-500 to-red-600" />

          {/* Big glowing 404 Badge */}
          <div className="relative inline-block mb-4">
            <span className="text-7xl sm:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white via-slate-200 to-slate-500 drop-shadow-sm select-none">
              404
            </span>
            <div className="absolute -bottom-1 -right-2 bg-linear-to-r from-red-600 to-amber-500 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Compass className="w-3 h-3 animate-spin" />
              Not Found
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Page Not Found / பக்கம் கிடைக்கவில்லை
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
            The administrative page or resource you are trying to access does not exist, has been moved, or requires higher privileges.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold shadow-lg shadow-red-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <button
              onClick={() => router.back()}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>
          </div>

          {/* Extra fallback for unauthenticated users */}
          {!isAuthenticated && (
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Need to sign in? Go to Admin Login &rarr;</span>
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-500">
          ATM Crackers © 2026 • Sivakasi, Tamil Nadu • Central Management System
        </p>
      </div>
    </div>
  );
}
