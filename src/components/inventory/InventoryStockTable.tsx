"use client";

import React from "react";
import { Product } from "@/data/mock-data";
import { Pagination } from "@/components/ui/Pagination";

interface InventoryStockTableProps {
  products: Product[];
  onAdjust: (productId: string) => void;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number | "all";
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number | "all") => void;
}

export const InventoryStockTable: React.FC<InventoryStockTableProps> = ({
  products,
  onAdjust,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-xs sm:text-sm text-slate-800">
              Current Warehouse Balances
            </h3>
            <p className="text-[11px] text-slate-400">
              Live Sivakasi stock levels and minimum reorder alerts
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {totalCount ?? products.length} Items Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3.5">Cracker Item</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Current Stock</th>
                <th className="py-2.5 px-3">Threshold</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((prod) => {
                const isLow = prod.stockQuantity <= prod.lowStockThreshold;
                return (
                  <tr
                    key={prod.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2.5 px-3.5">
                      <div className="max-w-xs">
                        <div className="font-semibold text-slate-800">
                          {prod.name}
                        </div>
                        {prod.description && (
                          <p
                            className="text-[10px] text-slate-400 line-clamp-1 mt-0.5"
                            title={prod.description}
                          >
                            {prod.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {prod.sku}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">
                        {prod.categoryName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">
                      <span
                        className={
                          isLow
                            ? "text-red-600 font-black"
                            : "text-slate-800 font-bold"
                        }
                      >
                        {prod.stockQuantity}
                      </span>{" "}
                      <span className="font-normal text-[10px] text-slate-400">
                        {prod.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500">
                      {prod.lowStockThreshold}
                    </td>
                    <td className="py-2.5 px-3">
                      {isLow ? (
                        <span className="badge badge-error text-[10px] font-bold">
                          Low Stock
                        </span>
                      ) : (
                        <span className="badge badge-success text-[10px] font-bold">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => onAdjust(prod.id)}
                        className="btn btn-secondary text-xs px-2.5 py-1 rounded-lg cursor-pointer hover:border-red-500 hover:text-red-600 transition"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-400 text-xs"
                  >
                    No inventory items found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {typeof totalCount === "number" &&
        typeof currentPage === "number" &&
        typeof totalPages === "number" &&
        typeof pageSize !== "undefined" &&
        onPageChange &&
        onPageSizeChange && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 20, 50, 100, "all"]}
            itemLabel="cracker items"
          />
        )}
    </div>
  );
};
