import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { Env } from "./env";

// ─── Token helpers ─────────────────────────────────────────────────────────────

export const TokenStore = {
  getAccess: (): string | null =>
    typeof window !== "undefined"
      ? localStorage.getItem(Env.ACCESS_TOKEN_KEY)
      : null,

  getRefresh: (): string | null =>
    typeof window !== "undefined"
      ? localStorage.getItem(Env.REFRESH_TOKEN_KEY)
      : null,

  set: (accessToken: string, refreshToken: string): void => {
    localStorage.setItem(Env.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(Env.REFRESH_TOKEN_KEY, refreshToken);
  },

  clear: (): void => {
    localStorage.removeItem(Env.ACCESS_TOKEN_KEY);
    localStorage.removeItem(Env.REFRESH_TOKEN_KEY);
  },
};

// ─── Axios instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: Env.API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: Env.API_TIMEOUT_MS,
});

// ─── Request interceptor ───────────────────────────────────────────────────────
// Attach access token to every outgoing request.

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenStore.getAccess();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Refresh token queue ───────────────────────────────────────────────────────
// Prevents multiple simultaneous refresh calls when several requests 401 at once.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token as string);
  });
  failedQueue = [];
}

// ─── Response interceptor ──────────────────────────────────────────────────────
// 401 → attempt silent token refresh → retry original request.
// Refresh failure → clear tokens + redirect to /login.

api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── 401 handling ──────────────────────────────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = TokenStore.getRefresh();

      // No refresh token → logout immediately
      if (!refreshToken) {
        TokenStore.clear();
        if (typeof window !== "undefined") {
          localStorage.removeItem("atm_crackers_admin_store_v1");
          window.location.href = "/login";
        }
        return Promise.reject(new Error("Session expired. Please log in again."));
      }

      // Already refreshing → queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return api(originalRequest);
        });
      }

      // Start refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${Env.API_BASE_URL}/admin/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken: string = data.accessToken;
        const newRefreshToken: string = data.refreshToken ?? refreshToken;

        TokenStore.set(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenStore.clear();
        if (typeof window !== "undefined") {
          localStorage.removeItem("atm_crackers_admin_store_v1");
          window.location.href = "/login";
        }
        return Promise.reject(new Error("Session expired. Please log in again."));
      } finally {
        isRefreshing = false;
      }
    }

    // ── Other errors ──────────────────────────────────────────────────────────
    if (error.response) {
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Request failed with status ${error.response.status}`;
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(
        new Error("No response from server. Please check your connection.")
      );
    }

    return Promise.reject(error);
  }
);

export default api;
