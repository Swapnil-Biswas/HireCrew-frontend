"use client";

// A rotating globe of agent types, joined by arcs that carry small data packets. Drag to spin it,
// hover a node to see what it does, click a node to bring it to the front. Plain canvas 2D, no
// libraries. Monochrome on purpose: it sits on the dark clay hero panel.

import { useEffect, useRef, useState } from "react";

type Agent = { name: string; kind: string; job: string; lat: number; lon: number };

// Illustrative network of agent types, not real listings.
const AGENTS: Agent[] = [
  { name: "Research", kind: "Research agent", job: "Cited market and company reports", lat: 48, lon: 8 },
  { name: "Inbox to Sheet", kind: "Spreadsheet agent", job: "Turns emails into tidy rows", lat: 22, lon: 62 },
  { name: "Lead follow-up", kind: "Sales agent", job: "Drafts and tracks follow-ups", lat: -8, lon: 104 },
  { name: "Launch posts", kind: "Content agent", job: "Writes a pack of launch posts", lat: 34, lon: 140 },
  { name: "Data cleanup", kind: "Data agent", job: "Dedupes and fixes messy tables", lat: -30, lon: 150 },
  { name: "Code review", kind: "Developer agent", job: "Reviews a pull request", lat: 8, lon: -170 },
  { name: "Docs", kind: "Writing agent", job: "Drafts and edits documents", lat: 52, lon: -128 },
  { name: "Support", kind: "Support agent", job: "Answers and triages tickets", lat: 20, lon: -96 },
  { name: "Scheduling", kind: "Calendar agent", job: "Books and reshuffles meetings", lat: -22, lon: -68 },
  { name: "Translation", kind: "Language agent", job: "Translates with a glossary", lat: 38, lon: -40 },
  { name: "Design", kind: "Design agent", job: "Produces simple graphics", lat: -46, lon: -10 },
  { name: "QA testing", kind: "Testing agent", job: "Runs through an app and reports", lat: -4, lon: 22 },
  { name: "Voice notes", kind: "Voice agent", job: "Turns a spoken brief into a task", lat: -34, lon: 52 },
  { name: "Reporting", kind: "Analytics agent", job: "Builds a weekly summary", lat: 64, lon: 80 },
];

const LINKS: [number, number][] = [
  [0, 1], [0, 9], [0, 13], [0, 6], [0, 11], [1, 2], [1, 11], [1, 13], [2, 3], [2, 12], [3, 4], [3, 13],
  [5, 6], [5, 7], [5, 4], [6, 7], [7, 8], [7, 9], [7, 10], [8, 10], [9, 11], [10, 11], [10, 12],
];

const DOT_COUNT = 1000;
const ARC_STEPS = 40;
const AUTO_SPEED = 0.2; // radians per second

type Vec = [number, number, number];

