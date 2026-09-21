"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { CategoryCard } from "./CategoryCard";
import { CategoryFormModal } from "./CategoryFormModal";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory as apiDeleteCategory,
} from "@/services/category.service";
import type {
  ApiCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";
import { useAdminStore } from "@/context/admin-store";
import {
  Plus,
  Search,
  RefreshCw,
  Layers,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

export const CategoriesView: React.FC = () => {
  const { setCategoriesList } = useAdminStore();
  const syncStoreRef = useRef(setCategoriesList);
  syncStoreRef.current = setCategoriesList;

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch Categories ────────────────────────────────────────────────────────
  const loadCategories = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);

    try {
      const data = await getCategories();
      setCategories(data);

      // Sync to admin-store for dropdowns in other views
      const mapped = data.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        icon: "🎆",
        imageUrl: c.imageUrl,
        sortOrder: c.displayOrder,
        isActive: c.status === "ACTIVE",
      }));
      if (syncStoreRef.current) {
        syncStoreRef.current(mapped);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to load categories. Please check your network.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ─── Modal Handlers ──────────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: ApiCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (
    payload: CreateCategoryPayload | UpdateCategoryPayload
  ) => {
    if (editingCategory) {
      // Edit
      const updated = await updateCategory(
        editingCategory._id,
        payload as UpdateCategoryPayload
      );
      setCategories((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c))
      );
      toast.success(`Category "${updated.name}" updated successfully!`);
    } else {
      // Create
      const created = await createCategory(payload as CreateCategoryPayload);
      setCategories((prev) => [...prev, created]);
      toast.success(`Category "${created.name}" created successfully!`);
    }
    // Background refresh to ensure counts and order are exact
    loadCategories(true);
  };

  // ─── Delete Handler ──────────────────────────────────────────────────────────
  const targetCategoryToDelete = useMemo(() => {
    return categories.find((c) => c._id === deleteTargetId) || null;
  }, [categories, deleteTargetId]);

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await apiDeleteCategory(deleteTargetId);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTargetId));
      toast.success("Category deleted successfully!");
      setDeleteTargetId(null);
      loadCategories(true);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete category. It may have products attached.";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Filtered Categories ─────────────────────────────────────────────────────
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Search
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cat.description &&
          cat.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && cat.status === "ACTIVE") ||
        (statusFilter === "INACTIVE" && cat.status === "INACTIVE");

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

  const activeCount = useMemo(
    () => categories.filter((c) => c.status === "ACTIVE").length,
    [categories]
  );
  const inactiveCount = useMemo(
    () => categories.filter((c) => c.status === "INACTIVE").length,
    [categories]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Categories"
        description="Organize Sivakasi crackers into seasonal collections, series, and sound effect categories."
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadCategories(true)}
              disabled={loading || refreshing}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Refresh categories"
              aria-label="Refresh categories"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin text-red-600" : ""}`}
              />
            </button>
            <button
              onClick={handleOpenCreate}
              className="btn btn-primary text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === "ACTIVE"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("INACTIVE")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === "INACTIVE"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => loadCategories()}
            className="text-xs font-bold text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                <div className="w-16 h-6 bg-slate-200 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-5 bg-slate-200 rounded-full w-14" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800">No categories found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No categories matching "${searchQuery}". Try a different keyword or clear search.`
              : "No categories have been created yet. Click below to add the first category."}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl"
            >
              Add First Category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <CategoryCard
              key={cat._id}
              category={cat}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal (Create or Edit) */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        defaultSortOrder={categories.length + 1}
        onSubmit={handleFormSubmit}
      />

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => {
          if (!isDeleting) setDeleteTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={
          <div>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">
                &ldquo;{targetCategoryToDelete?.name}&rdquo;
              </strong>
              ?
            </p>
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Categories with attached products cannot be deleted. Products must first be reassigned.
            </p>
          </div>
        }
        confirmText="Delete Category"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
