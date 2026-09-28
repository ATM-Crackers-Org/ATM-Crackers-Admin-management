"use client";

import React from "react";
import { Product, Category } from "@/data/mock-data";
import { POSProductCard } from "./PosProductCard";
import { Search, LayoutGrid } from "lucide-react";

interface POSCatalogGridProps {
  products: Product[];
  categories: Category[];
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  cartMap: Record<string, number>;
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
  onUpdateQuantity,
  cartMap,
  totalProductsCount,
}: POSCatalogGridProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Top Search Bar */}
      <div className="px-3 py-2.5 border-b border-slate-100 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Body: Category Sidebar + Product Grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Vertical Category Sidebar */}
        <div className="w-24 shrink-0 border-r border-slate-100 overflow-y-auto flex flex-col bg-slate-50/50">
          {/* All Items */}
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`w-full flex flex-col items-center gap-1 py-3 px-1 text-center transition-colors border-b border-slate-100 cursor-pointer ${
              selectedCategory === "all"
                ? "bg-red-600 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-semibold leading-tight">All</span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
              selectedCategory === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              {totalProductsCount}
            </span>
          </button>

          {/* Category Buttons */}
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            const count = products.filter(
              (p) => p.categoryId === c.id || p.categoryName === c.name
            ).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCategoryChange(c.id)}
                className={`w-full flex flex-col items-center gap-1 py-3 px-1 text-center transition-colors border-b border-slate-100 cursor-pointer ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <span className="text-base leading-none">{c.icon}</span>
                <span className="text-[9px] font-semibold leading-tight line-clamp-2">
                  {c.name}
                </span>
                {count > 0 && (
                  <span
                    className={`text-[8px] font-bold px-1 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Product Grid */}
        <div className="flex-1 overflow-y-auto p-2.5">
          {products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Search className="w-8 h-8 text-slate-300" />
              <span>No crackers found. Try another keyword.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
              {products.map((prod) => (
                <POSProductCard
                  key={prod.id}
                  product={prod}
                  onAddToCart={onAddToCart}
                  onUpdateQuantity={onUpdateQuantity}
                  cartQuantity={cartMap[prod.id] ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
