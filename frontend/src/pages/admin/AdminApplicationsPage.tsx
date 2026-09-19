import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatDate, statusBadgeClass } from '../../lib/format';
import * as api from '../../services/apiClient';
import type { ApplicationStatus } from '../../types';
import { ADMIN_LINKS } from '../../lib/navLinks';

const FILTERS: Array<ApplicationStatus | 'ALL'> = ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

export function AdminApplicationsPage() {
  return (
    <DashboardLayout links={ADMIN_LINKS} title="Admin dashboard">
      <AdminApplications />
    </DashboardLayout>
  );
}

function AdminApplications() {
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const { data, loading, error, reload } = useAsyncData(() => api.getApplications(), []);

  if (loading) {
    return (
      <>
        <h1 className="page-title">All applications</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const visible = filter === 'ALL' ? data : data.filter((a) => a.status === filter);

  return (
    <>
      <h1 className="page-title">All applications</h1>
      <p className="page-subtitle">Read-only view of every application across all companies.</p>

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
        <EmptyState title="No applications" message="No applications match this filter yet." />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Role</th>
                <th>Company</th>
                <th>Applied</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((app) => (
                <tr key={app.id}>
                  <td className="text-strong">{app.studentName}</td>
                  <td>{app.jobTitle}</td>
                  <td>{app.companyName}</td>
                  <td>{formatDate(app.applicationDate)}</td>
                  <td>
                    <span className={statusBadgeClass(app.status)}>{app.status}</span>
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
