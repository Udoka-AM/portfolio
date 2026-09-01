import { LINKS } from "@/content/site";
import s from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={s.foot} id="cv">
      {LINKS.map((l) => (
        <a
          key={l.href}
          href={l.href}
          {...(l.href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {l.label}
        </a>
      ))}
    </footer>
  );
}
