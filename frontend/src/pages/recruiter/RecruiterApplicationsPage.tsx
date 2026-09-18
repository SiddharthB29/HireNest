import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatDate, statusBadgeClass } from '../../lib/format';
import * as api from '../../services/mockApi';
import type { Application, ApplicationStatus } from '../../types';
import { RECRUITER_LINKS } from '../../lib/navLinks';

const COMPANY_ID = 1;

const FILTERS: Array<ApplicationStatus | 'ALL'> = ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

export function RecruiterApplicationsPage() {
  return (
    <DashboardLayout links={RECRUITER_LINKS} title="Recruiter dashboard">
      <RecruiterApplications />
    </DashboardLayout>
  );
}

function RecruiterApplications() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data, loading, error, reload } = useAsyncData(() => api.getApplications(), []);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Applications</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const myApps = data.filter((a) => a.companyId === COMPANY_ID);
  const visible = filter === 'ALL' ? myApps : myApps.filter((a) => a.status === filter);

  async function handleStatus(app: Application, status: ApplicationStatus) {
    setUpdatingId(app.id);
    try {
      await api.updateApplicationStatus(app.id, status);
      showToast('success', `${app.studentName} → ${status.toLowerCase()}`);
      reload();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <h1 className="page-title">Applications</h1>
      <p className="page-subtitle">Review candidates and move them through the pipeline.</p>

      <div className="filter-toolbar">
        <select
          className="select"
          value={filter}
          aria-label="Filter by status"
          onChange={(e) => setFilter(e.target.value as ApplicationStatus | 'ALL')}
        >
          {FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === 'ALL' ? 'All statuses' : f}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No applications"
          message={filter === 'ALL' ? 'No applications received yet.' : `No ${filter.toLowerCase()} applications.`}
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((app) => (
                <tr key={app.id}>
                  <td className="text-strong">{app.studentName}</td>
                  <td>{app.jobTitle}</td>
                  <td>{formatDate(app.applicationDate)}</td>
                  <td>
                    <span className={statusBadgeClass(app.status)}>{app.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                      {app.status !== 'SHORTLISTED' && app.status !== 'SELECTED' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={updatingId === app.id}
                          onClick={() => handleStatus(app, 'SHORTLISTED')}
                        >
                          Shortlist
                        </button>
                      )}
                      {app.status !== 'SELECTED' && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={updatingId === app.id}
                          onClick={() => handleStatus(app, 'SELECTED')}
                        >
                          Select
                        </button>
                      )}
                      {app.status !== 'REJECTED' && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--error-text)' }}
                          disabled={updatingId === app.id}
                          onClick={() => handleStatus(app, 'REJECTED')}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
