"use client";

import React from "react";
import Link from "next/link";
import { Receipt } from "lucide-react";

export const DashboardWelcomeBanner: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white px-5 py-4 rounded-xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
            Sivakasi Direct
          </span>
          <span className="text-[11px] text-slate-400">Diwali Season 2026</span>
        </div>
        <h1 className="text-base font-semibold text-white">ATM Crackers Control Center</h1>
        <p className="text-[12px] text-slate-400 mt-0.5 max-w-lg">
          Online orders, POS billing, warehouse inventory, and dispatch management.
        </p>
      </div>
      <Link
        href="/billing"
        className="btn flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 text-[12px] font-semibold shrink-0"
      >
        <Receipt className="w-3.5 h-3.5" />
        Launch POS
      </Link>
    </div>
  );
};
