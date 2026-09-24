"use client";

import React from "react";
import { OrderPaymentStatus } from "@/types/order.types";
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";

interface OrderPaymentBadgeProps {
  status: OrderPaymentStatus | string;
  size?: "sm" | "md";
}

export function OrderPaymentBadge({ status, size = "sm" }: OrderPaymentBadgeProps) {
  const normalized = (status || "").toUpperCase();

  const getConfig = () => {
    switch (normalized) {
      case "PAID":
        return {
          label: "Paid",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: CheckCircle2,
        };
      case "PENDING":
        return {
          label: "Pending",
          className: "bg-amber-50 text-amber-700 border-amber-200/80",
          icon: Clock,
        };
      case "FAILED":
        return {
          label: "Failed",
          className: "bg-rose-50 text-rose-700 border-rose-200/80",
          icon: AlertCircle,
        };
      case "REFUNDED":
        return {
          label: "Refunded",
          className: "bg-purple-50 text-purple-700 border-purple-200/80",
          icon: RefreshCw,
        };
      default:
        return {
          label: normalized || "Unknown",
          className: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Clock,
        };
    }
  };

  const { label, className, icon: Icon } = getConfig();

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1 font-semibold"
      : "text-xs px-2.5 py-1 gap-1.5 font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-md border whitespace-nowrap uppercase tracking-wider ${className} ${sizeClasses}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
