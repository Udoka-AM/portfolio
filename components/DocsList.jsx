import { DOCS } from "@/content/docs";
import s from "./DocsList.module.css";

export default function DocsList() {
  return (
    <section className="section" id="docs">
      <h2 className="sectionHead">Documentation</h2>

      {DOCS.map((d) => (
        <a
          key={d.name}
          className={s.entry}
          href={d.href}
          target="_blank"
          rel="noopener"
        >
          <div className={s.head}>
            <h3 className={s.name}>{d.name}</h3>
            <span className={s.where}>{d.where}</span>
          </div>
          <p className={s.line}>{d.line}</p>
        </a>
      ))}
    </section>
  );
}
