import { useEffect, useRef } from 'react';

/**
 * ScrollProgress — the scroll-triggered horizontal line: a thin bar fixed
 * to the top of the viewport whose width extends from 0 → 100% as the page
 * scrolls. Scroll direction is respected (shrinks when scrolling up).
 * Fill colors come from --fx-line-* CSS vars, so each theme has its own.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let pending = false;

    const flush = () => {
      pending = false;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const fraction = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      el.style.transform = `scaleX(${fraction})`;
      el.style.opacity = fraction > 0.005 ? '1' : '0';
    };

    const onScroll = () => {
      if (!pending) {
        pending = true;
        raf = requestAnimationFrame(flush);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    flush();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fx-scroll-progress" aria-hidden="true">
      <div ref={ref} className="fx-scroll-progress-fill" />
    </div>
  );
}
