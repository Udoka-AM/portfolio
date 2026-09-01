import { DOCS } from "@/content/docs";
import s from "./DocsList.module.css";

export default function DocsList() {
  return (
    <section className="section" id="docs">
      <h2 className="sectionHead">Documentation</h2>

      <div className={s.grid}>
        {DOCS.map((d) => (
          <a
            key={d.name}
            className={`tile-interactive ${s.tile}`}
            href={d.href}
            target="_blank"
            rel="noopener"
          >
            <span className={s.where}>[{d.where}]</span>
            <h3 className={s.name}>{d.name}</h3>
            <p className={s.line}>{d.line}</p>
            <span className={s.action}>Read the docs</span>
          </a>
        ))}
      </div>
    </section>
  );
}
