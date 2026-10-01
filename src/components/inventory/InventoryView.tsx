"use client";

import React, { useState, useMemo, useEffect } from "react";
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

  // Pagination for Warehouse Stock Table
  const [stockPage, setStockPage] = useState(1);
  const [stockPageSize, setStockPageSize] = useState<number | "all">(10);

  // Pagination for Movement Audit Trail
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState<number | "all">(10);

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

  // Reset pagination when search or low stock filter changes
  useEffect(() => {
    setStockPage(1);
  }, [search, showLowStockOnly]);

  // Comprehensive search filtering: name, SKU, category, and description
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesLow = showLowStockOnly
        ? p.stockQuantity <= p.lowStockThreshold
        : true;

      return matchesSearch && matchesLow;
    });
  }, [products, search, showLowStockOnly]);

  // Paginated Warehouse Stock
  const totalStockCount = filteredProducts.length;
  const numStockPageSize = stockPageSize === "all" ? totalStockCount : stockPageSize;
  const totalStockPages =
    stockPageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(totalStockCount / (numStockPageSize || 1)));
  const activeStockPage = Math.min(stockPage, totalStockPages);
  const startStockIdx =
    stockPageSize === "all" ? 0 : (activeStockPage - 1) * (numStockPageSize || 1);
  const endStockIdx =
    stockPageSize === "all"
      ? totalStockCount
      : Math.min(startStockIdx + (numStockPageSize || 1), totalStockCount);

  const paginatedStockProducts = useMemo(() => {
    return filteredProducts.slice(startStockIdx, endStockIdx);
  }, [filteredProducts, startStockIdx, endStockIdx]);

  // Paginated Movement Logs
  const totalLogsCount = inventoryLogs.length;
  const numLogsPageSize = logsPageSize === "all" ? totalLogsCount : logsPageSize;
  const totalLogsPages =
    logsPageSize === "all"
      ? 1
      : Math.max(1, Math.ceil(totalLogsCount / (numLogsPageSize || 1)));
  const activeLogsPage = Math.min(logsPage, totalLogsPages);
  const startLogsIdx =
    logsPageSize === "all" ? 0 : (activeLogsPage - 1) * (numLogsPageSize || 1);
  const endLogsIdx =
    logsPageSize === "all"
      ? totalLogsCount
      : Math.min(startLogsIdx + (numLogsPageSize || 1), totalLogsCount);

  const paginatedLogs = useMemo(() => {
    return inventoryLogs.slice(startLogsIdx, endLogsIdx);
  }, [inventoryLogs, startLogsIdx, endLogsIdx]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Inventory Management"
        description="Real-time Sivakasi warehouse balances, stock replenishment, and adjustment audit logs."
        actions={
          <button
            onClick={() => handleOpenReplenish()}
            className="btn btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
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
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search title, SKU, category, or description..."
          />
        </div>

        <button
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`btn text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            showLowStockOnly
              ? "bg-red-600 text-white shadow-xs"
              : "btn-secondary text-slate-600 border border-slate-200"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock Only ({lowStockCount})</span>
        </button>
      </div>

      {/* Stock Balance Table with Pagination */}
      <InventoryStockTable
        products={paginatedStockProducts}
        onAdjust={handleOpenReplenish}
        totalCount={totalStockCount}
        currentPage={activeStockPage}
        totalPages={totalStockPages}
        pageSize={stockPageSize}
        onPageChange={setStockPage}
        onPageSizeChange={setStockPageSize}
      />

      {/* Stock Adjustment Movement History with Pagination */}
      <InventoryMovementTable
        logs={paginatedLogs}
        totalCount={totalLogsCount}
        currentPage={activeLogsPage}
        totalPages={totalLogsPages}
        pageSize={logsPageSize}
        onPageChange={setLogsPage}
        onPageSizeChange={setLogsPageSize}
      />

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
