import api from "@/lib/axiosInstance";
import type {
  ApiStoreSettings,
  StoreSettingsResponse,
  UpdateStoreSettingsPayload,
} from "@/types/settings.types";

/**
 * Clean payload to ensure empty strings are trimmed, GSTIN uppercase, and values formatted properly.
 */
export function cleanSettingsPayload(payload: UpdateStoreSettingsPayload): Partial<UpdateStoreSettingsPayload> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      cleaned[key] = key === "gstin" ? trimmed.toUpperCase() : trimmed;
    } else if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned as Partial<UpdateStoreSettingsPayload>;
}

// ─── GET /admin/settings/store ───────────────────────────────────────────────

export async function getStoreSettings(): Promise<ApiStoreSettings> {
  const { data } = await api.get<StoreSettingsResponse>("/admin/settings/store");
  return data.data;
}

// ─── PATCH /admin/settings/store ──────────────────────────────────────────────

export async function updateStoreSettings(
  payload: UpdateStoreSettingsPayload
): Promise<ApiStoreSettings> {
  const cleaned = cleanSettingsPayload(payload);
  const { data } = await api.patch<StoreSettingsResponse>(
    "/admin/settings/store",
    cleaned
  );
  return data.data;
}
