import type {
  Application,
  ApplicationStatus,
  AuthResponse,
  CandidateRanking,
  Company,
  EligibilityResult,
  Job,
  JobInput,
  PageResponse,
  PlacementEvaluation,
  Student,
  StudentInput,
  User,
  UserSummary,
} from '../types';
import { decodeJwtPayload } from '../lib/jwt';
import { ApiError, httpDelete, httpGet, httpPatch, httpPost, httpPut } from './http';

/**
 * Calls against the real Spring Boot API.
 *
 * - `login` returns a raw JWT string; the session user is derived from the
 *   token's claims (role, userId, student/company linkage).
 * - `register` (students only) returns no token, so we log in right after —
 *   the user experiences registration + auto-login as one step.
 * - `createRecruiter` is the admin-only account-creation endpoint.
 */

export interface AuthResult {
  token: string;
  user: User;
}

function userFromToken(token: string): User {
  const claims = decodeJwtPayload(token);
  if (!claims?.sub || !claims.role) {
    throw new ApiError(
      0,
      'Login succeeded, but the session token could not be read. Please try again.',
    );
  }
  return {
    id: claims.userId ?? 0,
    userName: claims.sub,
    role: claims.role,
    studentId: claims.studentId,
    companyId: claims.companyId,
    companyName: claims.companyName,
  };
}

/** POST /api/auth/login — returns the raw JWT string. */
export async function login(username: string, password: string): Promise<AuthResult> {
  const token = await httpPost<string>('/auth/login', { userName: username, password });
  if (typeof token !== 'string' || token.length < 20) {
    throw new ApiError(0, 'Unexpected login response from the server.');
  }
  return { token, user: userFromToken(token) };
}

/** POST /api/auth/register (students only), then auto-login. */
export async function register(username: string, password: string): Promise<AuthResult> {
  await httpPost<AuthResponse>('/auth/register', {
    userName: username,
    password,
    role: 'STUDENT',
  });
  return login(username, password);
}

/** POST /api/auth/admin/recruiters — admin-only. */
export function createRecruiter(input: {
  userName: string;
  password: string;
  companyId: number;
}): Promise<void> {
  return httpPost('/auth/admin/recruiters', input);
}

/** GET /api/auth/admin/recruiters — admin-only listing of recruiter accounts. */
export function getRecruiters(): Promise<UserSummary[]> {
  return httpGet('/auth/admin/recruiters');
}

/** POST /api/auth/refresh-token — re-issues a token with current claims. */
export async function refreshSession(): Promise<AuthResult> {
  const token = await httpPost<string>('/auth/refresh-token');
  return { token, user: userFromToken(token) };
}

/** GET /api/companies */
export function getCompanies(): Promise<Company[]> {
  return httpGet('/companies');
}

/** POST /api/companies — admin-only. */
export function createCompany(input: Omit<Company, 'id'>): Promise<Company> {
  return httpPost('/companies', input);
}

/** GET /api/jobs */
export function getJobs(): Promise<Job[]> {
  return httpGet('/jobs');
}

/* ---------- Job writes (recruiter/admin) ----------
 * The UI form uses display labels ("Full-time", branch "Any"); the backend
 * entity stores enum job types and an empty branch set for "any".
 */

const JOB_TYPE_TO_ENUM: Record<string, string> = {
  'Full-time': 'FULL_TIME',
  Internship: 'INTERNSHIP',
};

function toJobEntity(input: JobInput) {
  return {
    title: input.title,
    description: input.description,
    location: input.location,
    salary: input.salary,
    minimumCgpa: input.minimumCgpa,
    maximumBacklogs: input.maximumBacklogs,
    requiredSkills: input.requiredSkills,
    preferredSkills: input.preferredSkills,
    allowedBranches: input.allowedBranches.filter((b) => b !== 'Any'),
    graduationYear: input.graduationYear,
    jobType: JOB_TYPE_TO_ENUM[input.jobType] ?? input.jobType,
  };
}

/** POST /api/jobs/company/{companyId} — server enforces company ownership. */
export function createJob(companyId: number, input: JobInput): Promise<Job> {
  return httpPost(`/jobs/company/${companyId}`, toJobEntity(input));
}

/** PUT /api/jobs/{id} — server enforces company ownership. */
export function updateJob(id: number, input: JobInput): Promise<Job> {
  return httpPut(`/jobs/${id}`, toJobEntity(input));
}

/** DELETE /api/jobs/{id} — server enforces company ownership. */
export function deleteJob(id: number): Promise<void> {
  return httpDelete(`/jobs/${id}`);
}

/** PATCH /api/applications/{id}/status — valid transitions enforced server-side. */
export function updateApplicationStatus(id: number, status: ApplicationStatus): Promise<void> {
  return httpPatch(`/applications/${id}/status`, { status });
}

/* ---------- Placement engine (recruiter/admin, company-scoped server-side) ---------- */

/** GET /api/placement/candidates/{jobId} — paged, filterable candidate pool. */
export function getCandidatePool(
  jobId: number,
  params: { minScore?: number; page?: number; size?: number } = {},
): Promise<PageResponse<CandidateRanking>> {
  return httpGet(`/placement/candidates/${jobId}`, { params });
}

/** GET /api/placement/results/{jobId} — eligibility evaluations for every student. */
export function getPlacementEvaluations(jobId: number): Promise<PlacementEvaluation[]> {
  return httpGet(`/placement/results/${jobId}`);
}

/** GET /api/jobs/{id} */
export function getJobById(id: number): Promise<Job> {
  return httpGet(`/jobs/${id}`);
}

/** GET /api/applications — scoped by role server-side (own / own company / all). */
export function getApplications(): Promise<Application[]> {
  return httpGet('/applications');
}

/** GET /api/students/{id} — students may read their own profile; admins any. */
export function getStudent(id: number): Promise<Student> {
  return httpGet(`/students/${id}`);
}

/** POST /api/students — creates the logged-in student's profile (one only). */
export function createStudent(input: StudentInput): Promise<Student> {
  return httpPost('/students', input);
}

/** PUT /api/students/{id} — students update their own profile; admins any. */
export function updateStudent(id: number, input: StudentInput): Promise<Student> {
  return httpPut(`/students/${id}`, input);
}

/** GET /api/students — scoped by role server-side. */
export function getStudents(): Promise<Student[]> {
  return httpGet('/students');
}

/** POST /api/applications — the logged-in student applies; server enforces eligibility + duplicates. */
export function applyToJob(jobId: number): Promise<void> {
  return httpPost('/applications', {
    jobId,
    applicationDate: new Date().toISOString().slice(0, 10),
  });
}

/** GET /api/jobs/{jobId}/eligibility/{studentId} — pass/fail verdict from the placement engine. */
export function checkEligibility(jobId: number, studentId: number): Promise<EligibilityResult> {
  return httpGet(`/jobs/${jobId}/eligibility/${studentId}`);
}
