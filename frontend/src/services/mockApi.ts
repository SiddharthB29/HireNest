import type {
  Application,
  ApplicationStatus,
  CandidateRanking,
  Company,
  Job,
  JobInput,
  PlacementEvaluation,
  Student,
  StudentInput,
  User,
} from '../types';
import {
  applications as seedApplications,
  candidateRankings as seedRankings,
  companies as seedCompanies,
  jobs as seedJobs,
  placementEvaluations as seedEvaluations,
  students as seedStudents,
} from '../mock/data';

/* ============================================================
   Mock API service layer.
   Mirrors the future Spring Boot endpoints (path noted on each
   function) so swapping in real fetch calls is a one-file change
   per resource. Every function returns a Promise with simulated
   latency so loading/empty/error states are exercised for real.
   ============================================================ */

const LATENCY = 450;

function delay<T>(value: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

let nextId = 10_000;

/* ---------- Auth (mirrors /api/auth) ---------- */

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  student: { password: 'student123', user: { id: 1, userName: 'student', role: 'STUDENT' } },
  recruiter: { password: 'recruiter123', user: { id: 2, userName: 'recruiter', role: 'RECRUITER' } },
  admin: { password: 'admin123', user: { id: 3, userName: 'admin', role: 'ADMIN' } },
};

export interface AuthResult {
  token: string;
  user: User;
}

/** POST /api/auth/login */
export function login(username: string, password: string): Promise<AuthResult> {
  const key = username.trim().toLowerCase();
  const account = DEMO_USERS[key];

  if (!account || account.password !== password) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new ApiError(401, 'Invalid username or password')), LATENCY),
    );
  }

  const token = btoa(JSON.stringify({ sub: account.user.userName, role: account.user.role }));
  return delay({ token, user: account.user });
}

/** POST /api/auth/register — public registration is students-only. */
export function register(username: string, password: string): Promise<AuthResult> {
  if (DEMO_USERS[username.trim().toLowerCase()]) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new ApiError(409, 'Username already exists')), LATENCY),
    );
  }

  const user: User = { id: nextId++, userName: username.trim(), role: 'STUDENT' };
  DEMO_USERS[username.trim().toLowerCase()] = { password, user };

  const token = btoa(JSON.stringify({ sub: user.userName, role: user.role }));
  return delay({ token, user });
}

/* ---------- Companies (mirrors /api/companies) ---------- */

let companies = [...seedCompanies];

/** GET /api/companies */
export function getCompanies(): Promise<Company[]> {
  return delay(companies.map((c) => ({ ...c })));
}

/** POST /api/companies */
export function createCompany(input: Omit<Company, 'id'>): Promise<Company> {
  if (companies.some((c) => c.name.toLowerCase() === input.name.trim().toLowerCase())) {
    return Promise.reject(new ApiError(409, 'A company with this name already exists'));
  }
  const company: Company = { ...input, name: input.name.trim(), id: nextId++ };
  companies = [company, ...companies];
  return delay(company);
}

/* ---------- Jobs (mirrors /api/jobs) ---------- */

let jobs = [...seedJobs];

/** GET /api/jobs */
export function getJobs(): Promise<Job[]> {
  return delay(jobs.map((j) => ({ ...j, requiredSkills: [...j.requiredSkills] })));
}

/** GET /api/jobs/{id} */
export function getJobById(id: number): Promise<Job> {
  const job = jobs.find((j) => j.id === id);
  if (!job) {
    return Promise.reject(new ApiError(404, 'Job not found'));
  }
  return delay({ ...job, requiredSkills: [...job.requiredSkills] });
}

/** POST /api/jobs/company/{companyId} */
export function createJob(companyId: number, input: JobInput): Promise<Job> {
  const company = companies.find((c) => c.id === companyId);
  if (!company) {
    return Promise.reject(new ApiError(404, 'Company not found'));
  }

  const job: Job = {
    id: nextId++,
    companyId,
    companyName: company.name,
    title: input.title,
    description: input.description,
    location: input.location,
    salary: input.salary,
    minimumCgpa: input.minimumCgpa,
    maximumBacklogs: input.maximumBacklogs,
    requiredSkills: input.requiredSkills,
    preferredSkills: input.preferredSkills,
    allowedBranches: input.allowedBranches,
    graduationYear: input.graduationYear,
    jobType: input.jobType,
  };
  jobs = [job, ...jobs];
  return delay(job);
}