function toVec(lat: number, lon: number): Vec {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

function slerpArc(a: Vec, b: Vec): Vec[] {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const angle = Math.acos(dot);
  const sin = Math.sin(angle) || 1;
  const lift = 0.07 + 0.2 * (angle / Math.PI);
  const points: Vec[] = [];
  for (let i = 0; i <= ARC_STEPS; i++) {
    const t = i / ARC_STEPS;
    const wa = Math.sin((1 - t) * angle) / sin;
    const wb = Math.sin(t * angle) / sin;
    const r = 1 + lift * Math.sin(Math.PI * t);
    points.push([(a[0] * wa + b[0] * wb) * r, (a[1] * wa + b[1] * wb) * r, (a[2] * wa + b[2] * wb) * r]);
  }
  return points;
}

function wrapAngle(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

export default function AgentGlobe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Static geometry, built once.
    const dots: Vec[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < DOT_COUNT; i++) {
      const y = 1 - (i / (DOT_COUNT - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      dots.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    }
    const nodeVecs = AGENTS.map((a) => toVec(a.lat, a.lon));
    const arcs = LINKS.map(([a, b], i) => ({
      a,
      b,
      points: slerpArc(nodeVecs[a], nodeVecs[b]),
      phase: (i * 0.37) % 1,
      speed: 0.16 + ((i * 7) % 5) * 0.035,
    }));
    const degree = AGENTS.map((_, i) => LINKS.filter(([a, b]) => a === i || b === i).length);

    // Live state, kept out of React so the animation never re-renders.
    const s = {
      yaw: -0.4,
      pitch: 0.36,
      vyaw: reduced ? 0 : AUTO_SPEED,
      dragging: false,
      moved: 0,
      lastX: 0,
      lastY: 0,
      lastT: 0,
      hover: -1,
      pinned: -1,
      pinUntil: 0,
      focus: null as null | { yaw: number; pitch: number },
      featured: 0,
      featuredAt: 0,
      size: 0,
      dpr: 1,
      visible: true,
      raf: 0,
      last: performance.now(),
      shown: 0,
    };

    const rot = (v: Vec): Vec => {
      const cy = Math.cos(s.yaw), sy = Math.sin(s.yaw);
      const x1 = v[0] * cy + v[2] * sy;
      const z1 = -v[0] * sy + v[2] * cy;
      const cp = Math.cos(s.pitch), sp = Math.sin(s.pitch);
      return [x1, v[1] * cp - z1 * sp, v[1] * sp + z1 * cp];
    };

    // The sphere body, floor shadow and rim never change, so they are painted once per size.
    const base = document.createElement("canvas");
    const paintBase = () => {
      const bc = base.getContext("2d");
      if (!bc) return;
      const W = base.width;
      const c = W / 2;
      const R = W * 0.385;
      const px = s.dpr;
      bc.clearRect(0, 0, W, W);
      const shadow = bc.createRadialGradient(c, c + R * 1.08, R * 0.1, c, c + R * 1.08, R * 0.95);
      shadow.addColorStop(0, "rgba(0,0,0,0.5)");
      shadow.addColorStop(1, "rgba(0,0,0,0)");
      bc.save();
      bc.scale(1, 0.22);
      bc.fillStyle = shadow;
      bc.beginPath();
      bc.arc(c, (c + R * 1.08) / 0.22, R * 0.95, 0, Math.PI * 2);
      bc.fill();
      bc.restore();
      const body = bc.createRadialGradient(c - R * 0.35, c - R * 0.4, R * 0.1, c, c, R * 1.02);
      body.addColorStop(0, "#3a3a3e");
      body.addColorStop(0.55, "#232326");
      body.addColorStop(1, "#0d0d0f");
      bc.fillStyle = body;
      bc.beginPath();
      bc.arc(c, c, R, 0, Math.PI * 2);
      bc.fill();
      // Rim light on the lit (upper-left) edge: the clay shading.
      const rim = bc.createLinearGradient(c - R, c - R, c + R, c + R);
      rim.addColorStop(0, "rgba(255,255,255,0.55)");
      rim.addColorStop(0.35, "rgba(255,255,255,0.06)");
      rim.addColorStop(0.7, "rgba(255,255,255,0.04)");
      rim.addColorStop(1, "rgba(255,255,255,0.28)");
      bc.strokeStyle = rim;
      bc.lineWidth = 2.2 * px;
      bc.beginPath();
      bc.arc(c, c, R - px, 0, Math.PI * 2);
      bc.stroke();
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      s.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      s.size = rect.width;
      canvas.width = Math.round(rect.width * s.dpr);
      canvas.height = Math.round(rect.width * s.dpr);
      base.width = canvas.width;
      base.height = canvas.height;
      paintBase();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const screenPos = (v: Vec) => {
      const R = s.size * s.dpr * 0.385;
      const c = s.size * s.dpr * 0.5;
      return { x: c + v[0] * R, y: c - v[1] * R, z: v[2] };
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - s.last) / 1000);
      s.last = now;
      const t = now / 1000;
      const px = s.dpr;
      const W = canvas.width;
      const c = W / 2;
      const R = W * 0.385;

      // Motion: inertia back to the idle spin, or an eased turn toward a clicked node.
      if (!s.dragging) {
        if (s.focus) {
          s.yaw += wrapAngle(s.focus.yaw - s.yaw) * Math.min(1, dt * 4);
          s.pitch += (s.focus.pitch - s.pitch) * Math.min(1, dt * 4);
          if (Math.abs(wrapAngle(s.focus.yaw - s.yaw)) < 0.01) s.focus = null;
        } else {
          s.yaw += s.vyaw * dt;
          s.vyaw += ((reduced ? 0 : AUTO_SPEED) - s.vyaw) * Math.min(1, dt * 1.1);
          s.pitch += (0.36 - s.pitch) * Math.min(1, dt * 0.35);
        }
      }
      if (s.pinned >= 0 && now > s.pinUntil && !s.focus) s.pinned = -1;

      ctx.clearRect(0, 0, W, W);

      ctx.drawImage(base, 0, 0);

      // Dotted surface, fading with depth so the far side reads as glass. Dots are batched by
      // brightness so each level is a single fill.
      const LEVELS = 8;
      const buckets: Vec[][] = Array.from({ length: LEVELS }, () => []);
      for (let i = 0; i < dots.length; i++) {
        const v = rot(dots[i]);
        const level = v[2] > 0 ? 2 + Math.min(LEVELS - 3, Math.floor(v[2] * (LEVELS - 2))) : v[2] > -0.5 ? 1 : 0;
        buckets[level].push(v);
      }
      for (let lv = 0; lv < LEVELS; lv++) {
        if (!buckets[lv].length) continue;
        const a = lv === 0 ? 0.05 : lv === 1 ? 0.09 : 0.18 + (0.6 * (lv - 2)) / (LEVELS - 3);
        const r = (lv < 2 ? 0.6 : 0.8 + (0.9 * (lv - 2)) / (LEVELS - 3)) * px;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.beginPath();
        for (const v of buckets[lv]) {
          const x = c + v[0] * R;
          const y = c - v[1] * R;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        }
        ctx.fill();
      }

      const lit = s.hover >= 0 ? s.hover : s.pinned >= 0 ? s.pinned : -1;

      // Arcs (batched by brightness) and the packets travelling along them.
      ctx.lineCap = "round";
      const arcLevels = 6;
      const lines: number[][][] = Array.from({ length: arcLevels }, () => []);
      const hotLines: number[][] = [];
      const rotated = arcs.map((arc) => arc.points.map((p) => rot(p)));
      arcs.forEach((arc, ai) => {
        const hot = lit >= 0 && (arc.a === lit || arc.b === lit);
        const pts = rotated[ai];
        for (let i = 0; i < pts.length - 1; i++) {
          const z = (pts[i][2] + pts[i + 1][2]) / 2;
          if (z < -0.25) continue;
          const seg = [c + pts[i][0] * R, c - pts[i][1] * R, c + pts[i + 1][0] * R, c - pts[i + 1][1] * R];
          if (hot) hotLines.push(seg);
          else lines[Math.min(arcLevels - 1, Math.max(0, Math.floor((z + 0.25) * 0.8 * arcLevels)))].push(seg);
        }
      });
      for (let lv = 0; lv < arcLevels; lv++) {
        if (!lines[lv].length) continue;
        ctx.strokeStyle = `rgba(255,255,255,${(0.07 + 0.3 * (lv / (arcLevels - 1))).toFixed(3)})`;
        ctx.lineWidth = 1.1 * px;
        ctx.beginPath();
        for (const sg of lines[lv]) { ctx.moveTo(sg[0], sg[1]); ctx.lineTo(sg[2], sg[3]); }
        ctx.stroke();
      }
      if (hotLines.length) {
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.lineWidth = 2 * px;
        ctx.beginPath();
        for (const sg of hotLines) { ctx.moveTo(sg[0], sg[1]); ctx.lineTo(sg[2], sg[3]); }
        ctx.stroke();
      }
      arcs.forEach((arc, ai) => {
        const hot = lit >= 0 && (arc.a === lit || arc.b === lit);
        const pts = rotated[ai];
        const head = (t * arc.speed + arc.phase) % 1;
        for (let k = 0; k < 6; k++) {
          const f = head - k * 0.012;
          if (f < 0) continue;
          const p = pts[Math.min(ARC_STEPS, Math.round(f * ARC_STEPS))];
          if (p[2] < -0.1) continue;
          const al = (1 - k / 6) * (hot ? 1 : 0.8) * Math.min(1, p[2] + 0.5);
          ctx.fillStyle = `rgba(255,255,255,${al.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(c + p[0] * R, c - p[1] * R, (k === 0 ? 3.1 : 2.2 - k * 0.25) * px, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Agent nodes. The one nearest the front is "featured" while nobody is interacting.
      const proj = nodeVecs.map((v) => rot(v));
      if (now - s.featuredAt > 900 && s.hover < 0 && s.pinned < 0) {
        let best = 0;
        let bestScore = -9;
        proj.forEach((p, i) => { const score = p[2] - Math.max(0, p[0] - 0.3) * 2; if (score > bestScore) { bestScore = score; best = i; } });
        s.featured = best;
        s.featuredAt = now;
      }
      const active = s.hover >= 0 ? s.hover : s.pinned >= 0 ? s.pinned : s.featured;
      if (active !== s.shown) {
        s.shown = active;
        setShown(active);
      }

      proj.forEach((p, i) => {
        if (p[2] < -0.05) return;
        const sx = c + p[0] * R * (1 + 0.0);
        const sy = c - p[1] * R;
        const isActive = i === active;
        const depth = Math.min(1, p[2] + 0.35);
        const pulse = (t * 0.7 + i * 0.31) % 1;
        ctx.strokeStyle = `rgba(255,255,255,${((1 - pulse) * 0.5 * depth).toFixed(3)})`;
        ctx.lineWidth = 1.4 * px;
        ctx.beginPath();
        ctx.arc(sx, sy, (6 + pulse * 15) * px, 0, Math.PI * 2);
        ctx.stroke();
        if (isActive) {
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.lineWidth = 2 * px;
          ctx.beginPath();
          ctx.arc(sx, sy, 13 * px, 0, Math.PI * 2);
          ctx.stroke();
        }
        const g = ctx.createRadialGradient(sx - 2 * px, sy - 2 * px, px, sx, sy, 8 * px);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "#b9b9be");
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.4 + 0.6 * depth;
        ctx.beginPath();
        ctx.arc(sx, sy, (isActive ? 7.5 : 5.2) * px, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Keep the info card pinned beside its node.
      const card = cardRef.current;
      if (card) {
        const p = proj[active];
        const visible = p[2] > 0.05 && p[0] < 0.35;
        const sp = screenPos(p);
        const cssX = sp.x / px;
        const cssY = sp.y / px;
        const w = s.size;
        const left = cssX - card.offsetWidth - 22;
        const top = Math.min(Math.max(cssY - card.offsetHeight / 2, 8), w - card.offsetHeight - 8);
        card.style.transform = `translate(${Math.min(Math.max(left, 8), w - card.offsetWidth - 8)}px, ${top}px)`;
        card.style.opacity = visible ? "1" : "0";
      }
    };

    const loop = (now: number) => {
      if (s.visible) draw(now);
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);

    // Pointer: drag to spin (the only thing that pauses the idle spin), hover or click a node to inspect it.
    const pick = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (clientX - rect.left) * s.dpr;
      const my = (clientY - rect.top) * s.dpr;
      let best = -1;
      let bestD = (20 * s.dpr) ** 2;
      nodeVecs.forEach((v, i) => {
        const p = rot(v);
        if (p[2] < 0.05) return;
        const sp = screenPos(p);
        const d = (sp.x - mx) ** 2 + (sp.y - my) ** 2;
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    };

    const onDown = (e: PointerEvent) => {
      s.dragging = true;
      s.moved = 0;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.lastT = performance.now();
      s.focus = null;
      canvas.setPointerCapture(e.pointerId);
      wrap.dataset.drag = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (s.dragging) {
        const dx = e.clientX - s.lastX;
        const dy = e.clientY - s.lastY;
        const now = performance.now();
        const dtm = Math.max(1, now - s.lastT) / 1000;
        s.yaw += dx * 0.0075;
        s.pitch = Math.min(0.95, Math.max(-0.65, s.pitch + dy * 0.005));
        s.vyaw = (dx * 0.0075) / dtm;
        s.vyaw = Math.max(-5, Math.min(5, s.vyaw));
        s.moved += Math.abs(dx) + Math.abs(dy);
        s.lastX = e.clientX;
        s.lastY = e.clientY;
        s.lastT = now;
        return;
      }
      s.hover = pick(e.clientX, e.clientY);
      wrap.dataset.hover = s.hover >= 0 ? "true" : "false";
    };
    const onUp = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.dragging = false;
      delete wrap.dataset.drag;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      if (s.moved < 6) {
        const hit = pick(e.clientX, e.clientY);
        if (hit >= 0) {
          s.pinned = hit;
          s.pinUntil = performance.now() + 7000;
        } else {
          s.pinned = -1;
        }
      }
    };
    const onLeave = () => {
      s.hover = -1;
      wrap.dataset.hover = "false";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    // Stop drawing while off-screen or in a background tab.
    const io = new IntersectionObserver(([entry]) => { s.visible = entry.isIntersecting && !document.hidden; }, { threshold: 0.01 });
    io.observe(wrap);
    const onVisibility = () => { if (document.hidden) s.visible = false; };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(s.raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const agent = AGENTS[shown];
  const connections = LINKS.filter(([a, b]) => a === shown || b === shown).length;

  return (
    <div className="globe" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className="globe__canvas"
        role="img"
        aria-label="A rotating globe of agent types connected by lines that carry data. Drag to rotate it."
      />
      <div className="globe__card glass glass--dark" ref={cardRef} aria-hidden="true">
        <span className="globe__kind">{agent.kind}</span>
        <strong>{agent.name}</strong>
        <span className="globe__job">{agent.job}</span>
        <span className="globe__meta">Linked to {connections} other agents</span>
      </div>
      <ul className="sr-only">
        {AGENTS.map((a) => (
          <li key={a.name}>{a.kind}: {a.job}</li>
        ))}
      </ul>
    </div>
  );
}
