import api from "@/lib/axiosInstance";
import type {
  ApiOffer,
  CreateOfferPayload,
  UpdateOfferPayload,
  OfferListResponse,
  OfferDetailResponse,
} from "@/types/offer.types";

/**
 * Format local datetime string (e.g. 2026-10-02T00:00) to ISO 8601 string
 */
export function toIsoDateTime(val?: string): string | undefined {
  if (!val || val.trim() === "") return undefined;
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toISOString();
  } catch {
    return val;
  }
}

/**
 * Clean and format offer payload to strictly match backend DTOs
 */
export function cleanOfferPayload<T extends CreateOfferPayload | UpdateOfferPayload>(
  payload: T
): Partial<T> {
  const cleaned: Record<string, any> = {};

  if (payload.name !== undefined && payload.name !== "") {
    cleaned.name = payload.name.trim();
  }

  if (payload.description !== undefined) {
    cleaned.description = typeof payload.description === "string" ? payload.description.trim() : "";
  }

  if (payload.discountPercent !== undefined && payload.discountPercent !== null) {
    const num = Number(payload.discountPercent);
    if (!isNaN(num)) cleaned.discountPercent = num;
  }

  if (payload.scope !== undefined) {
    cleaned.scope = payload.scope;
  }

  if (payload.startAt) {
    const iso = toIsoDateTime(payload.startAt);
    if (iso) cleaned.startAt = iso;
  }

  if (payload.expiresAt) {
    const iso = toIsoDateTime(payload.expiresAt);
    if (iso) cleaned.expiresAt = iso;
  }

  if (payload.status) {
    cleaned.status = payload.status;
  }

  // Handle scope-specific target arrays
  if (payload.scope === "GLOBAL") {
    cleaned.categoryIds = [];
    cleaned.productIds = [];
  } else if (payload.scope === "CATEGORY") {
    cleaned.categoryIds = Array.isArray(payload.categoryIds)
      ? payload.categoryIds.filter((id) => typeof id === "string" && id.trim() !== "")
      : [];
    cleaned.productIds = [];
  } else if (payload.scope === "PRODUCT") {
    cleaned.productIds = Array.isArray(payload.productIds)
      ? payload.productIds.filter((id) => typeof id === "string" && id.trim() !== "")
      : [];
    cleaned.categoryIds = [];
  } else {
    // Partial update without changing scope
    if (Array.isArray(payload.categoryIds)) {
      cleaned.categoryIds = payload.categoryIds.filter((id) => typeof id === "string" && id.trim() !== "");
    }
    if (Array.isArray(payload.productIds)) {
      cleaned.productIds = payload.productIds.filter((id) => typeof id === "string" && id.trim() !== "");
    }
  }

  return cleaned as Partial<T>;
}

// ─── GET /admin/offers (List seasonal offers) ───────────────────────────────────

export async function getOffers(): Promise<ApiOffer[]> {
  const { data } = await api.get<OfferListResponse>("/admin/offers");
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

// ─── GET /admin/offers/{id} (Get single offer) ──────────────────────────────────

export async function getOfferById(id: string): Promise<ApiOffer> {
  const { data } = await api.get<OfferDetailResponse>(`/admin/offers/${id}`);
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as unknown as ApiOffer;
}

// ─── POST /admin/offers (Create seasonal offer) ─────────────────────────────────

export async function createOffer(payload: CreateOfferPayload): Promise<ApiOffer> {
  const cleaned = cleanOfferPayload(payload);
  const { data } = await api.post<{ message?: string; data?: ApiOffer } | ApiOffer>(
    "/admin/offers",
    cleaned
  );
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as ApiOffer;
}

// ─── PATCH /admin/offers/{id} (Update seasonal offer) ───────────────────────────

export async function updateOffer(
  id: string,
  payload: UpdateOfferPayload
): Promise<ApiOffer> {
  const cleaned = cleanOfferPayload(payload);
  const { data } = await api.patch<{ message?: string; data?: ApiOffer } | ApiOffer>(
    `/admin/offers/${id}`,
    cleaned
  );
  if (data && typeof data === "object" && "data" in data && data.data) {
    return data.data;
  }
  return data as ApiOffer;
}

// ─── DELETE /admin/offers/{id} (Delete seasonal offer) ──────────────────────────

export async function deleteOffer(id: string): Promise<void> {
  await api.delete(`/admin/offers/${id}`);
}
