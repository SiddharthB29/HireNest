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

function isAiAnalysisRequest(url: string | undefined): boolean {
  return Boolean(url && (url.includes('/ai/resume-analysis') || url.includes('/ai/job-match/')));
}

function aiHttpFallback(status: number, responseMessage: string): string {
  if (responseMessage && responseMessage !== 'An unexpected error occurred') {
    return responseMessage;
  }
  if (status === 401 || status === 403) {
    return 'You must be signed in with a student account to request this AI analysis.';
  }
  if (status === 502) {
    return 'The AI provider could not complete the request. Please try again later.';
  }
  if (status === 503 || status === 429) {
    return 'The AI provider is temporarily busy. Please try again later.';
  }
  if (status >= 500) {
    return 'The AI analysis could not be completed by the service. Please try again later.';
  }
  return `The AI analysis request failed (HTTP ${status}). Please review the request and try again.`;
}

// export const http = axios.create({
//   baseURL: '/api',
//   headers: { 'Content-Type': 'application/json' },
//   timeout: 15_000,
// });

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export const http = axios.create({
  baseURL: `${API_URL}/api`,
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
      const isAiRequest = isAiAnalysisRequest(error.config?.url);
      const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
      if (status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
      const responseMessage = extractMessage(error.response?.data, '');
      const fallback = isAiRequest
        ? status === 0
          ? isTimeout
            ? 'AI analysis timed out while waiting for a response. Please try again.'
            : 'Could not connect to the AI analysis service. Check your connection and try again.'
          : aiHttpFallback(status, responseMessage)
        : status === 0
          ? 'Network error — is the backend running?'
          : `Request failed (${status})`;
      return Promise.reject(
        new ApiError(status, isAiRequest && status !== 0 ? fallback : extractMessage(error.response?.data, fallback)),
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
