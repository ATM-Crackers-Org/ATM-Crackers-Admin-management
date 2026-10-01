"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  ApiOrder,
  OrderStatus,
  OrderPaymentStatus,
  ORDER_STATUS_STEPS,
  ALL_ORDER_STATUSES,
  ALL_PAYMENT_STATUSES,
} from "@/types/order.types";
import {
  getOrderByOrderNumber,
  updateOrderStatus,
  updateOrderPaymentStatus,
  cancelOrder,
} from "@/services/order.service";
import {
  canCancelOrder,
  getNextAllowedStatuses,
  isValidStatusTransition,
  canTransitionToStatus,
} from "@/validations/order.validation";
import { formatINR, formatDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import {
  Printer,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  CreditCard,
  Truck,
  RotateCw,
  Ban,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";

interface OrderDetailsModalProps {
  orderNumber: string | null;
  initialOrder?: ApiOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: ApiOrder) => void;
  onOpenInvoice: (order: ApiOrder) => void;
}

export function OrderDetailsModal({
  orderNumber,
  initialOrder,
  isOpen,
  onClose,
  onOrderUpdated,
  onOpenInvoice,
}: OrderDetailsModalProps) {
  const [order, setOrder] = useState<ApiOrder | null>(initialOrder || null);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [paymentUpdating, setPaymentUpdating] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);

  // Status transition state
  const [selectedNextStatus, setSelectedNextStatus] = useState<OrderStatus | "">("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<OrderPaymentStatus | "">("");

  // Cancel confirmation state
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Fetch full order details by orderNumber whenever modal opens or orderNumber changes
  const fetchOrderDetails = useCallback(async (ordNum: string) => {
    setLoading(true);
    try {
      const data = await getOrderByOrderNumber(ordNum);
      setOrder(data);
      setSelectedPaymentStatus(data.paymentStatus);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to fetch order details. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && orderNumber) {
      if (initialOrder && initialOrder.orderNumber === orderNumber) {
        setOrder(initialOrder);
        setSelectedPaymentStatus(initialOrder.paymentStatus);
      }
      fetchOrderDetails(orderNumber);
    } else {
      setOrder(null);
      setSelectedNextStatus("");
      setSelectedPaymentStatus("");
    }
  }, [isOpen, orderNumber, initialOrder, fetchOrderDetails]);

  // Handle Copy Mobile
  const handleCopyMobile = (mobile: string) => {
    navigator.clipboard?.writeText(mobile);
    setCopiedMobile(true);
    setTimeout(() => setCopiedMobile(false), 2000);
  };

  // ─── Status Update Handler ──────────────────────────────────────────────────
  const handleUpdateStatus = async (targetStatus: OrderStatus) => {
    if (!order) return;

    // Validate sequential workflow and payment status prerequisite
    const validation = canTransitionToStatus(order, targetStatus);
    if (!validation.allowed) {
      toast.error(validation.reason || "Invalid status transition.");
      return;
    }

    setStatusUpdating(true);
    try {
      const updated = await updateOrderStatus(order.orderNumber, targetStatus);
      const newOrder = updated || { ...order, orderStatus: targetStatus };
      setOrder(newOrder);
      onOrderUpdated(newOrder);
      toast.success(`Order status updated to ${targetStatus}`);
      setSelectedNextStatus("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update order status. Please verify workflow transition.";
      toast.error(msg);
    } finally {
      setStatusUpdating(false);
    }
  };

  // ─── Payment Status Update Handler ──────────────────────────────────────────
  const handleUpdatePaymentStatus = async (newPaymentStatus: OrderPaymentStatus) => {
    if (!order || newPaymentStatus === order.paymentStatus) return;

    if (order.orderStatus === "CANCELLED") {
      toast.error("Payment status cannot be changed for cancelled orders.");
      setSelectedPaymentStatus(order.paymentStatus);
      return;
    }

    setPaymentUpdating(true);
    try {
      const updated = await updateOrderPaymentStatus(order.orderNumber, newPaymentStatus);
      const newOrder = updated || { ...order, paymentStatus: newPaymentStatus };
      setOrder(newOrder);
      onOrderUpdated(newOrder);
      toast.success(`Payment status updated to ${newPaymentStatus}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to update payment status.";
      toast.error(msg);
      setSelectedPaymentStatus(order.paymentStatus);
    } finally {
      setPaymentUpdating(false);
    }
  };

  // ─── Cancel Order Handler ───────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await cancelOrder(order.orderNumber);
      const cancelledOrder: ApiOrder = {
        ...order,
        orderStatus: "CANCELLED",
      };
      setOrder(cancelledOrder);
      onOrderUpdated(cancelledOrder);
      toast.success("Order cancelled successfully");
      setIsCancelConfirmOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to cancel order. Order may already have been dispatched.";
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (!isOpen) return null;

  const currentStatus = order?.orderStatus;
  const nextAllowed = currentStatus ? getNextAllowedStatuses(currentStatus) : [];
  const isCancellable = currentStatus ? canCancelOrder(currentStatus) : false;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={order ? `Order Details #${order.orderNumber}` : "Order Details"}
        maxWidth="2xl"
      >
        {loading && !order ? (
          <div className="py-16 text-center space-y-3">
            <RotateCw className="w-8 h-8 text-red-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              Loading complete order details from server...
            </p>
          </div>
        ) : order ? (
          <div className="space-y-6 text-sm">
            {/* 1. Header Overview Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-mono font-bold text-xs shadow-2xs">
                  #
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm font-mono">
                      {order.orderNumber}
                    </h3>
                    <OrderStatusBadge status={order.orderStatus} size="sm" />
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Placed: {formatDate(order.createdAt)}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenInvoice(order)}
                  className="btn btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3 cursor-pointer"
                  title="Print tax invoice"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Tax Invoice</span>
                </button>
              </div>
            </div>

            {/* 2. Visual Workflow Progress Indicator */}
            {order.orderStatus !== "CANCELLED" ? (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Fulfillment Progress
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Current: <strong className="text-red-600">{order.orderStatus}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1 pt-1">
                  {ORDER_STATUS_STEPS.map((step, idx) => {
                    const currentIdx = ORDER_STATUS_STEPS.indexOf(order.orderStatus);
                    const isDone = currentIdx >= idx;
                    const isCurrent = order.orderStatus === step;

                    return (
                      <div key={step} className="flex flex-col items-center text-center">
                        <div
                          className={`w-full h-1.5 rounded-full transition-colors ${
                            isDone
                              ? isCurrent
                                ? "bg-red-600"
                                : "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                        <span
                          className={`text-[9px] mt-1.5 truncate max-w-full font-bold ${
                            isCurrent
                              ? "text-red-600"
                              : isDone
                              ? "text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>This order was cancelled and cannot be fulfilled further.</span>
              </div>
            )}

            {/* 3. Customer & Shipping Address Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer Information
                </span>
                <h4 className="font-bold text-slate-900 text-sm">
                  {order.customer?.name || order.shippingAddress?.fullName || "—"}
                </h4>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerMobile || order.customer?.mobile || "—"}</span>
                    </span>
                    {(order.customerMobile || order.customer?.mobile) && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyMobile(order.customerMobile || order.customer?.mobile || "")
                        }
                        className="text-[11px] text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer flex items-center gap-1"
                        title="Copy phone"
                      >
                        {copiedMobile ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {order.customer?.email && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{order.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Shipping Destination
                </span>
                {order.shippingAddress ? (
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-medium text-slate-800">
                      {order.shippingAddress.fullName || order.customer?.name}
                    </p>
                    <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                      {order.shippingAddress.streetAddress}
                    </p>
                    <p className="text-slate-700 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>
                        {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                        {order.shippingAddress.pincode}
                      </span>
                    </p>
                    {order.shippingAddress.landmark && (
                      <p className="text-[11px] text-slate-400">
                        Landmark: {order.shippingAddress.landmark}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No delivery address provided.</p>
                )}
              </div>
            </div>

            {/* 4. Ordered Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ordered Crackers ({order.items?.length || 0})</span>
                </h5>
                <span className="text-xs text-slate-500">
                  Total Units:{" "}
                  <strong>
                    {(order.items || []).reduce((sum, it) => sum + (it.quantity || 0), 0)}
                  </strong>
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                <div className="bg-slate-50/80 px-3 py-2 text-[10px] uppercase font-bold text-slate-400 grid grid-cols-12 gap-2">
                  <span className="col-span-6">Cracker Item</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>

                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2.5 grid grid-cols-12 gap-2 items-center text-xs hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="col-span-6 flex items-center gap-2.5">
                        <img
                          src={item.image || "https://placehold.co/60x60/F5A623/111827?text=Cracker"}
                          alt={item.productName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://placehold.co/60x60/F5A623/111827?text=Cracker";
                          }}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-800 block truncate">
                            {item.productName}
                          </span>
                          {item.categoryName && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              {item.categoryName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-medium text-slate-700">
                        {formatINR(item.sellingPrice)}
                        {item.mrp > item.sellingPrice && (
                          <span className="text-[10px] text-slate-400 line-through block">
                            {formatINR(item.mrp)}
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-center font-bold text-slate-800">
                        × {item.quantity}
                      </div>

                      <div className="col-span-2 text-right font-bold text-slate-900">
                        {formatINR(item.itemTotal)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No items in this order.
                  </div>
                )}
              </div>
            </div>

            {/* 5. Payment & Order Financials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Details & Update */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Payment & Delivery Status
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Payment Method:</span>
                    </span>
                    <span className="font-bold text-slate-800">
                      {order.paymentMethod || "MANUAL"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Delivery Method:</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {order.deliveryMethod || "STANDARD"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-slate-600 font-semibold">Payment Status:</span>
                    <div className="flex items-center gap-2">
                      {order.orderStatus === "CANCELLED" ? (
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs shadow-2xs"
                          title="Payment status cannot be modified because this order is cancelled"
                        >
                          <OrderPaymentBadge status={order.paymentStatus} size="sm" />
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Locked (Cancelled)</span>
                          </span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedPaymentStatus || order.paymentStatus}
                            disabled={paymentUpdating}
                            onChange={(e) => {
                              const val = e.target.value as OrderPaymentStatus;
                              setSelectedPaymentStatus(val);
                              handleUpdatePaymentStatus(val);
                            }}
                            className="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-100 cursor-pointer disabled:opacity-50"
                          >
                            {ALL_PAYMENT_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                          {paymentUpdating && (
                            <RotateCw className="w-3.5 h-3.5 animate-spin text-red-600" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Order Summary
                </span>

                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatINR(order.subtotal)}</span>
                </div>

                {order.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>- {formatINR(order.totalDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold text-slate-800">
                    {order.deliveryCharge > 0 ? formatINR(order.deliveryCharge) : "FREE"}
                  </span>
                </div>

                {order.promoCode && (
                  <div className="flex justify-between text-purple-600 font-medium">
                    <span>Promo Applied:</span>
                    <span className="font-mono">{order.promoCode}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-red-600 text-base">{formatINR(order.grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* 6. Status Workflow Action Area */}
            <div className="p-5 bg-gradient-to-b from-slate-50/60 to-white rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Fulfillment Action Pipeline
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Advance the order sequentially or cancel before packing.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Current Status:</span>
                  <OrderStatusBadge status={order.orderStatus} size="sm" />
                </div>
              </div>

              {/* Notice for PENDING order needing PAID status */}
              {order.orderStatus === "PENDING" && order.paymentStatus !== "PAID" && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border border-amber-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-950">Payment Verification Required</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Order is currently <strong className="uppercase">{order.paymentStatus}</strong>. Payment must be marked as <strong>PAID</strong> before this order can be confirmed.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus("PAID")}
                    disabled={paymentUpdating}
                    className="btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-1.5 font-bold rounded-xl shadow-xs shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as PAID Now</span>
                  </button>
                </div>
              )}

              {/* Main Action Buttons Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Primary Advance Button */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {nextAllowed
                    .filter((st) => st !== "CANCELLED")
                    .map((target) => {
                      const isPaidRequired =
                        target === "CONFIRMED" && order.paymentStatus !== "PAID";

                      // Style configuration tailored for each target stage
                      let bgGradient =
                        "from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-slate-900/15";
                      let stageTitle = `Advance to ${target}`;
                      let stageSubtitle = "Next workflow step";
                      let StageIcon = ArrowRight;

                      if (isPaidRequired) {
                        bgGradient =
                          "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20 border-amber-400/40";
                        stageTitle = "Confirm Order";
                        stageSubtitle = "⚠️ Requires PAID status";
                        StageIcon = AlertTriangle;
                      } else if (target === "CONFIRMED") {
                        bgGradient =
                          "from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-600/25";
                        stageTitle = "Confirm Order";
                        stageSubtitle = "Reserve inventory & verify";
                        StageIcon = CheckCircle2;
                      } else if (target === "PROCESSING") {
                        bgGradient =
                          "from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:to-violet-800 text-white shadow-purple-600/25";
                        stageTitle = "Start Processing";
                        stageSubtitle = "Send to warehouse packing line";
                        StageIcon = RotateCw;
                      } else if (target === "PACKED") {
                        bgGradient =
                          "from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white shadow-teal-600/25";
                        stageTitle = "Mark as Packed";
                        stageSubtitle = "Boxes sealed & weighed";
                        StageIcon = Package;
                      } else if (target === "SHIPPED") {
                        bgGradient =
                          "from-indigo-600 via-sky-600 to-indigo-700 hover:from-indigo-700 hover:to-sky-800 text-white shadow-indigo-600/25";
                        stageTitle = "Dispatch & Ship";
                        stageSubtitle = "Handover to lorry / courier";
                        StageIcon = Truck;
                      } else if (target === "DELIVERED") {
                        bgGradient =
                          "from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-emerald-600/25";
                        stageTitle = "Mark as Delivered";
                        stageSubtitle = "Completed delivery to client";
                        StageIcon = CheckCircle2;
                      }

                      return (
                        <button
                          key={target}
                          type="button"
                          disabled={statusUpdating}
                          onClick={() => handleUpdateStatus(target)}
                          className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r ${bgGradient} border border-white/15 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50`}
                          title={
                            isPaidRequired
                              ? "Order must be marked as PAID before confirming"
                              : `Mark order as ${target}`
                          }
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                            <StageIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-extrabold tracking-tight">
                                {stageTitle}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                            <span className="text-[10px] text-white/80 font-medium block">
                              {stageSubtitle}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>

                {/* Cancel Action / Locked Indicator */}
                <div className="ml-auto">
                  {isCancellable ? (
                    <button
                      type="button"
                      disabled={statusUpdating || cancelling}
                      onClick={() => setIsCancelConfirmOpen(true)}
                      className="group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100/90 border border-rose-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                      title="Cancel order (Permitted up to PROCESSING stage)"
                    >
                      <div className="w-7 h-7 rounded-xl bg-rose-100 group-hover:bg-rose-200/80 flex items-center justify-center transition-colors">
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      <div className="text-left">
                        <span className="block leading-none font-bold">Cancel Order</span>
                        <span className="text-[10px] text-rose-400 font-normal">
                          Available till processing
                        </span>
                      </div>
                    </button>
                  ) : (
                    (order.orderStatus === "PACKED" ||
                      order.orderStatus === "SHIPPED" ||
                      order.orderStatus === "DELIVERED") && (
                      <div
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs"
                        title="Cancellation is permanently locked once packed or dispatched"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-medium">
                          Cancellation closed ({order.orderStatus})
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Status Selector dropdown for allowed transitions */}
              {nextAllowed.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Or select from allowed transitions:
                  </span>
                  <div className="relative">
                    <select
                      value={selectedNextStatus}
                      onChange={(e) => setSelectedNextStatus(e.target.value as OrderStatus)}
                      disabled={statusUpdating}
                      className="text-xs rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-slate-700 outline-none cursor-pointer focus:border-slate-400 shadow-2xs"
                    >
                      <option value="">Choose transition...</option>
                      {nextAllowed.map((st) => {
                        const isPaidReq = st === "CONFIRMED" && order.paymentStatus !== "PAID";
                        return (
                          <option key={st} value={st}>
                            {st === "CANCELLED" ? "✕ Cancel Order" : `→ Advance to: ${st}`}{" "}
                            {isPaidReq ? "⚠️ (Requires PAID)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={!selectedNextStatus || statusUpdating}
                    onClick={() => {
                      if (selectedNextStatus === "CANCELLED") {
                        setIsCancelConfirmOpen(true);
                      } else if (selectedNextStatus) {
                        handleUpdateStatus(selectedNextStatus);
                      }
                    }}
                    className="btn btn-primary text-xs py-1.5 px-3.5 rounded-xl cursor-pointer disabled:opacity-40 shadow-xs"
                  >
                    Apply Transition
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onOpenInvoice(order)}
                className="btn btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Print Invoice</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary text-xs px-5 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Confirmation Modal for Order Cancellation */}
      <ConfirmationModal
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Order Confirmation"
        message={
          <div>
            Are you sure you want to cancel order{" "}
            <strong className="font-mono text-slate-900">#{order?.orderNumber}</strong>?
            <p className="text-xs text-slate-500 mt-1">
              This action informs the warehouse and releases any reserved stocks.
            </p>
          </div>
        }
        confirmText="Yes, Cancel Order"
        cancelText="Keep Active"
        variant="danger"
        isLoading={cancelling}
      />
    </>
  );
}
