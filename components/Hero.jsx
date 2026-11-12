import Link from "next/link";
import { SITE, LATEST_REPORT } from "@/content/site";
import { FLAGSHIP } from "@/content/flagship";
import s from "./Hero.module.css";

// A project's headline status is its best network: mainnet if any proof line
// ran there, otherwise whatever it has.
const best = (p) =>
  p.proof.some((x) => x.net === "mainnet") ? "mainnet" : p.proof[0].net;

export default function Hero() {
  return (
    <section className={s.hero}>
      <h1 className={s.title}>{SITE.name}</h1>
      <p className={s.line}>
        <span className={s.role}>{SITE.role}.</span> {SITE.tagline}
      </p>
      <p className={s.lead}>{SITE.intro}</p>
      <p className={s.sub}>{SITE.focus}</p>

      <ul className={s.chips} aria-label="Flagship projects">
        {FLAGSHIP.map((p) => (
          <li key={p.id}>
            <a className={s.chip} href={`#${p.id}`}>
              <span className={s.chipName}>{p.name}</span>
              <span className="net" data-net={best(p)}>
                {best(p)}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className={s.ctas}>
        <Link className={s.primary} href={LATEST_REPORT.href}>
          {LATEST_REPORT.label} <span aria-hidden="true">→</span>
        </Link>
        <a className={s.secondary} href="#work-with-me">
          Work with me
        </a>
      </div>
    </section>
  );
}
