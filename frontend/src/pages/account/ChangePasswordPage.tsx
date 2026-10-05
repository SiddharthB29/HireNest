import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../../components/PublicNavbar';
import * as api from '../../services/apiClient';

export function ChangePasswordPage() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.trim() === '') {
      setError('New password cannot be empty.');
      return;
    }

    setSubmitting(true);

    try {
      await api.changePassword(currentPassword, newPassword);

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to change password. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-enter">
      <PublicNavbar />

      <div className="auth-page">
        <main className="auth-main">
          <div className="auth-card">
            <h1>Change password</h1>

            <p className="subtitle text-muted">
              Update your HireNest account password.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="current-password">
                  Current password
                </label>

                <input
                  id="current-password"
                  className="input"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="new-password">
                  New password
                </label>

                <input
                  id="new-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="confirm-password">
                  Confirm new password
                </label>

                <input
                  id="confirm-password"
                  className="input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                />
              </div>

              {error && (
                <p
                  className="field-error"
                  role="alert"
                  style={{ marginBottom: 'var(--sp-4)' }}
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  style={{
                    marginBottom: 'var(--sp-4)',
                    color: 'var(--text-heading)',
                  }}
                >
                  Password changed successfully.
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={submitting}
              >
                {submitting ? 'Changing password…' : 'Change password'}
              </button>
            </form>

            <p className="auth-alt">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}