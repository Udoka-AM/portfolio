import { FLAGSHIP } from "@/content/flagship";
import s from "./Flagship.module.css";

const ext = { target: "_blank", rel: "noopener noreferrer" };

export default function Flagship() {
  return (
    <section className="section" id="building">
      <h2 className="sectionHead">What I&apos;m building</h2>

      <div className={s.grid}>
        {FLAGSHIP.map((p) => (
          <article key={p.id} id={p.id} className={s.card}>
            <div className={s.eyebrow}>
              <span>[{p.kind}]</span>
              <span>{p.chains}</span>
            </div>

            <h3 className={s.name}>{p.name}</h3>
            <p className={s.problem}>{p.problem}</p>

            <div className={s.block}>
              <span className="label">Chain edge</span>
              <p className={s.edge}>{p.edge}</p>
            </div>

            <div className={s.block}>
              <span className="label">Proof</span>
              <ul className={s.proof}>
                {p.proof.map((x) => (
                  <li key={x.text}>
                    <span className="net" data-net={x.net}>
                      {x.net}
                    </span>
                    <a href={x.href} {...ext}>
                      {x.text}
                    </a>
                  </li>
                ))}
              </ul>
              {/* What is missing, said as plainly as what works. */}
              <p className={s.next}>{p.next}</p>
            </div>

            <div className={s.foot}>
              <ul className={s.links}>
                {p.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} {...ext}>
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
              {p.team ? (
                <p className={s.team}>
                  <span className="label">Team</span> {p.team.join(" · ")}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
