import { useCallback, useMemo } from 'react';
import type { Application, Student } from '../types';
import { useAsyncData } from './useAsyncData';
import { ApiError } from '../services/http';
import * as api from '../services/apiClient';

/**
 * The logged-in student's session context: their profile (or null when the
 * account has no student profile yet) and their applications. The backend
 * scopes both to the caller — `/students` returns only their own profile,
 * `/applications` only their own applications — so no client-side filtering
 * by id is needed.
 */

export interface MyStudentState {
  /** The student profile, or null while none exists yet. */
  myStudent: Student | null;
  myApplications: Application[];
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useMyStudent(): MyStudentState {
  const loader = useCallback(async () => {
    // A student account without a profile gets 403 from both scoped
    // endpoints — that is the "no profile yet" state, not a failure.
    const students = await api.getStudents().catch((err: unknown) => {
      // 403 = account without a student profile yet — the onboarding state,
      // not a failure. Other errors (network, 500) surface with real copy.
      if (err instanceof ApiError && err.status === 403) return null;
      throw err;
      throw err;
    });
    const applications = await api.getApplications().catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 403) return [] as Application[];
      throw err;
      throw err;
    });
    return [students, applications] as const;
  }, []);
  const { data, loading, error, reload } = useAsyncData(loader, []);

  return useMemo<MyStudentState>(() => {
    const students = data?.[0] ?? null;
    const applications = data?.[1] ?? [];
    return {
      // getStudents() returns just the caller's own profile (or null when
      // the account has none yet).
      myStudent: students && students.length > 0 ? students[0] : null,
      myApplications: applications,
      loading,
      error,
      reload,
    };
  }, [data, loading, error, reload]);
}
