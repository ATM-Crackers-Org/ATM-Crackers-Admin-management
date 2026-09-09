"use client";

import React from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";

interface StoreResetDataCardProps {
  onReset: () => void;
}

export const StoreResetDataCard: React.FC<StoreResetDataCardProps> = ({ onReset }) => {
  return (
    <div className="bg-red-50/60 p-6 rounded-3xl border border-red-200/80 space-y-3">
      <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
        <ShieldCheck className="w-5 h-5" />
        <span>Demo Data Management</span>
      </div>
      <p className="text-xs text-red-600 leading-relaxed max-w-xl">
        If you want to clear your local modifications, added products, or test orders and restore the original Sivakasi cracker catalog and seed records, click the reset button below.
      </p>
      <div>
        <button
          type="button"
          onClick={onReset}
          className="btn bg-white text-red-600 border border-red-300 hover:bg-red-50 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Factory Demo Seed Data</span>
        </button>
      </div>
    </div>
  );
};
