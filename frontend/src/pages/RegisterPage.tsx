import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (username.trim().length < 3) {
      next.username = 'Username must be at least 3 characters.';
    }
    if (password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    }
    if (confirm !== password) {
      next.confirm = 'Passwords do not match.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await register(username.trim(), password);
      showToast('success', `Account created — welcome to HireNest, ${user.userName}!`);
      navigate('/student', { replace: true });
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : 'Registration failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-enter">
      <PublicNavbar />
      <div className="auth-page">
        <aside className="auth-aside">
          <h2>Start your placement journey today.</h2>
          <p>
            Create a free student account, complete your profile, and get matched with roles you
            actually qualify for.
          </p>
          <div className="auth-point">
            <span className="tick">✓</span>
            <div>Automatic eligibility matching against every live role</div>
          </div>
          <div className="auth-point">
            <span className="tick">✓</span>
            <div>One-click applications with live status tracking</div>
          </div>
          <div className="auth-point">
            <span className="tick">✓</span>
            <div>Profile scoring — know exactly where you stand</div>
          </div>
        </aside>

        <main className="auth-main">
          <div className="auth-card">
            <h1>Create your account</h1>
            <p className="subtitle text-muted">
              Free for students. Recruiter accounts are issued by your placement cell.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  className="input"
                  autoComplete="username"
                  placeholder="e.g. aarav.sharma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && <span className="field-error">{errors.username}</span>}
              </div>

              <div className="field">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="field">
                <label htmlFor="reg-confirm">Confirm password</label>
                <input
                  id="reg-confirm"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>

              {errors.form && (
                <p className="field-error" role="alert" style={{ marginBottom: 'var(--sp-4)' }}>
                  {errors.form}
                </p>
              )}

              <button type="submit" className="btn btn-gradient btn-lg" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <p className="auth-alt">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
