import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Brand } from './Brand';
import { useAuth } from '../context/AuthContext';

/** Sticky navbar for public (marketing) pages. */
export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const close = () => setOpen(false);

  return (
    <header className="public-navbar">
      <div className="container public-navbar-inner">
        <Link to="/" onClick={close} aria-label="HireNest home">
          <Brand />
        </Link>

        <nav className={`public-nav-links ${open ? 'is-open' : ''}`} aria-label="Primary">
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/#features" onClick={close}>
            Features
          </NavLink>
          <Link to="/jobs" onClick={close}>
            Jobs
          </Link>
          <NavLink to="/#how-it-works" onClick={close}>
            How it works
          </NavLink>
        </nav>

        <div className={`public-nav-actions ${open ? 'is-open' : ''}`}>
          {user ? (
            <button className="btn btn-primary" onClick={() => navigate(`/${user.role.toLowerCase()}`)}>
              Go to dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" onClick={close}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-gradient" onClick={close}>
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="public-nav-toggle"
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
