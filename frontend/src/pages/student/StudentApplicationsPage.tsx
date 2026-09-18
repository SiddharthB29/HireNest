import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { STUDENT_LINKS } from '../../lib/navLinks';
import { formatDate, statusBadgeClass } from '../../lib/format';
import * as api from '../../services/mockApi';
import type { ApplicationStatus } from '../../types';

const FILTERS: Array<ApplicationStatus | 'ALL'> = ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED'];

export function StudentApplicationsPage() {
  return (
    <DashboardLayout links={STUDENT_LINKS} title="Student dashboard">
      <StudentApplications />
    </DashboardLayout>
  );
}

function StudentApplications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ApplicationStatus | 'ALL'>('ALL');

  const { data, loading, error, reload } = useAsyncData(
    () => Promise.all([api.getApplications(), api.getStudents()]),
    [],
  );

  if (loading) {
    return (
      <>
        <h1 className="page-title">My applications</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const [applications, students] = data;
  const myStudent =
    students.find((s) => s.name.toLowerCase().startsWith(user?.userName.toLowerCase() ?? '')) ??
    students[0];
  const myApps = applications.filter((a) => a.studentId === myStudent?.id);
  const visible = filter === 'ALL' ? myApps : myApps.filter((a) => a.status === filter);

  return (
    <>
      <h1 className="page-title">My applications</h1>
      <p className="page-subtitle">Track every application through the pipeline.</p>

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
          title="Nothing here yet"
          message={
            filter === 'ALL'
              ? 'You have not applied to any jobs yet. Browse open roles to get started.'
              : `No ${filter.toLowerCase()} applications right now.`
          }
          action={
            <Link to="/jobs" className="btn btn-primary btn-sm">
              Browse jobs
            </Link>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Company</th>
                <th>Applied on</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((app) => (
                <tr key={app.id}>
                  <td className="text-strong">{app.jobTitle}</td>
                  <td>{app.companyName}</td>
                  <td>{formatDate(app.applicationDate)}</td>
                  <td>
                    <span className={statusBadgeClass(app.status)}>{app.status}</span>
                  </td>
                  <td>
                    <Link to={`/jobs/${app.jobId}`} className="btn btn-ghost btn-sm">
                      View job
                    </Link>
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
