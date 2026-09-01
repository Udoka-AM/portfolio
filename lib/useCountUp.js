"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 700;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Counts from 0 to `target` once `active` is true.
 *
 * The animation is decoration; the figure is content. So anything that would
 * stop the count — reduced motion, or a backgrounded tab where rAF is paused
 * outright — lands on the real number instead of leaving a 0.00 on screen.
 */
export function useCountUp(target, active, delay = 0) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!active) return;

    // Nobody is watching a hidden tab, and rAF will not fire in one. A page
    // opened in a background tab (or captured by a screenshotter) must still
    // show the real figures.
    if (prefersReducedMotion() || document.visibilityState === "hidden") {
      setN(target);
      return;
    }

    let raf;
    const start = performance.now() + delay;

    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / DURATION));
      // easeOutCubic: fast arrival, slow settle. Reads as a figure landing.
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    // Backgrounded mid-count: rAF stops where it is. Land on the real number
    // so returning to the tab never shows a half-counted total.
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        cancelAnimationFrame(raf);
        setN(target);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [target, active, delay]);

  return n;
}

/**
 * True once the referenced element has scrolled into view. Fires once and
 * disconnects — the ledger should tally on arrival, not re-tally on every
 * scroll past it.
 */
export function useInView(options = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer, or a tab that was never in the foreground: show the figures
    // rather than gate real content behind an event that may not arrive.
    if (typeof IntersectionObserver === "undefined" || document.visibilityState === "hidden") {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setSeen(true);
        io.disconnect();
      }
    }, options);

    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, seen];
}

export const fmt = (n) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