/** PUT /api/jobs/{id} */
export function updateJob(id: number, input: JobInput): Promise<Job> {
  const index = jobs.findIndex((j) => j.id === id);
  if (index === -1) {
    return Promise.reject(new ApiError(404, 'Job not found'));
  }
  const updated: Job = { ...jobs[index], ...input, companyId: jobs[index].companyId, companyName: jobs[index].companyName };
  jobs = jobs.map((j, i) => (i === index ? updated : j));
  return delay(updated);
}

/** DELETE /api/jobs/{id} */
export function deleteJob(id: number): Promise<void> {
  const exists = jobs.some((j) => j.id === id);
  if (!exists) {
    return Promise.reject(new ApiError(404, 'Job not found'));
  }
  jobs = jobs.filter((j) => j.id !== id);
  return delay(undefined);
}

/* ---------- Students (mirrors /api/students) ---------- */

let students = [...seedStudents];

/** GET /api/students */
export function getStudents(): Promise<Student[]> {
  return delay(students.map((s) => ({ ...s, skills: [...s.skills] })));
}

/** GET /api/students/{id} */
export function getStudentById(id: number): Promise<Student> {
  const student = students.find((s) => s.id === id);
  if (!student) {
    return Promise.reject(new ApiError(404, 'Student profile not found'));
  }
  return delay({ ...student, skills: [...student.skills] });
}

/** POST /api/students */
export function createStudent(input: StudentInput): Promise<Student> {
  const student: Student = { ...input, id: nextId++ };
  students = [...students, student];
  return delay(student);
}

/** PUT /api/students/{id} */
export function updateStudent(id: number, input: StudentInput): Promise<Student> {
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    return Promise.reject(new ApiError(404, 'Student profile not found'));
  }
  const updated: Student = { ...input, id };
  students = students.map((s, i) => (i === index ? updated : s));
  return delay(updated);
}

/* ---------- Applications (mirrors /api/applications) ---------- */

let applications = [...seedApplications];

/** GET /api/applications */
export function getApplications(): Promise<Application[]> {
  return delay(applications.map((a) => ({ ...a })));
}

/** POST /api/applications — students apply to jobs. */
export function applyToJob(jobId: number, studentId: number): Promise<Application> {
  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    return Promise.reject(new ApiError(404, 'Job not found'));
  }

  const duplicate = applications.find((a) => a.jobId === jobId && a.studentId === studentId);
  if (duplicate) {
    return Promise.reject(new ApiError(409, 'You have already applied to this job'));
  }

  const student = students.find((s) => s.id === studentId);
  const application: Application = {
    id: nextId++,
    applicationDate: new Date().toISOString().slice(0, 10),
    status: 'APPLIED',
    studentId,
    studentName: student ? student.name : 'You',
    jobId,
    jobTitle: job.title,
    companyId: job.companyId,
    companyName: job.companyName,
  };
  applications = [application, ...applications];
  return delay(application);
}

/** PATCH /api/applications/{id}/status */
export function updateApplicationStatus(id: number, status: ApplicationStatus): Promise<Application> {
  const index = applications.findIndex((a) => a.id === id);
  if (index === -1) {
    return Promise.reject(new ApiError(404, 'Application not found'));
  }
  const updated = { ...applications[index], status };
  applications = applications.map((a, i) => (i === index ? updated : a));
  return delay(updated);
}

/* ---------- Placement engine (mirrors /api/placement) ---------- */

/** GET /api/placement/candidates/{jobId} */
export function getCandidateRankings(jobId: number): Promise<CandidateRanking[]> {
  const rankings = seedRankings[jobId];
  if (!rankings) {
    return delay([]);
  }
  return delay(rankings.map((r) => ({ ...r })));
}

/** GET /api/placement/results/{jobId} */
export function getPlacementEvaluations(jobId: number): Promise<PlacementEvaluation[]> {
  const evaluations = seedEvaluations[jobId];
  if (!evaluations) {
    return delay([]);
  }
  return delay(evaluations.map((e) => ({ ...e, reasons: [...e.reasons] })));
}
