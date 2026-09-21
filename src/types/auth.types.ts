// ─── Request payloads ──────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  refreshToken: string;
}

// ─── API responses ─────────────────────────────────────────────────────────────

export type AdminRole = "ADMIN" | "SUPER_ADMIN" | "MANAGER";

// Matches actual API: { id, name, email, role }
export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

// Matches actual API login response:
// { accessToken, refreshToken, tokenType, expiresIn, admin: { id, name, email, role } }
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
  admin: AdminProfile;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// GET /admin/auth/me → { data: { adminId, email, role } }
export interface MeResponse {
  data: {
    adminId: string;
    email: string;
    role: AdminRole;
  };
}

// ─── PATCH /admin/auth/password ───────────────────────────────────────────────

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

// ─── PATCH /admin/auth/profile ────────────────────────────────────────────────

export interface UpdateProfilePayload {
  name: string;
  email: string;
  currentPassword: string;
}

export interface UpdateProfileResponse {
  message: string;
  admin?: AdminProfile;
}
