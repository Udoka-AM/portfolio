"use client";

import { useId, useState } from "react";
import { PROJECTS } from "@/content/projects";
import s from "./WorkList.module.css";

export default function WorkList() {
  const [expanded, setExpanded] = useState(false);
  const gridId = useId();

  return (
    <section className="section" id="projects">
      <h2 className="sectionHead">Featured projects</h2>

      {/* Every tile is rendered. The cut is made in CSS, because how many
          tiles fill two rows depends on the breakpoint — three columns, then
          two, then one — and only the stylesheet knows which is in force. */}
      <div id={gridId} className={`${s.grid} ${expanded ? s.expanded : ""}`}>
        {PROJECTS.map((p) => {
          const Tag = p.href ? "a" : "article";
          return (
            <Tag
              key={p.name}
              className={`tile-interactive ${s.tile} ${p.featured ? s.featured : ""}`}
              {...(p.href
                ? { href: p.href, target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {/* The face. The name is the artwork — there is no photograph of
                  a security audit, so the type carries the card instead. */}
              <div className={s.face}>
                <div className={s.eyebrow}>
                  <span className={s.kind}>[{p.kind}]</span>
                  {p.featured ? <span className={s.badge}>Featured</span> : null}
                </div>

                <h3 className={s.name}>{p.name}</h3>
                <p className={s.summary}>{p.summary}</p>

                <ul className={s.tags}>
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* The full text, raised from the bottom edge on hover. On touch,
                  where there is no hover, the stylesheet lets this sit open
                  rather than hiding the part worth reading behind a gesture
                  that does not exist. */}
              <div className={s.reveal} aria-hidden="false">
                <p className={s.line}>{p.line}</p>
                {/* The flagged rule marks the failure, not the feature. */}
                <p className={s.hard}>{p.hard}</p>
              </div>
            </Tag>
          );
        })}
      </div>

      <div className={s.moreRow}>
        <button
          type="button"
          className={s.more}
          aria-expanded={expanded}
          aria-controls={gridId}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show fewer" : `See all ${PROJECTS.length} projects`}
          <span className={s.chev} aria-hidden="true">
            ↓
          </span>
        </button>
      </div>
    </section>
  );
}
