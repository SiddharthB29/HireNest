import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLE_BLURBS: Array<{ role: string; blurb: string }> = [
  { role: 'Student', blurb: 'Find roles you qualify for and track applications.' },
  { role: 'Recruiter', blurb: 'Manage jobs and review ranked candidate pools.' },
  { role: 'Admin', blurb: 'Oversee companies, recruiters, and the whole cycle.' },
];

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string } | null)?.from;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(username.trim(), password);
      showToast('success', `Welcome back, ${user.userName}!`);
      navigate(from ?? `/${user.role.toLowerCase()}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-enter">
      <PublicNavbar />
      <div className="auth-page">
        <aside className="auth-aside">
          <h2>Your placement journey continues here.</h2>
          <p>Log in to pick up exactly where you left off.</p>
          {ROLE_BLURBS.map(({ role, blurb }) => (
            <div key={role} className="auth-point">
              <span className="tick">✓</span>
              <div>
                <strong>{role}</strong>
                <div style={{ opacity: 0.85 }}>{blurb}</div>
              </div>
            </div>
          ))}
        </aside>

        <main className="auth-main">
          <div className="auth-card">
            <h1>Log in</h1>
            <p className="subtitle text-muted">
              Your account type — student, recruiter, or admin — is recognized automatically.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  className="input"
                  autoComplete="username"
                  placeholder="Your account username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="field-error" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Logging in…' : 'Log in'}
              </button>
            </form>

            <p className="auth-alt">
              New to HireNest? <Link to="/register">Create a student account</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
