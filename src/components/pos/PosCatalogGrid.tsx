"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product, Category } from "@/data/mock-data";
import { POSProductCard } from "./PosProductCard";
import { Search, LayoutGrid, RefreshCw } from "lucide-react";

interface POSCatalogGridProps {
  products: Product[];
  categories: Category[];
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (catId: string) => void;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onSetQuantity: (productId: string, qty: number) => void;
  cartMap: Record<string, number>;
  totalProductsCount: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
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
  onSetQuantity,
  cartMap,
  totalProductsCount,
  onRefresh,
  isRefreshing,
}: POSCatalogGridProps) {
  const PAGE_SIZE = 16;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset to initial 16 whenever category filter or search query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedCategory, search]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      if (visibleCount < products.length) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, products.length));
      }
    }
  };

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Top Search Bar with Refresh */}
      <div className="px-3 py-2.5 border-b border-slate-100 shrink-0 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crackers by name or SKU..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
          />
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
            title="Refresh Live Catalog from API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-600" : ""}`} />
          </button>
        )}
      </div>

      {/* Body: Category Sidebar + Product Grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Vertical Category Sidebar */}
        <div className="w-24 shrink-0 border-r border-slate-100 overflow-y-auto flex flex-col bg-slate-50/50">
          {/* All Items */}
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={`w-full flex flex-col items-center gap-1.5 py-3 px-1 text-center transition-colors border-b border-slate-100 cursor-pointer ${
              selectedCategory === "all"
                ? "bg-red-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold uppercase leading-tight">All</span>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                selectedCategory === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {totalProductsCount}
            </span>
          </button>

          {/* Category Buttons */}
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            const count = products.filter(
              (p) =>
                p.categoryId === c.id ||
                p.categoryName?.trim().toLowerCase() === c.name?.trim().toLowerCase()
            ).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onCategoryChange(c.id)}
                className={`w-full flex flex-col items-center gap-1.5 py-2.5 px-1.5 text-center transition-colors border-b border-slate-100 cursor-pointer ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center text-xs shrink-0 ${
                    isActive ? "bg-white/20" : "bg-slate-200/80"
                  }`}
                >
                  {c.icon || "💥"}
                </div>
                <span className="text-[9px] font-bold uppercase leading-tight line-clamp-2">
                  {c.name}
                </span>
                {count > 0 && (
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Product Grid with Infinite Scroll & Load More */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-2.5 flex flex-col"
        >
          {products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-2 py-12">
              <Search className="w-8 h-8 text-slate-300" />
              <span>No crackers found. Try another keyword.</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                {visibleProducts.map((prod) => (
                  <POSProductCard
                    key={prod.id}
                    product={prod}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                    onSetQuantity={onSetQuantity}
                    cartQuantity={cartMap[prod.id] ?? 0}
                  />
                ))}
              </div>

              {/* Load More & Infinite Scroll Indicator */}
              {hasMore ? (
                <div className="py-4 text-center mt-3 flex flex-col items-center gap-1.5 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, products.length))
                    }
                    className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-red-400 hover:text-red-600 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <span>Load More Crackers</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                      +{Math.min(PAGE_SIZE, products.length - visibleCount)}
                    </span>
                  </button>
                  <p className="text-[10px] text-slate-400">
                    Showing {visibleProducts.length} of {products.length} products · Scroll down to load automatically
                  </p>
                </div>
              ) : products.length > PAGE_SIZE ? (
                <div className="py-3 text-center mt-3 border-t border-slate-100 shrink-0">
                  <span className="text-[10px] text-slate-400 font-medium">
                    All {products.length} products loaded
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
