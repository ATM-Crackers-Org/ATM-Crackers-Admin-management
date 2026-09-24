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
  Copy,
  Check,
  ChevronRight,
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
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Update Order Workflow Status
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Advance the order according to allowed dispatch transitions.
                  </p>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
              </div>

              {/* Quick Transition Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {nextAllowed
                  .filter((st) => st !== "CANCELLED")
                  .map((target) => (
                    <button
                      key={target}
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => handleUpdateStatus(target)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <span>Mark as {target}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  ))}

                {/* Cancel Button */}
                {isCancellable && (
                  <button
                    type="button"
                    disabled={statusUpdating || cancelling}
                    onClick={() => setIsCancelConfirmOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200 disabled:opacity-50 ml-auto"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>

              {/* Status Selector dropdown for manual jump */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Or choose state:</span>
                <select
                  value={selectedNextStatus}
                  onChange={(e) => setSelectedNextStatus(e.target.value as OrderStatus)}
                  disabled={statusUpdating}
                  className="text-xs rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="">Select transition...</option>
                  {ALL_ORDER_STATUSES.filter((s) => s !== order.orderStatus).map((st) => (
                    <option key={st} value={st}>
                      {st} {isValidStatusTransition(order.orderStatus, st) ? "(Allowed)" : ""}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={!selectedNextStatus || statusUpdating}
                  onClick={() => selectedNextStatus && handleUpdateStatus(selectedNextStatus)}
                  className="btn btn-primary text-xs py-1 px-3 cursor-pointer disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
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
