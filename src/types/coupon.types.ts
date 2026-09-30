export type CouponDiscountType = "FIXED_AMOUNT" | "PERCENTAGE";
export type CouponStatus = "ACTIVE" | "INACTIVE";

export interface ApiCoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscount?: number | null;
  usageLimit: number;
  usedCount: number;
  perCustomerLimit: number;
  startAt: string;
  expiresAt: string;
  status: CouponStatus;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CouponListResponse {
  message: string;
  count: number;
  data: ApiCoupon[];
}

export interface CouponDetailResponse {
  message: string;
  data: ApiCoupon;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumOrderValue?: number;
  maximumDiscount?: number | null;
  usageLimit?: number;
  perCustomerLimit?: number;
  startAt: string;
  expiresAt: string;
  status?: CouponStatus;
}

export interface UpdateCouponPayload {
  code?: string;
  description?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  minimumOrderValue?: number;
  maximumDiscount?: number | null;
  usageLimit?: number;
  perCustomerLimit?: number;
  startAt?: string;
  expiresAt?: string;
  status?: CouponStatus;
}

export interface CouponFormValues {
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number | "";
  minimumOrderValue: number | "";
  maximumDiscount: number | "" | null;
  usageLimit: number | "";
  perCustomerLimit: number | "";
  startAt: string;
  expiresAt: string;
  status: CouponStatus;
}
