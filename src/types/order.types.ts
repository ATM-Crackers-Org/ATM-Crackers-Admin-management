export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderCustomer {
  name: string;
  mobile: string;
  email?: string;
}

export interface OrderShippingAddress {
  fullName?: string;
  streetAddress?: string;
  city: string;
  state?: string;
  pincode: string;
  landmark?: string;
}

export interface ApiOrderItem {
  productId: string;
  categoryId?: string;
  productName: string;
  categoryName?: string;
  image?: string;
  quantity: number;
  mrp: number;
  sellingPrice: number;
  discountPercent?: number;
  itemTotal: number;
}

export interface ApiOrder {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerMobile: string;
  customer: OrderCustomer;
  shippingAddress?: OrderShippingAddress;
  items: ApiOrderItem[];
  subtotal: number;
  totalDiscount: number;
  deliveryCharge: number;
  grandTotal: number;
  deliveryMethod?: string;
  paymentMethod?: string;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;
  promoCode?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface OrderListResponse {
  message: string;
  count: number;
  data: ApiOrder[];
}

export interface OrderDetailResponse {
  message: string;
  data: ApiOrder;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdatePaymentStatusPayload {
  status: OrderPaymentStatus;
}

export interface OrderActionResponse {
  message: string;
  data?: ApiOrder;
}

export interface OrderFilterParams {
  search?: string;
  orderStatus?: OrderStatus | "ALL";
  paymentStatus?: OrderPaymentStatus | "ALL";
}

/**
 * Valid workflow state transitions for orders.
 * Terminal states (DELIVERED, CANCELLED) cannot transition further.
 */
export const VALID_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * Status sequence for visual progression
 */
export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const ALL_PAYMENT_STATUSES: OrderPaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];
