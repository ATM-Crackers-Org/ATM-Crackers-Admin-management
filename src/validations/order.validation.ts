import * as Yup from "yup";
import {
  OrderStatus,
  OrderPaymentStatus,
  ALL_ORDER_STATUSES,
  ALL_PAYMENT_STATUSES,
  VALID_ORDER_STATUS_TRANSITIONS,
} from "@/types/order.types";

/**
 * Validation schema for PATCH /admin/orders/{orderNumber}/status
 */
export const updateOrderStatusSchema = Yup.object({
  status: Yup.string()
    .oneOf(ALL_ORDER_STATUSES, "Please select a valid order status")
    .required("Order status is required"),
});

/**
 * Validation schema for PATCH /admin/orders/{orderNumber}/payment-status
 */
export const updatePaymentStatusSchema = Yup.object({
  status: Yup.string()
    .oneOf(ALL_PAYMENT_STATUSES, "Please select a valid payment status")
    .required("Payment status is required"),
});

/**
 * Validation schema for GET /admin/orders query parameters
 */
export const orderFilterSchema = Yup.object({
  search: Yup.string().trim().optional(),
  orderStatus: Yup.string()
    .oneOf(["ALL", ...ALL_ORDER_STATUSES], "Invalid order status filter")
    .optional(),
  paymentStatus: Yup.string()
    .oneOf(["ALL", ...ALL_PAYMENT_STATUSES], "Invalid payment status filter")
    .optional(),
});

/**
 * Checks whether an order can be cancelled before shipping.
 * Cancellation is typically allowed for PENDING, CONFIRMED, PROCESSING, and PACKED orders.
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return ["PENDING", "CONFIRMED", "PROCESSING", "PACKED"].includes(status);
}

/**
 * Checks if a target status is a valid next transition from the current order status.
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): boolean {
  if (currentStatus === targetStatus) return false;
  const allowed = VALID_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Returns the list of allowable next statuses for a given current status.
 */
export function getNextAllowedStatuses(currentStatus: OrderStatus): OrderStatus[] {
  return VALID_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
}
