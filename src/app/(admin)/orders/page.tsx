"use client";

import React, { useState } from "react";
import { OrdersView } from "@/components/orders/OrdersView";
import { PosBillsView } from "@/components/orders/PosBillsView";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShoppingBag, ShoppingCart } from "lucide-react";

type Tab = "orders" | "pos";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Orders & POS Management"
        description="Manage customer online orders and in-store POS bills from a single dashboard."
      />

      {/* Tab Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-1.5 flex gap-1.5 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Online Orders</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "pos"
              ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>POS Bills</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" ? <OrdersView hideHeader /> : <PosBillsView />}
    </div>
  );
}
