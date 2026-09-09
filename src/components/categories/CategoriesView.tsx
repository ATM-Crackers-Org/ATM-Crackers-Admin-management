"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Category } from "@/data/mock-data";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { CategoryFormModal, CategoryFormData } from "./CategoryFormModal";

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products } = useAdminStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSubmit = (formData: CategoryFormData) => {
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-");
    if (editingCategory) {
      updateCategory(editingCategory.id, { ...formData, slug });
    } else {
      addCategory({ ...formData, slug });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize crackers into seasonal collections, series, and sound effect categories."
        actions={
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <CategoryCard
              key={cat.id}
              category={cat}
              productCount={productCount}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          );
        })}
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        defaultSortOrder={categories.length + 1}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteCategory(deleteTargetId);
        }}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products in this category may need re-assigning."
      />
    </div>
  );
};
