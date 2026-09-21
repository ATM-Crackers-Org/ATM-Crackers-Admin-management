import api from "@/lib/axiosInstance";
import type {
  ApiCategory,
  CategoryListResponse,
  CategoryDetailResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";

/**
 * Strips empty strings, undefined, null, or whitespace-only strings from payloads.
 * Ensures fields with empty values are omitted completely from the request.
 */
export function cleanCategoryPayload<T extends Record<string, any>>(payload: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed !== "") {
        cleaned[key] = trimmed;
      }
    } else if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<T>;
}

// ─── GET /admin/categories ───────────────────────────────────────────────────

export async function getCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get<CategoryListResponse>("/admin/categories");
  return data.data;
}

// ─── GET /admin/categories/{id} ──────────────────────────────────────────────

export async function getCategoryById(id: string): Promise<ApiCategory> {
  const { data } = await api.get<CategoryDetailResponse>(`/admin/categories/${id}`);
  return data.data;
}

// ─── POST /admin/categories ──────────────────────────────────────────────────

export async function createCategory(payload: CreateCategoryPayload): Promise<ApiCategory> {
  const cleaned = cleanCategoryPayload(payload);
  // User requirement: "crete category la status vendam athuserver side handle panniruvanga..."
  delete (cleaned as Record<string, any>).status;

  const { data } = await api.post<{ message: string; data: ApiCategory }>(
    "/admin/categories",
    cleaned
  );
  return data.data;
}

// ─── PATCH /admin/categories/{id} ────────────────────────────────────────────

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload
): Promise<ApiCategory> {
  const cleaned = cleanCategoryPayload(payload);
  // User requirement: "but eidt for la status venum" - status is preserved if present
  const { data } = await api.patch<{ message: string; data: ApiCategory }>(
    `/admin/categories/${id}`,
    cleaned
  );
  return data.data;
}

// ─── DELETE /admin/categories/{id} ───────────────────────────────────────────

export async function deleteCategory(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/categories/${id}`);
  return data;
}
