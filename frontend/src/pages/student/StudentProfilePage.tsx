import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StudentProfileModal } from '../../components/StudentProfileModal';
import { ErrorBanner, LoadingBlock } from '../../components/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useMyStudent } from '../../hooks/useMyStudent';
import { STUDENT_LINKS } from '../../lib/navLinks';
import type { ResumeAnalysis, Student, StudentInput } from '../../types';
import * as api from '../../services/apiClient';

export function StudentProfilePage() {
  return (
    <DashboardLayout links={STUDENT_LINKS} title="Student dashboard">
      <StudentProfile />
    </DashboardLayout>
  );
}

function StudentProfile() {
  const { refreshSession } = useAuth();
  const { showToast } = useToast();
  const { myStudent, loading, error, reload } = useMyStudent();
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  if (loading) {
    return (
      <>
        <h1 className="page-title">My profile</h1>
        <LoadingBlock rows={3} />
      </>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={reload} />;
  }

  async function handleSave(input: StudentInput) {
    if (!myStudent) return;
    await api.updateStudent(myStudent.id, input);
    setEditing(false);
    showToast('success', 'Profile updated');
    reload();
  }

  async function handleCreate(input: StudentInput) {
    await api.createStudent(input);
    // Re-issue the token so the fresh studentId claim is in the session.
    await refreshSession();
    setCreating(false);
    showToast('success', 'Profile created');
    reload();
  }

  function handleResumeSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setResumeError(null);
    setResumeFile(null);
    if (!file) return;

    const extension = file.name.toLowerCase().split('.').pop();
    const supportedType =
      (extension === 'pdf' && file.type === 'application/pdf') ||
      (extension === 'docx' &&
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    if (!supportedType) {
      setResumeError('Choose a PDF or DOCX resume.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setResumeError('Resume must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }
    setResumeFile(file);
  }

  async function handleResumeUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!myStudent || !resumeFile) return;
    const form = event.currentTarget;
    setUploadingResume(true);
    setResumeError(null);
    try {
      await api.uploadStudentResume(myStudent.id, resumeFile);
      setResumeFile(null);
      setResumeAnalysis(null);
      form.reset();
      showToast('success', 'Resume uploaded and processed successfully.');
      reload();
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  }

  async function handleAnalyzeResume() {
    setAnalyzingResume(true);
    setAnalysisError(null);
    try {
      setResumeAnalysis(await api.analyzeMyResume());
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Resume analysis failed.');
    } finally {
      setAnalyzingResume(false);
    }
  }

  return (
    <>
      <h1 className="page-title">My profile</h1>
      <p className="page-subtitle">
        Your profile powers eligibility checks and candidate scoring — keep it current.
      </p>

      {myStudent ? (
        <>
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
        <section className="card panel resume-panel" aria-labelledby="resume-heading">
          <div className="panel-head">
            <div>
              <h2 id="resume-heading">Resume</h2>
              <p className="text-sm text-muted" style={{ marginTop: 'var(--sp-2)' }}>
                Upload a PDF or DOCX file up to 2 MB. HireNest processes it for resume insights.
              </p>
            </div>
            <span className={`badge ${myStudent.hasResume ? 'badge-success' : 'badge-neutral'}`}>
              {myStudent.hasResume ? 'Resume on file' : 'No resume uploaded'}
            </span>
          </div>
          <div className="panel-body">
            <form onSubmit={handleResumeUpload}>
              <div className="field">
                <label htmlFor="student-resume">Select resume file</label>
                <input
                  id="student-resume"
                  className="input"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleResumeSelect}
                  aria-describedby="resume-file-hint"
                  disabled={uploadingResume}
                />
                <span className="field-hint" id="resume-file-hint">
                  {resumeFile ? `${resumeFile.name} · ${(resumeFile.size / 1024).toFixed(0)} KB` : 'PDF or DOCX · maximum 2 MB'}
                </span>
              </div>
              {resumeError && <p className="field-error" role="alert">{resumeError}</p>}
              <button className="btn btn-primary" type="submit" disabled={!resumeFile || uploadingResume}>
                {uploadingResume ? 'Uploading…' : myStudent.hasResume ? 'Replace resume' : 'Upload resume'}
              </button>
            </form>
            <p className="field-hint" style={{ marginTop: 'var(--sp-4)' }}>
              Your resume is stored privately. Viewing or downloading it is not available in the current API.
            </p>
          </div>
        </section>
        <section className="card panel" aria-labelledby="resume-insights-heading">
          <div className="panel-head">
            <div>
              <h2 id="resume-insights-heading">Resume insights</h2>
              <p className="text-sm text-muted" style={{ marginTop: 'var(--sp-2)' }}>
                Review skills, strengths, gaps, and suggestions extracted from your uploaded resume.
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              type="button"
              onClick={handleAnalyzeResume}
                disabled={!myStudent.hasResume || analyzingResume}
            >
              {analyzingResume ? 'Analyzing…' : resumeAnalysis ? 'Analyze again' : 'Analyze resume'}
            </button>
          </div>
          <div className="panel-body">
            {!myStudent.hasResume ? (
              <p className="text-sm text-muted">Upload a resume to see your insights.</p>
            ) : analysisError ? (
              <div role="alert">
                <p className="field-error" style={{ marginBottom: 'var(--sp-3)' }}>{analysisError}</p>
                <button className="btn btn-ghost btn-sm" type="button" onClick={handleAnalyzeResume} disabled={analyzingResume}>
                  Try again
                </button>
              </div>
            ) : analyzingResume ? (
              <p className="text-sm text-muted" role="status">Analyzing your resume…</p>
            ) : resumeAnalysis ? (
              <div className="resume-insights">
                <p className="text-sm text-strong">{resumeAnalysis.overallSummary}</p>
                <InsightList title="Technical skills" items={resumeAnalysis.technicalSkills} />
                <InsightList title="Strengths" items={resumeAnalysis.strengths} />
                <InsightList title="Potential gaps" items={resumeAnalysis.potentialGaps} />
                <InsightList title="Suggestions" items={resumeAnalysis.suggestions} />
              </div>
            ) : (
              <p className="text-sm text-muted">Insights are generated when you request an analysis.</p>
            )}
          </div>
        </section>
        </>
      ) : (
        <section className="card card-pad">
          <h2 style={{ marginTop: 0 }}>No profile yet</h2>
          <p className="text-sm text-muted" style={{ marginBottom: 'var(--sp-4)' }}>
            Create your profile to appear in recruiter candidate pools and to apply to jobs.
          </p>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            Create my profile
          </button>
        </section>
      )}

      {editing && myStudent && (
        <StudentProfileModal
          title="Edit profile"
          initial={studentInputFromProfile(myStudent)}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}

      {creating && (
        <StudentProfileModal
          title="Create your profile"
          onClose={() => setCreating(false)}
          onSave={handleCreate}
        />
      )}
    </>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm text-strong" style={{ marginBottom: 'var(--sp-2)' }}>{title}</h3>
      <ul className="resume-insight-list">
        {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ul>
    </div>
  );
}

function studentInputFromProfile(student: Student): StudentInput {
  return {
    name: student.name,
    email: student.email,
    phone: student.phone,
    branch: student.branch,
    cgpa: student.cgpa,
    backlogs: student.backlogs,
    skills: student.skills,
    projectCount: student.projectCount,
    certificationCount: student.certificationCount,
    graduationYear: student.graduationYear,
    portfolioUrl: student.portfolioUrl,
    githubUrl: student.githubUrl,
    linkedinUrl: student.linkedinUrl,
    certificationsUrl: student.certificationsUrl,
  };
}
