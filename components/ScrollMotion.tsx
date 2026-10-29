"use client";

import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Scroll-triggered animation, driven by data attributes in the markup:
//   data-reveal           fade and rise the element when it nears the viewport
//   data-stagger          the same for each direct child, one after another
//                         (data-stagger-each="0.03" sets the gap between children, in seconds)
//   data-split            headline: reveal word by word from behind a mask
//   data-countup="N"      count the text up to N (data-from, data-decimals, data-prefix, data-suffix)
//   data-meter            grow a bar from zero to its laid-out width
//   data-sequence         light the children one at a time, in a loop, while on screen
//   data-magnetic         button leans toward the pointer
// Starting states live in globals.css under `.js`; this file only animates to the end state.
// Reduced motion keeps everything in its final state and runs none of this.

// Wrap each word in a clipping mask so it can slide up out of it. The element keeps its text
// for assistive tech via aria-label; the split spans are hidden from it.
function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.splitDone) return Array.from(el.querySelectorAll<HTMLElement>(".word__inner"));
  const text = (el.textContent ?? "").trim();
  el.setAttribute("aria-label", text);
  el.textContent = "";
  const words = text.split(/\s+/).map((word, i, all) => {
    const outer = document.createElement("span");
    outer.className = "word";
    outer.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.className = "word__inner";
    inner.textContent = word;
    outer.appendChild(inner);
    el.appendChild(outer);
    if (i < all.length - 1) el.appendChild(document.createTextNode(" "));
    return inner;
  });
  el.dataset.splitDone = "1";
  el.classList.add("is-split");
  return words;
}

export default function ScrollMotion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cleanups: Array<() => void> = [];

        try {
          const finish = (els: Element[], props: string) => () => {
            els.forEach((el) => el.classList.add("is-revealed"));
            gsap.set(els, { clearProps: props });
          };

          gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
            const words = splitWords(el);
            // Clear first: if a previous run was reverted (dev strict mode runs effects twice),
            // GSAP can keep a stale pixel offset and add it to the percent one.
            gsap.set(words, { clearProps: "transform" });
            gsap.set(words, { yPercent: 115 });
            gsap.to(words, {
              yPercent: 0,
              duration: 0.95,
              ease: "power4.out",
              stagger: 0.07,
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
              onComplete: () => {
                gsap.set(words, { clearProps: "transform" });
              },
            });
          });

          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
            gsap.to(el, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
              onComplete: finish([el], "opacity,transform"),
            });
          });

          gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((parent) => {
            const kids = Array.from(parent.children);
            gsap.to(kids, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power3.out",
              stagger: Number(parent.dataset.staggerEach ?? 0.09),
              scrollTrigger: { trigger: parent, start: "top 90%", once: true },
              onComplete: finish(kids, "opacity,transform"),
            });
          });

          gsap.utils.toArray<HTMLElement>("[data-countup]").forEach((el) => {
            const end = Number(el.dataset.countup);
            if (!Number.isFinite(end)) return;
            const from = Number(el.dataset.from ?? 0);
            const decimals = Number(el.dataset.decimals ?? 0);
            const format = (value: number) =>
              `${el.dataset.prefix ?? ""}${value.toFixed(decimals)}${el.dataset.suffix ?? ""}`;
            const counter = { value: from };
            el.textContent = format(from);
            gsap.to(counter, {
              value: end,
              duration: 1.6,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
              onUpdate: () => {
                el.textContent = format(counter.value);
              },
              onComplete: () => {
                el.textContent = format(end);
              },
            });
            cleanups.push(() => {
              el.textContent = format(end);
            });
          });

          gsap.utils.toArray<HTMLElement>("[data-meter]").forEach((el) => {
            gsap.from(el, {
              width: 0,
              duration: 1.3,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
              onComplete: () => {
                gsap.set(el, { clearProps: "width" });
              },
            });
          });

          // Light each child in turn, looping, only while the group is on screen.
          gsap.utils.toArray<HTMLElement>("[data-sequence]").forEach((parent) => {
            const kids = Array.from(parent.children);
            const beat = 1.15;
            const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true });
            kids.forEach((kid, i) => {
              tl.call(() => kid.classList.add("is-lit"), [], i * beat);
              tl.call(() => kid.classList.remove("is-lit"), [], i * beat + beat * 0.9);
            });
            tl.to({}, { duration: 0.01 }, kids.length * beat);
            const trigger = ScrollTrigger.create({
              trigger: parent,
              start: "top 85%",
              end: "bottom 15%",
              onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
            });
            cleanups.push(() => {
              trigger.kill();
              tl.kill();
              kids.forEach((kid) => kid.classList.remove("is-lit"));
            });
          });

          // Buttons lean toward the pointer. Fine pointers only; touch has no hover to follow.
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
              const move = (event: PointerEvent) => {
                const rect = el.getBoundingClientRect();
                gsap.to(el, {
                  "--mx": `${(event.clientX - (rect.left + rect.width / 2)) * 0.25}px`,
                  "--my": `${(event.clientY - (rect.top + rect.height / 2)) * 0.35}px`,
                  duration: 0.4,
                  ease: "power3.out",
                  overwrite: "auto",
                });
              };
              const leave = () =>
                gsap.to(el, { "--mx": "0px", "--my": "0px", duration: 0.7, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
              el.addEventListener("pointermove", move);
              el.addEventListener("pointerleave", leave);
              cleanups.push(() => {
                el.removeEventListener("pointermove", move);
                el.removeEventListener("pointerleave", leave);
                gsap.set(el, { clearProps: "--mx,--my" });
              });
            });
          }
        } catch {
          // If animation setup ever fails, show the page rather than leave it hidden.
          document.documentElement.classList.remove("js");
        }

        return () => cleanups.forEach((fn) => fn());
      });

      return () => mm.revert();
    },
    { dependencies: [pathname] },
  );

  return null;
}
