import { LINKS, SITE } from "@/content/site";
import s from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={s.foot}>
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

      {/* The full legal name, stated once. Rare enough to be a unique search
          term, and body text is indexed where structured data alone is not. */}
      <p className={s.legal}>{SITE.legalName}</p>
    </footer>
  );
}
