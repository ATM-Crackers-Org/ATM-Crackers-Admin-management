"use client";

import React from "react";
import { OrderPaymentStatus, ALL_PAYMENT_STATUSES } from "@/types/order.types";
import { Search, RotateCw, Filter, X } from "lucide-react";

interface OrderFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  paymentStatus: OrderPaymentStatus | "ALL";
  onPaymentStatusChange: (val: OrderPaymentStatus | "ALL") => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalOrders: number;
}

export function OrderFilterBar({
  search,
  onSearchChange,
  paymentStatus,
  onPaymentStatusChange,
  onRefresh,
  isRefreshing,
  totalOrders,
}: OrderFilterBarProps) {
  const hasActiveFilters = search.trim() !== "" || paymentStatus !== "ALL";

  const handleReset = () => {
    onSearchChange("");
    onPaymentStatusChange("ALL");
  };

  return (
    <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Left: Search Input & Payment Filter */}
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search order number, customer name, or mobile..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Payment Status Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={paymentStatus}
              onChange={(e) =>
                onPaymentStatusChange(e.target.value as OrderPaymentStatus | "ALL")
              }
              className="w-full sm:w-auto appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100/80 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none cursor-pointer transition-all"
            >
              <option value="ALL">All Payment Statuses</option>
              {ALL_PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  Payment: {status}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              title="Clear filters"
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Refresh button and count */}
      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{totalOrders}</span> orders
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          title="Refresh orders from server"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-red-600" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
