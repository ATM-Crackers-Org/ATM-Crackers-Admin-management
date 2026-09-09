"use client";

import React from "react";
import Link from "next/link";
import { Receipt } from "lucide-react";

export const DashboardWelcomeBanner: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white p-6 rounded-3xl shadow-lg shadow-red-900/15">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
            Sivakasi Direct
          </span>
          <span className="text-xs text-red-100 font-medium">Diwali Season 2026</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold">ATM Crackers Control Center</h1>
        <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-xl">
          Real-time administrative operations for online bookings, retail POS billing, warehouse inventory, and orders dispatch.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/billing"
          className="btn bg-white text-red-700 hover:bg-red-50 text-sm font-semibold shadow-md shrink-0 flex items-center gap-2 rounded-xl"
        >
          <Receipt className="w-4 h-4" />
          <span>Launch POS Terminal</span>
        </Link>
      </div>
    </div>
  );
};
