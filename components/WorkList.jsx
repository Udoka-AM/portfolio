import { PROJECTS } from "@/content/projects";
import s from "./WorkList.module.css";

export default function WorkList() {
  return (
    <section className="section" id="work">
      <h2 className="sectionHead">Selected work</h2>
      {PROJECTS.map((p) => (
        <article className={s.entry} key={p.name}>
          <div>
            <h3 className={s.name}>{p.name}</h3>
            <p className={s.kind}>{p.kind}</p>
          </div>
          <div>
            <p className={s.line}>{p.line}</p>
            {/* The flagged rule marks the failure, not the feature. */}
            <p className={s.hard}>{p.hard}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
