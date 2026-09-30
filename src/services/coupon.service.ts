import api from "@/lib/axiosInstance";
import type {
  ApiCoupon,
  CouponListResponse,
  CouponDetailResponse,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/coupon.types";

/**
 * Format date values to ISO string for backend date-time validation
 */
export function toIsoDateString(val?: string): string | undefined {
  if (!val || val.trim() === "") return undefined;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toISOString();
  } catch {
    return val;
  }
}

/**
 * Clean coupon payload to format numeric fields and dates
 */
export function cleanCouponPayload<T extends Record<string, any>>(payload: T): Partial<T> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === "") {
      continue;
    }

    if (key === "code" && typeof value === "string") {
      cleaned[key] = value.trim().toUpperCase();
    } else if (key === "startAt" || key === "expiresAt") {
      const iso = toIsoDateString(value);
      if (iso) cleaned[key] = iso;
    } else if (
      ["discountValue", "minimumOrderValue", "maximumDiscount", "usageLimit", "perCustomerLimit"].includes(key)
    ) {
      if (value === null) {
        cleaned[key] = null;
      } else {
        const num = Number(value);
        if (!isNaN(num)) cleaned[key] = num;
      }
    } else if (typeof value === "string") {
      cleaned[key] = value.trim();
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned as Partial<T>;
}

// ─── GET /admin/coupons ───────────────────────────────────────────────────────

export async function getCoupons(): Promise<ApiCoupon[]> {
  const { data } = await api.get<CouponListResponse>("/admin/coupons");
  return Array.isArray(data?.data) ? data.data : [];
}

// ─── GET /admin/coupons/{id} ──────────────────────────────────────────────────

export async function getCouponById(id: string): Promise<ApiCoupon> {
  const { data } = await api.get<CouponDetailResponse>(`/admin/coupons/${id}`);
  return data.data;
}

// ─── POST /admin/coupons ──────────────────────────────────────────────────────

export async function createCoupon(payload: CreateCouponPayload): Promise<ApiCoupon> {
  const cleaned = cleanCouponPayload(payload);
  const { data } = await api.post<{ message: string; data: ApiCoupon }>(
    "/admin/coupons",
    cleaned
  );
  return data.data;
}

// ─── PATCH /admin/coupons/{id} ────────────────────────────────────────────────

export async function updateCoupon(
  id: string,
  payload: UpdateCouponPayload
): Promise<ApiCoupon> {
  const cleaned = cleanCouponPayload(payload);
  const { data } = await api.patch<{ message: string; data: ApiCoupon }>(
    `/admin/coupons/${id}`,
    cleaned
  );
  return data.data;
}

// ─── DELETE /admin/coupons/{id} ───────────────────────────────────────────────

export async function deleteCoupon(id: string): Promise<void> {
  await api.delete(`/admin/coupons/${id}`);
}
