"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/context/admin-store";
import { Order } from "@/data/mock-data";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { OrderStatusFilterTabs } from "./OrderStatusFilterTabs";
import { OrderTable } from "./OrderTable";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderInvoiceModal } from "./OrderInvoiceModal";

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus } = useAdminStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Orders Dispatch"
        description="Track customer bookings, advance status workflows, and print tax invoices."
        actions={
          <div className="text-xs text-slate-500 font-medium bg-white px-3 py-2 rounded-xl border border-slate-200">
            Total Orders: <strong className="text-slate-800">{orders.length}</strong>
          </div>
        }
      />

      {/* Status Filter Tabs */}
      <OrderStatusFilterTabs
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by Order #, Customer or Phone..."
        />
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={filteredOrders}
        onViewOrder={(ord) => setSelectedOrder(ord)}
        onPrintOrder={(ord) => setInvoiceOrder(ord)}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={(orderId, status) => {
          updateOrderStatus(orderId, status);
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status });
          }
        }}
        onOpenInvoice={(ord) => setInvoiceOrder(ord)}
      />

      {/* Printable Invoice Modal */}
      <OrderInvoiceModal
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
};
