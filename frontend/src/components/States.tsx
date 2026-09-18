import type { ReactNode } from 'react';

/** Shimmering placeholder block. */
export function Skeleton({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return <div className="skeleton" style={{ width, height }} />;
}

/** Full-region loading state with a few shimmering rows. */
export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} height={52} />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="state-banner">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="state-banner state-banner--error" role="alert">
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
