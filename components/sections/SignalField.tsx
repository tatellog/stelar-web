"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Capítulo III — Conexiones.
 * Not a drawn constellation: a living network emerging from depth.
 * señales sueltas → conexiones → red viva → patrón.
 *
 * Small points at many depths (bokeh near, faint far). Thin, almost
 * transparent threads that are born from one node, travel to another,
 * land softly and ignite both. Sparks ride the threads. The cursor pulls
 * gently on nearby lights; hovering a node names it (comida, sueño…);
 * clicking one sends a wave through everything it's connected to.
 * At the end the camera pulls back and the net settles into an elegant
 * abstract pattern — the constellation is not drawn, it emerges.
 */

const DEPTH = 26; // world depth of the dust field
const TRAVEL = 8.5; // camera dolly-in across phases 1-3
const PULLBACK = 2.6; // final dolly-out that reveals the pattern
const PATTERN_Z = 13.5; // the plane where the pattern settles

/* ── deterministic random ──────────────────────────────────────── */
function prand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type RGB = readonly [number, number, number];

/** A diffuse light: single radial falloff — never a hard circle. */
function softDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  color: RGB,
  alpha: number,
  mid: number,
) {
  if (alpha <= 0.004 || R <= 0.3) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${alpha})`);
  if (mid > 0) {
    g.addColorStop(mid, `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.45})`);
  }
  g.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
}

const LECHE: RGB = [244, 236, 222];
const WARM: RGB = [255, 240, 224];
const ORO: RGB = [217, 174, 111];
const ROSA: RGB = [251, 215, 227];

/* the six kinds of registro a node can be */
const DIMS = [
  { label: "comida", color: [232, 184, 114] as RGB },
  { label: "proteína", color: [224, 174, 160] as RGB },
  { label: "sueño", color: [193, 143, 255] as RGB },
  { label: "agua", color: [143, 190, 219] as RGB },
  { label: "entreno", color: [255, 158, 87] as RGB },
  { label: "déficit", color: [255, 72, 134] as RGB },
];

type Dust = {
  x: number; y: number; z: number;
  size: number; color: RGB;
  birth: number; tw: number; twS: number;
  dx: number; dy: number;
};

type Node = {
  x: number; y: number; z: number;
  size: number; dim: number;
  tw: number; pulseS: number;
  px: number; py: number; pz: number; // pattern slot
};

type Edge = {
  a: number; b: number;
  birth: number;
  tone: RGB;
  kind: "net" | "flicker" | "spiral";
  seed: number;
  spark: boolean;
};

/* ── build the field ───────────────────────────────────────────── */

function buildDust(): Dust[] {
  const out: Dust[] = [];
  for (let i = 0; i < 360; i++) {
    const roll = prand(i + 900);
    out.push({
      x: (prand(i) - 0.5) * 9,
      y: (prand(i + 100) - 0.5) * 6,
      z: prand(i + 200) * DEPTH,
      size: 0.014 + prand(i + 300) * 0.04,
      color: roll > 0.9 ? ROSA : roll > 0.8 ? ORO : LECHE,
      birth: prand(i + 400) < 0.5 ? 0 : 0.08 + prand(i + 500) * 0.26,
      tw: prand(i + 600) * Math.PI * 2,
      twS: 0.3 + prand(i + 700) * 0.9,
      dx: (prand(i + 800) - 0.5) * 0.05,
      dy: (prand(i + 850) - 0.5) * 0.035,
    });
  }
  return out;
}

function buildNodes(): { nodes: Node[]; clusterOf: number[] } {
  const nodes: Node[] = [];
  const clusterOf: number[] = [];
  const CLUSTERS = 6;
  for (let c = 0; c < CLUSTERS; c++) {
    const cx = (prand(c * 31 + 5) - 0.5) * 6.6;
    const cy = (prand(c * 47 + 9) - 0.5) * 4.2;
    const cz = 10 + prand(c * 53 + 13) * 5; // 10..15
    const n = 4 + Math.floor(prand(c * 61 + 17) * 3); // 4-6
    for (let i = 0; i < n; i++) {
      nodes.push({
        x: cx + (prand(c * 71 + i * 7 + 19) - 0.5) * 2.4,
        y: cy + (prand(c * 83 + i * 11 + 23) - 0.5) * 1.7,
        z: cz + (prand(c * 89 + i * 13 + 29) - 0.5) * 1.6,
        size: 0.05 + prand(c * 97 + i * 17 + 31) * 0.035,
        dim: (c * 2 + i) % DIMS.length,
        tw: prand(c * 101 + i * 19) * Math.PI * 2,
        pulseS: 0.5 + prand(c * 103 + i * 23) * 0.7,
        px: 0, py: 0, pz: 0,
      });
      clusterOf.push(c);
    }
  }
  // the abstract pattern the net settles into: a golden-angle spiral —
  // recognizable, elegant, and deliberately NOT a zodiac figure (that
  // revelation belongs to chapter IV)
  const N = nodes.length;
  nodes.forEach((nd, i) => {
    const r = 2.4 * Math.sqrt((i + 0.5) / N);
    const th = i * 2.39996 + 0.7;
    nd.px = Math.cos(th) * r;
    nd.py = Math.sin(th) * r * 0.86;
    nd.pz = PATTERN_Z + (prand(i + 77) - 0.5) * 0.5;
  });
  return { nodes, clusterOf };
}

function buildEdges(nodes: Node[], clusterOf: number[]): Edge[] {
  const edges: Edge[] = [];
  const tones: RGB[] = [WARM, ORO, ROSA];
  const N = nodes.length;

  // chains inside each cluster — the first repetitions finding each other
  for (let c = 0; c < 6; c++) {
    const members = nodes.map((_, i) => i).filter((i) => clusterOf[i] === c);
    for (let i = 0; i < members.length - 1; i++) {
      edges.push({
        a: members[i],
        b: members[i + 1],
        birth: 0.3 + prand(c * 7 + i * 3) * 0.18,
        tone: tones[(c + i) % 3],
        kind: "net",
        seed: c * 17 + i * 5,
        spark: prand(c * 11 + i * 13) > 0.55,
      });
    }
    if (members.length > 4) {
      edges.push({
        a: members[0],
        b: members[members.length - 2],
        birth: 0.42 + prand(c * 127) * 0.12,
        tone: tones[c % 3],
        kind: "net",
        seed: c * 23 + 7,
        spark: false,
      });
    }
  }
  // a few bridges between clusters — relations crossing contexts
  for (let k = 0; k < 7; k++) {
    const a = Math.floor(prand(k * 41 + 3) * N);
    let b = Math.floor(prand(k * 43 + 11) * N);
    if (clusterOf[a] === clusterOf[b]) b = (b + 5) % N;
    edges.push({
      a, b,
      birth: 0.46 + prand(k * 47) * 0.12,
      tone: tones[k % 3],
      kind: "net",
      seed: k * 29 + 3,
      spark: k % 2 === 0,
    });
  }
  // living connections that come and go in phase 3
  for (let k = 0; k < 10; k++) {
    const a = Math.floor(prand(k * 53 + 7) * N);
    let best = -1;
    let bestD = 3.2;
    for (let j = 0; j < N; j++) {
      if (j === a) continue;
      const d = Math.hypot(nodes[a].x - nodes[j].x, nodes[a].y - nodes[j].y, nodes[a].z - nodes[j].z);
      const jitter = prand(k * 59 + j) * 0.8;
      if (d + jitter < bestD) {
        bestD = d + jitter;
        best = j;
      }
    }
    if (best >= 0) {
      edges.push({
        a, b: best,
        birth: 0.52,
        tone: tones[k % 3],
        kind: "flicker",
        seed: k * 61 + 13,
        spark: false,
      });
    }
  }
  // the pattern's own thread: the spiral path + a few spokes
  for (let i = 0; i < N - 1; i++) {
    edges.push({
      a: i, b: i + 1,
      birth: 0.78 + (i / N) * 0.13,
      tone: i % 3 === 0 ? ROSA : WARM,
      kind: "spiral",
      seed: i * 3 + 1,
      spark: i % 4 === 0,
    });
  }
  for (let i = 0; i < N - 8; i += 8) {
    edges.push({
      a: i, b: i + 8,
      birth: 0.86 + prand(i) * 0.05,
      tone: ORO,
      kind: "spiral",
      seed: i * 7 + 2,
      spark: false,
    });
  }
  return edges;
}

export default function SignalField() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dust = buildDust();
    const { nodes, clusterOf } = buildNodes();
    const edges = buildEdges(nodes, clusterOf);
    const N = nodes.length;

    // adjacency for waves + how connected each node already is
    const adj: number[][] = Array.from({ length: N }, () => []);
    edges.forEach((e, ei) => {
      if (e.kind === "flicker") return;
      adj[e.a].push(ei);
      adj[e.b].push(ei);
    });

    let W = 0;
    let H = 0;
    let raf = 0;
    let running = true;
    let hovered = -1;

    type Wave = { t0: number; dist: number[] };
    const waves: Wave[] = [];

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, sx: -1, sy: -1 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / W) * 2 - 1;
      pointer.ty = (e.clientY / H) * 2 - 1;
      pointer.sx = e.clientX;
      pointer.sy = e.clientY;
    };

    const project = (x: number, y: number, dist: number, f: number, cx: number, cy: number) => {
      if (dist < 0.22) return null;
      return {
        sx: cx + ((x - pointer.x * 0.55) * f) / dist,
        sy: cy + ((y - pointer.y * 0.35) * f) / dist,
        s: f / dist,
      };
    };

    const cameraZ = (p: number) =>
      TRAVEL * smooth(0.04, 0.6, p) - PULLBACK * smooth(0.72, 0.95, p);

    const nodeWorld = (nd: Node, i: number, p: number, t: number) => {
      const morph = smooth(0.74, 0.92, p);
      const fx = reduced ? 0 : Math.sin(t * 0.24 + i * 2.1) * 0.07 * (1 - morph);
      const fy = reduced ? 0 : Math.cos(t * 0.2 + i * 1.7) * 0.05 * (1 - morph);
      return {
        x: nd.x + fx + (nd.px - nd.x) * morph,
        y: nd.y + fy + (nd.py - nd.y) * morph,
        z: nd.z + (nd.pz - nd.z) * morph,
      };
    };

    /* screen positions computed once per frame (edges + nodes + hit tests) */
    const screen: ({ sx: number; sy: number; s: number } | null)[] = Array(N).fill(null);

    const onClick = (e: MouseEvent) => {
      let best = -1;
      let bestD = 46;
      for (let i = 0; i < N; i++) {
        const pr = screen[i];
        if (!pr) continue;
        const d = Math.hypot(pr.sx - e.clientX, pr.sy - e.clientY);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      if (best < 0) return;
      // BFS: how far the energy travels through the net
      const dist = Array(N).fill(Infinity);
      dist[best] = 0;
      const q = [best];
      while (q.length) {
        const u = q.shift()!;
        for (const ei of adj[u]) {
          const ed = edges[ei];
          const v = ed.a === u ? ed.b : ed.a;
          if (dist[v] > dist[u] + 1) {
            dist[v] = dist[u] + 1;
            q.push(v);
          }
        }
      }
      waves.push({ t0: performance.now() / 1000, dist });
      if (waves.length > 3) waves.shift();
    };

    const wavePulse = (i: number, t: number) => {
      let k = 0;
      for (const w of waves) {
        const front = (t - w.t0) * 3.4;
        const d = w.dist[i];
        if (!isFinite(d)) continue;
        k += Math.exp(-((d - front) * (d - front)) / 0.32);
      }
      return Math.min(1, k);
    };

    const draw = (now: number) => {
      if (!running) return;
      const p = reduced ? 0.85 : scrollYProgress.get();
      const t = now / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      const camZ = cameraZ(p);
      const f = Math.min(H * 1.05, W * 1.32);
      const cx = W / 2;
      const cy = H / 2;

      // prune finished waves
      for (let i = waves.length - 1; i >= 0; i--) {
        if (t - waves[i].t0 > 4.5) waves.splice(i, 1);
      }

      /* deep-wine background, breathing — never flat */
      const bg = ctx.createRadialGradient(cx, cy * 1.05, 0, cx, cy, Math.max(W, H) * 0.75);
      const warmth = 0.05 + smooth(0.18, 0.5, p) * 0.05;
      bg.addColorStop(0, `rgba(31, 14, 19, ${0.9 + warmth})`);
      bg.addColorStop(0.55, "#120709");
      bg.addColorStop(1, "#0A0608");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const amb = smooth(0.2, 0.55, p) * 0.07;
      if (amb > 0.002) {
        const g1 = ctx.createRadialGradient(W * 0.3, H * 0.35, 0, W * 0.3, H * 0.35, W * 0.5);
        g1.addColorStop(0, `rgba(233, 30, 99, ${amb})`);
        g1.addColorStop(1, "rgba(233,30,99,0)");
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, W, H);
        const g2 = ctx.createRadialGradient(W * 0.72, H * 0.6, 0, W * 0.72, H * 0.6, W * 0.45);
        g2.addColorStop(0, `rgba(217, 174, 111, ${amb * 0.8})`);
        g2.addColorStop(1, "rgba(217,174,111,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, W, H);
      }

      /* the dust field dims a little when the pattern takes the stage */
      const fieldDim = 1 - 0.5 * smooth(0.74, 0.94, p);

      /* ── dust: many small points, depth-wrapped, bokeh near ───── */
      for (const pt of dust) {
        const born = smooth(pt.birth, pt.birth + 0.1, p);
        if (born <= 0.01) continue;

        const drift = reduced ? 0 : t;
        const wx = pt.x + pt.dx * drift;
        const wy = pt.y + pt.dy * drift;
        let rel = (pt.z - camZ) % DEPTH;
        if (rel < 0) rel += DEPTH;
        rel += 0.2;

        const pr = project(wx, wy, rel, f, cx, cy);
        if (!pr) continue;
        let { sx, sy } = pr;
        // near lights lean gently toward the cursor
        if (pointer.sx >= 0 && rel < 4) {
          const d = Math.hypot(pointer.sx - sx, pointer.sy - sy);
          if (d < 240) {
            const pull = 0.05 * (1 - d / 240) * (1 - rel / 4);
            sx += (pointer.sx - sx) * pull;
            sy += (pointer.sy - sy) * pull;
          }
        }
        if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) continue;

        const twinkle = reduced ? 1 : 0.6 + 0.4 * Math.sin(pt.tw + t * pt.twS);
        const r = Math.max(0.35, pt.size * pr.s);

        if (rel < 2.4) {
          // bokeh: near lights blur into wide, faint discs
          const bok = 1 - smooth(0.2, 2.4, rel);
          softDot(ctx, sx, sy, r * (1 + bok * 6), pt.color, born * twinkle * (0.24 - bok * 0.17) * fieldDim, 0);
        } else {
          const a = born * twinkle * Math.min(0.7, 2.6 / rel + 0.1) * fieldDim;
          softDot(ctx, sx, sy, r * 2.4, pt.color, a, 0.32);
        }
      }

      /* ── project the nodes (with light cursor attraction) ─────── */
      const morph = smooth(0.74, 0.92, p);
      hovered = -1;
      let hoverD = 44;
      for (let i = 0; i < N; i++) {
        const w = nodeWorld(nodes[i], i, p, t);
        const pr = project(w.x, w.y, w.z - camZ, f, cx, cy);
        if (pr && pointer.sx >= 0) {
          const d = Math.hypot(pointer.sx - pr.sx, pointer.sy - pr.sy);
          if (d < 220) {
            const pull = 0.05 * (1 - d / 220) * (1 - morph * 0.7);
            pr.sx += (pointer.sx - pr.sx) * pull;
            pr.sy += (pointer.sy - pr.sy) * pull;
          }
          if (d < hoverD) {
            hoverD = d;
            hovered = i;
          }
        }
        screen[i] = pr;
      }

      /* how lit each node is: it ignites when its connections land */
      const litLevel = Array(N).fill(0);
      for (const e of edges) {
        if (e.kind !== "net") continue;
        const landed = smooth(e.birth + 0.05, e.birth + 0.08, p);
        if (landed > litLevel[e.a]) litLevel[e.a] = landed;
        if (landed > litLevel[e.b]) litLevel[e.b] = landed;
      }

      /* ── the threads ───────────────────────────────────────────── */
      const phase3 = smooth(0.52, 0.62, p) * (1 - smooth(0.86, 0.96, p));
      ctx.lineCap = "round";
      for (const e of edges) {
        const A = screen[e.a];
        const B = screen[e.b];
        if (!A || !B) continue;

        let alpha = 0;
        let lt = 1;
        if (e.kind === "net") {
          const raw = smooth(e.birth, e.birth + 0.07, p);
          if (raw <= 0) continue;
          lt = 1 - Math.pow(1 - raw, 3); // born from a, lands softly on b
          alpha = 0.15 * raw * (1 - morph * 0.6);
        } else if (e.kind === "flicker") {
          if (phase3 <= 0.01) continue;
          const env = Math.sin(t * 0.55 + e.seed * 2.7);
          if (env <= 0.15) continue;
          alpha = 0.11 * Math.pow(env, 1.6) * phase3;
        } else {
          const raw = smooth(e.birth, e.birth + 0.05, p);
          if (raw <= 0) continue;
          lt = 1 - Math.pow(1 - raw, 3);
          alpha = 0.2 * raw * morph;
        }

        const isHover = hovered === e.a || hovered === e.b;
        if (isHover) alpha += 0.22;
        // the wave brightens the threads it travels
        if (waves.length && e.kind !== "flicker") {
          alpha += 0.3 * Math.max(wavePulse(e.a, t), wavePulse(e.b, t)) * 0.6;
        }
        if (alpha <= 0.004) continue;

        const ex = A.sx + (B.sx - A.sx) * lt;
        const ey = A.sy + (B.sy - A.sy) * lt;
        ctx.strokeStyle = `rgba(${e.tone[0]},${e.tone[1]},${e.tone[2]},${Math.min(0.5, alpha)})`;
        ctx.lineWidth = e.kind === "spiral" ? 0.7 : 0.6;
        ctx.beginPath();
        ctx.moveTo(A.sx, A.sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // the tip of a thread still traveling glows faintly
        if (lt < 1 && e.kind !== "flicker") {
          softDot(ctx, ex, ey, 5, WARM, 0.35, 0.45);
        }

        // sparks ride the settled threads in the living-net phase
        if (e.spark && lt >= 1 && !reduced) {
          const env = e.kind === "spiral" ? morph : phase3;
          if (env > 0.02) {
            const k = (t * (0.14 + prand(e.seed) * 0.12) + prand(e.seed * 3)) % 1;
            const px2 = A.sx + (B.sx - A.sx) * k;
            const py2 = A.sy + (B.sy - A.sy) * k;
            softDot(ctx, px2, py2, 4.5, WARM, 0.5 * env * Math.sin(k * Math.PI), 0.45);
          }
        }
      }

      /* ── the nodes: small lights, never big four-point stars ──── */
      for (let i = 0; i < N; i++) {
        const pr = screen[i];
        if (!pr) continue;
        if (pr.sx < -60 || pr.sx > W + 60 || pr.sy < -60 || pr.sy > H + 60) continue;

        const nd = nodes[i];
        const dim = DIMS[nd.dim];
        const isHover = hovered === i;
        const lit = litLevel[i];
        const pulse = reduced
          ? 1
          : 1 + (0.05 + lit * 0.05) * Math.sin(nd.tw + t * nd.pulseS);
        const wave = wavePulse(i, t);

        const r =
          Math.max(0.6, nd.size * pr.s) *
          pulse *
          (isHover ? 1.15 : 1) *
          (1 + wave * 0.3);
        const a =
          (0.3 + lit * 0.3 + morph * 0.15 + wave * 0.35 + (isHover ? 0.25 : 0)) *
          (reduced ? 1 : 0.85 + 0.15 * Math.sin(nd.tw + t * 0.7));

        // tinted halo + warm core — diffuse, subtle
        softDot(ctx, pr.sx, pr.sy, r * (3 + lit * 1.4 + wave), dim.color, Math.min(0.7, a), 0.3);
        softDot(ctx, pr.sx, pr.sy, r * 0.95, [255, 250, 240], Math.min(0.95, a + 0.25), 0.5);

        // its name, only when you reach for it
        if (isHover) {
          ctx.fillStyle = `rgba(244,236,222,0.9)`;
          ctx.font = "600 11px 'Hanken Grotesk', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(dim.label, pr.sx, pr.sy - r * 3.2 - 8);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    canvas.addEventListener("click", onClick);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("click", onClick);
    };
  }, [scrollYProgress]);

  return (
    <section id="senales" ref={ref} className="relative h-[560vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* the canvas dissolves at its edges — no hard seams */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_82%,transparent_100%)]"
        />

        {/* ── one text per phase ─────────────────────────────────── */}
        <Overlay progress={scrollYProgress} range={[0.03, 0.08, 0.17, 0.23]}>
          <Chapter>Capítulo III · Conexiones</Chapter>
          <Heading>
            Tus días se convierten en{" "}
            <Accent tone="cream">señales sueltas.</Accent>
          </Heading>
          <Sub>Un solo día cambia muy poco.</Sub>
        </Overlay>

        <Overlay progress={scrollYProgress} range={[0.34, 0.39, 0.5, 0.56]}>
          <Heading>
            La repetición empieza a <Accent tone="gold">conectar.</Accent>
          </Heading>
          <Sub>Cuando algo se repite, deja de ser ruido.</Sub>
          <Hint>Toca un nodo — todo está conectado</Hint>
        </Overlay>

        <Overlay progress={scrollYProgress} range={[0.8, 0.86, 0.97, 1]}>
          <Heading>
            Tus días se convierten en <Accent tone="pink">un patrón.</Accent>
          </Heading>
          <Sub>
            Y cuando la repetición se conecta, aparece lo que antes no podías
            ver.
          </Sub>
        </Overlay>
      </div>
    </section>
  );
}

/* ── text primitives ─────────────────────────────────────────────── */

function Overlay({
  progress,
  range,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number, number, number];
  children: React.ReactNode;
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, [range[0], range[1]], [22, 0]);
  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-x-0 top-[13%] z-10 mx-auto max-w-3xl px-6 text-center"
    >
      {children}
    </motion.div>
  );
}

function Chapter({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold/80">
      {children}
    </p>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-sans text-3xl font-black leading-tight tracking-tight text-cream sm:text-5xl">
      {children}
    </h2>
  );
}

function Accent({
  tone,
  children,
}: {
  tone: "cream" | "gold" | "pink";
  children: React.ReactNode;
}) {
  const cls =
    tone === "pink"
      ? "text-pink text-glow-pink"
      : tone === "gold"
        ? "text-gold text-glow-gold"
        : "text-cream/60";
  return <span className={`font-serif italic font-medium ${cls}`}>{children}</span>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-cream/60">
      {children}
    </p>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto mt-4 text-xs uppercase tracking-[0.3em] text-cream/35">
      {children}
    </p>
  );
}
