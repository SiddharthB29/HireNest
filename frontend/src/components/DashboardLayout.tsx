import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
          <Brand size="sm" />
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

          <div className="topbar-user">
            <div style={{ textAlign: 'right' }}>
              <div className="text-sm text-strong">{user?.userName}</div>
              <div className="text-xs text-muted">{user?.role}</div>
            </div>
            <span className="topbar-avatar" aria-hidden="true">
              {initials}
            </span>
          </div>
        </header>

        <main className="dashboard-content page-enter">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
