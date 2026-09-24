"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ApiOrder,
  OrderStatus,
  OrderPaymentStatus,
  ALL_ORDER_STATUSES,
  ALL_PAYMENT_STATUSES,
} from "@/types/order.types";
import { formatINR, formatDate } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderPaymentBadge } from "./OrderPaymentBadge";
import { canCancelOrder, isValidStatusTransition } from "@/validations/order.validation";
import {
  Eye,
  Printer,
  Ban,
  ChevronDown,
  Copy,
  Check,
  Package,
  MapPin,
  Phone,
  User,
  MoreVertical,
  RotateCw,
} from "lucide-react";

interface OrderTableProps {
  orders: ApiOrder[];
  loading?: boolean;
  onViewOrder: (order: ApiOrder) => void;
  onPrintOrder: (order: ApiOrder) => void;
  onUpdateOrderStatus?: (order: ApiOrder, newStatus: OrderStatus) => Promise<void> | void;
  onUpdatePaymentStatus?: (order: ApiOrder, newStatus: OrderPaymentStatus) => Promise<void> | void;
  onRequestCancel?: (order: ApiOrder) => void;
}

export function OrderTable({
  orders,
  loading = false,
  onViewOrder,
  onPrintOrder,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onRequestCancel,
}: OrderTableProps) {
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);
  const [updatingAction, setUpdatingAction] = useState<{
    orderNumber: string;
    field: "orderStatus" | "paymentStatus";
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close actions dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenActionDropdownId(null);
      }
    };
    if (openActionDropdownId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openActionDropdownId]);

  const handleCopyOrderNumber = (e: React.MouseEvent, orderNumber: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(orderNumber);
    setCopiedOrderNumber(orderNumber);
    setTimeout(() => setCopiedOrderNumber(null), 2000);
  };

  const handleOrderStatusSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    order: ApiOrder
  ) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === order.orderStatus || !onUpdateOrderStatus) return;

    setUpdatingAction({ orderNumber: order.orderNumber, field: "orderStatus" });
    try {
      await onUpdateOrderStatus(order, newStatus);
    } finally {
      setUpdatingAction(null);
    }
  };

  const handlePaymentStatusSelect = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    order: ApiOrder
  ) => {
    const newStatus = e.target.value as OrderPaymentStatus;
    if (newStatus === order.paymentStatus || !onUpdatePaymentStatus) return;

    setUpdatingAction({ orderNumber: order.orderNumber, field: "paymentStatus" });
    try {
      await onUpdatePaymentStatus(order, newStatus);
    } finally {
      setUpdatingAction(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/90 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4">Order # & Date</th>
              <th className="py-3.5 px-4">Customer Details</th>
              <th className="py-3.5 px-4">Delivery & Mode</th>
              <th className="py-3.5 px-4">Payment Status</th>
              <th className="py-3.5 px-4">Items Summary</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Order Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded w-28 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-20" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded w-32 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-24" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded w-20 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-16" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 bg-slate-200 rounded-lg w-20" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded w-24 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-16" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-slate-200 rounded w-16 mb-1.5" />
                    <div className="h-3 bg-slate-100 rounded w-12" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-6 bg-slate-200 rounded-full w-24" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="h-8 bg-slate-100 rounded-lg w-24 ml-auto" />
                  </td>
                </tr>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => {
                const totalItemUnits = (order.items || []).reduce(
                  (sum, item) => sum + (item.quantity || 0),
                  0
                );
                const isCancellable = canCancelOrder(order.orderStatus);

                const isStatusUpdating =
                  updatingAction?.orderNumber === order.orderNumber &&
                  updatingAction?.field === "orderStatus";
                const isPaymentUpdating =
                  updatingAction?.orderNumber === order.orderNumber &&
                  updatingAction?.field === "paymentStatus";

                const isActionMenuOpen = openActionDropdownId === order.orderNumber;

                return (
                  <tr
                    key={order._id || order.orderNumber}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    onClick={() => onViewOrder(order)}
                  >
                    {/* 1. Order Number & Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 font-mono text-xs group-hover:text-red-600 transition-colors">
                          {order.orderNumber}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyOrderNumber(e, order.orderNumber)}
                          title="Copy order number"
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                        >
                          {copiedOrderNumber === order.orderNumber ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    {/* 2. Customer Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-800 font-semibold text-xs">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {order.customer?.name ||
                            order.shippingAddress?.fullName ||
                            "Customer"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>{order.customerMobile || order.customer?.mobile || "—"}</span>
                      </div>
                      {order.shippingAddress?.city && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {order.shippingAddress.city}
                            {order.shippingAddress.pincode
                              ? ` - ${order.shippingAddress.pincode}`
                              : ""}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 3. Delivery & Mode */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {order.paymentMethod || "MANUAL"}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {order.deliveryMethod || "STANDARD"}
                      </span>
                    </td>

                    {/* 4. Payment Status (INLINE DROPDOWN) */}
                    <td
                      className="py-3.5 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-flex items-center group/pay">
                        <div className="flex items-center gap-1">
                          <OrderPaymentBadge status={order.paymentStatus} size="sm" />
                          {isPaymentUpdating ? (
                            <RotateCw className="w-3 h-3 animate-spin text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover/pay:text-slate-700 transition-colors" />
                          )}
                        </div>

                        {/* Interactive Select Overlay */}
                        <select
                          value={order.paymentStatus}
                          disabled={isPaymentUpdating}
                          onChange={(e) => handlePaymentStatusSelect(e, order)}
                          title="Click to change payment status"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed text-xs"
                        >
                          {ALL_PAYMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              Mark Payment: {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* 5. Items Summary */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                        <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {totalItemUnits} item{totalItemUnits !== 1 ? "s" : ""}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({order.items?.length || 0} variety)
                        </span>
                      </div>
                      {order.items && order.items[0] && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[170px] block mt-0.5">
                          {order.items[0].productName}
                          {order.items.length > 1
                            ? ` +${order.items.length - 1} more`
                            : ""}
                        </span>
                      )}
                    </td>

                    {/* 6. Total Amount */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm block">
                        {formatINR(order.grandTotal)}
                      </span>
                      {order.totalDiscount > 0 ? (
                        <span className="text-[10px] text-emerald-600 font-semibold block">
                          Saved {formatINR(order.totalDiscount)}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 block">
                          Subtotal: {formatINR(order.subtotal)}
                        </span>
                      )}
                    </td>

                    {/* 7. Order Status (INLINE DROPDOWN) */}
                    <td
                      className="py-3.5 px-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative inline-flex items-center group/status">
                        <div className="flex items-center gap-1">
                          <OrderStatusBadge status={order.orderStatus} size="sm" />
                          {isStatusUpdating ? (
                            <RotateCw className="w-3 h-3 animate-spin text-slate-500" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-slate-400 group-hover/status:text-slate-700 transition-colors" />
                          )}
                        </div>

                        {/* Interactive Select Overlay */}
                        <select
                          value={order.orderStatus}
                          disabled={isStatusUpdating}
                          onChange={(e) => handleOrderStatusSelect(e, order)}
                          title="Click to advance or change order status"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed text-xs"
                        >
                          {ALL_ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}{" "}
                              {isValidStatusTransition(order.orderStatus, status)
                                ? "✓ (Allowed)"
                                : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* 8. Actions Column (WITH ACTIONS DROPDOWN & QUICK BUTTONS) */}
                    <td
                      className="py-3.5 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1 relative">
                        {/* Quick View */}
                        <button
                          type="button"
                          onClick={() => onViewOrder(order)}
                          title="View order details"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Quick Print Invoice */}
                        <button
                          type="button"
                          onClick={() => onPrintOrder(order)}
                          title="Print tax invoice"
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Action Dropdown Toggle Button */}
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionDropdownId(
                                isActionMenuOpen ? null : order.orderNumber
                              )
                            }
                            title="More actions"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActionMenuOpen
                                ? "bg-slate-900 text-white"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Popover Action Menu */}
                          {isActionMenuOpen && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
                            >
                              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                Order #{order.orderNumber}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionDropdownId(null);
                                  onViewOrder(order);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View Full Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionDropdownId(null);
                                  onPrintOrder(order);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5 text-red-500" />
                                <span>Print Tax Invoice</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  handleCopyOrderNumber(e, order.orderNumber);
                                  setOpenActionDropdownId(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy Order Number</span>
                              </button>

                              {isCancellable && onRequestCancel && (
                                <div className="border-t border-slate-100 mt-1 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      onRequestCancel(order);
                                    }}
                                    className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors font-semibold"
                                  >
                                    <Ban className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Cancel Order</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-700 text-sm">No orders found</p>
                    <p className="text-xs text-slate-400">
                      No customer orders match your current search or filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
