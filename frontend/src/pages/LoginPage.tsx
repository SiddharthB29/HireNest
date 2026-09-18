import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Role } from '../types';

const DEMO_CREDENTIALS: Record<Role, { username: string; password: string }> = {
  STUDENT: { username: 'student', password: 'student123' },
  RECRUITER: { username: 'recruiter', password: 'recruiter123' },
  ADMIN: { username: 'admin', password: 'admin123' },
};

const ROLE_BLURB: Record<Role, string> = {
  STUDENT: 'Find roles you qualify for and track applications.',
  RECRUITER: 'Manage jobs and review ranked candidate pools.',
  ADMIN: 'Oversee companies, recruiters, and the whole cycle.',
};

export function LoginPage() {
  const [role, setRole] = useState<Role>('STUDENT');
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

  function fillDemo() {
    setUsername(DEMO_CREDENTIALS[role].username);
    setPassword(DEMO_CREDENTIALS[role].password);
    setError(null);
  }

  return (
    <div className="page-enter">
      <PublicNavbar />
      <div className="auth-page">
        <aside className="auth-aside">
          <h2>Your placement journey continues here.</h2>
          <p>Log in to pick up exactly where you left off.</p>
          {(Object.keys(DEMO_CREDENTIALS) as Role[]).map((r) => (
            <div key={r} className="auth-point">
              <span className="tick">✓</span>
              <div>
                <strong>{r.charAt(0) + r.slice(1).toLowerCase()}</strong>
                <div style={{ opacity: 0.85 }}>{ROLE_BLURB[r]}</div>
              </div>
            </div>
          ))}
        </aside>

        <main className="auth-main">
          <div className="auth-card">
            <h1>Log in</h1>
            <p className="subtitle text-muted">Welcome back to HireNest.</p>

            <div className="role-tabs" role="tablist" aria-label="Account type">
              {(Object.keys(DEMO_CREDENTIALS) as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={role === r}
                  className={`role-tab ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  className="input"
                  autoComplete="username"
                  placeholder="e.g. student"
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

            <div className="demo-box">
              <h4>Demo accounts ({role.toLowerCase()})</h4>
              <div className="demo-cred">
                <span className="mono">
                  {DEMO_CREDENTIALS[role].username} / {DEMO_CREDENTIALS[role].password}
                </span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={fillDemo}>
                  Fill
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
