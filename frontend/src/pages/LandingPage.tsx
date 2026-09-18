import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { SiteFooter } from '../components/SiteFooter';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Smart candidate ranking',
    description:
      'A weighted placement engine scores every student on skills, CGPA, projects, and certifications — so recruiters see the strongest fits first, not the loudest applications.',
  },
  {
    icon: '✅',
    title: 'Instant eligibility checks',
    description:
      'CGPA cut-offs, backlog limits, branch filters, and graduation years are evaluated automatically. Students only see and apply to roles they truly qualify for.',
  },
  {
    icon: '📋',
    title: 'Application tracking',
    description:
      'Every application moves through a transparent pipeline — Applied, Shortlisted, Selected or Rejected — visible to students and recruiters in real time.',
  },
  {
    icon: '🏫',
    title: 'Built for placement cells',
    description:
      'Admins manage companies, recruiter accounts, and the full placement cycle from one dashboard, replacing spreadsheets and email chains.',
  },
  {
    icon: '⚡',
    title: 'Fast, focused hiring',
    description:
      'Candidate pools with score breakdowns let recruiters filter, compare, and shortlist in minutes instead of days.',
  },
  {
    icon: '🔒',
    title: 'Role-based access',
    description:
      'Students, recruiters, and admins each get a purpose-built dashboard with exactly the permissions and data they need — nothing more.',
  },
];

const STEPS = [
  {
    title: 'Create your profile',
    description:
      'Students sign up and add their CGPA, branch, skills, projects, and certifications. The engine keeps scoring your profile against every live role.',
  },
  {
    title: 'Get matched & apply',
    description:
      'Browse openings you are eligible for, see exactly why you qualify, and apply with one click. Recruiters get ranked candidate pools automatically.',
  },
  {
    title: 'Track to placement',
    description:
      'Recruiters shortlist, interview, and select from a ranked shortlist. Students watch each application move through the pipeline in real time.',
  },
];

const STATS = [
  { value: '120+', label: 'Open roles this season' },
  { value: '3,400+', label: 'Students placed' },
  { value: '45', label: 'Partner companies' },
  { value: '92%', label: 'Shortlist accuracy' },
];

export function LandingPage() {
  return (
    <div className="page-enter">
      <PublicNavbar />

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="container hero-inner">
            <div className="hero-copy">
              <span className="hero-eyebrow">Campus placement, modernized</span>
              <h1>
                Connecting talent <span className="accent">with opportunity.</span>
              </h1>
              <p>
                HireNest brings students, recruiters, and placement cells onto one platform — with
                automatic eligibility checks and a candidate engine that ranks the right people for
                every role.
              </p>
              <div className="hero-ctas">
                <Link to="/jobs" className="btn btn-gradient btn-lg">
                  Find opportunities
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  I&apos;m a student — sign up
                </Link>
              </div>
              <p className="text-sm text-muted">
                Free for students · Recruiter accounts issued by your placement cell
              </p>
            </div>

            <div className="hero-preview" aria-hidden="true">
              <div className="preview-card">
                <div className="text-strong" style={{ marginBottom: 'var(--sp-4)' }}>
                  Ranked candidates — Software Engineer
                </div>
                {[
                  { initials: 'AS', name: 'Aarav Sharma', score: 86.4, rank: 1 },
                  { initials: 'DP', name: 'Diya Patel', score: 84.2, rank: 2 },
                  { initials: 'IR', name: 'Ishita Rao', score: 68.8, rank: 3 },
                ].map((row) => (
                  <div className="preview-row" key={row.rank}>
                    <span className="preview-avatar">{row.initials}</span>
                    <div>
                      <div className="text-sm text-strong">{row.name}</div>
                      <div className="text-xs text-muted">Overall fit</div>
                    </div>
                    <span className="preview-rank">#{row.rank} · {row.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-band">
          <div className="container">
            <div className="stats-grid">
              {STATS.map((stat) => (
                <div key={stat.label} className="card stat-card">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="section section-alt" id="features">
          <div className="container">
            <div className="section-head">
              <h2>Everything a placement season needs</h2>
              <p>
                One platform for discovery, evaluation, and tracking — built around how campus
                placements actually work.
              </p>
            </div>
            <div className="features-grid">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="card card-hover feature-card">
                  <div className="feature-icon" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section" id="how-it-works">
          <div className="container">
            <div className="section-head">
              <h2>How HireNest works</h2>
              <p>From sign-up to offer letter in three steps.</p>
            </div>
            <div className="steps-grid">
              {STEPS.map((step, index) => (
                <div key={step.title} className="card step-card">
                  <span className="step-number">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p className="text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section">
          <div className="container">
            <div className="cta-band">
              <h2>Ready to simplify your placement season?</h2>
              <p>
                Students get matched to roles they qualify for. Recruiters get ranked shortlists on
                day one.
              </p>
              <div className="hero-ctas" style={{ justifyContent: 'center' }}>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  Create free account
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg" style={{ color: '#fff' }}>
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
