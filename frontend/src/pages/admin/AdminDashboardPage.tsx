import { DashboardLayout } from '../../components/DashboardLayout';
import { ErrorBanner, LoadingBlock } from '../../components/States';
import { useAsyncData } from '../../hooks/useAsyncData';
import { ADMIN_LINKS } from '../../lib/navLinks';
import * as api from '../../services/apiClient';

export function AdminDashboardPage() {
  return (
    <DashboardLayout links={ADMIN_LINKS} title="Admin dashboard">
      <AdminOverview />
    </DashboardLayout>
  );
}

function AdminOverview() {
  const { data, loading, error, reload } = useAsyncData(
    () => Promise.all([api.getJobs(), api.getCompanies(), api.getApplications(), api.getStudents()]),
    [],
  );

  if (loading) {
    return (
      <>
        <h1 className="page-title">Platform overview</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const [jobs, companies, applications, students] = data;
  const selected = applications.filter((a) => a.status === 'SELECTED').length;
  const shortlisted = applications.filter((a) => a.status === 'SHORTLISTED').length;

  return (
    <>
      <h1 className="page-title">Platform overview</h1>
      <p className="page-subtitle">Everything happening across the placement cycle.</p>

      <div className="stat-cards">
        <div className="card stat-card-tile">
          <span className="stat-value">{companies.length}</span>
          <span className="stat-label">Companies</span>
        </div>
        <div className="card stat-card-tile">
          <span className="stat-value">{jobs.length}</span>
          <span className="stat-label">Open roles</span>
        </div>
        <div className="card stat-card-tile">
          <span className="stat-value">{students.length}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="card stat-card-tile">
          <span className="stat-value">{applications.length}</span>
          <span className="stat-label">Applications</span>
        </div>
      </div>

      <div className="grid-2">
        <section className="card panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h2>Pipeline health</h2>
          </div>
          <div className="panel-body">
            <PipelineRow label="Applied" value={applications.length} max={applications.length} color="var(--gray-400)" />
            <PipelineRow label="Shortlisted" value={shortlisted} max={applications.length} color="var(--info)" />
            <PipelineRow label="Selected" value={selected} max={applications.length} color="var(--success)" />
          </div>
        </section>

        <section className="card panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h2>Quick links</h2>
          </div>
          <div className="panel-body">
            <p className="text-sm" style={{ marginBottom: 'var(--sp-4)' }}>
              Common admin tasks:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <a className="sidebar-link" href="/admin/companies">🏢 Onboard a new company</a>
              <a className="sidebar-link" href="/admin/recruiters">🧑‍💼 Create a recruiter account</a>
              <a className="sidebar-link" href="/admin/applications">📋 Review all applications</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function PipelineRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 'var(--sp-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)', marginBottom: 4 }}>
        <span>{label}</span>
        <span className="text-strong">
          {value} ({pct}%)
        </span>
      </div>
      <div className="score-bar" style={{ height: 8 }}>
        <div className="score-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
