"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Plus, AlertTriangle } from "lucide-react";
import { InventorySummaryCards } from "./InventorySummaryCards";
import { InventoryStockTable } from "./InventoryStockTable";
import { InventoryMovementTable } from "./InventoryMovementTable";
import { InventoryStockModal } from "./InventoryStockModal";

export const InventoryView: React.FC = () => {
  const { products, inventoryLogs, adjustStock, lowStockCount } = useAdminStore();
  const [search, setSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");

  const handleOpenReplenish = (prodId?: string) => {
    if (prodId) setSelectedProductId(prodId);
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = (data: {
    productId: string;
    qty: number;
    type: "IN" | "ADJUSTMENT";
    reference: string;
    notes: string;
  }) => {
    adjustStock(data.productId, data.qty, data.type, data.reference, data.notes);
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesLow = showLowStockOnly ? p.stockQuantity <= p.lowStockThreshold : true;
    return matchesSearch && matchesLow;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Inventory Management"
        description="Real-time Sivakasi warehouse balances, stock replenishment, and adjustment audit logs."
        actions={
          <button
            onClick={() => handleOpenReplenish()}
            className="btn btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Replenish Stock</span>
          </button>
        }
      />

      {/* Stock Summary Banner */}
      <InventorySummaryCards
        products={products}
        lowStockCount={lowStockCount}
      />

      {/* Search & Filter Bar */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search cracker SKU or title..."
        />

        <button
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`btn text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            showLowStockOnly
              ? "bg-red-600 text-white"
              : "btn-secondary text-slate-600"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock Only ({lowStockCount})</span>
        </button>
      </div>

      {/* Stock Balance Table */}
      <InventoryStockTable
        products={filteredProducts}
        onAdjust={handleOpenReplenish}
      />

      {/* Stock Adjustment Movement History */}
      <InventoryMovementTable logs={inventoryLogs} />

      {/* Adjust Modal */}
      <InventoryStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        products={products}
        initialProductId={selectedProductId}
        onSubmit={handleAdjustSubmit}
      />
    </div>
  );
};
