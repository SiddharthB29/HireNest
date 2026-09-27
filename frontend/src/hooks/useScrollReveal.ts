import { useEffect } from 'react';

/**
 * useScrollReveal — scroll-triggered reveal for the landing page.
 *
 * Three coordinated behaviors:
 *  1. Content reveals — every [data-reveal] element gets `.is-revealed` as it
 *     enters the viewport (fx.css animates fade + rise, staggered via
 *     --reveal-index).
 *  2. Section rules — [data-reveal='rule'] elements are *scrubbed*: a rAF
 *     loop maps their viewport position to --rule-scrub (0..1) each frame,
 *     lerped for smoothness, so the hairline is physically tied to scroll
 *     progress instead of playing its own transition.
 *  3. One-shot shimmer — once a rule's scrub reaches ~1, or a content block's
 *     reveal transition ends, the element gets `.is-shimmered` and fx.css
 *     runs a single gold sweep (never loops).
 *
 * Honors prefers-reduced-motion (everything visible immediately, scrub
 * pinned to 1, no shimmer sweep).
 */
export function useScrollReveal(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (targets.length === 0) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach((t) => {
        t.classList.add('is-revealed');
        if (t.dataset.reveal === 'rule') t.style.setProperty('--rule-scrub', '1');
      });
      return;
    }

    targets.forEach((t, i) => t.style.setProperty('--reveal-index', String(i % 6)));

    // ---- shimmer scheduling -------------------------------------------------
    // Fire `.is-shimmered` exactly once, after the reveal has visibly finished.
    const shimmer = (el: HTMLElement, delayMs: number) => {
      window.setTimeout(() => el.classList.add('is-shimmered'), delayMs);
    };

    const onContentRevealed = (el: HTMLElement) => {
      el.classList.add('is-revealed');
      if (el.classList.contains('stat-card')) {
        // wait for the 450ms transition + its stagger delay before sweeping
        const idx = parseInt(el.style.getPropertyValue('--reveal-index') || '0', 10);
        shimmer(el, 480 + idx * 50);
      }
    };

    // ---- scroll-scrubbed section rules --------------------------------------
    const rules = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal='rule']"));
    let raf = 0;
    let scrubRunning = false;
    const scrubValues = new Map<HTMLElement, number>(); // displayed (lerped) value

    const scrubFrame = () => {
      if (!scrubRunning) return;
      const vh = window.innerHeight;
      let allDone = true;

      for (const el of rules) {
        if (el.classList.contains('is-shimmered')) continue;
        const rect = el.getBoundingClientRect();
        // progress 0 → 1 while the rule travels from 88% to 55% of the viewport
        const raw = (vh * 0.88 - rect.top) / (vh * 0.33);
        const targetP = Math.min(1, Math.max(0, raw));
        const prev = scrubValues.get(el) ?? 0;
        // lerp toward the scroll target — smooth scrubbed motion
        const next = prev + (targetP - prev) * 0.18;
        scrubValues.set(el, next);
        el.style.setProperty('--rule-scrub', next.toFixed(3));
        if (next < 0.995) {
          allDone = false;
        } else {
          el.classList.add('is-shimmered'); // one-shot gold sweep, once stretched
        }
      }

      if (allDone) {
        scrubRunning = false;
        return;
      }
      raf = requestAnimationFrame(scrubFrame);
    };

    const startScrub = () => {
      if (!scrubRunning) {
        scrubRunning = true;
        raf = requestAnimationFrame(scrubFrame);
      }
    };

    // ---- observers -----------------------------------------------------------
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onContentRevealed(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    targets.forEach((t) => observer.observe(t));

    // Kick the scrub loop on scroll/resize (it self-stops when rules finish).
    const onScroll = () => startScrub();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    startScrub(); // handle rules already near the viewport on mount

    return () => {
      observer.disconnect();
      scrubRunning = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [rootRef]);
}
