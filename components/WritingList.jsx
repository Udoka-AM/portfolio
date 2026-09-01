import { WRITING } from "@/content/writing";
import s from "./WritingList.module.css";

export default function WritingList() {
  return (
    <section className="section" id="writing">
      <h2 className="sectionHead">Writing</h2>
      {WRITING.map((w) => {
        const body = (
          <>
            <span className={s.title}>{w.title}</span>
            <span className={s.meta}>{w.meta}</span>
          </>
        );

        // Unpublished pieces stay plain text rather than shipping a dead link.
        return w.href ? (
          <a className={s.entry} key={w.title} href={w.href}>
            {body}
          </a>
        ) : (
          <div className={s.entry} key={w.title}>
            {body}
          </div>
        );
      })}
    </section>
  );
}
