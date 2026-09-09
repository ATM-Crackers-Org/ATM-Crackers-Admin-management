"use client";

import React from "react";
import { formatINR } from "@/lib/utils";

interface ReportSummaryCardsProps {
  totalRevenue: number;
  totalOrdersCount: number;
  avgOrderValue: number;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  totalRevenue,
  totalOrdersCount,
  avgOrderValue,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-400 uppercase">
          Gross Booking Revenue
        </span>
        <div className="text-2xl font-bold text-slate-800 mt-1">
          {formatINR(totalRevenue)}
        </div>
        <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
          +24.5% vs 2025
        </span>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-400 uppercase">
          Total Orders Fulfilled
        </span>
        <div className="text-2xl font-bold text-slate-800 mt-1">
          {totalOrdersCount}
        </div>
        <span className="text-xs text-slate-500 font-medium mt-1 inline-block">
          Online & POS combined
        </span>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-400 uppercase">
          Average Order Value (AOV)
        </span>
        <div className="text-2xl font-bold text-slate-800 mt-1">
          {formatINR(avgOrderValue)}
        </div>
        <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
          Healthy basket size
        </span>
      </div>
    </div>
  );
};
