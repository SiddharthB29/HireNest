interface BrandProps {
  size?: 'sm' | 'md';
}

/** HireNest logo: rounded nest/arrow glyph + wordmark. */
export function Brand({ size = 'md' }: BrandProps) {
  const box = size === 'sm' ? 28 : 34;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem' }}>
      <span
        aria-hidden="true"
        style={{
          width: box,
          height: box,
          borderRadius: '0.55em',
          background: 'var(--gradient-brand)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: 'var(--shadow-primary)',
        }}
      >
        <svg width={box * 0.58} height={box * 0.58} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8v3.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5V14Z"
            stroke="#fff"
            strokeWidth="2"
          />
          <circle cx="12" cy="13.5" r="2.4" fill="#fff" />
          <path d="M9 6.2 12 3l3 3.2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          HireNest logo
        </span>
      </span>
      <span
        style={{
          fontSize: size === 'sm' ? 'var(--fs-lg)' : 'var(--fs-xl)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-heading)',
        }}
      >
        Hire<span style={{ color: 'var(--primary-600)' }}>Nest</span>
      </span>
    </span>
  );
}
