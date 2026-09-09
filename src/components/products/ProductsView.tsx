"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Product } from "@/data/mock-data";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Plus } from "lucide-react";
import { ProductFilterBar } from "./ProductFilterBar";
import { ProductTable } from "./ProductTable";
import { ProductFormModal, ProductFormData } from "./ProductFormModal";

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured,
  } = useAdminStore();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal and action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData: ProductFormData) => {
    const selectedCat = categories.find((c) => c.id === formData.categoryId);
    const categoryName = selectedCat ? selectedCat.name : "General";

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        categoryName,
      });
    } else {
      addProduct({
        ...formData,
        categoryName,
      });
    }
    setIsModalOpen(false);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameTamil && p.nameTamil.includes(search));
    const matchesCat = categoryFilter === "all" || p.categoryId === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Crackers Catalog"
        description="Manage Sivakasi cracker listings, pricing, retail discounts, and stock thresholds."
        actions={
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Cracker</span>
          </button>
        }
      />

      {/* Filter Bar */}
      <ProductFilterBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categories}
        totalProductsCount={products.length}
      />

      {/* Products Table */}
      <ProductTable
        products={filteredProducts}
        onToggleActive={toggleProductActive}
        onToggleFeatured={toggleProductFeatured}
        onEdit={handleOpenEdit}
        onDelete={(id) => setDeleteTargetId(id)}
      />

      {/* Add/Edit Product Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) deleteProduct(deleteTargetId);
        }}
        title="Delete Cracker Listing"
        message="Are you sure you want to delete this cracker? This action cannot be undone."
      />
    </div>
  );
};
