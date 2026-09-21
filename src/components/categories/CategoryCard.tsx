"use client";

import React from "react";
import type { ApiCategory } from "@/types/category.types";
import { Edit, Trash2, Layers, Package } from "lucide-react";

interface CategoryCardProps {
  category: ApiCategory;
  onEdit: (category: ApiCategory) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  const isActive = category.status === "ACTIVE";

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Image / Icon + Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Layers className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
              title="Edit Category"
              aria-label={`Edit ${category.name}`}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category._id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              title="Delete Category"
              aria-label={`Delete ${category.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Name & Slug */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
              {category.name}
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-mono">
              #{category.displayOrder}
            </span>
          </div>

          {category.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          )}

          <p className="text-[11px] text-slate-400 font-mono truncate">
            /{category.slug}
          </p>
        </div>
      </div>

      {/* Footer: Products count & Status badge */}
      <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Package className="w-3.5 h-3.5 text-slate-400" />
          <span>{category.productCount ?? 0} Crackers</span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
};
