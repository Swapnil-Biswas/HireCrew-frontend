"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { absoluteTop, navOffset, scrollToElement } from "@/lib/smooth";

type PageInfo = { id: string; label: string };

// Dots for every [data-page] section on the current route; click one to glide there.
export default function PageIndicator() {
  const pathname = usePathname();
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-page]"));
    setPages(els.map((el) => ({ id: el.id, label: el.dataset.page ?? el.id })));
    setActive(0);
    if (els.length < 2) return;

    const update = () => {
      const line = navOffset() + window.innerHeight * 0.3;
      let index = 0;
      els.forEach((el, i) => {
        if (absoluteTop(el) - window.scrollY <= line) index = i;
      });
      setActive(index);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  if (pages.length < 2) return null;

  return (
    <nav className="page-dots glass glass--dark" aria-label="Page navigation">
      {pages.map((page, i) => (
        <button
          key={page.id}
          type="button"
          className="page-dots__item"
          aria-label={`Go to ${page.label}`}
          aria-current={i === active ? "true" : undefined}
          onClick={() => {
            const el = document.getElementById(page.id);
            if (el) scrollToElement(el);
          }}
        >
          <span className="page-dots__dot" />
          <span className="page-dots__label glass glass--dark">{page.label}</span>
        </button>
      ))}
    </nav>
  );
}
