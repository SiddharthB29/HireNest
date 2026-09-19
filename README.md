# HireNest — Campus Placement Platform

A campus placement platform connecting **students**, **recruiters**, and **placement-cell admins**: job discovery with automatic eligibility checks, a weighted candidate-ranking engine, and a full application pipeline.

- **Backend** — Spring Boot (Java), PostgreSQL, JWT auth — serves `/api` on port **8081**
- **Frontend** — React + TypeScript + Vite — runs on port **5173** and proxies `/api` to the backend

---

## Running frontend + backend together

### 1. Database

PostgreSQL must be reachable at `localhost:5432` with a database named `placement_management` (user `postgres`). The schema is created/updated automatically on boot (`ddl-auto=update`).

### 2. Backend (port 8081)

Two environment variables are required:

| Variable | Purpose |
|---|---|
| `DB_PASSWORD` | Password for the `postgres` DB user |
| `JWT_SECRET` | Secret used to sign session JWTs |

```bash
./mvnw spring-boot:run
```

Or run `PlacementManagementApplication` from your IDE with those env vars set. Wait for `Started ... on port 8081`.

> spring-boot-devtools is on the classpath: recompiling (`./mvnw compile`) while the app is running triggers a hot restart — handy during development, but a full restart is the only way to guarantee the JVM matches disk.

### 3. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies every `/api/*` request to `http://localhost:8081`, so **no CORS configuration is needed in development** — the browser only ever talks to :5173. To point the proxy elsewhere (e.g. a backend on another port or a deployed host), edit `server.proxy` in `frontend/vite.config.ts`.

### 4. Verify the full loop

```bash
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"<user>","password":"<pass>"}'
```

A JWT string response means frontend → proxy → backend → database all work. Production builds (`npm run build`) serve static assets; put them behind a reverse proxy that forwards `/api` to the backend.

---

## Authentication flow

Sessions are **stateless JWTs** — there are no server-side sessions or cookies.

```
┌──────────┐  POST /api/auth/login        ┌──────────┐
│ Frontend │ ───────────────────────────► │ Backend  │
│          │ ◄───────── raw JWT string ── │          │   401 + plain-string body on failure
└──────────┘                              └──────────┘
```

1. **Login** — `POST /api/auth/login` returns the JWT as a *plain string* (not wrapped in JSON). The frontend decodes the payload and derives the session user from its claims.
2. **Token claims** — `sub` (username), `role` (`STUDENT` | `RECRUITER` | `ADMIN`), `userId`, and when linked: `studentId`, `companyId`, `companyName`. Tokens expire after **1 hour**.
3. **Session storage** — the frontend persists `{ token, user }` under the `hirenest.session` localStorage key. On boot, the stored token must decode as a real JWT with role claims **and** not be expired — otherwise the session is discarded and the user is treated as logged out.
4. **Request auth** — every API call attaches `Authorization: Bearer <token>` (see `frontend/src/services/http.ts`). Authorization is enforced server-side by role (`SecurityConfig`) and by ownership checks in the services; the claims are only so the *UI* knows who is logged in.
5. **Mid-session expiry** — any 401 response makes the HTTP client broadcast a `hirenest:unauthorized` window event; `AuthContext` listens and logs the user out immediately.
6. **Token refresh** — a student who creates their profile *after* login would otherwise lack the `studentId` claim. `POST /api/auth/refresh-token` (authenticated) re-issues a token with current claims without re-login.
7. **Registration** — students only (`POST /api/auth/register`). It returns no token, so the frontend logs in right after — the user experiences register + auto-login as one step. Recruiter accounts are created by admins; there is no self-service recruiter signup.

---

## API contract (summary)

Base path `/api`. All endpoints except the ones marked 🔓 require the bearer token.

