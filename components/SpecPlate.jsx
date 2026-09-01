import { FACTS } from "@/content/facts";
import s from "./SpecPlate.module.css";

export default function SpecPlate() {
  return (
    <section className={s.plate} aria-label="Position">
      {FACTS.map((f) => (
        <div key={f.key} className={`${s.cell} ${f.wide ? s.wide : ""}`}>
          <span className={s.k}>{f.key}</span>
          <span className={`${s.v} ${f.words ? s.words : ""}`}>{f.value}</span>
          <span className={s.q}>{f.note}</span>
        </div>
      ))}
    </section>
  );
}
