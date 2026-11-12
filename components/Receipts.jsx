import { RECEIPTS } from "@/content/receipts";
import s from "./Receipts.module.css";

export default function Receipts() {
  return (
    <section className="section" id="receipts">
      <h2 className="sectionHead">Receipts</h2>
      <p className={s.intro}>Every figure links to the transaction or the evidence it came from.</p>

      <div className={s.plate}>
        {RECEIPTS.map((r) => (
          <a key={r.who} className={s.cell} href={r.href} target="_blank" rel="noopener noreferrer">
            <span className={s.v}>{r.value}</span>
            <span className={s.what}>{r.what}</span>
            <span className={s.meta}>
              {r.who} · {r.net} <span aria-hidden="true">↗</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
