import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StudentProfileModal } from '../../components/StudentProfileModal';
import { ErrorBanner, LoadingBlock } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useMyStudent } from '../../hooks/useMyStudent';
import { STUDENT_LINKS } from '../../lib/navLinks';
import { statusBadgeClass, formatDate } from '../../lib/format';
import type { StudentInput } from '../../types';
import * as api from '../../services/apiClient';

export function StudentDashboardPage() {
  return (
    <DashboardLayout links={STUDENT_LINKS} title="Student dashboard">
      <StudentOverview />
    </DashboardLayout>
  );
}

function StudentOverview() {
  const { refreshSession } = useAuth();
  const { showToast } = useToast();
  const { myStudent, myApplications, loading, error, reload } = useMyStudent();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Overview</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={reload} />;
  }

  const selected = myApplications.filter((a) => a.status === 'SELECTED').length;
  const active = myApplications.filter((a) => a.status === 'APPLIED' || a.status === 'SHORTLISTED').length;

  async function handleCreateProfile(input: StudentInput) {
    await api.createStudent(input);
    // Re-issue the token so the fresh studentId claim is in the session.
    await refreshSession();
    setCreating(false);
    showToast('success', 'Profile created — you can now apply to jobs!');
    reload();
  }

  async function handleSaveProfile(input: StudentInput) {
    if (!myStudent) return;
    await api.updateStudent(myStudent.id, input);
    setEditing(false);
    showToast('success', 'Profile updated');
    reload();
  }

  return (
    <>
      <h1 className="page-title">
        Welcome back, {myStudent?.name.split(' ')[0] ?? 'student'} 👋
      </h1>
      <p className="page-subtitle">Here&apos;s where your placement journey stands.</p>

      {!myStudent && (
        <section className="card card-pad" style={{ marginBottom: 'var(--sp-6)' }}>
          <h2 style={{ marginTop: 0 }}>Complete your profile to get started</h2>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-4)' }}>
            Your account exists, but recruiters can&apos;t see you — and the placement engine
            can&apos;t rank you — until your profile has your details. It takes a minute.
          </p>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            Create my profile
          </button>
        </section>
      )}

      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card stat-card-tile">
          <span className="stat-value">{myApplications.length}</span>
          <span className="stat-label">Total applications</span>
        </div>
        <div className="card stat-card-tile">
          <span className="stat-value">{active}</span>
          <span className="stat-label">Active pipelines</span>
        </div>
        <div className="card stat-card-tile">
          <span className="stat-value">{selected}</span>
          <span className="stat-label">Offers received</span>
        </div>
      </div>

      <div className="grid-2">
        <section className="card panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h2>Recent applications</h2>
            <Link to="/student/applications" className="btn btn-ghost btn-sm">
              View all →
            </Link>
          </div>
          <div className="panel-body">
            {myApplications.length === 0 ? (
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                No applications yet — browse open roles to get started.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {myApplications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--sp-3)',
                      padding: 'var(--sp-3)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div className="text-sm text-strong">{app.jobTitle}</div>
                      <div className="text-xs text-muted">
                        {app.companyName} · {formatDate(app.applicationDate)}
                      </div>
                    </div>
                    <span className={statusBadgeClass(app.status)}>{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card panel" style={{ marginBottom: 0 }}>
          <div className="panel-head">
            <h2>My profile</h2>
            {myStudent && (
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            )}
          </div>
          <div className="panel-body">
            {myStudent ? (
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 'var(--sp-2) var(--sp-5)', fontSize: 'var(--fs-sm)' }}>
                <dt className="text-muted">CGPA</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.cgpa}</dd>
                <dt className="text-muted">Branch</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.branch}</dd>
                <dt className="text-muted">Backlogs</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.backlogs}</dd>
                <dt className="text-muted">Graduation</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.graduationYear}</dd>
                <dt className="text-muted">Skills</dt>
                <dd style={{ margin: 0 }}>
                  <span className="skills-row">
                    {myStudent.skills.map((skill) => (
                      <span key={skill} className="badge badge-primary">
                        {skill}
                      </span>
                    ))}
                  </span>
                </dd>
              </dl>
            ) : (
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                Profile not created yet.
              </p>
            )}
          </div>
        </section>
      </div>

      {creating && (
        <StudentProfileModal
          title="Create your profile"
          onClose={() => setCreating(false)}
          onSave={handleCreateProfile}
        />
      )}

      {editing && myStudent && (
        <StudentProfileModal
          title="Edit profile"
          initial={myStudent}
          onClose={() => setEditing(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}