### Auth
| Method & path | Roles | Notes |
|---|---|---|
| 🔓 `POST /auth/login` | — | Body `{ userName, password }` → **raw JWT string**; failures are plain-text 401s |
| 🔓 `POST /auth/register` | — | Students only; 409 on duplicate username |
| `POST /auth/refresh-token` | any | Re-issues a token with current claims |
| `GET/POST /auth/admin/recruiters` | ADMIN | List / create recruiter accounts (`{ userName, password, companyId }`) |

### Companies & jobs
| Method & path | Roles | Notes |
|---|---|---|
| `GET /companies` | any logged-in | |
| `POST/PUT/DELETE /companies/**` | ADMIN (PUT also RECRUITER) | |
| 🔓 `GET /jobs`, 🔓 `GET /jobs/{id}` | public | `JobResponse`: id, title, description, location, salary, minimumCgpa, maximumBacklogs, requiredSkills, preferredSkills, allowedBranches, graduationYear, jobType (`FULL_TIME`/`INTERNSHIP`), companyId, companyName |
| `GET /jobs/company/{companyId}` | any logged-in | |
| `POST /jobs/company/{companyId}` | RECRUITER/ADMIN | Body = Job entity; recruiters can only post for **their own** company (server-checked) |
| `PUT/DELETE /jobs/{id}` | RECRUITER/ADMIN | Same ownership rule; PUT **replaces all fields** — clients must send the complete job |
| `GET /jobs/{jobId}/eligibility/{studentId}` | any logged-in | `{ eligible, failedCriteria[] }` — codes: `CGPA`, `BACKLOGS`, `BRANCH`, `SKILLS`, `GRADUATION_YEAR` |

### Applications
| Method & path | Roles | Notes |
|---|---|---|
| `POST /applications` | STUDENT | Body `{ jobId, applicationDate }`; the student is resolved from the token. Server enforces eligibility (409) and duplicates (409) |
| `GET /applications` | any logged-in | **Scoped by role**: students see their own, recruiters their company's, admins everything |
| `PATCH /applications/{id}/status` | RECRUITER/ADMIN | Body `{ "status": "SHORTLISTED" }`. Valid transitions only: `APPLIED → SHORTLISTED | REJECTED`, `SHORTLISTED → SELECTED | REJECTED` (409 otherwise) |

### Students & placement engine
| Method & path | Roles | Notes |
|---|---|---|
| `POST /students` | STUDENT | Creates the **logged-in** student's profile (one only; 403 if it exists) |
| `PUT /students/{id}` | STUDENT (own) / ADMIN | |
| `GET /students`, `GET /students/{id}` | any logged-in | Scoped server-side |
| `GET /placement/candidates/{jobId}?minScore=&page=&size=` | RECRUITER/ADMIN | Paged ranking: `{ page, content[], size, totalElements, totalPages }` |
| `GET /placement/results/{jobId}` | RECRUITER/ADMIN | Eligibility verdicts for every student |

### Error shape
Failures return JSON `{ "status": 409, "message": "...", "timestamp": "..." }` — except **login**, which returns a plain-string body on bad credentials. Clients should handle both. Meaningful codes: `400` malformed JSON, `401` missing/expired token, `403` role or ownership violation (incl. "student profile not found" for profile-less accounts), `404` unknown id, `409` duplicates, ineligibility, and invalid status transitions.

---

## Frontend architecture notes

- `services/http.ts` — axios instance (`baseURL: /api`), bearer-token interceptor, error normalization (`ApiError` with `status` + `message`), 401 event broadcast.
- `services/apiClient.ts` — one typed function per endpoint; the only place that knows URL shapes.
- `context/AuthContext.tsx` — session = JWT; user object derived from claims at boot; exposes `login`, `register`, `refreshSession`, `logout`.
- `hooks/useMyStudent.ts` — profile loader that maps a 403 to the "no profile yet" onboarding state instead of an error.
- Route guards (`components/RouteGuards.tsx`) redirect unauthenticated users to `/login` and enforce per-role dashboard routes.
