import { PROJECTS } from "@/content/projects";
import s from "./WorkList.module.css";

export default function WorkList() {
  return (
    <section className="section" id="work">
      <h2 className="sectionHead">Featured projects</h2>

      <div className={s.grid}>
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
              <div className={s.eyebrow}>
                <span className={s.kind}>[{p.kind}]</span>
                {p.featured ? <span className={s.badge}>Featured</span> : null}
              </div>

              <h3 className={s.name}>{p.name}</h3>
              <p className={s.line}>{p.line}</p>
              {/* The flagged rule marks the failure, not the feature. */}
              <p className={s.hard}>{p.hard}</p>

              <ul className={s.tags}>
                {p.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Tag>
          );
        })}
      </div>
    </section>
  );
}
