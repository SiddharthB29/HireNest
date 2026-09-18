import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { EmptyState, ErrorBanner, LoadingBlock } from '../../components/States';
import { useAsyncData } from '../../hooks/useAsyncData';
import { scoreColor } from '../../lib/format';
import * as api from '../../services/mockApi';
import { RECRUITER_LINKS } from '../../lib/navLinks';

type Tab = 'rankings' | 'eligibility';

/** Ranked candidate pool + eligibility results for a single job. */
export function CandidateRankingsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const id = Number(jobId);

  return (
    <DashboardLayout links={RECRUITER_LINKS} title="Recruiter dashboard">
      <CandidateRankings jobId={id} />
    </DashboardLayout>
  );
}

function CandidateRankings({ jobId }: { jobId: number }) {
  const [tab, setTab] = useState<Tab>('rankings');
  const [minScore, setMinScore] = useState(0);

  const rankings = useAsyncData(() => api.getCandidateRankings(jobId), [jobId]);
  const job = useAsyncData(() => api.getJobById(jobId), [jobId]);
  const evaluations = useAsyncData(
    () => (tab === 'eligibility' ? api.getPlacementEvaluations(jobId) : Promise.resolve([])),
    [jobId, tab],
  );

  if (rankings.loading || job.loading) {
    return (
      <>
        <h1 className="page-title">Candidate pool</h1>
        <LoadingBlock rows={5} />
      </>
    );
  }

  if (rankings.error || job.error || !rankings.data || !job.data) {
    return <ErrorBanner message={rankings.error ?? job.error ?? 'Failed to load'} onRetry={rankings.reload} />;
  }

  const jobData = job.data;
  const filtered = rankings.data.filter((c) => c.totalScore >= minScore);

  return (
    <>
      <div className="job-detail-head">
        <div>
          <h1 className="page-title">{jobData.title}</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            {jobData.companyName} · {jobData.location} · ranked by the placement engine
          </p>
        </div>
        <Link to="/recruiter/jobs" className="btn btn-ghost">
          ← All postings
        </Link>
      </div>

      <div className="role-tabs" style={{ maxWidth: 360, marginBottom: 'var(--sp-6)' }}>
        <button className={`role-tab ${tab === 'rankings' ? 'active' : ''}`} onClick={() => setTab('rankings')}>
          Rankings
        </button>
        <button className={`role-tab ${tab === 'eligibility' ? 'active' : ''}`} onClick={() => setTab('eligibility')}>
          Eligibility results
        </button>
      </div>

      {tab === 'rankings' ? (
        <>
          <div className="filter-toolbar">
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="min-score">Minimum total score: {minScore}</label>
              <input
                id="min-score"
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                style={{ width: 200 }}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No candidates match"
              message="Lower the minimum score filter, or wait for more students to complete their profiles."
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Candidate</th>
                    <th>Skills</th>
                    <th>CGPA</th>
                    <th>Projects</th>
                    <th>Certs</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((candidate) => (
                    <tr key={candidate.studentId}>
                      <td className="text-strong">#{candidate.rank}</td>
                      <td className="text-strong">{candidate.studentName}</td>
                      <td>
                        <ScoreBar label="Skills" value={candidate.skillScore} />
                      </td>
                      <td>
                        <ScoreBar label="CGPA" value={candidate.cgpaScore} />
                      </td>
                      <td>
                        <ScoreBar label="Projects" value={candidate.projectScore} />
                      </td>
                      <td>
                        <ScoreBar label="Certs" value={candidate.certificationScore} />
                      </td>
                      <td>
                        <span className="text-strong" style={{ color: scoreColor(candidate.totalScore) }}>
                          {candidate.totalScore.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          {evaluations.loading ? (
            <LoadingBlock rows={4} />
          ) : evaluations.error ? (
            <ErrorBanner message={evaluations.error} onRetry={evaluations.reload} />
          ) : !evaluations.data || evaluations.data.length === 0 ? (
            <EmptyState
              title="No evaluation data"
              message="Eligibility results are computed by the placement engine once students have complete profiles."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {evaluations.data.map((evaluation) => (
                <div key={evaluation.studentId} className="card card-pad">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--sp-3)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span className="text-strong">{evaluation.studentName}</span>
                    <span className={`badge ${evaluation.eligible ? 'badge-success' : 'badge-error'}`}>
                      {evaluation.eligible ? 'Eligible' : 'Not eligible'}
                    </span>
                  </div>
                  <ul style={{ margin: 'var(--sp-3) 0 0', paddingLeft: '1.2rem', fontSize: 'var(--fs-sm)' }}>
                    {evaluation.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 90 }}>
      <span className="text-xs text-muted">{label} · {Math.round(value)}</span>
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
