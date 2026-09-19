import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { SESSION_KEY, UNAUTHORIZED_EVENT } from '../services/http';
import { decodeJwtPayload, isTokenExpired } from '../lib/jwt';
import * as authApi from '../services/apiClient';

/**
 * Auth context — the session IS the backend JWT. The token is persisted in
 * localStorage and the user object is derived from the token's claims
 * (role, userId, student/company linkage), so what the UI knows about the
 * session always comes from what the backend signed.
 *
 * Any 401 from the HTTP client broadcasts `hirenest:unauthorized`, which
 * logs the user out here — covering expired (1h) or rejected tokens
 * without a refresh-token flow.
 */

interface StoredSession {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string) => Promise<User>;
  refreshSession: () => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.token || !parsed?.user?.role) return null;
    // The session is only as valid as the token it is built from: it must
    // decode as a real JWT with the claims we expect (discards anything
    // stale or non-JWT), and an `exp` in the past means logged out.
    const claims = decodeJwtPayload(parsed.token);
    if (!claims?.sub || !claims.role) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    if (isTokenExpired(parsed.token)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    // Prefer the claims over the stored user object (they may diverge if
    // the account changed between sessions).
    return {
      token: parsed.token,
      user: {
        ...parsed.user,
        id: claims.userId ?? parsed.user.id,
        userName: claims.sub,
        role: claims.role,
        studentId: claims.studentId,
        companyId: claims.companyId,
        companyName: claims.companyName,
      },
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession());

  const persist = useCallback((next: StoredSession | null) => {
    setSession(next);
    if (next) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  // Any 401 from the HTTP client logs the user out (expired/invalid token).
  useEffect(() => {
    const onUnauthorized = () => persist(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [persist]);

  const login = useCallback(
    async (username: string, password: string) => {
      const result = await authApi.login(username, password);
      persist({ token: result.token, user: result.user });
      return result.user;
    },
    [persist],
  );

  const register = useCallback(
    async (username: string, password: string) => {
      const result = await authApi.register(username, password);
      persist({ token: result.token, user: result.user });
      return result.user;
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  /** Re-issues the token server-side so new claims (e.g. a freshly created
   * student profile link) take effect without a re-login. */
  const refreshSession = useCallback(async () => {
    const result = await authApi.refreshSession();
    persist({ token: result.token, user: result.user });
    return result.user;
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      login,
      register,
      refreshSession,
      logout,
    }),
    [session, login, register, refreshSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- standard context + hook pattern
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
