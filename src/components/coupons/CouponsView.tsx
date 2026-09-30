"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CouponCard } from "./CouponCard";
import { CouponFormModal } from "./CouponFormModal";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon as apiDeleteCoupon,
} from "@/services/coupon.service";
import type {
  ApiCoupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/coupon.types";
import { useAdminStore } from "@/context/admin-store";
import {
  Plus,
  Search,
  RefreshCw,
  Tag,
  AlertCircle,
  Percent,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react";

export const CouponsView: React.FC = () => {
  const { setCouponsList } = useAdminStore();
  const syncStoreRef = useRef(setCouponsList);
  syncStoreRef.current = setCouponsList;

  const [coupons, setCoupons] = useState<ApiCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "FIXED_AMOUNT" | "PERCENTAGE">("ALL");

  // Modal & Actions State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<ApiCoupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch Coupons from API ────────────────────────────────────────────────
  const loadCoupons = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);

    try {
      const data = await getCoupons();
      setCoupons(data);

      // Sync to admin-store for POS billing checkout validation
      if (syncStoreRef.current) {
        syncStoreRef.current(
          data.map((c) => ({
            id: c._id,
            code: c.code,
            description: c.description || "",
            discountType: c.discountType === "FIXED_AMOUNT" ? "FLAT" : "PERCENTAGE",
            discountValue: c.discountValue,
            minOrderValue: c.minimumOrderValue || 0,
            maxDiscount: c.maximumDiscount || undefined,
            expiryDate: c.expiresAt ? c.expiresAt.split("T")[0] : "",
            usageLimit: c.usageLimit || 0,
            usageCount: c.usedCount || 0,
            isActive: c.status === "ACTIVE",
          }))
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load coupons from server.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // ─── Create or Update Coupon ───────────────────────────────────────────────
  const handleSubmitModal = async (payload: CreateCouponPayload | UpdateCouponPayload) => {
    setIsSubmitting(true);
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon._id, payload);
        toast.success(`Coupon ${payload.code || editingCoupon.code} updated successfully!`);
      } else {
        await createCoupon(payload as CreateCouponPayload);
        toast.success(`Coupon ${payload.code} created successfully!`);
      }
      setIsModalOpen(false);
      setEditingCoupon(null);
      await loadCoupons(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save coupon. Please check your inputs.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete Coupon ─────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await apiDeleteCoupon(deleteTargetId);
      toast.success("Coupon deleted successfully!");
      setDeleteTargetId(null);
      await loadCoupons(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Cannot delete this coupon (it may have already been used by customers).";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Toggle Active / Inactive Status ───────────────────────────────────────
  const handleToggleActive = async (coup: ApiCoupon) => {
    const newStatus = coup.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActionLoadingId(coup._id);
    try {
      await updateCoupon(coup._id, { status: newStatus });
      toast.info(`Coupon ${coup.code} is now ${newStatus}.`);
      await loadCoupons(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to toggle coupon status.";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── Filtering & Search ────────────────────────────────────────────────────
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      // Status
      const matchesStatus =
        statusFilter === "ALL" || c.status === statusFilter;

      // Discount Type
      const matchesType =
        typeFilter === "ALL" || c.discountType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coupons, searchQuery, statusFilter, typeFilter]);

  // Statistics
  const activeCount = coupons.filter((c) => c.status === "ACTIVE").length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Discount Coupons & Vouchers"
        description="Create and manage promotion vouchers for POS billing counter and online checkout discounts."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadCoupons(true)}
              disabled={refreshing || loading}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
              title="Refresh coupons"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingCoupon(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Coupons</span>
            <span className="text-base font-bold text-slate-900">{coupons.length}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Active Coupons</span>
            <span className="text-base font-bold text-emerald-700">{activeCount}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Total Redemptions</span>
            <span className="text-base font-bold text-slate-900">{totalRedemptions}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Disabled</span>
            <span className="text-base font-bold text-slate-700">{coupons.length - activeCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-red-500 bg-white font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-red-500 bg-white font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="FIXED_AMOUNT">Flat Amount (₹)</option>
            <option value="PERCENTAGE">Percentage (%)</option>
          </select>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => loadCoupons()}
              className="font-semibold underline ml-3 hover:text-red-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 h-48">
              <div className="flex justify-between">
                <div className="h-6 w-28 bg-slate-200 rounded-lg" />
                <div className="h-6 w-16 bg-slate-200 rounded-lg" />
              </div>
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-52 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filteredCoupons.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">No coupons found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "ALL" || typeFilter !== "ALL"
                ? "No coupons match the current search filter criteria. Try resetting the filters."
                : "No promotional coupons exist yet. Create your first discount voucher for festive fireworks sales!"}
            </p>
          </div>
          {(searchQuery || statusFilter !== "ALL" || typeFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setTypeFilter("ALL");
              }}
              className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        /* Coupons Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCoupons.map((c) => (
            <CouponCard
              key={c._id}
              coupon={c}
              onEdit={(coup) => {
                setEditingCoupon(coup);
                setIsModalOpen(true);
              }}
              onDelete={(id) => setDeleteTargetId(id)}
              onToggleActive={handleToggleActive}
              isActionLoading={actionLoadingId === c._id}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
        }}
        coupon={editingCoupon}
        onSubmit={handleSubmitModal}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Discount Coupon"
        message="Are you sure you want to delete this coupon? If customers have already used this coupon in existing orders, backend policy may prevent its deletion."
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
      />
    </div>
  );
};
