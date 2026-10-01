import api from "@/lib/axiosInstance";
import type {
  PosBill,
  PosListResponse,
  PosDetailResponse,
  PosCreateBillPayload,
  PosProduct,
  PosProductListResponse,
  PosProductFilterParams,
} from "@/types/pos.types";

/**
 * ─── GET /admin/pos/products ──────────────────────────────────────────────────
 * Fetch POS products directly from /admin/pos/products endpoint.
 * Returns products with pre-calculated MRP, discountPercent, and sellingPrice.
 */
export async function getPosProducts(
  params?: PosProductFilterParams
): Promise<PosProduct[]> {
  const queryParams: Record<string, string> = {};
  if (params?.search?.trim()) queryParams.search = params.search.trim();
  if (params?.categoryId && params.categoryId !== "all") {
    queryParams.categoryId = params.categoryId;
  }

  const { data } = await api.get<PosProductListResponse>("/admin/pos/products", {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });
  return Array.isArray(data?.data) ? data.data : [];
}

/**
 * ─── GET /admin/pos/bills ─────────────────────────────────────────────────────
 * List all POS bills, optionally filtered.
 */
export async function getPosBills(params?: {
  search?: string;
  status?: string;
  paymentMethod?: string;
}): Promise<PosBill[]> {
  const queryParams: Record<string, string> = {};
  if (params?.search?.trim()) queryParams.search = params.search.trim();
  if (params?.status && params.status !== "ALL") queryParams.status = params.status;
  if (params?.paymentMethod && params.paymentMethod !== "ALL")
    queryParams.paymentMethod = params.paymentMethod;

  const { data } = await api.get<PosListResponse>("/admin/pos/bills", {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });
  return Array.isArray(data?.data) ? data.data : [];
}

/**
 * ─── GET /admin/pos/bills/{billNumber} ────────────────────────────────────────
 * Get a single POS bill by bill number.
 */
export async function getPosBillByNumber(billNumber: string): Promise<PosBill> {
  const encoded = encodeURIComponent(billNumber.trim());
  const { data } = await api.get<PosDetailResponse>(`/admin/pos/bills/${encoded}`);
  return data.data;
}

/**
 * ─── GET /admin/pos/bills/{billNumber}/receipt ────────────────────────────────
 * Get receipt data for a POS bill (same shape as PosBill).
 */
export async function getPosBillReceipt(billNumber: string): Promise<PosBill> {
  const encoded = encodeURIComponent(billNumber.trim());
  const { data } = await api.get<PosDetailResponse>(
    `/admin/pos/bills/${encoded}/receipt`
  );
  return data.data;
}

/**
 * ─── POST /admin/pos/bills ────────────────────────────────────────────────────
 * Create a new POS bill.
 */
export async function createPosBill(payload: PosCreateBillPayload): Promise<PosBill> {
  const { data } = await api.post<PosDetailResponse>("/admin/pos/bills", payload);
  return data.data;
}

/**
 * ─── PATCH /admin/pos/bills/{billNumber}/cancel ───────────────────────────────
 * Cancel an existing POS bill.
 */
export async function cancelPosBill(
  billNumber: string
): Promise<{ message: string }> {
  const encoded = encodeURIComponent(billNumber.trim());
  const { data } = await api.patch<{ message: string }>(
    `/admin/pos/bills/${encoded}/cancel`
  );
  return data;
}
