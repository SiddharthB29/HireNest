import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatSalary } from '../../lib/format';
import { RECRUITER_LINKS } from '../../lib/navLinks';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/apiClient';

export function RecruiterDashboardPage() {
  return (
    <DashboardLayout links={RECRUITER_LINKS} title="Recruiter dashboard">
      <RecruiterOverview />
    </DashboardLayout>
  );
}

function RecruiterOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const companyId = user?.companyId ?? null;

  const { data, loading, error, reload } = useAsyncData(
    () => Promise.all([api.getJobs(), api.getApplications()]),
    [],
  );

  if (!companyId) {
    return (
      <>
        <h1 className="page-title">Recruiter overview</h1>
        <ErrorBanner message="Your account is not linked to a company yet. Ask your placement cell to link it." />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <h1 className="page-title">Overview</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const [jobs, applications] = data;
  const myJobs = jobs.filter((j) => j.companyId === companyId);
  const myApps = applications.filter((a) => a.companyId === companyId);
  const shortlisted = myApps.filter((a) => a.status === 'SHORTLISTED').length;
  const selected = myApps.filter((a) => a.status === 'SELECTED').length;

  return (
    <>
      <h1 className="page-title">Recruiter overview</h1>
      <p className="page-subtitle">
        {user?.companyName ? `${user.companyName}'s hiring pipeline at a glance.` : "Your company's hiring pipeline at a glance."}
      </p>

      <div className="stat-cards">
        <div className="card stat-card-tile">
          <span className="stat-value">{myJobs.length}</span>
          <span className="stat-label">Active postings</span>
        </div>
        <div className="card stat-card-tile">
          <span className="stat-value">{myApps.length}</span>
          <span className="stat-label">Applications</span>
        </div>
        <div className="card stat-card-tile">
          <span className="stat-value">{shortlisted}</span>
          <span className="stat-label">Shortlisted</span>
        </div>
        <div className="card stat-card-tile">
          <span className="stat-value">{selected}</span>
          <span className="stat-label">Selected</span>
        </div>
      </div>

      <section className="card panel">
        <div className="panel-head">
          <h2>Your job postings</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/recruiter/jobs')}>
            Manage postings
          </button>
        </div>
        <div className="panel-body">
          {myJobs.length === 0 ? (
            <EmptyState
              title="No postings yet"
              message="Create your first job posting to start receiving ranked candidates."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {myJobs.map((job) => {
                const count = applications.filter((a) => a.jobId === job.id).length;
                return (
                  <div
                    key={job.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--sp-3)',
                      padding: 'var(--sp-3)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div className="text-sm text-strong">{job.title}</div>
                      <div className="text-xs text-muted">
                        {job.location} · {formatSalary(job.salary)} · {count} applicant{count === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                      <Link to={`/recruiter/jobs/${job.id}/candidates`} className="btn btn-secondary btn-sm">
                        Candidates
                      </Link>
                      <Link to={`/jobs/${job.id}`} className="btn btn-ghost btn-sm">
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
