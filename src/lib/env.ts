
function get(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const Env = {
  // ── API ───────────────────────────────────────────────────────────────────
  API_BASE_URL: get(
    "NEXT_PUBLIC_API_BASE_URL",
    "https://atm-crackers-backend-ne5o.onrender.com"
  ),

  API_TIMEOUT_MS: Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 15_000),

  // ── Auth tokens ───────────────────────────────────────────────────────────
  /** localStorage key for the short-lived JWT access token */
  ACCESS_TOKEN_KEY: get("NEXT_PUBLIC_ACCESS_TOKEN_KEY", "atm_admin_access"),

  /** localStorage key for the long-lived refresh token */
  REFRESH_TOKEN_KEY: get("NEXT_PUBLIC_REFRESH_TOKEN_KEY", "atm_admin_refresh"),
} as const;

export type EnvConfig = typeof Env;
