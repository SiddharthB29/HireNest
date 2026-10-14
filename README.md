# HireNest

HireNest is a campus placement platform for students, recruiters, and placement-cell administrators. It brings job discovery, eligibility checks, applications, recruiter review, candidate ranking, and resume-based AI insights into one web application.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Application routes](#application-routes)
- [Authentication and authorization](#authentication-and-authorization)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Run locally](#run-locally)
- [API overview](#api-overview)
- [AI workflows and candidate scoring](#ai-workflows-and-candidate-scoring)
- [Database, resume storage, and cache](#database-resume-storage-and-cache)
- [Build and tests](#build-and-tests)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)

## Features

### Students

- Register a student account, complete a placement profile, and update profile details.
- Browse and filter public job listings, review job details, and view eligibility criteria.
- Apply to eligible jobs and track application statuses.
- Upload a PDF or DOCX resume (up to 2 MB) for text extraction and resume analysis.
- Request AI-generated resume insights and a resume-to-job fit analysis for a specific listing.

### Recruiters

- Manage job postings for the recruiter’s associated company.
- Review applications belonging to that company and move applications through supported statuses.
- View eligible applicants ranked by the rule-based placement scoring service, with ranking filters.

### Administrators

- View an administrative overview and all applications.
- Create companies and recruiter accounts.
- Onboard companies, create and list recruiter accounts, and review all applications.

### Shared interface

- Public landing page and job browsing.
- Role-protected student, recruiter, and administrator routes.
- Responsive dashboards with shared navigation, loading and error states, and account controls.

## Architecture

The frontend is a React single-page application. It calls the Spring Boot REST API through a centralized Axios service. During local development, Vite proxies `/api` requests to the backend. The backend coordinates persistence, resume storage and extraction, caching, eligibility and scoring, and AI requests.

~~~mermaid
flowchart LR
    Browser[Browser] --> UI[React + TypeScript frontend]
    UI -->|/api requests with bearer token| API[Spring Boot REST API]
    Vite[Vite development server] -. local /api proxy .-> API
    API --> DB[(PostgreSQL via Spring Data JPA)]
    API --> Storage[Private Supabase resume storage]
    API --> Cache[(Redis extracted-text cache)]
    API --> AI[Spring AI ChatClient]
    AI --> Provider[OpenRouter-compatible AI service]
~~~

Resume upload and analysis are handled by the backend. The backend stores resume files in private Supabase Storage, extracts text with Apache Tika, and caches extracted text in Redis. Resume analysis and job matching send the relevant resume text (and, for matching, job information) from the backend to the configured AI provider. The frontend converts the profile resume reference into a boolean availability state, and the UI does not render internal storage references or the upload response body.

## Technology stack

| Area | Technologies in the repository |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7, Axios |
| Backend | Java 25, Spring Boot 4.1.1, Spring Web MVC, Spring Data JPA, Spring Security |
| Authentication | Stateless JWT using JJWT; BCrypt password encoder |
| Database | PostgreSQL |
| Resume storage and extraction | Supabase Storage, Apache Tika |
| Cache | Redis through Spring Data Redis |
| AI | Spring AI ChatClient with the OpenAI-compatible client configuration and OpenRouter API key |
| Build and tests | Maven Wrapper, npm, TypeScript compiler, Vite, ESLint |

Versions reflect the Maven and npm configuration checked into this repository.

## Application routes

| Area | Frontend routes |
|---|---|
| Public | `/`, `/jobs`, `/jobs/:jobId` |
| Account | `/login`, `/register`, `/account/change-password` |
| Student | `/student`, `/student/profile`, `/student/applications` |
| Recruiter | `/recruiter`, `/recruiter/jobs`, `/recruiter/applications`, `/recruiter/jobs/:jobId/candidates` |
| Administrator | `/admin`, `/admin/companies`, `/admin/recruiters`, `/admin/applications` |

The candidate-ranking route accepts recruiter and administrator roles. Other dashboard routes are guarded by their corresponding role.

## Authentication and authorization

- `POST /api/auth/login` returns a signed JWT as a plain string. The frontend derives the current user and role from the token claims.
- The frontend stores its session in browser local storage and sends the token as a bearer token on API requests. Expired or rejected sessions are cleared when the API returns HTTP 401.
- Tokens expire after one hour. The authenticated refresh-token endpoint lets the frontend obtain updated claims after a student profile is created.
- Public registration is limited by the backend to student accounts. Recruiter accounts are created by administrators; there is no public recruiter sign-up flow.
- Spring Security is stateless. The backend validates requests and enforces role checks; service methods also apply profile ownership and recruiter-company scope checks. Frontend route guards improve navigation but are not the backend authorization boundary.
- Passwords are encoded with BCrypt before storage.

## Project structure

~~~text
.
├── frontend/
│   ├── public/                 Static frontend assets
│   └── src/
│       ├── components/         Shared layout, navigation, forms, modals, UI states
│       ├── context/            Authentication and toast contexts
│       ├── hooks/              Shared data and UI hooks
│       ├── lib/                Navigation, JWT decoding, and formatting helpers
│       ├── pages/              Public, student, recruiter, admin, and account screens
│       ├── services/           Axios setup and typed API client
│       └── styles/             Design tokens and shared styles
├── src/main/java/com/placement/
│   ├── config/                 Spring Security and JWT filter
│   ├── controller/             REST endpoints
│   ├── dto/                    Request and response models
│   ├── entity/                 JPA entities and enums
│   ├── exception/              API exception handling
│   ├── repository/             Spring Data repositories
│   ├── service/                Business, scoring, resume, cache, and AI services
│   └── specification/          Database query specifications
├── src/main/resources/          Spring application configuration
├── src/test/java/               Backend tests
├── Dockerfile                   Backend container build
├── mvnw, mvnw.cmd               Maven Wrapper scripts
└── pom.xml                      Backend dependencies and build configuration
~~~

## Prerequisites

- Java 25
- Node.js and npm (the repository includes `frontend/package-lock.json`)
- PostgreSQL
- Redis for the resume-text cache
- Supabase Storage configuration for resume uploads and recovery
- An OpenRouter API key for AI analysis and job matching

The backend uses the Maven Wrapper, so a separate Maven installation is not required.

## Configuration

Provide backend configuration to the Spring Boot process through your local shell, IDE run configuration, or a secret manager. The repository’s `application.properties` supplies defaults for `PORT`, `DATABASE_URL`, `DB_USERNAME`, and `REDIS_URL`; set overrides when your local services differ.

| Backend variable | Required by current configuration | Purpose |
|---|---:|---|
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `JWT_SECRET` | Yes | Base64-encoded JWT signing key |
| `SUPABASE_URL` | Yes | Supabase project endpoint used by backend storage integration |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side credential for private resume storage |
| `OPENROUTER_API_KEY` | Yes | Server-side credential for Spring AI requests |
| `DATABASE_URL` | Optional override | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | Optional override | PostgreSQL user |
| `REDIS_URL` | Optional override | Redis connection URL |
| `PORT` | Optional override | Backend HTTP port |

For the frontend, `VITE_API_URL` optionally sets the API origin; the API client appends `/api`. Leave it unset during local development to use the Vite `/api` proxy. Values with the `VITE_` prefix are included in the browser build: never place passwords, service-role keys, AI keys, or other secrets in frontend configuration.

Do not copy production values into this README or commit local secret files.

## Run locally

1. Start PostgreSQL and create a development database. Configure the backend variables above, using local values or the repository defaults where available. Start Redis if you want the resume-text cache available.
2. From the repository root, run the backend:

   Linux or macOS:

   ~~~bash
   ./mvnw spring-boot:run
   ~~~

   Windows PowerShell:

   ~~~powershell
   .\mvnw.cmd spring-boot:run
   ~~~

   The backend defaults to port 8081. Supabase Storage and OpenRouter configuration are required for resume upload and AI requests.
3. In another terminal, install and run the frontend:

   ~~~bash
   cd frontend
   npm ci
   npm run dev
   ~~~

4. Open `http://localhost:5173`. The local Vite server forwards `/api` requests to `http://localhost:8081`.

For a frontend production build, run `npm run build` from `frontend/`. If the backend runs on a different host in a local or hosted environment, set `VITE_API_URL` to that API origin before building.

## API overview

The API base path is `/api`, except for the public health check at `/health`. The table lists the primary implemented routes; service-level ownership checks apply in addition to the listed role requirements.

| Method and path | Access | Purpose |
|---|---|---|
| `GET /health` | Public | Backend health response |
| `POST /api/auth/register` | Public; student accounts only | Register a student account; registration does not return a login token |
| `POST /api/auth/login` | Public | Authenticate and return a raw JWT string |
| `POST /api/auth/refresh-token` | Authenticated | Issue a token with current account claims |
| `POST /api/auth/change-password` | Authenticated | Change the current account password |
| `GET`, `POST /api/auth/admin/recruiters` | Administrator | List or create recruiter accounts |
| `GET /api/jobs`, `GET /api/jobs/{id}` | Public | Browse jobs and job details |
| `GET /api/jobs/company/{companyId}` | Authenticated | List jobs for a company |
| `POST /api/jobs/company/{companyId}` | Recruiter or administrator | Create a job; recruiters are limited to their company |
| `PUT`, `DELETE /api/jobs/{id}` | Recruiter or administrator | Update or delete a job, subject to company ownership |
| `GET /api/jobs/{jobId}/eligibility/{studentId}` | Authenticated | Evaluate a student against a job’s eligibility criteria |
| `GET /api/companies`, `GET /api/companies/{id}` | Authenticated | List or retrieve companies |
| `POST /api/companies` | Administrator | Create a company |
| `PUT /api/companies/{id}` | Recruiter or administrator | Update a company; recruiters are limited to their own company |
| `DELETE /api/companies/{id}` | Administrator | Delete a company when related-user/job constraints permit |
| `GET /api/students` | Authenticated, role-scoped | List profiles according to the caller’s role |
| `GET /api/students/{id}` | Student (own profile) or administrator | Retrieve a profile |
| `POST /api/students` | Student | Create the authenticated student’s profile |
| `PUT`, `DELETE /api/students/{id}` | Student (own profile) or administrator | Update or delete a profile |
| `POST /api/students/{id}/resume` | Student (own profile) | Upload a PDF or DOCX resume (maximum 2 MB) |
| `POST /api/applications` | Student | Apply to an eligible job; duplicate and eligibility checks are enforced |
| `GET /api/applications` | Authenticated, role-scoped | List the caller’s applications, the recruiter’s company applications, or all applications for administrators |
| `GET /api/applications/{id}` | Authenticated, ownership-scoped | Retrieve an application the caller may access |
| `PATCH /api/applications/{id}/status` | Recruiter or administrator | Update an application status, subject to ownership and transition rules |
| `GET /api/placement/candidates/{jobId}` | Recruiter or administrator, company-scoped | Retrieve the paged, ranked eligible-applicant list |
| `GET /api/placement/results/{jobId}` | Recruiter or administrator, company-scoped | Evaluate students against job eligibility criteria |
| `GET /api/placement/eligible/{jobId}` | Recruiter or administrator, company-scoped | List eligible students |
| `GET /api/placement/evaluate/{jobId}/{studentId}` | Recruiter or administrator, company-scoped | Evaluate one student against a job |
| `GET /api/ai/resume-analysis` | Authenticated student with a profile and resume | Analyze the signed-in student’s resume |
| `GET /api/ai/job-match/{jobId}` | Authenticated student with a profile and resume | Compare the signed-in student’s resume with one job |

Candidate ranking accepts pagination and score filters, including minimum total, CGPA, skill, project, and certification scores. Application statuses are `APPLIED`, `SHORTLISTED`, `REJECTED`, and `SELECTED`; valid transitions are from `APPLIED` to `SHORTLISTED` or `REJECTED`, and from `SHORTLISTED` to `SELECTED` or `REJECTED`.

Most application-level errors use a JSON response with status, message, and timestamp fields. Invalid login credentials return a plain-text response, and Spring Security authentication/authorization failures are handled by the security layer.

## AI workflows and candidate scoring

### Resume analysis

The authenticated student requests analysis from the frontend API client. The backend loads extracted resume text from Redis when available; otherwise it retrieves the private stored file, extracts text, and attempts to repopulate the cache. Spring AI sends the resume text to the configured OpenRouter-compatible chat service and maps the response to technical skills, strengths, potential gaps, suggestions, and an overall summary.

### Job matching

The student requests a match for a specific job. The backend loads the job and the student’s extracted resume text, then asks Spring AI to compare the supplied resume and job information. The response contains an overall assessment, relevant strengths, requirements not demonstrated in the resume, improvement suggestions, and a summary. This feature does not return a numerical match score or guarantee selection; its generated output should be reviewed by a person.

Both AI routes are called through the frontend’s centralized API client and have a 90-second client request timeout. This client setting does not guarantee that an upstream provider or hosting platform will wait for the full interval.

### Rule-based candidate ranking

Candidate ranking is separate from AI job matching. The backend first checks placement eligibility and then computes a weighted score using skill (40%), CGPA (30%), project (20%), and certification (10%) components. Eligible applicants are sorted by this score and returned with rank and component scores. The ranking is not an AI-generated decision.

## Database, resume storage, and cache

- PostgreSQL data is accessed through Spring Data JPA and Hibernate. The current Hibernate setting is `ddl-auto=update`; no versioned database migration tool or migration directory is present in the repository.
- Resume files are stored in private Supabase Storage. The README intentionally does not document internal object references.
- Apache Tika extracts text from supported PDF and DOCX uploads.
- Redis caches extracted resume text for 24 hours. Cache reads and writes are best-effort; when text is not available in cache, the backend attempts to recover it from stored resume data.

## Build and tests

From the repository root, run the backend tests:

~~~bash
./mvnw test
~~~

On Windows PowerShell, use:

~~~powershell
.\mvnw.cmd test
~~~

Backend test sources currently cover the Spring application context, job controller, candidate scoring, and placement engine.

From the frontend directory, the available scripts are:

~~~bash
npm run build
npm run lint
~~~

The frontend package does not define an automated test script. `npm run build` runs the TypeScript project build and Vite production build; `npm run lint` runs ESLint.

## Deployment

The repository includes a Dockerfile for the Java 25 backend container. It packages the application JAR with Maven and exposes port 8081. The frontend is built as static Vite assets with `npm run build`.

Provider-specific deployment steps and production URLs are not documented in this repository. Production environment variables and the frontend API origin must be configured by the deployment operator. Keep server-only credentials on the backend.

## Known limitations

- AI analysis is generated output, not an eligibility decision, candidate ranking score, hiring recommendation, or guarantee of selection.
- Native deployment configuration and production URLs are maintained outside this repository.
- Hibernate schema updates are configured at startup, and there is no versioned migration workflow in the repository.
- The frontend currently has build and lint scripts but no configured automated frontend test script.