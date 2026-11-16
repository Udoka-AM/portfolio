"use client";

import { useEffect, useRef, useState } from "react";
import s from "./ImageZoom.module.css";

/**
 * Figures are exported at 3200–4000px but shown at reading width. Clicking one
 * opens it at full size in a native <dialog> (Esc, backdrop click, or a second
 * click closes it), so dense diagram labels stay legible without making the
 * reading column any wider.
 */
export default function ImageZoom({ scope }) {
  const dialog = useRef(null);
  const [img, setImg] = useState(null);

  useEffect(() => {
    const root = document.querySelector(scope);
    if (!root) return;

    const figures = root.querySelectorAll("figure img");
    figures.forEach((el) => {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `${el.alt || "Figure"} — open full size`);
    });

    const open = (el) => {
      setImg({ src: el.currentSrc || el.src, alt: el.alt });
      dialog.current?.showModal();
    };
    const onClick = (e) => {
      const el = e.target.closest?.("figure img");
      if (el && root.contains(el)) open(el);
    };
    const onKey = (e) => {
      if ((e.key === "Enter" || e.key === " ") && e.target.matches?.("figure img")) {
        e.preventDefault();
        open(e.target);
      }
    };
    root.addEventListener("click", onClick);
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("keydown", onKey);
    };
  }, [scope]);

  const close = () => dialog.current?.close();

  return (
    <dialog ref={dialog} className={s.dialog} onClick={close} onClose={() => setImg(null)} aria-label="Full-size figure">
      {img && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.src} alt={img.alt} className={s.img} />
          {img.alt && <p className={s.caption}>{img.alt}</p>}
        </>
      )}
      <button type="button" className={s.close} onClick={close} aria-label="Close">
        ×
      </button>
    </dialog>
  );
}
