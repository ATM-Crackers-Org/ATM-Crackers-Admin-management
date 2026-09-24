"use client";

import React from "react";
import { OrderStatus } from "@/types/order.types";
import {
  Clock,
  Check,
  RotateCw,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  size?: "sm" | "md";
}

export function OrderStatusBadge({ status, size = "sm" }: OrderStatusBadgeProps) {
  const normalized = (status || "").toUpperCase();

  const getConfig = () => {
    switch (normalized) {
      case "PENDING":
        return {
          label: "Pending",
          className: "bg-amber-50 text-amber-700 border-amber-200/80",
          dotClassName: "bg-amber-500",
          icon: Clock,
        };
      case "CONFIRMED":
        return {
          label: "Confirmed",
          className: "bg-blue-50 text-blue-700 border-blue-200/80",
          dotClassName: "bg-blue-500",
          icon: Check,
        };
      case "PROCESSING":
        return {
          label: "Processing",
          className: "bg-purple-50 text-purple-700 border-purple-200/80",
          dotClassName: "bg-purple-500",
          icon: RotateCw,
        };
      case "PACKED":
      case "PACKING":
        return {
          label: "Packed",
          className: "bg-teal-50 text-teal-700 border-teal-200/80",
          dotClassName: "bg-teal-500",
          icon: Package,
        };
      case "SHIPPED":
        return {
          label: "Shipped",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          dotClassName: "bg-indigo-500",
          icon: Truck,
        };
      case "DELIVERED":
        return {
          label: "Delivered",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          dotClassName: "bg-emerald-500",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-rose-50 text-rose-700 border-rose-200/80",
          dotClassName: "bg-rose-500",
          icon: XCircle,
        };
      default:
        return {
          label: normalized || "Unknown",
          className: "bg-slate-100 text-slate-700 border-slate-200",
          dotClassName: "bg-slate-400",
          icon: Clock,
        };
    }
  };

  const { label, className, dotClassName, icon: Icon } = getConfig();

  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2.5 py-0.5 gap-1.5 font-medium"
      : "text-xs px-3 py-1 gap-1.5 font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs whitespace-nowrap transition-colors ${className} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClassName}`} />
      <Icon className="w-3 h-3 shrink-0 opacity-80" />
      <span>{label}</span>
    </span>
  );
}
