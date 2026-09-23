"use client";

import React from "react";
import { Search, Filter, Layers, CheckCircle2, PackageCheck } from "lucide-react";
import type { ProductStatus, StockStatus } from "@/types/product.types";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  statusFilter: "ALL" | ProductStatus;
  onStatusFilterChange: (value: "ALL" | ProductStatus) => void;
  stockStatusFilter: "ALL" | StockStatus;
  onStockStatusFilterChange: (value: "ALL" | StockStatus) => void;
  categories: CategoryOption[];
  totalProductsCount: number;
}

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  onStatusFilterChange,
  stockStatusFilter,
  onStockStatusFilterChange,
  categories,
  totalProductsCount,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, slug, description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
          >
            <option value="all">All Categories ({totalProductsCount})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <CheckCircle2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as "ALL" | ProductStatus)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="relative">
          <PackageCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={stockStatusFilter}
            onChange={(e) => onStockStatusFilterChange(e.target.value as "ALL" | StockStatus)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none cursor-pointer"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="in_stock">In Stock</option>
            <option value="limited">Limited Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>
    </div>
  );
};
