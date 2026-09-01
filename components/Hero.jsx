import { SITE } from "@/content/site";
import s from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={s.hero}>
      <h1 className={s.title}>{SITE.name}</h1>
      <p className={s.lead}>{SITE.intro}</p>
      <p className={s.sub}>{SITE.focus}</p>
    </section>
  );
}
