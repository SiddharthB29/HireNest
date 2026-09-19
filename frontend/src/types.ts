/**
 * HireNest domain types.
 * Shapes mirror the Spring Boot backend DTOs/entities served by /api.
 */

export type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED';

export interface User {
  id: number;
  userName: string;
  role: Role;
  /** Set when the account is linked to a student profile (from JWT claims). */
  studentId?: number;
  /** Set for recruiter accounts (from JWT claims). */
  companyId?: number;
  companyName?: string;
}

export interface Company {
  id: number;
  name: string;
  description: string;
  website: string;
  location: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: number;
  minimumCgpa: number;
  maximumBacklogs: number;
  /** Collections are optional: some backend versions/rows omit them. */
  requiredSkills?: string[];
  preferredSkills?: string[];
  allowedBranches?: string[];
  graduationYear: number | null;
  jobType: string;
  companyId: number;
  companyName: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  branch: string;
  cgpa: number;
  backlogs: number;
  skills: string[];
  projectCount: number;
  certificationCount: number;
  graduationYear: number;
}

export interface Application {
  id: number;
  applicationDate: string;
  status: ApplicationStatus;
  studentId: number;
  studentName: string;
  jobId: number;
  jobTitle: string;
  companyId: number;
  companyName: string;
}

/** GET /api/jobs/{jobId}/eligibility/{studentId} — placement engine verdict. */
export interface EligibilityResult {
  eligible: boolean;
  /** Criterion codes: CGPA, BACKLOGS, BRANCH, SKILLS, GRADUATION_YEAR. */
  failedCriteria: string[];
}

export interface CandidateRanking {
  rank: number;
  studentId: number;
  studentName: string;
  skillScore: number;
  cgpaScore: number;
  projectScore: number;
  certificationScore: number;
  totalScore: number;
}

export interface PlacementEvaluation {
  studentId: number;
  studentName: string;
  eligible: boolean;
  reasons: string[];
}

/** Job creation/update payload sent by recruiter & admin forms (collections required). */
export interface JobInput {
  title: string;
  description: string;
  location: string;
  salary: number;
  minimumCgpa: number;
  maximumBacklogs: number;
  requiredSkills: string[];
  preferredSkills: string[];
  allowedBranches: string[];
  graduationYear: number | null;
  jobType: string;
  companyId?: number;
}

/** Student profile creation/update payload. */
export type StudentInput = Omit<Student, 'id'>;

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

/* ---------- Auth contract (Spring Boot /api/auth) ---------- */

/** POST /api/auth/login returns the raw JWT string, not a JSON object. */
export type LoginResponse = string;

/** POST /api/auth/register response body (no token — clients log in afterwards). */
export interface AuthResponse {
  id: number;
  userName: string;
  role: Role;
}

/** Standard error body produced by the backend's GlobalExceptionHandler. */
export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}

/** Lightweight account summary (admin recruiter listings). */
export interface UserSummary {
  id: number;
  userName: string;
  role: Role;
  companyId: number | null;
  companyName: string | null;
}
