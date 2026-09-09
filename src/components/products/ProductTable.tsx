"use client";

import React from "react";
import { Product } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import { AlertTriangle, Sparkles, Edit, Trash2 } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onToggleActive: (id: string) => void;
  onToggleFeatured: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onToggleActive,
  onToggleFeatured,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4">Cracker Details</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price (Offer / MRP)</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">Active</th>
              <th className="py-3.5 px-4">Featured</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((prod) => {
              const isLowStock = prod.stockQuantity <= prod.lowStockThreshold;
              return (
                <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-xs shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-800 leading-snug">
                          {prod.name}
                        </div>
                        {prod.nameTamil && (
                          <div className="text-xs text-slate-400">{prod.nameTamil}</div>
                        )}
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          SKU: {prod.sku} • {prod.unit}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                    {prod.categoryName}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-red-600">{formatINR(prod.price)}</div>
                    {prod.originalPrice > prod.price && (
                      <div className="text-xs text-slate-400 line-through">
                        {formatINR(prod.originalPrice)}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-semibold ${
                          isLowStock ? "text-red-600" : "text-slate-800"
                        }`}
                      >
                        {prod.stockQuantity}
                      </span>
                      {isLowStock && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Low
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onToggleActive(prod.id)}
                      className="cursor-pointer text-slate-600 hover:text-slate-900 transition-colors"
                      title="Toggle Active Status"
                    >
                      {prod.isActive ? (
                        <span className="badge badge-success text-[10px]">Active</span>
                      ) : (
                        <span className="badge badge-neutral text-[10px]">Inactive</span>
                      )}
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => onToggleFeatured(prod.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        prod.isFeatured
                          ? "bg-amber-50 text-amber-500"
                          : "text-slate-300 hover:text-amber-400"
                      }`}
                      title="Toggle Featured on Storefront"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(prod)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Cracker"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(prod.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Cracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                  No crackers found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
