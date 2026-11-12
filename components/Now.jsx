import { NOW, PATH } from "@/content/now";
import s from "./Now.module.css";

export default function Now() {
  return (
    <section className="section" id="now">
      <div className={s.cols}>
        <div>
          <h2 className="sectionHead">Now · {NOW.month}</h2>
          <ul className={s.now}>
            {NOW.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="sectionHead">The path here</h2>
          <ol className={s.path}>
            {PATH.map((p) => (
              <li key={p.when + p.what}>
                <span className={s.when}>{p.when}</span>
                <div>
                  <p className={s.what}>{p.what}</p>
                  <p className={s.note}>{p.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
