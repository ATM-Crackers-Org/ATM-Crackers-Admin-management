"use client";

import React from "react";
import { Product, Category } from "@/data/mock-data";
import { POSProductCard } from "./PosProductCard";
import { Receipt, Search } from "lucide-react";

interface POSCatalogGridProps {
  products: Product[];
  categories: Category[];
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  onAddToCart: (product: Product) => void;
  totalProductsCount: number;
}

export function POSCatalogGrid({
  products,
  categories,
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  totalProductsCount,
}: POSCatalogGridProps) {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Top Filter Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-600" />
            <span>POS Billing Counter</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Direct Sivakasi Retail POS
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick search cracker by name or SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-red-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Items ({totalProductsCount})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onCategoryChange(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start auto-rows-max">
        {products.map((prod) => (
          <POSProductCard
            key={prod.id}
            product={prod}
            onAddToCart={onAddToCart}
          />
        ))}

        {products.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No crackers match your search query. Try another keyword.
          </div>
        )}
      </div>
    </div>
  );
}
