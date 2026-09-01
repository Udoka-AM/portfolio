"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "theme";

/**
 * Theme state with three values: "light", "dark", or null for "follow the OS".
 *
 * The stored choice is read in an inline script in the document head (see
 * app/layout.js) so the attribute is on <html> before first paint. This hook
 * only keeps React in sync with what that script already decided.
 */
export function useTheme() {
  const [theme, setTheme] = useState(null);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    // Storage can throw in a private window or with site data blocked.
    let stored = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {}
    if (stored === "light" || stored === "dark") setTheme(stored);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);

    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = theme ? theme === "dark" : systemDark;

  const toggle = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  }, [isDark]);

  return { isDark, toggle };
}

/**
 * Runs before paint, inlined in <head>. Sets data-theme from the stored
 * choice so the page never flashes the wrong palette on load. Kept to one
 * statement and wrapped, because anything that throws here blocks render.
 */
export const NO_FLASH_SCRIPT = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;
