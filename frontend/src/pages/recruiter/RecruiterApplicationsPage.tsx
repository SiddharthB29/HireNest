import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatDate, statusBadgeClass } from '../../lib/format';
import * as api from '../../services/apiClient';
import type { Application, ApplicationStatus } from '../../types';
import { RECRUITER_LINKS } from '../../lib/navLinks';

const FILTERS: Array<ApplicationStatus | 'ALL'> = ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

/** Backend-valid transitions: APPLIED → SHORTLISTED/REJECTED; SHORTLISTED → SELECTED/REJECTED. */
function nextActions(status: ApplicationStatus): ApplicationStatus[] {
  switch (status) {
    case 'APPLIED':
      return ['SHORTLISTED', 'REJECTED'];
    case 'SHORTLISTED':
      return ['SELECTED', 'REJECTED'];
    default:
      return [];
  }
}

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

  // GET /api/applications is scoped server-side: a recruiter receives only
  // their own company's applications.
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

  const visible = filter === 'ALL' ? data : data.filter((a) => a.status === filter);

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
                      {nextActions(app.status).map((status) => (
                        <button
                          key={status}
                          className={`btn btn-sm ${status === 'SELECTED' ? 'btn-primary' : status === 'REJECTED' ? 'btn-ghost' : 'btn-secondary'}`}
                          style={status === 'REJECTED' ? { color: 'var(--error-text)' } : undefined}
                          disabled={updatingId === app.id}
                          onClick={() => handleStatus(app, status)}
                        >
                          {status === 'SHORTLISTED' ? 'Shortlist' : status === 'SELECTED' ? 'Select' : 'Reject'}
                        </button>
                      ))}
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
