import { DOCS } from "@/content/docs";
import s from "./DocsList.module.css";

export default function DocsList() {
  return (
    <section className="section" id="docs">
      <h2 className="sectionHead">Documentation</h2>
      {DOCS.map((d) => (
        <article className={s.entry} key={d.name}>
          <h3 className={s.name}>{d.name}</h3>
          <p className={s.line}>{d.line}</p>
        </article>
      ))}
    </section>
  );
}
