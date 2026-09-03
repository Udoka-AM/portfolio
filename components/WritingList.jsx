import Link from "next/link";
import { getPostSummaries } from "@/lib/posts";
import s from "./WritingList.module.css";

export default function WritingList() {
  const posts = getPostSummaries();

  return (
    <section className="section" id="writing">
      <h2 className="sectionHead">Recent writing</h2>

      <div className={s.grid}>
        {posts.map((w) => {
          const body = (
            <>
              <span className={s.topic}>[{w.topic}]</span>
              <h3 className={s.title}>{w.title}</h3>
              <p className={s.blurb}>{w.blurb}</p>
              <div className={s.foot}>
                <span className={s.words}>{w.readingMinutes} min read</span>
                <span className={s.action}>{w.draft ? "Draft" : "Read"}</span>
              </div>
            </>
          );

          // A draft still gets a tile, but nothing to click — the page exists
          // for previewing and is marked noindex until it has a date.
          return w.draft ? (
            <article className={s.tile} key={w.slug}>
              {body}
            </article>
          ) : (
            <Link className={`tile-interactive ${s.tile}`} href={`/writing/${w.slug}/`} key={w.slug}>
              {body}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
