export interface CustomerOrderSummary {
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  itemsCount: number;
}

export interface AggregatedCustomer {
  id: string; // normalized phone key (e.g. 9840012345)
  name: string;
  mobile: string;
  cleanMobile: string; // 10 or 12 digit format for wa.me links (e.g. 919840012345)
  email?: string;
  city?: string;
  address?: string;
  pincode?: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate?: string;
  lastOrderDate?: string;
  lastOrderNumber?: string;
  lastOrderStatus?: string;
  orders: CustomerOrderSummary[];
  status: "ACTIVE" | "INACTIVE";
  source: "ORDER" | "MANUAL";
}

export interface CustomerWhatsAppMessagePayload {
  customer: AggregatedCustomer;
  templateType: "diwali_announcement" | "new_arrivals" | "loyal_discount" | "custom";
  message: string;
}
