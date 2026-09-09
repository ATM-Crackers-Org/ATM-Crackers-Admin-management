"use client";

import React from "react";
import { Banner } from "@/data/mock-data";
import { Edit, Trash2 } from "lucide-react";

interface BannerCardProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (bannerId: string) => void;
  onToggleActive: (bannerId: string) => void;
}

export const BannerCard: React.FC<BannerCardProps> = ({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
      <div className="h-44 relative bg-slate-900">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-5 flex flex-col justify-between">
          <div className="flex justify-end gap-1">
            <button
              onClick={() => onEdit(banner)}
              className="p-1.5 bg-slate-900/80 rounded-lg text-slate-300 hover:text-white cursor-pointer"
              title="Edit Banner"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(banner.id)}
              className="p-1.5 bg-slate-900/80 rounded-lg text-slate-300 hover:text-red-400 cursor-pointer"
              title="Delete Banner"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white">{banner.title}</h4>
            <p className="text-xs text-slate-200 mt-0.5">{banner.tagline}</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between border-t border-slate-100 text-xs">
        <span className="font-mono text-slate-500">
          Order #{banner.sortOrder} • {banner.buttonText}
        </span>
        <button
          onClick={() => onToggleActive(banner.id)}
          className={`badge cursor-pointer ${
            banner.isActive ? "badge-success" : "badge-neutral"
          }`}
        >
          {banner.isActive ? "Active" : "Hidden"}
        </button>
      </div>
    </div>
  );
};
