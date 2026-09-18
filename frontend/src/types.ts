/**
 * HireNest domain types.
 * Shapes intentionally mirror the Spring Boot backend DTOs/entities so the
 * mock API layer can later be swapped for real fetch calls with minimal churn.
 */

export type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED';

export interface User {
  id: number;
  userName: string;
  role: Role;
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
  requiredSkills: string[];
  preferredSkills: string[];
  allowedBranches: string[];
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

/** Job creation/update payload sent by recruiter & admin forms. */
export type JobInput = Omit<Job, 'id' | 'companyId' | 'companyName'> & {
  companyId?: number;
};

/** Student profile creation/update payload. */
export type StudentInput = Omit<Student, 'id'>;

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
