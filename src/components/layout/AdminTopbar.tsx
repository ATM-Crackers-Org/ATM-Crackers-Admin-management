"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useAdminStore } from "@/context/admin-store";
import {
  Menu,
  Bell,
  Receipt,
  AlertCircle,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { formatINR } from "@/lib/utils";

interface AdminTopbarProps {
  onToggleMobileMenu: () => void;
}

export function AdminTopbar({ onToggleMobileMenu }: AdminTopbarProps) {
  const router = useRouter();
  const { currentUser, logout, lowStockCount, orders } = useAdminStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const totalNotifications = (lowStockCount > 0 ? 1 : 0) + pendingOrders.length;

  return (
    <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
          <span className="text-slate-300">·</span>
          <span>ATM Crackers Admin</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* POS Button */}
        <Link
          href="/billing"
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">POS Counter</span>
          <span className="sm:hidden">POS</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-[13px] text-slate-800">Alerts</h4>
                  {totalNotifications > 0 && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">
                      {totalNotifications}
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {lowStockCount > 0 && (
                    <div className="px-4 py-3 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] font-semibold text-slate-800">
                          Low Stock — {lowStockCount} items
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Below safety threshold. Replenish soon.
                        </p>
                        <Link
                          href="/inventory"
                          onClick={() => setShowNotifications(false)}
                          className="text-[11px] font-semibold text-red-600 hover:underline mt-1 inline-block"
                        >
                          View Inventory →
                        </Link>
                      </div>
                    </div>
                  )}

                  {pendingOrders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="px-4 py-3 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] font-semibold text-slate-800">
                          Order {ord.orderNumber}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {ord.customerName} · {formatINR(ord.grandTotal)}
                        </p>
                        <Link
                          href="/orders"
                          onClick={() => setShowNotifications(false)}
                          className="text-[11px] font-semibold text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Review →
                        </Link>
                      </div>
                    </div>
                  ))}

                  {totalNotifications === 0 && (
                    <p className="text-[12px] text-slate-400 py-6 text-center">
                      All clear — no alerts
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            {currentUser?.name?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="leading-tight">
            <span className="text-[12px] font-semibold text-slate-800 block">
              {currentUser?.name || "Admin"}
            </span>
            <span className="text-[10px] text-slate-400 block">Sivakasi HQ</span>
          </div>
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={async () => {
          await logout();
          setShowLogoutModal(false);
          router.push("/login");
        }}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        icon={<LogOut className="w-5 h-5 text-red-500" />}
      />
    </header>
  );
}
