import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { SiteFooter } from '../components/SiteFooter';
import { ErrorBanner, LoadingBlock } from '../components/States';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { formatSalary } from '../lib/format';
import type { EligibilityResult } from '../types';
import * as api from '../services/apiClient';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const id = Number(jobId);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const job = useAsyncData(() => api.getJobById(id), [id]);
  const applications = useAsyncData(
    () => (user ? api.getApplications() : Promise.resolve([])),
    [],
  );

  // Live verdict from the placement engine — only for students whose
  // account is linked to a profile. Other roles/visitors never fetch it.
  const isStudentWithProfile = user?.role === 'STUDENT' && user.studentId !== undefined;
  const eligibility = useAsyncData<EligibilityResult | null>(
    () =>
      isStudentWithProfile
        ? api.checkEligibility(id, user.studentId as number)
        : Promise.resolve(null),
    [id, user?.id, user?.studentId],
  );

  const [applying, setApplying] = useState(false);

  if (job.loading) {
    return (
      <Shell>
        <LoadingBlock rows={5} />
      </Shell>
    );
  }

  if (job.error || !job.data) {
    return (
      <Shell>
        <ErrorBanner
          message={job.error ?? 'Job not found'}
          onRetry={job.reload}
        />
        <div style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
          <Link to="/jobs" className="btn btn-secondary">
            ← Back to all jobs
          </Link>
        </div>
      </Shell>
    );
  }

  // Tolerate backends/rows missing optional collection fields — a missing
  // array must degrade to "empty", never crash the page.
  const jobData = {
    ...job.data,
    requiredSkills: job.data.requiredSkills ?? [],
    preferredSkills: job.data.preferredSkills ?? [],
    allowedBranches: job.data.allowedBranches ?? [],
  };

  // The session's student id comes from the JWT claims (set at login).
  const myStudentId = user?.role === 'STUDENT' ? user.studentId : undefined;
  const myApplication = applications.data?.find(
    (a) => a.jobId === id && myStudentId !== undefined && a.studentId === myStudentId,
  );

  async function handleApply() {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user.role !== 'STUDENT') {
      showToast('info', 'Only student accounts can apply to jobs.');
      return;
    }

    setApplying(true);
    try {
      // Server resolves the student from the session and enforces
      // eligibility + duplicate checks (409 with a message otherwise).
      await api.applyToJob(id);
      showToast('success', `Application submitted for ${jobData.title}`);
      applications.reload();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  }

  const isOwner =
    user && (user.role === 'ADMIN' || (user.role === 'RECRUITER' && user.companyId === jobData.companyId));

  return (
    <Shell>
      <div className="job-detail-head">
        <div className="job-company" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--sp-2)' }}>
          <span className="eyebrow">
            <span className="mark" aria-hidden="true">✳︎</span> {jobData.companyName} · {jobData.location}
          </span>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            {jobData.title}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          {isOwner && (
            <>
              <Link to="/recruiter/jobs" className="btn btn-secondary">
                Manage posting
              </Link>
              <Link to={`/recruiter/jobs/${jobData.id}/candidates`} className="btn btn-secondary">
                View candidates
              </Link>
            </>
          )}
          {myApplication ? (
            <span className={`badge ${statusClass(myApplication.status)}`} style={{ fontSize: 'var(--fs-md)', padding: '0.5rem 1rem' }}>
              {myApplication.status}
            </span>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={handleApply} disabled={applying}>
              {applying ? 'Applying…' : user ? 'Apply now ↗' : 'Log in to apply'}
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <section className="panel" style={{ marginBottom: 0 }}>
            <div className="section-rule">
              <span>About the role</span>
            </div>
            <p style={{ whiteSpace: 'pre-line' }}>{jobData.description}</p>
          </section>

          <section className="panel" style={{ marginBottom: 0 }}>
            <div className="section-rule">
              <span>Skills</span>
            </div>
            <h3 className="text-sm text-strong" style={{ marginBottom: 'var(--sp-2)' }}>
              Required
            </h3>
            <div className="skills-row" style={{ marginBottom: 'var(--sp-4)' }}>
              {jobData.requiredSkills.map((skill) => (
                <span key={skill} className="badge badge-neutral">
                  {skill}
                </span>
              ))}
            </div>
            {jobData.preferredSkills.length > 0 && (
              <>
                <h3 className="text-sm text-strong" style={{ marginBottom: 'var(--sp-2)' }}>
                  Preferred
                </h3>
                <div className="skills-row">
                  {jobData.preferredSkills.map((skill) => (
                    <span key={skill} className="badge badge-neutral">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <section className="panel" style={{ marginBottom: 0 }}>
            <div className="section-rule">
              <span>Eligibility</span>
            </div>
            <dl className="meta-table" style={{ margin: 0 }}>
              <div className="meta-row">
                <dt>Min CGPA</dt>
                <dd>{jobData.minimumCgpa}</dd>
              </div>
              <div className="meta-row">
                <dt>Max backlogs</dt>
                <dd>{jobData.maximumBacklogs}</dd>
              </div>
              <div className="meta-row">
                <dt>Job type</dt>
                <dd>{jobData.jobType}</dd>
              </div>
              <div className="meta-row">
                <dt>Graduation</dt>
                <dd>{jobData.graduationYear ? String(jobData.graduationYear) : 'Any'}</dd>
              </div>
              {jobData.allowedBranches.length > 0 && (
                <div className="meta-row">
                  <dt>Branches</dt>
                  <dd>
                    <div className="skills-row">
                      {jobData.allowedBranches.map((branch) => (
                        <span key={branch} className="badge badge-neutral">
                          {branch}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
            <EligibilityVerdict eligibility={eligibility} />
          </section>

          <section className="panel" style={{ marginBottom: 0 }}>
            <div className="section-rule">
              <span>Package</span>
            </div>
            <div className="stat-value" style={{ fontSize: 'var(--fs-2xl)' }}>
              {formatSalary(jobData.salary)}
            </div>
            <p className="text-sm text-muted">per annum</p>
          </section>
        </div>
      </div>
    </Shell>
  );
}

function statusClass(status: string): string {
  switch (status) {
    case 'SELECTED':
      return 'badge-success';
    case 'SHORTLISTED':
      return 'badge-info';
    case 'REJECTED':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
}

/** Backend criterion codes → what they mean for the student. */
const CRITERION_TEXT: Record<string, string> = {
  CGPA: 'CGPA is below the cut-off',
  BACKLOGS: 'Too many active backlogs',
  BRANCH: 'Your branch is not in the allowed list',
  SKILLS: 'Missing one or more required skills',
  GRADUATION_YEAR: 'Graduation year does not match',
};

function EligibilityVerdict({
  eligibility,
}: {
  eligibility: ReturnType<typeof useAsyncData<EligibilityResult | null>>;
}) {
  // Hidden for visitors/recruiters/admins, while loading, and if the check
  // fails — the server re-enforces everything at apply time regardless.
  if (eligibility.loading || eligibility.error || !eligibility.data) return null;

  const { eligible, failedCriteria } = eligibility.data;

  if (eligible) {
    return (
      <p
        className="badge badge-success"
        style={{ display: 'inline-block', marginTop: 'var(--sp-4)' }}
      >
        ✓ You meet every requirement for this role
      </p>
    );
  }

  return (
    <div style={{ marginTop: 'var(--sp-4)' }}>
      <p className="text-sm text-strong" style={{ marginBottom: 'var(--sp-2)' }}>
        Not eligible yet:
      </p>
      <ul
        className="text-sm text-muted"
        style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: 'var(--sp-1)' }}
      >
        {failedCriteria.map((criterion) => (
          <li key={criterion}>{CRITERION_TEXT[criterion] ?? criterion}</li>
        ))}
      </ul>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter">
      <PublicNavbar />
      <main className="section" style={{ paddingTop: 'var(--sp-12)', minHeight: '60vh' }}>
        <div className="container">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
