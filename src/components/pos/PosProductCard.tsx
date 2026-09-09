"use client";

import React from "react";
import { Product } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import { Plus } from "lucide-react";

interface POSProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function POSProductCard({ product, onAddToCart }: POSProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div
      onClick={() => !isOutOfStock && onAddToCart(product)}
      className={`p-2.5 sm:p-3 rounded-2xl border transition-all flex flex-col justify-between select-none h-fit ${
        isOutOfStock
          ? "bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed"
          : "bg-white border-slate-200/80 hover:border-red-400 hover:shadow-md cursor-pointer active:scale-98"
      }`}
    >
      <div>
        <div className="h-20 sm:h-24 w-full rounded-xl bg-slate-100 mb-2 overflow-hidden relative shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <span
            className={`absolute bottom-1 right-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isOutOfStock ? "bg-red-600 text-white" : "bg-slate-900/80 text-white"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : `${product.stockQuantity} left`}
          </span>
        </div>
        <h4 className="font-semibold text-xs text-slate-800 line-clamp-2 leading-tight min-h-[1.8rem]">
          {product.name}
        </h4>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>{product.sku}</span>
          <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
            {product.unit}
          </span>
        </div>
      </div>

      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="font-bold text-xs sm:text-sm text-red-600">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-[10px] text-slate-400 line-through block leading-none">
              {formatINR(product.originalPrice)}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={isOutOfStock}
          className="w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer"
          aria-label="Add to cart"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
