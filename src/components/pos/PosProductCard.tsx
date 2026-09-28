"use client";

import React from "react";
import { Product } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface POSProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  cartQuantity: number; // 0 = not in cart
}

export function POSProductCard({
  product,
  onAddToCart,
  onUpdateQuantity,
  cartQuantity,
}: POSProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;
  const inCart = cartQuantity > 0;

  return (
    <div
      className={`rounded-xl border flex flex-col select-none overflow-hidden transition-all ${
        isOutOfStock
          ? "bg-slate-100 border-slate-200 opacity-50"
          : inCart
          ? "bg-white border-red-400 shadow-md ring-1 ring-red-200"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer"
      }`}
      onClick={() => !isOutOfStock && !inCart && onAddToCart(product)}
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {/* Stock badge */}
        <span
          className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
            isOutOfStock ? "bg-red-600 text-white" : "bg-black/60 text-white"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : `${product.stockQuantity} left`}
        </span>
        {/* In-cart indicator */}
        {inCart && (
          <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            ✓ In Cart
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-2 flex flex-col gap-1 flex-1">
        <h4 className="font-semibold text-[11px] sm:text-xs text-slate-800 line-clamp-2 leading-tight">
          {product.name}
        </h4>
        <p className="text-[9px] text-slate-400 font-mono truncate">{product.sku}</p>

        {/* Price + Action */}
        <div className="mt-auto pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
          <div>
            <span className="font-bold text-xs text-red-600">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[9px] text-slate-400 line-through block leading-none">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Show stepper if in cart, else show + button */}
          {inCart ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, -1)}
                className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors font-bold"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-slate-900 w-5 text-center">
                {cartQuantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(product.id, 1)}
                disabled={cartQuantity >= product.stockQuantity}
                className="w-6 h-6 rounded-md bg-red-600 text-white hover:bg-red-700 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) onAddToCart(product);
              }}
              className="w-6 h-6 rounded-md bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Add to cart"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
