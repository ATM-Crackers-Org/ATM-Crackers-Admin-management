"use client";

import React from "react";

export const ORDER_STATUS_LIST = [
  "all",
  "PENDING",
  "CONFIRMED",
  "PACKING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

interface OrderStatusFilterTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

export const OrderStatusFilterTabs: React.FC<OrderStatusFilterTabsProps> = ({
  activeStatus,
  onStatusChange,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {ORDER_STATUS_LIST.map((st) => (
        <button
          key={st}
          onClick={() => onStatusChange(st)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeStatus === st
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          {st === "all" ? "All Orders" : st}
        </button>
      ))}
    </div>
  );
};
