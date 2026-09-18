import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StudentProfileModal } from '../../components/StudentProfileModal';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { STUDENT_LINKS } from '../../lib/navLinks';
import { statusBadgeClass, formatDate } from '../../lib/format';
import * as api from '../../services/mockApi';
import type { Application, StudentInput } from '../../types';

export function StudentDashboardPage() {
  return (
    <DashboardLayout links={STUDENT_LINKS} title="Student dashboard">
      <StudentOverview />
    </DashboardLayout>
  );
}

function StudentOverview() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, loading, error, reload } = useAsyncData(
    () => Promise.all([api.getApplications(), api.getStudents()]),
    [],
  );

  const [editing, setEditing] = useState(false);

  if (loading) {
    return (
      <>
        <h1 className="page-title">Overview</h1>
        <LoadingBlock rows={4} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const [applications, students] = data;

  // A student's profile is looked up by username convention in the mock;
  // when wiring the real API this becomes the session student id.
  const myStudent =
    students.find((s) => s.name.toLowerCase().startsWith(user?.userName.toLowerCase() ?? '')) ??
    students[0];

  const myApps = applications.filter((a) => a.studentId === myStudent?.id);
  const selected = myApps.filter((a) => a.status === 'SELECTED').length;
  const active = myApps.filter((a) => a.status === 'APPLIED' || a.status === 'SHORTLISTED').length;

  async function handleSaveProfile(input: StudentInput) {
    if (!myStudent) return;
    await api.updateStudent(myStudent.id, input);
    setEditing(false);
    showToast('success', 'Profile updated');
    reload();
  }

  return (
    <>
      <h1 className="page-title">Welcome back, {myStudent?.name.split(' ')[0] ?? user?.userName} 👋</h1>
      <p className="page-subtitle">Here&apos;s where your placement journey stands.</p>

      <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card stat-card-tile">
          <span className="stat-value">{myApps.length}</span>
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
            {myApps.length === 0 ? (
              <EmptyState
                title="No applications yet"
                message="Browse open roles and apply to your first opportunity."
                action={
                  <Link to="/jobs" className="btn btn-primary btn-sm">
                    Browse jobs
                  </Link>
                }
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {myApps.slice(0, 4).map((app: Application) => (
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
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              Edit profile
            </button>
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
              <EmptyState
                title="Profile incomplete"
                message="Add your details so recruiters can find and rank you."
                action={
                  <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
                    Complete profile
                  </button>
                }
              />
            )}
          </div>
        </section>
      </div>

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
