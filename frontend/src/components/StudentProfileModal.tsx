import { useState } from 'react';
import type { FormEvent } from 'react';
import { Modal } from './Modal';
import type { StudentInput } from '../types';

const EMPTY_PROFILE: StudentInput = {
  name: '',
  email: '',
  phone: '',
  branch: 'CSE',
  cgpa: 7,
  backlogs: 0,
  skills: [],
  projectCount: 0,
  certificationCount: 0,
  graduationYear: new Date().getFullYear() + 1,
};

export function StudentProfileModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial?: StudentInput;
  onClose: () => void;
  onSave: (input: StudentInput) => Promise<void>;
}) {
  const [form, setForm] = useState<StudentInput>(initial ?? EMPTY_PROFILE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof StudentInput>(key: K, value: StudentInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setSaving(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="field">
            <label htmlFor="sp-name">Full name</label>
            <input id="sp-name" className="input" value={form.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="sp-email">Email</label>
            <input id="sp-email" className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="sp-phone">Phone</label>
            <input id="sp-phone" className="input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="sp-branch">Branch</label>
            <select id="sp-branch" className="select" value={form.branch} onChange={(e) => update('branch', e.target.value)}>
              {['CSE', 'IT', 'ECE', 'Mechanical', 'Civil', 'AI/ML'].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="sp-cgpa">CGPA</label>
            <input id="sp-cgpa" className="input" type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={(e) => update('cgpa', Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="sp-backlogs">Backlogs</label>
            <input id="sp-backlogs" className="input" type="number" min="0" value={form.backlogs} onChange={(e) => update('backlogs', Number(e.target.value))} />
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="sp-projects">Projects</label>
            <input id="sp-projects" className="input" type="number" min="0" value={form.projectCount} onChange={(e) => update('projectCount', Number(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="sp-certs">Certifications</label>
            <input id="sp-certs" className="input" type="number" min="0" value={form.certificationCount} onChange={(e) => update('certificationCount', Number(e.target.value))} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="sp-skills">Skills (comma-separated)</label>
          <input
            id="sp-skills"
            className="input"
            placeholder="Java, SQL, React"
            value={form.skills.join(', ')}
            onChange={(e) => update('skills', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
          />
          <span className="field-hint">These drive your skill score in the placement engine.</span>
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
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
