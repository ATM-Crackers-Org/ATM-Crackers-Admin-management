"use client";

import React, { useState } from "react";
import { KeyRound, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

interface SuperAdminLoginFormProps {
  onSubmit: (email: string) => void;
  onQuickAccess: () => void;
}

export const SuperAdminLoginForm: React.FC<SuperAdminLoginFormProps> = ({
  onSubmit,
  onQuickAccess,
}) => {
  const [email, setEmail] = useState("admin@atmcrackers.com");
  const [password, setPassword] = useState("••••••••");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter valid super admin credentials");
      return;
    }
    onSubmit(email.trim());
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md py-6 sm:py-8 px-5 sm:px-8 shadow-2xl rounded-3xl border border-slate-800">
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

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Super Admin ID / Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-base sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="admin@atmcrackers.com"
              autoComplete="username"
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Accepts: admin@atmcrackers.com, superadmin@atmcrackers.com, etc.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Master Security Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-base sm:text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <span>Authorize & Enter Admin Suite</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* 1-Tap Quick Access as Super Admin */}
      <div className="mt-5 pt-5 border-t border-slate-800">
        <button
          type="button"
          onClick={onQuickAccess}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer border border-slate-700/60 active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>1-Tap Super Admin Access</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Full Rights
          </span>
        </button>
      </div>
    </div>
  );
};
