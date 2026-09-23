"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ProductFilterBar } from "./ProductFilterBar";
import { ProductTable } from "./ProductTable";
import { ProductFormModal } from "./ProductFormModal";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct as apiDeleteProduct,
} from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import type {
  ApiProduct,
  CreateProductPayload,
  UpdateProductPayload,
  ProductStatus,
  StockStatus,
} from "@/types/product.types";
import { useAdminStore } from "@/context/admin-store";
import type { Product } from "@/data/mock-data";
import { Plus, RefreshCw, AlertCircle, Package } from "lucide-react";

export const ProductsView: React.FC = () => {
  const { setProductsList, categories: storeCategories } = useAdminStore();
  const syncStoreRef = useRef(setProductsList);
  syncStoreRef.current = setProductsList;

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ProductStatus>("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState<"ALL" | StockStatus>("ALL");

  // Modal & Action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch Categories for Dropdown ──────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      const mapped = data.map((c) => ({
        id: c._id,
        name: c.name,
      }));
      setCategoriesList(mapped);
    } catch {
      // Fallback to store categories if direct fetch fails
      if (storeCategories && storeCategories.length > 0) {
        setCategoriesList(
          storeCategories.map((c) => ({ id: c.id, name: c.name }))
        );
      }
    }
  }, [storeCategories]);

  // ─── Fetch Products ─────────────────────────────────────────────────────────
  const loadProducts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);

    try {
      const data = await getProducts();
      setProducts(data);

      // Sync to admin-store for POS Billing and Inventory modules
      const mappedForStore: Product[] = data.map((p) => {
        const catId =
          typeof p.category === "object" && p.category
            ? p.category._id
            : typeof p.category === "string"
            ? p.category
            : "";
        const catName =
          typeof p.category === "object" && p.category
            ? p.category.name
            : "General";

        const sellingPrice =
          p.sellingPrice ??
          Math.round(p.mrp * (1 - (p.discountPercent || 0) / 100));

        return {
          id: p._id || p.id || "",
          name: p.name,
          sku: p.slug || (p._id ? p._id.slice(-6).toUpperCase() : "CRK-001"),
          price: sellingPrice,
          originalPrice: p.mrp,
          stockQuantity:
            p.stockStatus === "out_of_stock"
              ? 0
              : p.stockStatus === "limited"
              ? 10
              : 100,
          lowStockThreshold: 20,
          categoryId: catId,
          categoryName: catName,
          unit: "1 Box",
          description: p.description || "",
          imageUrl:
            Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "https://placehold.co/600x600/F5A623/111827?text=ATM+Crackers",
          isActive: p.status === "ACTIVE",
          isFeatured: false,
          createdAt: p.createdAt || new Date().toISOString(),
        };
      });

      if (syncStoreRef.current) {
        syncStoreRef.current(mappedForStore);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load products. Please check your network connection.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [loadCategories, loadProducts]);

  // ─── Modal Handlers ─────────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ApiProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (
    payload: CreateProductPayload | UpdateProductPayload
  ) => {
    if (editingProduct) {
      const id = editingProduct._id || editingProduct.id || "";
      const updated = await updateProduct(id, payload as UpdateProductPayload);
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === (updated._id || updated.id) ? updated : p))
      );
      toast.success(`Product "${updated.name}" updated successfully!`);
    } else {
      const created = await createProduct(payload as CreateProductPayload);
      setProducts((prev) => [created, ...prev]);
      toast.success(`Product "${created.name}" created successfully!`);
    }
    // Background refresh to ensure relations & server calculated values are exact
    loadProducts(true);
  };

  // ─── Status Toggle ──────────────────────────────────────────────────────────
  const handleToggleActive = async (product: ApiProduct) => {
    const id = product._id || product.id || "";
    const nextStatus: ProductStatus =
      product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      const updated = await updateProduct(id, { status: nextStatus });
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === id ? updated : p))
      );
      toast.info(`Product is now ${nextStatus}`);
      loadProducts(true);
    } catch (err: any) {
      toast.error("Failed to update status.");
    }
  };

  // ─── Delete Handler ─────────────────────────────────────────────────────────
  const targetProductToDelete = useMemo(() => {
    return products.find((p) => (p._id || p.id) === deleteTargetId) || null;
  }, [products, deleteTargetId]);

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await apiDeleteProduct(deleteTargetId);
      setProducts((prev) =>
        prev.filter((p) => (p._id || p.id) !== deleteTargetId)
      );
      toast.success("Cracker deleted successfully!");
      setDeleteTargetId(null);
      loadProducts(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete cracker. It may be referenced by orders.";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Client Filter ──────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        (prod.slug && prod.slug.toLowerCase().includes(q)) ||
        (prod.description && prod.description.toLowerCase().includes(q));

      // Category
      const prodCatId =
        typeof prod.category === "object" && prod.category
          ? prod.category._id
          : typeof prod.category === "string"
          ? prod.category
          : "";
      const matchesCategory =
        categoryFilter === "all" || prodCatId === categoryFilter;

      // Status
      const matchesStatus =
        statusFilter === "ALL" || prod.status === statusFilter;

      // Stock Status
      const matchesStockStatus =
        stockStatusFilter === "ALL" || prod.stockStatus === stockStatusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesStockStatus
      );
    });
  }, [products, search, categoryFilter, statusFilter, stockStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Crackers Catalog"
        description="Manage Sivakasi cracker listings, pricing, retail discounts, stock levels, and store visibility."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadProducts(false)}
              disabled={loading || refreshing}
              className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh Products"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin text-red-600" : ""}`}
              />
            </button>
            <button
              onClick={handleOpenAdd}
              className="btn btn-primary text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Cracker</span>
            </button>
          </div>
        }
      />

      {/* Error Notice */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200/80 text-red-700 p-4 rounded-2xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => loadProducts(false)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <ProductFilterBar
        search={search}
        onSearchChange={setSearch}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        stockStatusFilter={stockStatusFilter}
        onStockStatusFilterChange={setStockStatusFilter}
        categories={categoriesList}
        totalProductsCount={products.length}
      />

      {/* Main Table or Loading Skeleton */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="h-5 w-40 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-5 w-24 bg-slate-200 rounded-lg animate-pulse" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-1/5 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onToggleActive={handleToggleActive}
          onEdit={handleOpenEdit}
          onDelete={(id) => setDeleteTargetId(id)}
        />
      )}

      {/* Add / Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        categories={categoriesList}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Cracker Listing"
        variant="danger"
        confirmText="Delete Cracker"
        isLoading={isDeleting}
        message={
          <div>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900">
                &ldquo;{targetProductToDelete?.name || "this cracker"}&rdquo;
              </strong>
              ?
            </p>
            <p className="text-xs text-red-600 font-medium mt-2">
              Warning: This product will be deleted from the database. If this
              product is referenced in existing customer orders, the server will
              prevent its deletion to protect order history integrity.
            </p>
          </div>
        }
      />
    </div>
  );
};
