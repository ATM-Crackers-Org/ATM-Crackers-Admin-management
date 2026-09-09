"use client";

import React from "react";
import { Offer } from "@/data/mock-data";
import { Edit, Trash2 } from "lucide-react";

interface OfferCardProps {
  offer: Offer;
  onEdit: (offer: Offer) => void;
  onDelete: (offerId: string) => void;
  onToggleActive: (offerId: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
      <div className="h-44 relative bg-slate-900 overflow-hidden">
        <img
          src={offer.bannerUrl}
          alt={offer.title}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              {offer.badge}
            </span>
            <div className="flex items-center gap-1 bg-slate-900/70 backdrop-blur-xs p-1 rounded-lg">
              <button
                onClick={() => onEdit(offer)}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
                title="Edit Offer"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(offer.id)}
                className="p-1 text-slate-300 hover:text-red-400 cursor-pointer"
                title="Delete Offer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{offer.title}</h3>
            <p className="text-xs text-slate-200 mt-1">{offer.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block">Offer Discount</span>
          <span className="text-base font-extrabold text-red-600">
            {offer.discountPercent}% OFF
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block">Validity</span>
          <span className="font-semibold text-slate-700">
            {offer.startDate} to {offer.endDate}
          </span>
        </div>
        <button
          onClick={() => onToggleActive(offer.id)}
          className={`badge cursor-pointer ${
            offer.isActive ? "badge-success" : "badge-neutral"
          }`}
        >
          {offer.isActive ? "Live" : "Inactive"}
        </button>
      </div>
    </div>
  );
};
