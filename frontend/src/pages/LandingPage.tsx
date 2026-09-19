import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { SiteFooter } from '../components/SiteFooter';

const FEATURES = [
  {
    title: 'Smart candidate ranking',
    description:
      'A weighted placement engine scores every student on skills, CGPA, projects, and certifications — so recruiters see the strongest fits first, not the loudest applications.',
  },
  {
    title: 'Instant eligibility checks',
    description:
      'CGPA cut-offs, backlog limits, branch filters, and graduation years are evaluated automatically. Students only see and apply to roles they truly qualify for.',
  },
  {
    title: 'Application tracking',
    description:
      'Every application moves through a transparent pipeline — Applied, Shortlisted, Selected or Rejected — visible to students and recruiters in real time.',
  },
  {
    title: 'Built for placement cells',
    description:
      'Admins manage companies, recruiter accounts, and the full placement cycle from one dashboard, replacing spreadsheets and email chains.',
  },
  {
    title: 'Fast, focused hiring',
    description:
      'Candidate pools with score breakdowns let recruiters filter, compare, and shortlist in minutes instead of days.',
  },
  {
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
        {/* Hero — editorial statement */}
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="hero-eyebrow">
                <span className="mark" aria-hidden="true">✳︎</span> Campus placement, modernized
              </span>
              <h1>
                HireNest connects{' '}
                <Link to="/jobs" className="inline-link">
                  talent
                </Link>{' '}
                with <span className="accent">opportunity.</span>
              </h1>
              <p>
                Students, recruiters, and placement cells on one platform — automatic eligibility
                checks and a candidate engine that ranks the right people for every role.
              </p>
              <div className="hero-ctas">
                <Link to="/jobs" className="btn btn-primary btn-lg">
                  Find opportunities
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg">
                  I&apos;m a student — sign up
                </Link>
              </div>
              <a href="#features" className="scroll-cue">
                Scroll ↓
              </a>
              <div className="hero-meta">
                <span>
                  <span className="mark" aria-hidden="true">✳︎</span> Free for students
                </span>
                <span>
                  <span className="mark" aria-hidden="true">✳︎</span> Recruiter accounts issued by
                  your placement cell
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-band">
          <div className="container">
            <div className="stats-grid">
              {STATS.map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — metadata rows */}
        <section className="section" id="features">
          <div className="container">
            <div className="section-rule">
              <span>Experience — what HireNest does</span>
            </div>
            <div className="section-head">
              <h2>
                Everything a placement season <span className="accent">needs.</span>
              </h2>
              <p>
                One platform for discovery, evaluation, and tracking — built around how campus
                placements actually work.
              </p>
            </div>
            <div className="feature-rows">
              {FEATURES.map((feature, index) => (
                <div key={feature.title} className="feature-row">
                  <h3>
                    <span className="feature-index">{String(index + 1).padStart(2, '0')}</span>
                    {feature.title}
                  </h3>
                  <p>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — numbered rows */}
        <section className="section" id="how-it-works">
          <div className="container">
            <div className="section-rule">
              <span>About — how it works</span>
            </div>
            <div className="section-head">
              <h2>From sign-up to offer letter, in three steps.</h2>
            </div>
            <div className="step-rows">
              {STEPS.map((step, index) => (
                <div key={step.title} className="step-row">
                  <span className="step-number">{index + 1}.</span>
                  <h3>{step.title}</h3>
                  <p className="text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — typographic close */}
        <section className="cta-band">
          <div className="container">
            <h2>
              Ready to simplify your placement <span className="accent">season?</span>
            </h2>
            <p>
              Students get matched to roles they qualify for. Recruiters get ranked shortlists on
              day one.
            </p>
            <div className="hero-ctas" style={{ justifyContent: 'center', marginBottom: 0 }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create free account
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
