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
 * Checks whether an order can be cancelled.
 * Cancellation is ONLY allowed up to PROCESSING status (PENDING, CONFIRMED, PROCESSING).
 * Once an order reaches PACKED or SHIPPED, cancellation is strictly disallowed.
 */
export function canCancelOrder(status: OrderStatus): boolean {
  return ["PENDING", "CONFIRMED", "PROCESSING"].includes(status);
}

/**
 * Checks whether an order's payment status can be modified.
 * Once an order is CANCELLED, its payment status is permanently locked and cannot be modified.
 */
export function canUpdatePaymentStatus(orderStatus: OrderStatus): boolean {
  return orderStatus !== "CANCELLED";
}

/**
 * Validates whether an order can transition to a target status according to strict business workflow:
 * 1. PENDING -> CONFIRMED (ONLY if order paymentStatus === "PAID")
 * 2. CONFIRMED -> PROCESSING
 * 3. PROCESSING -> PACKED
 * 4. PACKED -> SHIPPED
 * 5. SHIPPED -> DELIVERED
 * 6. CANCELLED is allowed ONLY up to PROCESSING stage (PENDING, CONFIRMED, PROCESSING).
 * 7. Terminal statuses (DELIVERED, CANCELLED) cannot transition.
 */
export function canTransitionToStatus(
  order: { orderStatus: OrderStatus; paymentStatus: OrderPaymentStatus },
  targetStatus: OrderStatus
): { allowed: boolean; reason?: string } {
  if (order.orderStatus === targetStatus) {
    return { allowed: false, reason: `Order is already in ${targetStatus} status.` };
  }

  if (order.orderStatus === "DELIVERED") {
    return { allowed: false, reason: "Delivered orders cannot be modified." };
  }

  if (order.orderStatus === "CANCELLED") {
    return { allowed: false, reason: "Cancelled orders cannot be reopened or changed." };
  }

  // Cancel is allowed ONLY up to PROCESSING status (PENDING, CONFIRMED, PROCESSING)
  if (targetStatus === "CANCELLED") {
    if (!canCancelOrder(order.orderStatus)) {
      return {
        allowed: false,
        reason: `Orders in ${order.orderStatus} status cannot be cancelled. Cancellation is only permitted up to PROCESSING stage.`,
      };
    }
    return { allowed: true };
  }

  // 1. PENDING -> CONFIRMED (Requires PAID payment)
  if (targetStatus === "CONFIRMED") {
    if (order.orderStatus !== "PENDING") {
      return {
        allowed: false,
        reason: `Order cannot transition to CONFIRMED from ${order.orderStatus}. It must be in PENDING status.`,
      };
    }
    if (order.paymentStatus !== "PAID") {
      return {
        allowed: false,
        reason:
          "Order payment must be PAID before confirming! Please mark payment status as PAID first.",
      };
    }
    return { allowed: true };
  }

  // 2. CONFIRMED -> PROCESSING
  if (targetStatus === "PROCESSING") {
    if (order.orderStatus !== "CONFIRMED") {
      return {
        allowed: false,
        reason: `Order must be in CONFIRMED status before moving to PROCESSING. Current status is ${order.orderStatus}.`,
      };
    }
    return { allowed: true };
  }

  // 3. PROCESSING -> PACKED
  if (targetStatus === "PACKED") {
    if (order.orderStatus !== "PROCESSING") {
      return {
        allowed: false,
        reason: `Order must be in PROCESSING status before moving to PACKED. Current status is ${order.orderStatus}.`,
      };
    }
    return { allowed: true };
  }

  // 4. PACKED -> SHIPPED
  if (targetStatus === "SHIPPED") {
    if (order.orderStatus !== "PACKED") {
      return {
        allowed: false,
        reason: `Order must be PACKED before being marked as SHIPPED. Current status is ${order.orderStatus}.`,
      };
    }
    return { allowed: true };
  }

  // 5. SHIPPED -> DELIVERED
  if (targetStatus === "DELIVERED") {
    if (order.orderStatus !== "SHIPPED") {
      return {
        allowed: false,
        reason: `Order must be SHIPPED before being marked as DELIVERED. Current status is ${order.orderStatus}.`,
      };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: "Invalid workflow status transition." };
}

/**
 * Checks if a target status is a valid next transition from the current order status.
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  paymentStatus?: OrderPaymentStatus
): boolean {
  if (paymentStatus) {
    return canTransitionToStatus({ orderStatus: currentStatus, paymentStatus }, targetStatus).allowed;
  }
  if (currentStatus === targetStatus) return false;
  if (targetStatus === "CANCELLED") return canCancelOrder(currentStatus);
  const allowed = VALID_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Returns the list of allowable next statuses for a given current status.
 */
export function getNextAllowedStatuses(
  currentStatus: OrderStatus,
  _paymentStatus?: OrderPaymentStatus
): OrderStatus[] {
  if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") {
    return [];
  }
  return [...(VALID_ORDER_STATUS_TRANSITIONS[currentStatus] || [])];
}
