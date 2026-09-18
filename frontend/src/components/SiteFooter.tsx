import { Link } from 'react-router-dom';
import { Brand } from './Brand';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-brand">
          <Brand size="sm" />
          <p className="text-sm">
            The smarter campus placement platform — connecting student talent with hiring teams.
          </p>
        </div>

        <div className="site-footer-col">
          <h4>Product</h4>
          <Link to="/jobs">Browse jobs</Link>
          <Link to="/register">For students</Link>
          <Link to="/login">For recruiters</Link>
        </div>

        <div className="site-footer-col">
          <h4>Company</h4>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="site-footer-col">
          <h4>Resources</h4>
          <a href="#faq">FAQ</a>
          <a href="#support">Support</a>
          <a href="#privacy">Privacy</a>
        </div>
      </div>

      <div className="container site-footer-bottom">
        <span className="text-xs text-muted">© {new Date().getFullYear()} HireNest. All rights reserved.</span>
      </div>
    </footer>
  );
}
