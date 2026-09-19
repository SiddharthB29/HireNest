interface BrandProps {
  size?: 'sm' | 'md';
}

/** HireNest wordmark — editorial style: ✳︎ mark + serif wordmark. */
export function Brand({ size = 'md' }: BrandProps) {
  const markSize = size === 'sm' ? 'var(--fs-md)' : 'var(--fs-lg)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.375rem' }}>
      <span
        aria-hidden="true"
        style={{ color: 'var(--accent)', fontSize: markSize, lineHeight: 1 }}
      >
        ✳︎
      </span>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: size === 'sm' ? 'var(--fs-lg)' : 'var(--fs-xl)',
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: 'var(--text-heading)',
        }}
      >
        HireNest
      </span>
    </span>
  );
}
