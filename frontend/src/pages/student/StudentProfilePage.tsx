import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StudentProfileModal } from '../../components/StudentProfileModal';
import { ErrorBanner, LoadingBlock } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsyncData } from '../../hooks/useAsyncData';
import { STUDENT_LINKS } from '../../lib/navLinks';
import * as api from '../../services/mockApi';
import type { StudentInput } from '../../types';

export function StudentProfilePage() {
  return (
    <DashboardLayout links={STUDENT_LINKS} title="Student dashboard">
      <StudentProfile />
    </DashboardLayout>
  );
}

function StudentProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);

  const { data, loading, error, reload } = useAsyncData(() => api.getStudents(), []);

  if (loading) {
    return (
      <>
        <h1 className="page-title">My profile</h1>
        <LoadingBlock rows={3} />
      </>
    );
  }

  if (error || !data) {
    return <ErrorBanner message={error ?? 'Failed to load'} onRetry={reload} />;
  }

  const myStudent =
    data.find((s) => s.name.toLowerCase().startsWith(user?.userName.toLowerCase() ?? '')) ?? data[0];

  async function handleSave(input: StudentInput) {
    if (!myStudent) return;
    await api.updateStudent(myStudent.id, input);
    setEditing(false);
    showToast('success', 'Profile updated');
    reload();
  }

  return (
    <>
      <h1 className="page-title">My profile</h1>
      <p className="page-subtitle">
        Your profile powers eligibility checks and candidate scoring — keep it current.
      </p>

      {myStudent ? (
        <div className="detail-grid">
          <section className="card panel" style={{ marginBottom: 0 }}>
            <div className="panel-head">
              <h2>{myStudent.name}</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
                Edit profile
              </button>
            </div>
            <div className="panel-body">
              <dl
                style={{
                  margin: 0,
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  gap: 'var(--sp-3) var(--sp-8)',
                  fontSize: 'var(--fs-sm)',
                }}
              >
                <dt className="text-muted">Email</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.email}</dd>
                <dt className="text-muted">Phone</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.phone || '—'}</dd>
                <dt className="text-muted">Branch</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.branch}</dd>
                <dt className="text-muted">CGPA</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.cgpa}</dd>
                <dt className="text-muted">Backlogs</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.backlogs}</dd>
                <dt className="text-muted">Projects</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.projectCount}</dd>
                <dt className="text-muted">Certifications</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.certificationCount}</dd>
                <dt className="text-muted">Graduation year</dt>
                <dd className="text-strong" style={{ margin: 0 }}>{myStudent.graduationYear}</dd>
              </dl>
            </div>
          </section>

          <section className="card panel" style={{ marginBottom: 0 }}>
            <div className="panel-head">
              <h2>Skills</h2>
            </div>
            <div className="panel-body">
              <div className="skills-row">
                {myStudent.skills.length > 0 ? (
                  myStudent.skills.map((skill) => (
                    <span key={skill} className="badge badge-primary">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted">No skills added yet — edit your profile to add some.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <ErrorBanner message="Profile not found. Complete your profile to get started." />
      )}

      {editing && myStudent && (
        <StudentProfileModal
          title="Edit profile"
          initial={myStudent}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
