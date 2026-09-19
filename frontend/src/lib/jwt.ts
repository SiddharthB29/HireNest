/**
 * Minimal JWT payload decoder.
 *
 * The backend verifies the signature — we only decode claims to bootstrap
 * the session (role, student/company linkage) on the client. These claims
 * are never trusted for authorization; the server enforces everything.
 */

export interface JwtClaims {
  sub: string;
  role?: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  userId?: number;
  studentId?: number;
  companyId?: number;
  companyName?: string;
  exp?: number;
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  // Decode UTF-8 bytes properly (handles non-ASCII characters in claims).
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwtPayload(token: string): JwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as JwtClaims;
  } catch {
    return null;
  }
}

/** True when the token has an `exp` claim in the past (5s clock slack). */
export function isTokenExpired(token: string): boolean {
  const claims = decodeJwtPayload(token);
  if (!claims?.exp) return false;
  return claims.exp * 1000 < Date.now() + 5_000;
}
