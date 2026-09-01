"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const DURATION = 700;

// useLayoutEffect warns during SSR, where there is no layout to read. Fall back
// to useEffect on the server; on the client we need the pre-paint timing.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * True when the count would not be seen anyway: the reader asked for less
 * motion, or the tab is hidden — where rAF never fires at all, so an animated
 * figure would sit at zero indefinitely.
 */
const skipAnimation = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
  document.visibilityState === "hidden";

/**
 * Counts from 0 to `target` once `active` is true.
 *
 * State is seeded with `target`, not 0, so the real figure is what ships in the
 * prerendered HTML — a crawler, a link preview, or a reader with JS disabled
 * sees the actual trial balance rather than a column of zeros. The client
 * resets to 0 before first paint, so the animation still starts from nothing
 * and nothing flashes.
 *
 * The animation is decoration; the figure is content. Every path that stops the
 * count lands on the real number.
 */
export function useCountUp(target, active, delay = 0) {
  const [n, setN] = useState(target);

  useIsomorphicLayoutEffect(() => {
    // Runs before paint: if we are going to animate, start from zero. If not,
    // the seeded target stays exactly as it was rendered on the server.
    if (skipAnimation()) return;
    setN(0);
  }, []);

  useEffect(() => {
    if (!active) return;

    if (skipAnimation()) {
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
