"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { OrderStatusFilterTabs } from "./OrderStatusFilterTabs";
import { OrderFilterBar } from "./OrderFilterBar";
import { OrderTable } from "./OrderTable";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { OrderInvoiceModal } from "./OrderInvoiceModal";
import {
  getOrders,
  updateOrderStatus as apiUpdateOrderStatus,
  updateOrderPaymentStatus as apiUpdateOrderPaymentStatus,
  cancelOrder as apiCancelOrder,
} from "@/services/order.service";
import type {
  ApiOrder,
  OrderStatus,
  OrderPaymentStatus,
} from "@/types/order.types";
import { useAdminStore } from "@/context/admin-store";
import type { Order } from "@/data/mock-data";
import { formatINR } from "@/lib/utils";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  RotateCw,
} from "lucide-react";

export const OrdersView: React.FC = () => {
  const { setOrdersList } = useAdminStore();
  const syncStoreRef = useRef(setOrdersList);
  syncStoreRef.current = setOrdersList;

  // Primary state
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<OrderPaymentStatus | "ALL">("ALL");

  // Modals & Selected Order
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<ApiOrder | null>(null);

  // Cancel order confirmation dialog
  const [cancelTargetOrder, setCancelTargetOrder] = useState<ApiOrder | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // ─── Fetch Orders from Backend API ──────────────────────────────────────────
  const loadOrders = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setErrorMessage(null);

      try {
        const data = await getOrders({
          search: search.trim() || undefined,
          orderStatus: statusFilter !== "ALL" ? (statusFilter as OrderStatus) : undefined,
          paymentStatus:
            paymentStatusFilter !== "ALL" ? (paymentStatusFilter as OrderPaymentStatus) : undefined,
        });

        setOrders(data);

        // Sync with admin-store for dashboard statistics & topbar badge
        if (syncStoreRef.current) {
          const mappedForStore: Order[] = data.map((o) => ({
            id: o._id,
            orderNumber: o.orderNumber,
            customerName: o.customer?.name || o.shippingAddress?.fullName || "Customer",
            customerPhone: o.customerMobile || o.customer?.mobile || "",
            customerEmail: o.customer?.email,
            shippingAddress: o.shippingAddress
              ? {
                  line1: o.shippingAddress.streetAddress || "",
                  city: o.shippingAddress.city || "",
                  pincode: o.shippingAddress.pincode || "",
                  state: o.shippingAddress.state || "",
                }
              : null,
            items: (o.items || []).map((it) => ({
              productId: it.productId,
              productName: it.productName,
              productPrice: it.sellingPrice,
              quantity: it.quantity,
              unit: "1 Pkt",
              lineTotal: it.itemTotal,
            })),
            subtotal: o.subtotal,
            discountAmount: o.totalDiscount,
            taxAmount: 0,
            grandTotal: o.grandTotal,
            paymentMethod: o.paymentMethod || "MANUAL",
            paymentStatus: o.paymentStatus,
            status: o.orderStatus,
            channel: (o.deliveryMethod === "POS" ? "POS" : "ONLINE") as "ONLINE" | "POS",
            createdAt: o.createdAt,
          }));
          syncStoreRef.current(mappedForStore);
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to load orders. Please check your network or server status.";
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, paymentStatusFilter]
  );

  // Debounce search / filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  // ─── Quick Advance Status from Table ────────────────────────────────────────
  const handleQuickStatusChange = async (order: ApiOrder, newStatus: OrderStatus) => {
    try {
      await apiUpdateOrderStatus(order.orderNumber, newStatus);
      toast.success(`Order ${order.orderNumber} updated to ${newStatus}`);
      // Optimistically update in table
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === order.orderNumber ? { ...o, orderStatus: newStatus } : o
        )
      );
      if (selectedOrder && selectedOrder.orderNumber === order.orderNumber) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update order status. Please verify workflow transition.";
      toast.error(msg);
    }
  };

  // ─── Inline Payment Status Change from Table ────────────────────────────────
  const handlePaymentStatusChange = async (
    order: ApiOrder,
    newStatus: OrderPaymentStatus
  ) => {
    try {
      await apiUpdateOrderPaymentStatus(order.orderNumber, newStatus);
      toast.success(
        `Payment status for order ${order.orderNumber} updated to ${newStatus}`
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === order.orderNumber
            ? { ...o, paymentStatus: newStatus }
            : o
        )
      );
      if (selectedOrder && selectedOrder.orderNumber === order.orderNumber) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: newStatus });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update payment status.";
      toast.error(msg);
    }
  };

  // ─── Cancel Order Handler ───────────────────────────────────────────────────
  const handleConfirmCancelOrder = async () => {
    if (!cancelTargetOrder) return;
    setIsCancelling(true);
    try {
      await apiCancelOrder(cancelTargetOrder.orderNumber);
      toast.success(`Order ${cancelTargetOrder.orderNumber} cancelled successfully`);
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === cancelTargetOrder.orderNumber
            ? { ...o, orderStatus: "CANCELLED" }
            : o
        )
      );
      if (selectedOrder && selectedOrder.orderNumber === cancelTargetOrder.orderNumber) {
        setSelectedOrder({ ...selectedOrder, orderStatus: "CANCELLED" });
      }
      setCancelTargetOrder(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to cancel order. It may have already been dispatched.";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  // ─── Update from Detail Modal ───────────────────────────────────────────────
  const handleOrderUpdatedInModal = (updated: ApiOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderNumber === updated.orderNumber ? updated : o))
    );
    setSelectedOrder(updated);
  };

  // ─── Status counts for tab badges ───────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length };
    for (const ord of orders) {
      const st = ord.orderStatus;
      counts[st] = (counts[st] || 0) + 1;
    }
    return counts;
  }, [orders]);

  // Overall KPIs from current list
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const pendingCount = orders.filter((o) => o.orderStatus === "PENDING").length;
    const deliveredCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;
    const totalAmount = orders.reduce(
      (sum, o) => sum + (o.orderStatus !== "CANCELLED" ? o.grandTotal : 0),
      0
    );
    return { totalCount, pendingCount, deliveredCount, totalAmount };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <PageHeader
        title="Orders Dispatch & Management"
        description="Track customer bookings, advance status workflows, manage payments, and generate tax invoices."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadOrders(true)}
              disabled={refreshing || loading}
              className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh orders"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-red-600" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* 2. Top Metric KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Orders Count
            </span>
            <span className="text-xl font-black text-slate-900">{metrics.totalCount}</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Pending Orders
            </span>
            <span className="text-xl font-black text-amber-600">{metrics.pendingCount}</span>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Fulfilled / Delivered
            </span>
            <span className="text-xl font-black text-emerald-600">{metrics.deliveredCount}</span>
          </div>
        </div>

        {/* Active Order Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Orders Volume
            </span>
            <span className="text-xl font-black text-slate-900">
              {formatINR(metrics.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Error Banner (if any) */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => loadOrders()}
            className="font-bold underline text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Order Status Filter Tabs */}
      <OrderStatusFilterTabs
        activeStatus={statusFilter}
        onStatusChange={setStatusFilter}
        counts={statusCounts}
      />

      {/* 5. Search Bar & Payment Status Filter */}
      <OrderFilterBar
        search={search}
        onSearchChange={setSearch}
        paymentStatus={paymentStatusFilter}
        onPaymentStatusChange={setPaymentStatusFilter}
        onRefresh={() => loadOrders(true)}
        isRefreshing={refreshing}
        totalOrders={orders.length}
      />

      {/* 6. Orders Table */}
      <OrderTable
        orders={orders}
        loading={loading}
        onViewOrder={(ord) => {
          setSelectedOrder(ord);
          setSelectedOrderNumber(ord.orderNumber);
        }}
        onPrintOrder={(ord) => setInvoiceOrder(ord)}
        onUpdateOrderStatus={handleQuickStatusChange}
        onUpdatePaymentStatus={handlePaymentStatusChange}
        onRequestCancel={(ord) => setCancelTargetOrder(ord)}
      />

      {/* 7. Complete Order Details Modal */}
      <OrderDetailsModal
        orderNumber={selectedOrderNumber}
        initialOrder={selectedOrder}
        isOpen={!!selectedOrderNumber}
        onClose={() => {
          setSelectedOrderNumber(null);
          setSelectedOrder(null);
        }}
        onOrderUpdated={handleOrderUpdatedInModal}
        onOpenInvoice={(ord) => setInvoiceOrder(ord)}
      />

      {/* 8. Tax Invoice Modal */}
      <OrderInvoiceModal
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />

      {/* 9. Cancellation Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!cancelTargetOrder}
        onClose={() => setCancelTargetOrder(null)}
        onConfirm={handleConfirmCancelOrder}
        title="Cancel Order Confirmation"
        message={
          <div>
            Are you sure you want to cancel order{" "}
            <strong className="font-mono text-slate-900">
              #{cancelTargetOrder?.orderNumber}
            </strong>
            ?
            <p className="text-xs text-slate-500 mt-1">
              Customer: {cancelTargetOrder?.customer?.name || "Customer"}. This marks the
              order as CANCELLED before dispatch.
            </p>
          </div>
        }
        confirmText="Yes, Cancel Order"
        cancelText="Keep Active"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
};
