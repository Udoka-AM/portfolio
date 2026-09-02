import { WORKED_WITH } from "@/content/worked-with";
import s from "./WorkedWith.module.css";

function Mark({ item }) {
  return (
    <li className={s.item} title={item.name}>
      {item.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.logo} src={item.logo} alt={item.name} loading="lazy" />
      ) : (
        <span className={s.name}>{item.name}</span>
      )}
    </li>
  );
}

export default function WorkedWith() {
  return (
    <section className="section" id="worked-with">
      <h2 className="sectionHead">Worked with</h2>

      <div className={s.viewport}>
        {/* Rendered twice so the track can translate by exactly its own width
            and land back where it started. The copy is hidden from assistive
            tech and from the reading order. */}
        <ul className={s.track}>
          {WORKED_WITH.map((w) => (
            <Mark key={w.name} item={w} />
          ))}
        </ul>
        <ul className={s.track} aria-hidden="true">
          {WORKED_WITH.map((w) => (
            <Mark key={`${w.name}-echo`} item={w} />
          ))}
        </ul>
      </div>
    </section>
  );
}
