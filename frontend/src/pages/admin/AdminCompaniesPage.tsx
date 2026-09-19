import { useState } from 'react';
import type { FormEvent } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import * as api from '../../services/apiClient';
import type { Company } from '../../types';
import { ADMIN_LINKS } from '../../lib/navLinks';

export function AdminCompaniesPage() {
  return (
    <DashboardLayout links={ADMIN_LINKS} title="Admin dashboard">
      <AdminCompanies />
    </DashboardLayout>
  );
}

function AdminCompanies() {
  const { showToast } = useToast();
  const { data, loading, error, reload } = useAsyncData(
    () => Promise.all([api.getCompanies(), api.getJobs()]),
    [],
  );
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Companies</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const [companies, jobs] = data;

  async function handleCreate(input: Omit<Company, 'id'>) {
    setBusy(true);
    try {
      await api.createCompany(input);
      showToast('success', 'Company onboarded');
      setCreating(false);
      reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="job-detail-head">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Partner companies participating in placements.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          + Add company
        </button>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          title="No companies yet"
          message="Onboard your first partner company to begin the placement cycle."
          action={
            <button className="btn btn-primary" onClick={() => setCreating(true)}>
              Add company
            </button>
          }
        />
      ) : (
        <div className="jobs-grid">
          {companies.map((company) => {
            const openRoles = jobs.filter((j) => j.companyId === company.id).length;
            return (
              <div key={company.id} className="card card-hover card-pad">
                <div className="job-company" style={{ marginBottom: 'var(--sp-3)' }}>
                  <span className="job-logo">{company.name}</span>
                  <div>
                    <div className="text-strong">{company.name}</div>
                    <div className="text-xs text-muted">{company.location}</div>
                  </div>
                </div>
                <p className="text-sm" style={{ marginBottom: 'var(--sp-3)' }}>
                  {company.description}
                </p>
                <div className="job-meta">
                  <span className="badge badge-primary">{openRoles} open roles</span>
                  {company.website && (
                    <a href={company.website} target="_blank" rel="noreferrer" className="text-xs">
                      Website ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {creating && (
        <CompanyModal
          onClose={() => setCreating(false)}
          onSave={handleCreate}
          busy={busy}
        />
      )}
    </>
  );
}

function CompanyModal({
  onClose,
  onSave,
  busy,
}: {
  onClose: () => void;
  onSave: (input: Omit<Company, 'id'>) => Promise<void>;
  busy: boolean;
}) {
  const [form, setForm] = useState<Omit<Company, 'id'>>({
    name: '',
    description: '',
    website: '',
    location: '',
  });
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Company name is required.');
      return;
    }
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
    }
  }

  return (
    <Modal title="Add company" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="co-name">Company name</label>
          <input id="co-name" className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="co-desc">Description</label>
          <textarea id="co-desc" className="textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="field">
            <label htmlFor="co-website">Website</label>
            <input id="co-website" className="input" placeholder="https://…" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="co-location">Location</label>
            <input id="co-location" className="input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
        </div>

        {error && (
          <p className="field-error" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Add company'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
