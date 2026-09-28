"use client";

import React from "react";
import { Product } from "@/data/mock-data";

interface InventoryStockTableProps {
  products: Product[];
  onAdjust: (productId: string) => void;
}

export const InventoryStockTable: React.FC<InventoryStockTableProps> = ({
  products,
  onAdjust,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-xs sm:text-sm text-slate-800">Current Warehouse Balances</h3>
        <span className="text-[11px] text-slate-400">{products.length} Items Listed</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3">Cracker</th>
              <th className="py-2.5 px-3">SKU</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Current Stock</th>
              <th className="py-2.5 px-3">Threshold</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((prod) => {
              const isLow = prod.stockQuantity <= prod.lowStockThreshold;
              return (
                <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-3 font-semibold text-slate-800">
                    {prod.name}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                    {prod.sku}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-500">
                    {prod.categoryName}
                  </td>
                  <td className="py-2 px-3 font-bold text-slate-800">
                    {prod.stockQuantity} {prod.unit}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-slate-400">
                    {prod.lowStockThreshold}
                  </td>
                  <td className="py-2 px-3">
                    {isLow ? (
                      <span className="badge badge-error text-[10px]">Low Stock</span>
                    ) : (
                      <span className="badge badge-success text-[10px]">In Stock</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => onAdjust(prod.id)}
                      className="btn btn-secondary text-xs px-2 py-0.5 rounded cursor-pointer"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                  No inventory items found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
