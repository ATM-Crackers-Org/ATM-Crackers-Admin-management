"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { OfferCard } from "./OfferCard";
import { OfferFormModal } from "./OfferFormModal";
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer as apiDeleteOffer,
} from "@/services/offer.service";
import type {
  ApiOffer,
  CreateOfferPayload,
  OfferScope,
  OfferStatus,
  UpdateOfferPayload,
} from "@/types/offer.types";
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  Globe,
  Loader2,
  Package,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  XCircle,
} from "lucide-react";

export const OffersView: React.FC = () => {
  const [offers, setOffers] = useState<ApiOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OfferStatus>("ALL");
  const [scopeFilter, setScopeFilter] = useState<"ALL" | OfferScope>("ALL");

  // Modal & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ApiOffer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Fetch Offers from API ──────────────────────────────────────────────────
  const loadOffers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setErrorMessage(null);

    try {
      const data = await getOffers();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load offers from server.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  // ─── Open Modal for Add / Edit ──────────────────────────────────────────────
  const handleOpenAdd = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: ApiOffer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  // ─── Submit Create or Update (POST /admin/offers or PATCH /admin/offers/{id}) ──
  const handleSubmitModal = async (payload: CreateOfferPayload | UpdateOfferPayload) => {
    setIsSubmitting(true);
    try {
      if (editingOffer) {
        await updateOffer(editingOffer._id, payload);
        toast.success(`Seasonal offer "${payload.name || editingOffer.name}" updated successfully!`);
      } else {
        await createOffer(payload as CreateOfferPayload);
        toast.success(`Seasonal offer "${payload.name}" created successfully!`);
      }
      setIsModalOpen(false);
      setEditingOffer(null);
      await loadOffers(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save offer. Please check your inputs.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Delete Offer (DELETE /admin/offers/{id}) ─────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await apiDeleteOffer(deleteTargetId);
      toast.success("Seasonal offer deleted successfully!");
      setDeleteTargetId(null);
      await loadOffers(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete offer.";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Toggle Active / Inactive Status (PATCH /admin/offers/{id}) ───────────────
  const handleToggleActive = async (offer: ApiOffer) => {
    const newStatus: OfferStatus = offer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActionLoadingId(offer._id);
    try {
      await updateOffer(offer._id, { status: newStatus });
      toast.info(`Offer "${offer.name}" is now ${newStatus}.`);
      await loadOffers(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update offer status.";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── Filtering & Search ────────────────────────────────────────────────────
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.name.toLowerCase().includes(q) ||
        (o.description && o.description.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" || o.status === statusFilter;

      const matchesScope =
        scopeFilter === "ALL" || o.scope === scopeFilter;

      return matchesSearch && matchesStatus && matchesScope;
    });
  }, [offers, searchQuery, statusFilter, scopeFilter]);

  // ─── Metrics / Stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = offers.length;
    const active = offers.filter((o) => o.status === "ACTIVE").length;
    const maxDiscount = offers.reduce(
      (max, o) => Math.max(max, o.discountPercent || 0),
      0
    );
    const globalCount = offers.filter((o) => o.scope === "GLOBAL").length;
    return { total, active, maxDiscount, globalCount };
  }, [offers]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Promotions & Festive Offers"
        description="Publish festival season discount deals, category sales, and product promotional offers."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadOffers(false)}
              disabled={loading || refreshing}
              className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Offers"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing || loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={handleOpenAdd}
              className="btn btn-primary text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Seasonal Offer</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Offers</span>
            <Tag className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600">Active (Live)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-600">Max Discount</span>
            <Percent className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-1">
            {stats.maxDiscount}% OFF
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600">Global Deals</span>
            <Globe className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.globalCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search offers by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-slate-50/50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Live)</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Scope Filter */}
          <select
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-red-500 bg-white font-medium cursor-pointer"
          >
            <option value="ALL">All Scopes</option>
            <option value="GLOBAL">Global (Store-wide)</option>
            <option value="CATEGORY">Category Specific</option>
            <option value="PRODUCT">Product Specific</option>
          </select>

          {(searchQuery || statusFilter !== "ALL" || scopeFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setScopeFilter("ALL");
              }}
              className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Offers Grid / List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          <span className="text-xs font-medium">Loading promotional offers...</span>
        </div>
      ) : errorMessage ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold">Failed to Load Offers</h4>
          <p className="text-xs mt-1 mb-3">{errorMessage}</p>
          <button
            onClick={() => loadOffers(false)}
            className="btn btn-primary text-xs font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {offers.length === 0 ? "No Offers Created Yet" : "No Matching Offers"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {offers.length === 0
              ? "Launch seasonal discounts for Diwali, New Year, or festive celebrations."
              : "Try adjusting your search keywords or filters."}
          </p>
          {offers.length === 0 ? (
            <button
              onClick={handleOpenAdd}
              className="btn btn-primary text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Seasonal Offer</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setScopeFilter("ALL");
              }}
              className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              onEdit={handleOpenEdit}
              onDelete={(id) => setDeleteTargetId(id)}
              onToggleActive={handleToggleActive}
              isActionLoading={actionLoadingId === offer._id}
            />
          ))}
        </div>
      )}

      {/* Offer Form Modal (Create & Edit) */}
      <OfferFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOffer(null);
        }}
        offer={editingOffer}
        onSubmit={handleSubmitModal}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Seasonal Offer"
        message="Are you sure you want to permanently delete this festive offer? This action cannot be undone."
        confirmText="Delete Offer"
        isLoading={isDeleting}
      />
    </div>
  );
};
