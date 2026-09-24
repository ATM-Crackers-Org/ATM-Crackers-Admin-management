"use client";

import React from "react";
import { OrderStatus } from "@/types/order.types";

export const ORDER_STATUS_TABS: Array<{ id: OrderStatus | "ALL"; label: string }> = [
  { id: "ALL", label: "All Orders" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "PROCESSING", label: "Processing" },
  { id: "PACKED", label: "Packed" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "CANCELLED", label: "Cancelled" },
];

interface OrderStatusFilterTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  counts?: Partial<Record<string, number>>;
}

export const OrderStatusFilterTabs: React.FC<OrderStatusFilterTabsProps> = ({
  activeStatus,
  onStatusChange,
  counts = {},
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {ORDER_STATUS_TABS.map((tab) => {
        const isActive = activeStatus === tab.id;
        const count = counts[tab.id];

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onStatusChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            {typeof count === "number" && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
