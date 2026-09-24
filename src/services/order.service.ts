import api from "@/lib/axiosInstance";
import type {
  ApiOrder,
  OrderListResponse,
  OrderDetailResponse,
  OrderFilterParams,
  OrderStatus,
  OrderPaymentStatus,
  OrderActionResponse,
} from "@/types/order.types";
import {
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "@/validations/order.validation";

/**
 * ─── GET /admin/orders ────────────────────────────────────────────────────────
 * List and filter all customer orders.
 * Supports searching by orderNumber, customer name, or mobile,
 * and filtering by orderStatus and paymentStatus.
 */
export async function getOrders(params?: OrderFilterParams): Promise<ApiOrder[]> {
  const queryParams: Record<string, string> = {};

  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }

  if (params?.orderStatus && params.orderStatus !== "ALL") {
    queryParams.orderStatus = params.orderStatus;
  }

  if (params?.paymentStatus && params.paymentStatus !== "ALL") {
    queryParams.paymentStatus = params.paymentStatus;
  }

  const { data } = await api.get<OrderListResponse>("/admin/orders", {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return Array.isArray(data?.data) ? data.data : [];
}

/**
 * ─── GET /admin/orders/{orderNumber} ──────────────────────────────────────────
 * Retrieve complete order details by orderNumber.
 */
export async function getOrderByOrderNumber(orderNumber: string): Promise<ApiOrder> {
  if (!orderNumber || !orderNumber.trim()) {
    throw new Error("Order number is required");
  }

  const encoded = encodeURIComponent(orderNumber.trim());
  const { data } = await api.get<OrderDetailResponse>(`/admin/orders/${encoded}`);

  return data.data;
}

/**
 * ─── PATCH /admin/orders/{orderNumber}/status ──────────────────────────────────
 * Update the order status using valid workflow transitions.
 * Body: { status: OrderStatus }
 */
export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus
): Promise<ApiOrder> {
  if (!orderNumber || !orderNumber.trim()) {
    throw new Error("Order number is required");
  }

  // Client-side schema validation
  updateOrderStatusSchema.validateSync({ status });

  const encoded = encodeURIComponent(orderNumber.trim());
  const { data } = await api.patch<OrderDetailResponse>(
    `/admin/orders/${encoded}/status`,
    { status }
  );

  return data.data;
}

/**
 * ─── PATCH /admin/orders/{orderNumber}/payment-status ──────────────────────────
 * Update the order payment status.
 * Body: { status: OrderPaymentStatus }
 */
export async function updateOrderPaymentStatus(
  orderNumber: string,
  status: OrderPaymentStatus
): Promise<ApiOrder> {
  if (!orderNumber || !orderNumber.trim()) {
    throw new Error("Order number is required");
  }

  // Client-side schema validation
  updatePaymentStatusSchema.validateSync({ status });

  const encoded = encodeURIComponent(orderNumber.trim());
  const { data } = await api.patch<OrderDetailResponse>(
    `/admin/orders/${encoded}/payment-status`,
    { status }
  );

  return data.data;
}

/**
 * ─── PATCH /admin/orders/{orderNumber}/cancel ──────────────────────────────────
 * Cancel an order before shipping.
 */
export async function cancelOrder(orderNumber: string): Promise<OrderActionResponse> {
  if (!orderNumber || !orderNumber.trim()) {
    throw new Error("Order number is required");
  }

  const encoded = encodeURIComponent(orderNumber.trim());
  const { data } = await api.patch<OrderActionResponse>(
    `/admin/orders/${encoded}/cancel`
  );

  return data;
}
