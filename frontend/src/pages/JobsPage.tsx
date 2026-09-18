import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { SiteFooter } from '../components/SiteFooter';
import { EmptyState, ErrorBanner, LoadingBlock } from '../components/States';
import { useAsyncData } from '../hooks/useAsyncData';
import { formatSalary } from '../lib/format';
import * as api from '../services/mockApi';
import type { Job } from '../types';

const JOB_TYPES = ['All', 'Full-time', 'Internship'];

export function JobsPage() {
  const { data, loading, error, reload } = useAsyncData(() => api.getJobs(), []);

  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('All');
  const [minCgpa, setMinCgpa] = useState(0);

  const filtered = useMemo(() => {
    const jobs = data ?? [];
    return jobs.filter((job) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        job.title.toLowerCase().includes(q) ||
        job.companyName.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(q));
      const matchesType = jobType === 'All' || job.jobType === jobType;
      const matchesCgpa = job.minimumCgpa >= minCgpa;
      return matchesSearch && matchesType && matchesCgpa;
    });
  }, [data, search, jobType, minCgpa]);

  return (
    <div className="page-enter">
      <PublicNavbar />

      <main style={{ minHeight: '60vh' }}>
        <section className="section" style={{ paddingTop: 'var(--sp-12)' }}>
          <div className="container">
            <h1 className="page-title">Open roles</h1>
            <p className="page-subtitle">
              Browse every opportunity on HireNest. Students can log in to check eligibility and
              apply.
            </p>

            <div className="filter-toolbar">
              <input
                className="input"
                placeholder="Search title, company, skill…"
                aria-label="Search jobs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 320 }}
              />
              <select
                className="select"
                aria-label="Filter by job type"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                {JOB_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'All' ? 'All types' : t}
                  </option>
                ))}
              </select>
              <select
                className="select"
                aria-label="Filter by minimum CGPA"
                value={minCgpa}
                onChange={(e) => setMinCgpa(Number(e.target.value))}
              >
                <option value={0}>Any CGPA</option>
                <option value={6}>6.0+</option>
                <option value={7}>7.0+</option>
                <option value={8}>8.0+</option>
                <option value={9}>9.0+</option>
              </select>
            </div>

            {loading ? (
              <LoadingBlock rows={5} />
            ) : error ? (
              <ErrorBanner message={error} onRetry={reload} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="No roles found"
                message="Try widening your search — fewer filters usually surfaces more results."
                action={
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSearch('');
                      setJobType('All');
                      setMinCgpa(0);
                    }}
                  >
                    Clear filters
                  </button>
                }
              />
            ) : (
              <div className="jobs-grid">
                {filtered.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export function JobCard({ job }: { job: Job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card card-hover card-pad job-card" style={{ color: 'inherit', textDecoration: 'none' }}>
      <div className="job-card-top">
        <div className="job-company">
          <span className="job-logo">{job.companyName.slice(0, 1)}</span>
          <div>
            <div className="text-strong">{job.title}</div>
            <div className="text-xs text-muted">{job.companyName}</div>
          </div>
        </div>
        <span className="badge badge-primary">{job.jobType}</span>
      </div>

      <p className="job-desc">{job.description}</p>

      <div className="job-meta text-xs text-muted">
        <span>📍 {job.location}</span>
        <span>💰 {formatSalary(job.salary)}</span>
        <span>🎓 CGPA {job.minimumCgpa}+</span>
      </div>

      <div className="skills-row">
        {job.requiredSkills.slice(0, 4).map((skill) => (
          <span key={skill} className="badge badge-neutral">
            {skill}
          </span>
        ))}
        {job.requiredSkills.length > 4 && (
          <span className="badge badge-neutral">+{job.requiredSkills.length - 4}</span>
        )}
      </div>
    </Link>
  );
}
