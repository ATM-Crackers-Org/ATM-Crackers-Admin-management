"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/context/admin-store";
import {
  Menu,
  Bell,
  Search,
  Receipt,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface AdminTopbarProps {
  onToggleMobileMenu: () => void;
}

export function AdminTopbar({ onToggleMobileMenu }: AdminTopbarProps) {
  const { currentUser, lowStockCount, orders } = useAdminStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const totalNotifications = (lowStockCount > 0 ? 1 : 0) + pendingOrders.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile menu toggle + breadcrumb / brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Demo Mode
          </span>
          <span className="text-slate-300">•</span>
          <span>Zero-Backend Mock State</span>
        </div>
      </div>

      {/* Right: Quick POS shortcut, Notifications, User info */}
      <div className="flex items-center gap-3">
        {/* Quick Launch POS Billing */}
        <Link
          href="/billing"
          className="btn btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-red-600/20 flex items-center gap-1.5"
        >
          <Receipt className="w-4 h-4" />
          <span className="hidden md:inline">Open POS Counter</span>
          <span className="md:hidden">POS</span>
        </Link>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-semibold text-sm text-slate-800">Notifications</h4>
                  <span className="text-[11px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">
                    {totalNotifications} Alerts
                  </span>
                </div>
                <div className="py-2 divide-y divide-slate-100 max-h-72 overflow-y-auto space-y-2">
                  {lowStockCount > 0 && (
                    <div className="pt-2 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Low Stock Alert ({lowStockCount} items)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Several crackers are below safety threshold. Please replenish soon.
                        </p>
                        <Link
                          href="/inventory"
                          onClick={() => setShowNotifications(false)}
                          className="text-[11px] font-bold text-red-600 hover:underline mt-1 inline-block"
                        >
                          View Inventory →
                        </Link>
                      </div>
                    </div>
                  )}

                  {pendingOrders.map((ord) => (
                    <div key={ord.id} className="pt-2 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          New Order {ord.orderNumber}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {ord.customerName} • {formatINR(ord.grandTotal)}
                        </p>
                        <Link
                          href="/orders"
                          onClick={() => setShowNotifications(false)}
                          className="text-[11px] font-bold text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Review Order →
                        </Link>
                      </div>
                    </div>
                  ))}

                  {totalNotifications === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      No pending alerts right now. All clear!
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Tag */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {currentUser?.name?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="text-left leading-tight">
            <span className="text-xs font-semibold text-slate-800 block">
              {currentUser?.name || "Admin"}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Sivakasi HQ
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
