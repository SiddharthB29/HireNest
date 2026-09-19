import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Shared HTTP client for the real Spring Boot API.
 *
 * - baseURL `/api` is same-origin; the Vite dev proxy forwards to :8081,
 *   so no CORS is involved in development.
 * - Attaches the bearer token from the same localStorage session that
 *   AuthContext persists (`hirenest.session`).
 * - Normalizes every failure into `ApiError` (which the UI already handles),
 *   covering both `ErrorResponse` JSON bodies and plain-string bodies
 *   (the login endpoint returns raw text on bad credentials).
 * - Broadcasts `hirenest:unauthorized` on any 401 so the AuthContext can
 *   log the user out when a session expires mid-use.
 */

export const SESSION_KEY = 'hirenest.session';
export const UNAUTHORIZED_EVENT = 'hirenest:unauthorized';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

interface StoredSession {
  token: string;
}

function readToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession | null;
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

export const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

http.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      if (status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
      const fallback =
        status === 0
          ? 'Network error — is the backend running?'
          : `Request failed (${status})`;
      return Promise.reject(
        new ApiError(status, extractMessage(error.response?.data, fallback)),
      );
    }
    return Promise.reject(new ApiError(0, 'Unexpected error'));
  },
);

/* ---------- Typed convenience helpers ---------- */

export async function httpGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await http.get(url, config);
  return response.data;
}

export async function httpPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await http.post(url, body, config);
  return response.data;
}

export async function httpPut<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await http.put(url, body, config);
  return response.data;
}

export async function httpPatch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await http.patch(url, body, config);
  return response.data;
}

export async function httpDelete(url: string, config?: AxiosRequestConfig): Promise<void> {
  await http.delete(url, config);
}
