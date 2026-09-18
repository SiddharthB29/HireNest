import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { SiteFooter } from '../components/SiteFooter';
import { ErrorBanner, LoadingBlock } from '../components/States';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { formatSalary } from '../lib/format';
import * as api from '../services/mockApi';

export function JobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const id = Number(jobId);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const job = useAsyncData(() => api.getJobById(id), [id]);
  const applications = useAsyncData(() => api.getApplications(), []);
  const students = useAsyncData(
    () => (user ? api.getStudents() : Promise.resolve([])),
    [user?.userName],
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

  const jobData = job.data;

  // In the mock, the demo student maps to the first profile; when wiring the
  // real API the session student id comes from the JWT.
  const myStudent = user?.role === 'STUDENT' ? students.data?.[0] : undefined;
  const myApplication = applications.data?.find(
    (a) => a.jobId === id && myStudent && a.studentId === myStudent.id,
  );

  async function handleApply() {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (user.role !== 'STUDENT' || !myStudent) {
      showToast('info', 'Only student accounts can apply to jobs.');
      return;
    }

    setApplying(true);
    try {
      await api.applyToJob(id, myStudent.id);
      showToast('success', `Application submitted for ${jobData.title}`);
      applications.reload();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setApplying(false);
    }
  }

  const isOwner = user && (user.role === 'ADMIN' || (user.role === 'RECRUITER' && user.userName === 'recruiter'));

  return (
    <Shell>
      <div className="job-detail-head">
        <div className="job-company">
          <span className="job-logo">{jobData.companyName.slice(0, 1)}</span>
          <div>
            <h1 className="page-title" style={{ marginBottom: 2 }}>
              {jobData.title}
            </h1>
            <div className="text-sm text-muted">
              {jobData.companyName} · {jobData.location}
            </div>
          </div>
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
            <button className="btn btn-gradient btn-lg" onClick={handleApply} disabled={applying}>
              {applying ? 'Applying…' : user ? 'Apply now' : 'Log in to apply'}
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <section className="card panel" style={{ marginBottom: 0 }}>
            <div className="panel-head">
              <h2>About the role</h2>
            </div>
            <div className="panel-body">
              <p style={{ whiteSpace: 'pre-line' }}>{jobData.description}</p>
            </div>
          </section>

          <section className="card panel" style={{ marginBottom: 0 }}>
            <div className="panel-head">
              <h2>Skills</h2>
            </div>
            <div className="panel-body">
              <h3 className="text-sm text-strong" style={{ marginBottom: 'var(--sp-2)' }}>Required</h3>
              <div className="skills-row" style={{ marginBottom: 'var(--sp-4)' }}>
                {jobData.requiredSkills.map((skill) => (
                  <span key={skill} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
              {jobData.preferredSkills.length > 0 && (
                <>
                  <h3 className="text-sm text-strong" style={{ marginBottom: 'var(--sp-2)' }}>Preferred</h3>
                  <div className="skills-row">
                    {jobData.preferredSkills.map((skill) => (
                      <span key={skill} className="badge badge-neutral">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
          <section className="card panel" style={{ marginBottom: 0 }}>
            <div className="panel-head">
              <h2>Eligibility</h2>
            </div>
            <div className="panel-body">
              <div className="criteria-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <CriteriaItem label="Min CGPA" value={String(jobData.minimumCgpa)} />
                <CriteriaItem label="Max backlogs" value={String(jobData.maximumBacklogs)} />
                <CriteriaItem label="Job type" value={jobData.jobType} />
                <CriteriaItem
                  label="Graduation"
                  value={jobData.graduationYear ? String(jobData.graduationYear) : 'Any'}
                />
              </div>
              {jobData.allowedBranches.length > 0 && (
                <div style={{ marginTop: 'var(--sp-4)' }}>
                  <div className="text-xs text-muted" style={{ marginBottom: 'var(--sp-2)' }}>
                    Allowed branches
                  </div>
                  <div className="skills-row">
                    {jobData.allowedBranches.map((branch) => (
                      <span key={branch} className="badge badge-neutral">
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="card panel" style={{ marginBottom: 0 }}>
            <div className="panel-head">
              <h2>Package</h2>
            </div>
            <div className="panel-body">
              <div className="stat-value" style={{ fontSize: 'var(--fs-2xl)' }}>
                {formatSalary(jobData.salary)}
              </div>
              <p className="text-sm text-muted">per annum</p>
            </div>
          </section>
        </div>
      </div>
    </Shell>
  );
}

function CriteriaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="criteria-item">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
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
