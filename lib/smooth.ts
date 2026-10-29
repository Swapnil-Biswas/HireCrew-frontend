import type { ScrollSmoother } from "gsap/ScrollSmoother";

// Shared handle on the page's ScrollSmoother so the nav, the page dots and the
// anchor handler all scroll the same way. Null when smoothing is off
// (reduced motion), in which case everything falls back to native scrolling.
let smoother: ScrollSmoother | null = null;

export const setSmoother = (next: ScrollSmoother | null) => {
  smoother = next;
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Fixed nav height (set by Nav as --nav-h) plus a little breathing room.
export const navOffset = () => {
  const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
  return (Number.isFinite(h) ? h : 84) + 20;
};

// Layout position of an element inside the scroll content. offsetTop ignores the smoother's
// transform, unlike getBoundingClientRect: window.scrollY jumps straight to a scroll target while
// the content glides there, so on-screen rects lag behind it. Compare against scrollY instead.
export function absoluteTop(el: HTMLElement) {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export function scrollToElement(el: HTMLElement, animate = true) {
  if (smoother) {
    smoother.scrollTo(el, animate, `top ${navOffset()}px`);
  } else {
    el.scrollIntoView({ behavior: animate && !reducedMotion() ? "smooth" : "auto", block: "start" });
  }
}

export function scrollToTop() {
  if (smoother) smoother.scrollTop(0);
  else window.scrollTo(0, 0);
}
