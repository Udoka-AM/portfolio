"use client";

import { NAV, SITE } from "@/content/site";
import { useTheme } from "@/lib/theme";
import s from "./TopBar.module.css";

export default function TopBar() {
  const { isDark, toggle } = useTheme();

  return (
    <header className={s.bar}>
      <span className={s.mark}>{SITE.name}</span>
      <nav className={s.nav}>
        {NAV.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
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
    </header>
  );
}
