"use client";

import React from "react";
import type { ApiOffer } from "@/types/offer.types";
import {
  Calendar,
  Clock,
  Edit2,
  Globe,
  Layers,
  Loader2,
  Package,
  Percent,
  Sparkles,
  Trash2,
} from "lucide-react";

interface OfferCardProps {
  offer: ApiOffer;
  onEdit: (offer: ApiOffer) => void;
  onDelete: (offerId: string) => void;
  onToggleActive: (offer: ApiOffer) => void;
  isActionLoading?: boolean;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onEdit,
  onDelete,
  onToggleActive,
  isActionLoading = false,
}) => {
  const isActive = offer.status === "ACTIVE";

  const startDateStr = offer.startAt
    ? new Date(offer.startAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Immediate";

  const endDateStr = offer.expiresAt
    ? new Date(offer.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No Expiry";

  // Check if expired
  const isExpired = offer.expiresAt
    ? new Date(offer.expiresAt).getTime() < Date.now()
    : false;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Top Banner Header with Festive Gradient */}
      <div className="p-4 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-lg pointer-events-none" />

        <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30 text-white">
              <Sparkles className="w-3 h-3 text-amber-200" />
              Festive Deal
            </span>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-full text-white/95">
              {offer.scope === "GLOBAL" && <Globe className="w-3 h-3" />}
              {offer.scope === "CATEGORY" && <Layers className="w-3 h-3" />}
              {offer.scope === "PRODUCT" && <Package className="w-3 h-3" />}
              <span>
                {offer.scope === "GLOBAL"
                  ? "Global"
                  : offer.scope === "CATEGORY"
                  ? "Category"
                  : "Product"}
              </span>
            </span>
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => onEdit(offer)}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors cursor-pointer"
              title="Edit Offer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(offer._id)}
              className="p-1.5 text-white/80 hover:text-red-200 hover:bg-red-500/40 rounded-md transition-colors cursor-pointer"
              title="Delete Offer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div className="relative z-10 mt-1">
          <h3 className="text-base font-black tracking-tight text-white line-clamp-1 drop-shadow-xs">
            {offer.name}
          </h3>
          <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
            {offer.description || "Seasonal festival crackers celebration discount"}
          </p>
        </div>
      </div>

      {/* Details Body */}
      <div className="p-3.5 space-y-3 bg-white flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-black shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">
                Seasonal Discount
              </span>
              <span className="text-lg font-black text-red-600 leading-none">
                {offer.discountPercent}% OFF
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3 text-slate-400" />
              Duration
            </span>
            <span className="text-[11px] font-bold text-slate-700">
              {startDateStr} - {endDateStr}
            </span>
          </div>
        </div>

        {/* Target Details if Category or Product */}
        {offer.scope !== "GLOBAL" && (
          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="font-medium text-slate-500">Target Items:</span>
            <span className="font-bold text-slate-800">
              {offer.scope === "CATEGORY"
                ? `${offer.categoryIds?.length || 0} Categories Selected`
                : `${offer.productIds?.length || 0} Products Selected`}
            </span>
          </div>
        )}

        {/* Footer with Toggle Active button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {isExpired && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Expired
              </span>
            )}
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ID: {offer._id.slice(-6)}
            </span>
          </div>

          <button
            onClick={() => onToggleActive(offer)}
            disabled={isActionLoading}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
            }`}
            title="Click to toggle status"
          >
            {isActionLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
            )}
            <span>{isActive ? "Active (Live)" : "Inactive"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
