import { useState } from 'react';
import type { FormEvent } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import * as api from '../../services/apiClient';
import { ADMIN_LINKS } from '../../lib/navLinks';

export function AdminRecruitersPage() {
  return (
    <DashboardLayout links={ADMIN_LINKS} title="Admin dashboard">
      <AdminRecruiters />
    </DashboardLayout>
  );
}

function AdminRecruiters() {
  const { showToast } = useToast();
  const { data, loading, error, reload } = useAsyncData(
    () => Promise.all([api.getCompanies(), api.getRecruiters()]),
    [],
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Recruiter accounts</h1>
        <LoadingBlock rows={3} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const [companies, recruiters] = data;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || password.length < 6 || !companyId) {
      setFormError('Username, a password of at least 6 characters, and a company are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      // POST /api/auth/admin/recruiters (admin-only endpoint).
      await api.createRecruiter({
        userName: username.trim(),
        password,
        companyId: Number(companyId),
      });
      showToast('success', `Recruiter account created for ${username.trim()}`);
      setUsername('');
      setPassword('');
      setCompanyId('');
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create recruiter');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Recruiter accounts</h1>
      <p className="page-subtitle">
        Recruiter accounts are created by admins only — students cannot self-register as recruiters.
      </p>

      <div className="detail-grid">
        <section className="card panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h2>Create recruiter account</h2>
          </div>
          <div className="panel-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="rec-username">Username</label>
                <input
                  id="rec-username"
                  className="input"
                  placeholder="e.g. nimbus.talent"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="rec-password">Temporary password</label>
                <input
                  id="rec-password"
                  className="input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="rec-company">Company</label>
                <select
                  id="rec-company"
                  className="select"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                >
                  <option value="">Select a company…</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <p className="field-error" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
                  {formError}
                </p>
              )}

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create recruiter'}
              </button>
            </form>
          </div>
        </section>

        <section className="card panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h2>How it works</h2>
          </div>
          <div className="panel-body">
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: 'var(--fs-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              <li>Pick the company the recruiter represents.</li>
              <li>Create their username and a temporary password.</li>
              <li>
                Share the credentials securely — the recruiter logs in and lands directly in their
                company dashboard.
              </li>
              <li>
                Recruiters can only see and manage jobs and applications belonging to their own
                company.
              </li>
            </ol>
          </div>
        </section>
      </div>

      <section style={{ marginTop: 'var(--sp-8)' }}>
        <h2 className="text-lg" style={{ marginBottom: 'var(--sp-4)' }}>
          Existing recruiter accounts ({recruiters.length})
        </h2>
        {recruiters.length === 0 ? (
          <EmptyState
            title="No recruiter accounts yet"
            message="Create the first recruiter account with the form above."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Company</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {recruiters.map((recruiter) => (
                  <tr key={recruiter.id}>
                    <td className="text-strong">{recruiter.userName}</td>
                    <td>{recruiter.companyName ?? '—'}</td>
                    <td>
                      <span className="badge badge-neutral">{recruiter.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
