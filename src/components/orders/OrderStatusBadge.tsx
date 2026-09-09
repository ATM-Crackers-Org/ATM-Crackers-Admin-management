"use client";

import React from "react";
import { Order } from "@/data/mock-data";

interface OrderStatusBadgeProps {
  status: Order["status"];
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const getBadgeClass = (st: Order["status"]) => {
    switch (st) {
      case "CONFIRMED":
      case "DELIVERED":
        return "badge-success";
      case "PENDING":
      case "PACKING":
        return "badge-warning";
      case "SHIPPED":
        return "badge-info";
      case "CANCELLED":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)} text-[10px] font-bold`}>
      {status}
    </span>
  );
}
