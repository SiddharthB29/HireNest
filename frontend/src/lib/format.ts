/** Shared formatting helpers. */

export function formatSalary(salary: number): string {
  if (salary >= 1_000_000) {
    return `₹${(salary / 1_000_000).toFixed(salary % 1_000_000 === 0 ? 0 : 1)} LPA`;
  }
  return `₹${salary.toLocaleString('en-IN')}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'SELECTED':
      return 'badge badge-success';
    case 'SHORTLISTED':
      return 'badge badge-info';
    case 'REJECTED':
      return 'badge badge-error';
    default:
      return 'badge badge-neutral';
  }
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 60) return 'var(--warning)';
  return 'var(--error)';
}
