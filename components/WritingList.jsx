import { WRITING } from "@/content/writing";
import s from "./WritingList.module.css";

export default function WritingList() {
  return (
    <section className="section" id="writing">
      <h2 className="sectionHead">Recent writing</h2>

      <div className={s.grid}>
        {WRITING.map((w) => {
          const Tag = w.href ? "a" : "article";
          return (
            <Tag
              key={w.title}
              className={s.tile}
              {...(w.href
                ? { href: w.href, target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <span className={s.topic}>[{w.topic}]</span>
              <h3 className={s.title}>{w.title}</h3>
              <p className={s.blurb}>{w.blurb}</p>
              <div className={s.foot}>
                <span className={s.words}>{w.words}</span>
                {/* Unpublished pieces say so rather than offering a dead link. */}
                <span className={s.action}>{w.href ? "Read" : "Draft"}</span>
              </div>
            </Tag>
          );
        })}
      </div>
    </section>
  );
}
