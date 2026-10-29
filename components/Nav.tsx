"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GooeyNav, { type GooeyNavItem } from "./GooeyNav";
import { absoluteTop } from "@/lib/smooth";

const items: GooeyNavItem[] = [
  { label: "Demo", href: "/#demo" },
  { label: "Benchmark", href: "/#verified" },
  { label: "How it works", href: "/#how" },
  { label: "Coordinator", href: "/#coordinator" },
  { label: "FAQ", href: "/#faq" },
  { label: "Join", href: "/join" },
];

const JOIN_INDEX = items.length - 1;
// Section ids behind the first five items, in the same order, for the scroll highlight.
const sectionIds = ["demo", "verified", "how", "coordinator", "faq"];

// The default dark theme is purple-tinted, so the frame is re-tinted here as a translucent cream
// glass tray on the emerald bar (the glass blur and refraction live in globals.css).
const frameTheme = {
  "--gn-frame": "rgba(255, 248, 236, 0.05)",
  "--gn-frame-edge": "rgba(255, 248, 236, 0.22)",
  "--gn-frame-highlight": "rgba(255, 248, 236, 0.55)",
  "--gn-frame-shadow": "inset 0 0 20px rgba(255,248,236,.1), 0 12px 26px -12px rgba(1,38,20,.9)",
  "--gn-ink": "#F9EBD7",
  "--gn-muted": "#F9EBD7",
} as CSSProperties;

export default function Nav() {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname === "/join" ? JOIN_INDEX : 0);
  // After a click the page scrolls smoothly past other sections; hold the pill on the
  // clicked item until that finishes instead of letting it hop through them.
  const lockUntil = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Thin progress line under the bar. It follows scrollY, which jumps straight to the target while
  // the smoother glides, so the line eases toward it instead of snapping.
  useEffect(() => {
    const bar = progressRef.current;
    if (!bar) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      gsap.to(bar, { scaleX: progress, duration: reduced ? 0 : 0.5, ease: "power2.out", overwrite: true });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      gsap.killTweensOf(bar);
    };
  }, [pathname]);

  // The bar is fixed, so the page needs to know how tall it is to leave room under it.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () => document.documentElement.style.setProperty("--nav-h", `${el.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Hash links are handled by SmoothScroll, which bypasses GooeyNav's own click; mirror the pill here.
  useEffect(() => {
    const onAnchor = (event: Event) => {
      const { hash } = (event as CustomEvent<{ hash: string }>).detail;
      const index = items.findIndex((item) => item.href?.endsWith(hash));
      if (index < 0) return;
      lockUntil.current = performance.now() + 1500;
      setActive(index);
    };
    window.addEventListener("hc:anchor", onAnchor);
    return () => window.removeEventListener("hc:anchor", onAnchor);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActive(pathname === "/join" ? JOIN_INDEX : 0);
      return;
    }

    const update = () => {
      if (performance.now() < lockUntil.current) return;
      const line = window.innerHeight * 0.4;
      let index = 0;
      sectionIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && absoluteTop(el) - window.scrollY <= line) index = i;
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

  return (
    <header className="nav" ref={headerRef}>
      <div className="nav__progress" ref={progressRef} aria-hidden="true" />
      <div className="wrap nav__inner">
        <Link className="brand" href="/" aria-label="HireCrew home">
          <Image src="/brand/hirecrew-logo.png" alt="" width={84} height={84} priority />
        </Link>
        <GooeyNav
          className="nav__gooey"
          items={items}
          activeIndex={active}
          onChange={(index) => {
            lockUntil.current = performance.now() + 1100;
            setActive(index);
          }}
          theme="dark"
          color="#F9EBD7"
          activeTextColor="#046A38"
          hoverColor="rgba(249, 235, 215, 0.14)"
          size="md"
          frame
          particleCount={15}
          spread={56}
          animationTime={600}
          timeVariance={300}
          gooeyness={0.5}
          wobble={0.5}
          hoverEffect
          style={frameTheme}
        />
      </div>
    </header>
  );
}
