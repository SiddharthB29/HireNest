import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatSalary } from '../../lib/format';
import * as api from '../../services/mockApi';
import type { Job, JobInput } from '../../types';
import { RECRUITER_LINKS } from '../../lib/navLinks';

const COMPANY_ID = 1;

const EMPTY_JOB: JobInput = {
  title: '',
  description: '',
  location: '',
  salary: 1_000_000,
  minimumCgpa: 7,
  maximumBacklogs: 0,
  requiredSkills: [],
  preferredSkills: [],
  allowedBranches: ['CSE', 'IT'],
  graduationYear: new Date().getFullYear() + 1,
  jobType: 'Full-time',
};

export function RecruiterJobsPage() {
  return (
    <DashboardLayout links={RECRUITER_LINKS} title="Recruiter dashboard">
      <RecruiterJobs />
    </DashboardLayout>
  );
}

function RecruiterJobs() {
  const { showToast } = useToast();
  const { data, loading, error, reload } = useAsyncData(() => api.getJobs(), []);
  const [modal, setModal] = useState<{ mode: 'create' } | { mode: 'edit'; job: Job } | null>(null);
  const [deleting, setDeleting] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <>
        <h1 className="page-title">My job postings</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const myJobs = data.filter((j) => j.companyId === COMPANY_ID);

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteJob(deleting.id);
      showToast('success', `Deleted "${deleting.title}"`);
      setDeleting(null);
      reload();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to delete job');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="job-detail-head">
        <div>
          <h1 className="page-title">My job postings</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Create, edit, and manage your company&apos;s openings.
          </p>
        </div>
        <button className="btn btn-gradient" onClick={() => setModal({ mode: 'create' })}>
          + Post a job
        </button>
      </div>

      {myJobs.length === 0 ? (
        <EmptyState
          title="No postings yet"
          message="Post your first job — the placement engine will start ranking eligible students immediately."
          action={
            <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
              Post a job
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Location</th>
                <th>Package</th>
                <th>Min CGPA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {myJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className="text-strong">{job.title}</div>
                    <div className="text-xs text-muted">{job.jobType}</div>
                  </td>
                  <td>{job.location}</td>
                  <td>{formatSalary(job.salary)}</td>
                  <td>{job.minimumCgpa}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/recruiter/jobs/${job.id}/candidates`}
                        className="btn btn-secondary btn-sm"
                      >
                        Candidates
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal({ mode: 'edit', job })}>
                        Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error-text)' }} onClick={() => setDeleting(job)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <JobFormModal
          title={modal.mode === 'create' ? 'Post a job' : `Edit — ${modal.job.title}`}
          initial={modal.mode === 'edit' ? modal.job : undefined}
          onClose={() => setModal(null)}
          onSave={async (input) => {
            if (modal.mode === 'create') {
              await api.createJob(COMPANY_ID, input);
              showToast('success', 'Job posted');
            } else {
              await api.updateJob(modal.job.id, input);
              showToast('success', 'Job updated');
            }
            setModal(null);
            reload();
          }}
        />
      )}

      {deleting && (
        <Modal
          title="Delete job posting"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)} disabled={busy}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={busy}>
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to delete <strong>{deleting.title}</strong>? This will remove it
            from listings. Existing applications are retained.
          </p>
        </Modal>
      )}
    </>
  );
}

function JobFormModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial?: Job;
  onClose: () => void;
  onSave: (input: JobInput) => Promise<void>;
}) {
  const [form, setForm] = useState<JobInput>(
    initial
      ? {
          title: initial.title,
          description: initial.description,
          location: initial.location,
          salary: initial.salary,
          minimumCgpa: initial.minimumCgpa,
          maximumBacklogs: initial.maximumBacklogs,
          requiredSkills: [...initial.requiredSkills],
          preferredSkills: [...initial.preferredSkills],
          allowedBranches: [...initial.allowedBranches],
          graduationYear: initial.graduationYear,
          jobType: initial.jobType,
        }
      : EMPTY_JOB,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof JobInput>(key: K, value: JobInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleBranch(branch: string) {
    update(
      'allowedBranches',
      form.allowedBranches.includes(branch)
        ? form.allowedBranches.filter((b) => b !== branch)
        : [...form.allowedBranches, branch],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Title, description, and location are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job');
      setSaving(false);
    }
  }

  const BRANCHES = ['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'AI/ML', 'Any'];

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="jf-title">Job title</label>
          <input id="jf-title" className="input" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="jf-desc">Description</label>
          <textarea
            id="jf-desc"
            className="textarea"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="jf-location">Location</label>
            <input id="jf-location" className="input" value={form.location} onChange={(e) => update('location', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="jf-type">Job type</label>
            <select id="jf-type" className="select" value={form.jobType} onChange={(e) => update('jobType', e.target.value)}>
              {['Full-time', 'Internship'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="jf-salary">Annual package (₹)</label>
            <input id="jf-salary" className="input" type="number" min="0" step="50000" value={form.salary} onChange={(e) => update('salary', Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="jf-year">Graduation year</label>
            <input id="jf-year" className="input" type="number" value={form.graduationYear ?? ''} onChange={(e) => update('graduationYear', e.target.value ? Number(e.target.value) : null)} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="jf-cgpa">Minimum CGPA</label>
            <input id="jf-cgpa" className="input" type="number" step="0.1" min="0" max="10" value={form.minimumCgpa} onChange={(e) => update('minimumCgpa', Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="jf-backlogs">Maximum backlogs</label>
            <input id="jf-backlogs" className="input" type="number" min="0" value={form.maximumBacklogs} onChange={(e) => update('maximumBacklogs', Number(e.target.value))} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="jf-required">Required skills (comma-separated)</label>
          <input
            id="jf-required"
            className="input"
            value={form.requiredSkills.join(', ')}
            onChange={(e) => update('requiredSkills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </div>

        <div className="field">
          <label htmlFor="jf-preferred">Preferred skills (comma-separated)</label>
          <input
            id="jf-preferred"
            className="input"
            value={form.preferredSkills.join(', ')}
            onChange={(e) => update('preferredSkills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
        </div>

        <div className="field">
          <label>Allowed branches</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
            {BRANCHES.map((branch) => (
              <button
                key={branch}
                type="button"
                className={`badge ${form.allowedBranches.includes(branch) ? 'badge-primary' : 'badge-neutral'}`}
                style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
                onClick={() => toggleBranch(branch)}
                aria-pressed={form.allowedBranches.includes(branch)}
              >
                {branch}
              </button>
            ))}
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
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save job'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
