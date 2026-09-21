import api, { TokenStore } from "@/lib/axiosInstance";
import type {
  LoginPayload,
  LoginResponse,
  RefreshPayload,
  RefreshResponse,
  LogoutPayload,
  MeResponse,
  AdminProfile,
  ChangePasswordPayload,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "@/types/auth.types";

// ─── POST /admin/auth/login ────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<AdminProfile> {
  const { data } = await api.post<LoginResponse>("/admin/auth/login", payload);
  TokenStore.set(data.accessToken, data.refreshToken);
  return data.admin;
}

// ─── POST /admin/auth/refresh ─────────────────────────────────────────────────

export async function refreshTokens(
  payload: RefreshPayload
): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>("/admin/auth/refresh", payload);
  TokenStore.set(data.accessToken, data.refreshToken);
  return data;
}

// ─── POST /admin/auth/logout ──────────────────────────────────────────────────

export async function logout(payload: LogoutPayload): Promise<void> {
  try {
    await api.post("/admin/auth/logout", payload);
  } finally {
    TokenStore.clear();
  }
}

// ─── GET /admin/auth/me ───────────────────────────────────────────────────────

export async function getMe(): Promise<MeResponse["data"]> {
  const { data } = await api.get<MeResponse>("/admin/auth/me");
  return data.data;
}

// ─── PATCH /admin/auth/password ───────────────────────────────────────────────
// Body: { currentPassword, newPassword }

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<void> {
  await api.patch("/admin/auth/password", payload);
}

// ─── PATCH /admin/auth/profile ────────────────────────────────────────────────
// Body: { name, email, currentPassword }

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> {
  const { data } = await api.patch<UpdateProfileResponse>(
    "/admin/auth/profile",
    payload
  );
  return data;
}
