import { useState } from 'react';
import type { FormEvent } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { ErrorBanner, LoadingBlock } from '../../components/States';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import * as api from '../../services/mockApi';
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
  const { data, loading, error, reload } = useAsyncData(() => api.getCompanies(), []);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || password.length < 6 || !companyId) {
      setFormError('Username, a password of at least 6 characters, and a company are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      // Mirrors POST /api/auth/admin/recruiters (admin-only endpoint).
      await api.register(username.trim(), password);
      showToast('success', `Recruiter account created for ${username.trim()}`);
      setUsername('');
      setPassword('');
      setCompanyId('');
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
                  {data.map((company) => (
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
    </>
  );
}
