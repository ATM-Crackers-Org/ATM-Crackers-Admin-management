import api from "@/lib/axiosInstance";
import type {
  ApiProduct,
  ProductListResponse,
  ProductDetailResponse,
  ProductFilterParams,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types/product.types";

/**
 * Strips empty strings, undefined, null, or whitespace-only strings from payloads.
 * Ensures fields with empty values are omitted completely from the request.
 */
export function cleanProductPayload<T extends Record<string, any>>(payload: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed !== "") {
        cleaned[key] = trimmed;
      }
    } else if (Array.isArray(value)) {
      // Filter out empty strings from image arrays
      const filtered = value
        .filter((item) => typeof item === "string" && item.trim() !== "")
        .map((item) => item.trim());
      if (filtered.length > 0) {
        cleaned[key] = filtered;
      }
    } else if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

// ─── GET /admin/products ─────────────────────────────────────────────────────

export async function getProducts(params?: ProductFilterParams): Promise<ApiProduct[]> {
  const queryParams: Record<string, string> = {};

  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (params?.categoryId && params.categoryId !== "all" && params.categoryId.trim()) {
    queryParams.categoryId = params.categoryId.trim();
  }
  if (params?.status) {
    queryParams.status = params.status;
  }
  if (params?.stockStatus) {
    queryParams.stockStatus = params.stockStatus;
  }

  const { data } = await api.get<ProductListResponse>("/admin/products", {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return data.data;
}

// ─── GET /admin/products/{id} ────────────────────────────────────────────────

export async function getProductById(id: string): Promise<ApiProduct> {
  const { data } = await api.get<ProductDetailResponse>(`/admin/products/${id}`);
  return data.data;
}

// ─── POST /admin/products ────────────────────────────────────────────────────

export async function createProduct(payload: CreateProductPayload): Promise<ApiProduct> {
  const cleaned = cleanProductPayload(payload);

  const { data } = await api.post<{ message: string; data: ApiProduct }>(
    "/admin/products",
    cleaned
  );
  return data.data;
}

// ─── PATCH /admin/products/{id} ──────────────────────────────────────────────

export async function updateProduct(
  id: string,
  payload: UpdateProductPayload
): Promise<ApiProduct> {
  const cleaned = cleanProductPayload(payload);

  const { data } = await api.patch<{ message: string; data: ApiProduct }>(
    `/admin/products/${id}`,
    cleaned
  );
  return data.data;
}

// ─── DELETE /admin/products/{id} ─────────────────────────────────────────────

export async function deleteProduct(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/products/${id}`);
  return data;
}
