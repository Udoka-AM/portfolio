"use client";

import { useEffect, useState } from "react";
import { ICONS } from "@/lib/share-icons";
import s from "./ShareBar.module.css";

/**
 * Share links for a post. Every target is a plain intent URL, so it works with
 * no third-party script, no tracking, and with JavaScript off. Two extras need
 * JS: copy-link, and the system share sheet (shown only where the browser has
 * one — on phones that reaches Instagram, Slack, Signal, Discord and the rest).
 */
export default function ShareBar({ url, title, via = "Udoka_AM", variant = "compact" }) {
  const [canNative, setCanNative] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const tu = encodeURIComponent(`${title}\n\n${url}`);

  const targets = [
    { id: "x", label: "X", href: `https://x.com/intent/tweet?text=${t}&url=${u}&via=${via}` },
    { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${tu}` },
    { id: "telegram", label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { id: "reddit", label: "Reddit", href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
    { id: "hackernews", label: "Hacker News", href: `https://news.ycombinator.com/submitlink?u=${u}&t=${t}` },
    { id: "bluesky", label: "Bluesky", href: `https://bsky.app/intent/compose?text=${tu}` },
    { id: "threads", label: "Threads", href: `https://www.threads.net/intent/post?text=${tu}` },
    { id: "email", label: "Email", href: `mailto:?subject=${t}&body=${tu}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older Safari / insecure context: fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {}
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // Dismissing the sheet rejects; nothing to do.
    }
  }

  const full = variant === "full";

  return (
    <div className={`${s.share} ${full ? s.full : s.compact}`}>
      {!full && <span className={s.label}>Share</span>}
      <ul className={s.list}>
        {targets.map((x) => (
          <li key={x.id}>
            <a
              className={s.btn}
              href={x.href}
              target={x.id === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              aria-label={full ? undefined : `Share on ${x.label}`}
              title={full ? undefined : x.label}
            >
              <Icon d={ICONS[x.id]} />
              {full && <span>{x.label}</span>}
            </a>
          </li>
        ))}
        <li>
          <button type="button" className={s.btn} onClick={copy} aria-label={full ? undefined : "Copy link"} title={full ? undefined : "Copy link"}>
            <Icon d={copied ? ICONS.check : ICONS.link} />
            {full && <span>{copied ? "Copied" : "Copy link"}</span>}
          </button>
        </li>
        {canNative && (
          <li>
            <button type="button" className={`${s.btn} ${s.native}`} onClick={nativeShare} aria-label={full ? undefined : "More sharing options"} title={full ? undefined : "More…"}>
              <Icon d={ICONS.share} />
              {full && <span>More…</span>}
            </button>
          </li>
        )}
      </ul>
      <span className={s.status} role="status" aria-live="polite">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d={d} fill="currentColor" />
    </svg>
  );
}
