"use client";

import React from "react";
import { formatINR } from "@/lib/utils";
import { Product } from "@/data/mock-data";

interface InventorySummaryCardsProps {
  products: Product[];
  lowStockCount: number;
}

export const InventorySummaryCards: React.FC<InventorySummaryCardsProps> = ({
  products,
  lowStockCount,
}) => {
  const totalUnits = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalValue = products.reduce((acc, p) => acc + p.stockQuantity * p.price, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-400 uppercase">
          Total Inventory Units
        </span>
        <div className="text-2xl font-bold text-slate-800 mt-1">
          {totalUnits} Units
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-400 uppercase">
          Low Stock Alerts
        </span>
        <div
          className={`text-2xl font-bold mt-1 ${
            lowStockCount > 0 ? "text-red-600" : "text-emerald-600"
          }`}
        >
          {lowStockCount} Products
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-400 uppercase">
          Estimated Stock Asset Value
        </span>
        <div className="text-2xl font-bold text-slate-800 mt-1">
          {formatINR(totalValue)}
        </div>
      </div>
    </div>
  );
};
