import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Brand } from './Brand';
import { useAuth } from '../context/AuthContext';

export interface SidebarLink {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

/** Shared dashboard shell: sidebar + topbar + routed content. */
export function DashboardLayout({
  links,
  title,
  children,
}: {
  links: SidebarLink[];
  title: string;
  children?: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  const initials = (user?.userName ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className="dashboard">
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="sidebar-head">
          {/* Click the HireNest symbol to leave the dashboard and go home. */}
          <Link to="/" aria-label="HireNest home" className="sidebar-brand-link">
            <Brand size="sm" />
          </Link>
        </div>

        <nav className="sidebar-nav" aria-label={`${title} navigation`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <span className="link-mark" aria-hidden="true">
                {link.icon}
              </span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>
            ← Log out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <div className="dashboard-main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <button
              className="btn btn-ghost btn-sm mobile-only"
              aria-label="Toggle sidebar"
              onClick={() => setMenuOpen((o) => !o)}
            >
              ☰
            </button>
            <span className="topbar-title">{title}</span>
          </div>

          <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="topbar-user"
        onClick={() => setAccountMenuOpen((open) => !open)}
        aria-expanded={accountMenuOpen}
        aria-haspopup="menu"
      >
        <div style={{ textAlign: 'right' }}>
          <div className="text-sm text-strong">{user?.userName}</div>
          <div className="text-xs text-muted">{user?.role}</div>
        </div>

        <span className="topbar-avatar" aria-hidden="true">
          {initials}
        </span>
      </button>

      {accountMenuOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + var(--sp-2))',
            minWidth: '180px',
            padding: 'var(--sp-2)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 100,
          }}
        >
          <button
            type="button"
            role="menuitem"
            className="btn btn-ghost"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => {
              setAccountMenuOpen(false);
              navigate('/account/change-password');
            }}
          >
            Change password
          </button>

          <button
            type="button"
            role="menuitem"
            className="btn btn-ghost"
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => {
              setAccountMenuOpen(false);
              handleLogout();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
        </header>

        <main className="dashboard-content page-enter">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
