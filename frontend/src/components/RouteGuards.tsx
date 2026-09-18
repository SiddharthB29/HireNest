import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Role } from '../types';
import { useAuth } from '../context/AuthContext';

/** Redirects unauthenticated users to login; enforces allowed roles. */
export function RequireRole({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return <>{children}</>;
}

/** Signed-in users shouldn't see login/register pages. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return <>{children}</>;
}
