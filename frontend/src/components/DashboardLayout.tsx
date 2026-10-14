import { useEffect, useRef, useState } from 'react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpen = useRef(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const breakpoint = window.matchMedia('(max-width: 900px)');
    const updateViewport = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile(event.matches);
      if (!event.matches) setMenuOpen(false);
    };
    updateViewport(breakpoint);
    breakpoint.addEventListener('change', updateViewport);
    return () => breakpoint.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      mobileCloseRef.current?.focus();
    } else if (wasMenuOpen.current && isMobile) {
      mobileToggleRef.current?.focus();
    }
    wasMenuOpen.current = menuOpen;
  }, [menuOpen, isMobile]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  const initials = (user?.userName ?? '?').slice(0, 2).toUpperCase();

  return (
    <div className={`dashboard ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
      <aside id="dashboard-sidebar" className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="sidebar-head">
          {/* Click the HireNest symbol to leave the dashboard and go home. */}
          <Link to="/" aria-label="HireNest home" className="sidebar-brand-link">
            <Brand size="sm" />
          </Link>
          <button
            ref={mobileCloseRef}
            type="button"
            className="btn btn-ghost btn-sm mobile-only sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="sidebar-nav" aria-label={`${title} navigation`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
              aria-label={link.label}
              title={sidebarCollapsed && !isMobile ? link.label : undefined}
            >
              <span className="link-mark" aria-hidden="true">
                {link.icon}
              </span>
              <span className="sidebar-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <button
            type="button"
            className="btn btn-ghost sidebar-link sidebar-logout"
            aria-label="Log out"
            title={sidebarCollapsed && !isMobile ? 'Log out' : undefined}
            onClick={handleLogout}
          >
            <span className="link-mark" aria-hidden="true">↪</span>
            <span className="sidebar-label">Log out</span>
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      <div className="dashboard-main" inert={isMobile && menuOpen}>
        <header className="topbar">
          <div className="topbar-leading">
            <button
              className="btn btn-ghost btn-sm mobile-only"
              type="button"
              ref={mobileToggleRef}
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              aria-controls="dashboard-sidebar"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="sidebar-toggle-icon" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm desktop-only sidebar-toggle"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
              aria-controls="dashboard-sidebar"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            >
              <span className="sidebar-toggle-icon" aria-hidden="true" />
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
