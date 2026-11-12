import Link from "next/link";
import { getPostSummaries } from "@/lib/posts";
import s from "./WritingList.module.css";

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export default function WritingList() {
  // Scaffolds still build a preview page, but the homepage lists only
  // published pieces: an undated "Draft" tile reads as an abandoned blog.
  const posts = getPostSummaries().filter((p) => !p.draft);

  return (
    <section className="section" id="writing">
      <h2 className="sectionHead">Build reports and writing</h2>

      <div className={s.grid}>
        {posts.map((w) => {
          const body = (
            <>
              <span className={s.topic}>[{w.topic}]</span>
              <h3 className={s.title}>{w.title}</h3>
              <p className={s.blurb}>{w.blurb}</p>
              <div className={s.foot}>
                <span className={s.words}>
                  {w.date ? `${formatDate(w.date)} · ` : ""}
                  {w.readingMinutes} min read
                </span>
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
