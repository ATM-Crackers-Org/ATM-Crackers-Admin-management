"use client";

import React from "react";
import type { ApiProduct } from "@/types/product.types";
import { formatINR } from "@/lib/utils";
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Package,
  Layers,
  ArrowUpDown,
} from "lucide-react";

interface ProductTableProps {
  products: ApiProduct[];
  onToggleActive: (product: ApiProduct) => void;
  onEdit: (product: ApiProduct) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onToggleActive,
  onEdit,
  onDelete,
}) => {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Package className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Crackers Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No crackers match your search or filter criteria. Try adjusting your query or add a new cracker listing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4">Cracker Details</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Pricing & Discount</th>
              <th className="py-3.5 px-4">Stock Status</th>
              <th className="py-3.5 px-4">Display Order</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((prod) => {
              const productId = prod._id || prod.id || "";
              const primaryImage =
                Array.isArray(prod.images) && prod.images.length > 0
                  ? prod.images[0]
                  : "https://placehold.co/600x600/F5A623/111827?text=ATM+Crackers";

              const categoryName =
                typeof prod.category === "object" && prod.category
                  ? prod.category.name
                  : typeof prod.category === "string"
                  ? prod.category
                  : "General";

              const sellingPrice =
                prod.sellingPrice ??
                Math.round(prod.mrp * (1 - (prod.discountPercent || 0) / 100));

              const isDiscounted =
                prod.discountPercent > 0 && prod.mrp > sellingPrice;

              return (
                <tr
                  key={productId}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Cracker Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border border-slate-200/80 overflow-hidden bg-slate-100 shrink-0 shadow-xs">
                        <img
                          src={primaryImage}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/600x600/F5A623/111827?text=ATM+Crackers";
                          }}
                        />
                      </div>
                      <div className="min-w-0 max-w-xs sm:max-w-sm">
                        <div className="font-semibold text-slate-800 leading-snug truncate">
                          {prod.name}
                        </div>
                        {prod.slug && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                            /{prod.slug}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[140px]">
                        {categoryName}
                      </span>
                    </span>
                  </td>

                  {/* Pricing */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {formatINR(sellingPrice)}
                      </span>
                      {isDiscounted && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatINR(prod.mrp)}
                        </span>
                      )}
                    </div>
                    {isDiscounted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                        {prod.discountPercent}% OFF
                      </span>
                    )}
                  </td>

                  {/* Stock Status */}
                  <td className="py-3.5 px-4">
                    {prod.stockStatus === "in_stock" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        In Stock
                      </span>
                    )}
                    {prod.stockStatus === "limited" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Limited Stock
                      </span>
                    )}
                    {prod.stockStatus === "out_of_stock" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Out of Stock
                      </span>
                    )}
                  </td>

                  {/* Display Order */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                    #{prod.displayOrder ?? 0}
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleActive(prod)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                      title="Click to toggle status"
                    >
                      {prod.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(prod)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Cracker"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(productId)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Cracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
