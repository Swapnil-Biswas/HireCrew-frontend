"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// "The model proposes. Code decides." as a loop: a permitted tool call (sheet-write) passes the
// gateway to the apps; a forbidden one (delete) is stopped at the gateway. Plays only while on
// screen. With reduced motion it stays a still diagram with both outcomes labelled.
export default function GatewayFlow() {
  const root = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5, paused: true });

        tl.set(q(".gw-packet"), { opacity: 0, scale: 1, attr: { cx: 120 } })
          .set(q(".gw-tag"), { opacity: 0 })
          .set(q(".gw-x"), { opacity: 0, scale: 0.4 })
          // permitted call: passes through the gateway to the apps
          .to(q(".gw-tag--ok"), { opacity: 1, duration: 0.3 })
          .to(q(".gw-packet--ok"), { opacity: 1, duration: 0.2 }, "<")
          .to(q(".gw-packet--ok"), { attr: { cx: 184 }, duration: 0.7, ease: "power2.in" })
          .to(q(".gw-gate"), { scale: 1.05, duration: 0.18, yoyo: true, repeat: 1 })
          .to(q(".gw-packet--ok"), { attr: { cx: 360 }, duration: 0.8, ease: "power2.out" })
          .to(q(".gw-app"), { scale: 1.07, duration: 0.2, yoyo: true, repeat: 1 }, "<0.65")
          .to([...q(".gw-packet--ok"), ...q(".gw-tag--ok")], { opacity: 0, duration: 0.3 }, "+=0.35")
          // forbidden call: stopped at the gateway
          .to(q(".gw-tag--no"), { opacity: 1, duration: 0.3 }, "+=0.15")
          .to(q(".gw-packet--no"), { opacity: 1, duration: 0.2 }, "<")
          .to(q(".gw-packet--no"), { attr: { cx: 176 }, duration: 0.7, ease: "power2.in" })
          .to(q(".gw-packet--no"), { scale: 2.4, opacity: 0, duration: 0.35, ease: "power2.out" })
          .to(q(".gw-x"), { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.5)" }, "<")
          .to(q(".gw-gate"), { x: -5, duration: 0.05, yoyo: true, repeat: 5 }, "<")
          .to([...q(".gw-x"), ...q(".gw-tag--no")], { opacity: 0, duration: 0.4 }, "+=0.9");

        const trigger = ScrollTrigger.create({
          trigger: root.current,
          start: "top 90%",
          end: "bottom 10%",
          onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
        });

        return () => {
          trigger.kill();
          tl.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <svg ref={root} className="gw-svg" viewBox="0 0 480 215" role="img" aria-labelledby="gw-title gw-desc">
      <title id="gw-title">How the gateway treats tool calls</title>
      <desc id="gw-desc">
        The model proposes a tool call. A permitted call, sheet-write, passes the gateway and reaches the apps. A
        forbidden call, delete, is blocked at the gateway.
      </desc>

      <line className="gw-lane" x1="118" y1="100" x2="184" y2="100" />
      <line className="gw-lane" x1="296" y1="100" x2="362" y2="100" />

      <g className="gw-model">
        <rect className="gw-node gw-node--dark" x="8" y="70" width="110" height="60" rx="22" />
        <text className="gw-text gw-text--light" x="63" y="96" textAnchor="middle">
          Model
        </text>
        <text className="gw-sub gw-text--light" x="63" y="114" textAnchor="middle">
          proposes
        </text>
      </g>

      <g className="gw-gate">
        <rect className="gw-node gw-node--light" x="184" y="55" width="112" height="90" rx="28" />
        <text className="gw-text" x="240" y="94" textAnchor="middle">
          Gateway
        </text>
        <text className="gw-sub" x="240" y="112" textAnchor="middle">
          code decides
        </text>
        <path className="gw-x" d="M229 126 l22 14 M251 126 l-22 14" />
      </g>

      <g className="gw-app">
        <rect className="gw-node gw-node--dark" x="362" y="70" width="110" height="60" rx="22" />
        <text className="gw-text gw-text--light" x="417" y="96" textAnchor="middle">
          Apps
        </text>
        <text className="gw-sub gw-text--light" x="417" y="114" textAnchor="middle">
          real work
        </text>
      </g>

      <circle className="gw-packet gw-packet--ok" cx="120" cy="100" r="9" />
      <circle className="gw-packet gw-packet--no" cx="120" cy="100" r="9" />

      <text className="gw-tag gw-tag--ok" x="240" y="176" textAnchor="middle">
        sheet-write · allowed
      </text>
      <text className="gw-tag gw-tag--no" x="240" y="199" textAnchor="middle">
        delete · blocked
      </text>
    </svg>
  );
}
