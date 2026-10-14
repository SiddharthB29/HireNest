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
  JobMatchAnalysis,
  ResumeAnalysis,
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

const AI_ANALYSIS_TIMEOUT_MS = 90_000;

function invalidAiResponse(): ApiError {
  return new ApiError(0, 'The AI service returned an invalid response. Please try the analysis again later.');
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidAiResponse();
  }
  return value as Record<string, unknown>;
}

function optionalString(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw invalidAiResponse();
  return value;
}

function optionalStringArray(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw invalidAiResponse();
  }
  return value;
}

function parseResumeAnalysis(value: unknown): ResumeAnalysis {
  const response = asRecord(value);
  const fields = ['technicalSkills', 'strengths', 'potentialGaps', 'suggestions', 'overallSummary'];
  if (!fields.some((field) => Object.prototype.hasOwnProperty.call(response, field))) {
    throw invalidAiResponse();
  }
  return {
    technicalSkills: optionalStringArray(response.technicalSkills),
    strengths: optionalStringArray(response.strengths),
    potentialGaps: optionalStringArray(response.potentialGaps),
    suggestions: optionalStringArray(response.suggestions),
    overallSummary: optionalString(response.overallSummary),
  };
}

function parseJobMatchAnalysis(value: unknown, requestedJobId: number): JobMatchAnalysis {
  const response = asRecord(value);
  const analysisFields = [
    'jobTitle',
    'overallAssessment',
    'relevantStrengths',
    'requirementsNotDemonstrated',
    'improvementSuggestions',
    'overallSummary',
  ];
  if (!analysisFields.some((field) => Object.prototype.hasOwnProperty.call(response, field))) {
    throw invalidAiResponse();
  }
  const jobId = response.jobId;
  const jobTitle = response.jobTitle;
  if (
    typeof jobId !== 'number' ||
    !Number.isFinite(jobId) ||
    jobId !== requestedJobId ||
    typeof jobTitle !== 'string'
  ) {
    throw invalidAiResponse();
  }
  return {
    jobId,
    jobTitle,
    overallAssessment: optionalString(response.overallAssessment),
    relevantStrengths: optionalStringArray(response.relevantStrengths),
    requirementsNotDemonstrated: optionalStringArray(response.requirementsNotDemonstrated),
    improvementSuggestions: optionalStringArray(response.improvementSuggestions),
    overallSummary: optionalString(response.overallSummary),
  };
}

async function requestAiAnalysis<T>(url: string, parse: (value: unknown) => T): Promise<T> {
  try {
    const data = await httpGet<unknown>(url, { timeout: AI_ANALYSIS_TIMEOUT_MS });
    return parse(data);
  } catch (error) {
    if (error instanceof ApiError && error.message === 'Unexpected error') {
      throw new ApiError(0, 'The AI analysis could not be completed because of an unexpected client error. Please try again.');
    }
    throw error;
  }
}

/** Strip the private storage reference returned by the backend at the API boundary. */
function studentFromApi(student: Student): Student {
  const { resumePath, ...profile } = student as Student & { resumePath?: string | null };
  return { ...profile, hasResume: Boolean(resumePath) };
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

/** POST /api/auth/change-password — changes the password of the authenticated user. */
export function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  return httpPost('/auth/change-password', {
    currentPassword,
    newPassword,
  });
}

/** POST /api/students/{id}/resume — student-owned multipart upload. */
export function uploadStudentResume(studentId: number, file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  return httpPost(`/students/${studentId}/resume`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/** GET /api/ai/resume-analysis — analyzes the authenticated student's stored resume. */
export function analyzeMyResume(): Promise<ResumeAnalysis> {
  return requestAiAnalysis('/ai/resume-analysis', parseResumeAnalysis);
}

/** GET /api/ai/job-match/{jobId} — match for the authenticated student. */
export function analyzeJobMatch(jobId: number): Promise<JobMatchAnalysis> {
  return requestAiAnalysis(`/ai/job-match/${jobId}`, (response) => parseJobMatchAnalysis(response, jobId));
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
  return httpGet<Student>(`/students/${id}`).then(studentFromApi);
}

/** POST /api/students — creates the logged-in student's profile (one only). */
export function createStudent(input: StudentInput): Promise<Student> {
  return httpPost<Student>('/students', input).then(studentFromApi);
}

/** PUT /api/students/{id} — students update their own profile; admins any. */
export function updateStudent(id: number, input: StudentInput): Promise<Student> {
  return httpPut<Student>(`/students/${id}`, input).then(studentFromApi);
}

/** GET /api/students — scoped by role server-side. */
export function getStudents(): Promise<Student[]> {
  return httpGet<Student[]>('/students').then((students) => students.map(studentFromApi));
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
