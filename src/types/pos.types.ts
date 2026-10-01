// ─── POS Product Types ───────────────────────────────────────────────────────

export interface PosProductCategory {
  _id: string;
  name: string;
  slug: string;
  displayOrder?: number;
  imageUrl?: string;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface PosProduct {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  category: PosProductCategory | string;
  images: string[];
  mrp: number;
  discountPercent: number;
  sellingPrice: number;
  stockQuantity: number;
  stockStatus: "in_stock" | "out_of_stock" | "limited" | string;
  description?: string;
  status?: string;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PosProductListResponse {
  message: string;
  count: number;
  data: PosProduct[];
}

export interface PosProductFilterParams {
  search?: string;
  categoryId?: string;
}

// ─── POS Bill Types ──────────────────────────────────────────────────────────

export type PosBillStatus = "COMPLETED" | "CANCELLED";
export type PosPaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "CREDIT";
export type PosPaymentStatus = "PENDING" | "PAID";

export interface PosShippingAddress {
  fullName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  _id?: string;
}

export interface PosBillItem {
  productId: string;
  categoryId?: string;
  productName: string;
  categoryName?: string;
  image?: string;
  quantity: number;
  mrp: number;
  sellingPrice: number;
  discountPercent?: number;
  offerId?: string | null;
  offerName?: string | null;
  itemTotal: number;
}

export interface PosBill {
  _id: string;
  billNumber: string;
  createdBy: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  shippingAddress?: PosShippingAddress | null;
  items: PosBillItem[];
  subtotal: number;
  totalDiscount: number;
  couponCode?: string | null;
  couponDiscount: number;
  grandTotal: number;
  paymentMethod: PosPaymentMethod;
  paymentStatus: PosPaymentStatus;
  amountReceived: number;
  changeAmount: number;
  status: PosBillStatus;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface PosListResponse {
  message: string;
  count: number;
  data: PosBill[];
}

export interface PosDetailResponse {
  message: string;
  data: PosBill;
}

// ─── POS Bill Create DTO ─────────────────────────────────────────────────────

export interface PosCreateBillItem {
  productId: string;
  quantity: number;
}

export interface PosCreateBillPayload {
  customer?: {
    name?: string;
    mobile?: string;
    email?: string;
  };
  shippingAddress?: {
    fullName: string;
    streetAddress: string;
    city: string;
    state?: string;
    pincode: string;
    landmark?: string;
  };
  items: PosCreateBillItem[];
  couponCode?: string;
  paymentMethod: PosPaymentMethod;
  paymentStatus?: PosPaymentStatus;
  amountReceived?: number;
}
