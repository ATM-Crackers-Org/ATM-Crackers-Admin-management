"use client";

import React from "react";
import { Category } from "@/data/mock-data";
import { Edit, Trash2 } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  productCount: number;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  productCount,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-xl shadow-xs">
            {category.icon}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Edit Category"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-base text-slate-800">{category.name}</h3>
        {category.nameTamil && (
          <p className="text-xs text-slate-400 mt-0.5">{category.nameTamil}</p>
        )}
        <p className="text-xs text-slate-400 font-mono mt-2">slug: {category.slug}</p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{productCount} Crackers</span>
        <span className={`badge ${category.isActive ? "badge-success" : "badge-neutral"}`}>
          {category.isActive ? "Active" : "Hidden"}
        </span>
      </div>
    </div>
  );
};
