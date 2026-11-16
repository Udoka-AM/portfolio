"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { SITE } from "@/content/site";
import { useTheme } from "@/lib/theme";
import s from "./ArticleBar.module.css";

/**
 * The slim bar that sits over an article: a way home, the theme toggle, and a
 * reading-progress hairline along its bottom edge. Progress is written straight
 * to a CSS variable from a rAF-throttled scroll handler, so scrolling never
 * re-renders React.
 */
export default function ArticleBar() {
  const { isDark, toggle } = useTheme();
  const bar = useRef(null);

  useEffect(() => {
    const el = bar.current;
    const article = document.querySelector("article");
    if (!el || !article) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      el.style.setProperty("--progress", p.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={s.bar} ref={bar}>
      <div className={s.inner}>
        <Link href="/" className={s.home}>
          <span className={s.mark} aria-hidden="true" />
          {SITE.name}
        </Link>
        <nav className={s.nav}>
          <Link href="/#writing">Writing</Link>
          <Link href="/#projects" className={s.wideOnly}>
            Projects
          </Link>
          <button
            type="button"
            className={s.toggle}
            onClick={toggle}
            aria-pressed={isDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </nav>
      </div>
      <div className={s.progress} aria-hidden="true" />
    </header>
  );
}
