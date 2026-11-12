import { ROUTES } from "@/content/work-with-me";
import s from "./WorkWithMe.module.css";

export default function WorkWithMe() {
  return (
    <section className="section" id="work-with-me">
      <h2 className="sectionHead">Work with me</h2>

      <div className={s.grid}>
        {ROUTES.map((r) => (
          <div key={r.who} className={s.route}>
            <h3 className={s.who}>{r.who}</h3>
            <p className={s.line}>{r.line}</p>
            <ul className={s.links}>
              {r.links.map((l) => {
                const external = l.href.startsWith("http");
                return (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {l.label} <span aria-hidden="true">{external ? "↗" : "→"}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
