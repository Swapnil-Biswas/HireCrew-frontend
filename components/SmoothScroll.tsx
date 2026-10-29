"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";
import { absoluteTop, navOffset, scrollToElement, scrollToTop, setSmoother } from "@/lib/smooth";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother);

// A "page" is any element marked data-page. Scroll positions, in px:
//   start  scroll position that puts the page's top just under the nav
//   end    scroll position that puts the page's bottom at the viewport bottom
// end === start when the page fits on screen; end > start when it is taller, and the
// range in between is where you scroll freely instead of snapping.
type Page = { start: number; end: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function measurePages(): Page[] {
  const max = ScrollTrigger.maxScroll(window);
  const offset = navOffset();
  const vh = window.innerHeight;
  return Array.from(document.querySelectorAll<HTMLElement>("[data-page]")).map((el) => {
    const top = absoluteTop(el);
    const start = clamp(top - offset, 0, max);
    const end = clamp(top + el.offsetHeight - vh + 20, start, max);
    return { start, end };
  });
}

// Where scrolling should settle, or null to leave it alone.
//  - inside a page taller than the screen: free reading, no snap
//  - otherwise: the next page edge in the direction of travel (nearest if direction is unknown)
function snapTarget(pos: number, max: number, pages: Page[], direction: number): number | null {
  if (!pages.length || !max) return null;
  if (pages.some((p) => pos > p.start + 2 && pos < p.end - 2)) return null;

  const stops = [0, ...pages.flatMap((p) => (p.end > p.start ? [p.start, p.end] : [p.start])), max]
    .sort((a, b) => a - b)
    .filter((s, i, all) => i === 0 || s - all[i - 1] > 1);

  if (direction > 0) return stops.find((s) => s >= pos - 2) ?? max;
  if (direction < 0) return [...stops].reverse().find((s) => s <= pos + 2) ?? 0;
  return stops.reduce((best, s) => (Math.abs(s - pos) < Math.abs(best - pos) ? s : best), stops[0]);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.1,
        effects: true, // enables data-speed / data-lag parallax
        smoothTouch: false, // touch keeps native momentum scrolling
      });
      setSmoother(smoother);

      let pages = measurePages();
      const remeasure = () => {
        pages = measurePages();
      };
      ScrollTrigger.addEventListener("refresh", remeasure);

      // Page snapping: when scrolling settles, glide to the next page edge in the direction of
      // travel. ScrollTrigger's built-in snap tween doesn't cooperate with ScrollSmoother (it jumps
      // to 0), so the decision is made on "scrollEnd" and the glide is done by the smoother itself.
      let direction = 0;
      const tracker = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (self.direction) direction = self.direction;
        },
      });
      const onScrollEnd = () => {
        // window.scrollY is where the input sent the page; smoother.scrollTop() is the content's
        // current, still-gliding position and lags behind it when "scrollEnd" fires.
        const pos = window.scrollY;
        const target = snapTarget(pos, ScrollTrigger.maxScroll(window), pages, direction);
        if (target !== null && Math.abs(target - pos) > 2) smoother.scrollTo(target, true);
      };
      ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);

      // Content height changes (FAQ open/close, fonts, images, route swaps) need a re-measure.
      const content = document.getElementById("smooth-content");
      let timer = 0;
      const resizeObserver = new ResizeObserver(() => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
      });
      if (content) resizeObserver.observe(content);
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      document.fonts?.ready.then(refresh);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("load", refresh);
        resizeObserver.disconnect();
        ScrollTrigger.removeEventListener("refresh", remeasure);
        ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
        tracker.kill();
        setSmoother(null);
        smoother.kill();
      };
    });

    // Same-page hash links (nav, page dots, skip link) glide instead of jumping. Handled in the
    // capture phase so Next's own Link handler never sees them and doesn't also scroll.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      window.history.pushState(null, "", url.hash);
      scrollToElement(target);
      window.dispatchEvent(new CustomEvent("hc:anchor", { detail: { hash: url.hash } }));
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      mm.revert();
    };
  }, []);

  // After a client-side route change, start at the top (or at the hash) and re-measure.
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    const hash = window.location.hash;
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) scrollToElement(target, false);
    else scrollToTop();
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
