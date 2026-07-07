"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { figureFit } from "@/lib/zodiac/helpers";

/**
 * Capítulos II–III — el campo de señales.
 * Not a drawn constellation over a flat sky: an immersive particle field.
 * Every particle is a day, a meal, a workout, a night. The camera travels
 * INTO the field as you scroll; near lights blur into bokeh, far ones
 * shrink into depth. Then thin golden threads begin to connect a few of
 * them — and when the camera pulls back, the connections were a pattern.
 *
 * Canvas 2D with true perspective projection (x·f/z), depth-sorted bokeh,
 * pointer parallax and click-to-ignite. Text lives in Framer overlays.
 */

const DEPTH = 26; // world depth of the field
const TRAVEL = 13; // camera travel across the whole scroll
const PULLBACK = 1.6; // final dolly-out that reveals the pattern

/* ── deterministic random ──────────────────────────────────────── */
function prand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A diffuse light: single radial-gradient falloff — never a hard circle.
 *  `mid` shapes the falloff (higher = brighter, tighter center). */
function softDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  color: readonly [number, number, number],
  alpha: number,
  mid: number
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

/** Four-point sparkle body (the app's star shape), filled with the
 *  current fillStyle. */
function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number
) {
  const d = R * 0.24;
  ctx.beginPath();
  ctx.moveTo(x, y - R);
  ctx.quadraticCurveTo(x + d, y - d, x + R, y);
  ctx.quadraticCurveTo(x + d, y + d, x, y + R);
  ctx.quadraticCurveTo(x - d, y + d, x - R, y);
  ctx.quadraticCurveTo(x - d, y - d, x, y - R);
  ctx.closePath();
  ctx.fill();
}

/* ── the pattern: the real Leo figure on a plane deep in the field ─ */
const PATTERN_Z = TRAVEL + 5.2;
const FIG = figureFit("leo", { x: -2.3, y: -1.7, w: 4.6, h: 3.4 });
const LINKS = FIG.lines;

type Particle = {
  x: number;
  y: number;
  z: number;
  size: number;
  color: [number, number, number];
  glow: boolean;
  birth: number; // scroll progress at which it fades in
  tw: number; // twinkle phase
  twS: number; // twinkle speed
  dx: number; // slow drift
  dy: number;
  lit: boolean;
  // pattern particles only:
  slot?: { x: number; y: number; mag: number };
  scatter?: { x: number; y: number; z: number };
};

const LECHE: [number, number, number] = [244, 236, 222];
const MAGENTA: [number, number, number] = [255, 72, 134];
const ORO: [number, number, number] = [217, 174, 111];
const ROSA: [number, number, number] = [251, 215, 227];

function buildParticles(): Particle[] {
  const out: Particle[] = [];
  // ambient field — days, meals, nights, floating in depth
  for (let i = 0; i < 340; i++) {
    const roll = prand(i + 900);
    out.push({
      x: (prand(i) - 0.5) * 9,
      y: (prand(i + 100) - 0.5) * 6,
      z: prand(i + 200) * DEPTH,
      size: 0.02 + prand(i + 300) * 0.05,
      color: roll > 0.9 ? MAGENTA : roll > 0.76 ? ORO : roll > 0.68 ? ROSA : LECHE,
      glow: roll > 0.68,
      birth: prand(i + 400) < 0.55 ? 0 : 0.14 + prand(i + 500) * 0.3,
      tw: prand(i + 600) * Math.PI * 2,
      twS: 0.3 + prand(i + 700) * 0.8,
      dx: (prand(i + 800) - 0.5) * 0.045,
      dy: (prand(i + 850) - 0.5) * 0.03,
      lit: false,
    });
  }
  // pattern particles — scattered like any other light until they gather
  FIG.pts.forEach((p, i) => {
    out.push({
      x: p.x,
      y: p.y,
      z: PATTERN_Z,
      size: p.mag <= 2.3 ? 0.13 : 0.085,
      color: p.mag <= 2.3 ? MAGENTA : prand(i + 20) > 0.5 ? ORO : ROSA,
      glow: true,
      birth: 0,
      tw: prand(i + 30) * Math.PI * 2,
      twS: 0.6,
      dx: 0,
      dy: 0,
      lit: false,
      slot: { x: p.x, y: p.y, mag: p.mag },
      scatter: {
        x: p.x + (prand(i + 40) - 0.5) * 5,
        y: p.y + (prand(i + 50) - 0.5) * 3.5,
        z: PATTERN_Z + (prand(i + 60) - 0.5) * 9,
      },
    });
  });
  return out;
}

/* ── mini-constellation clusters: the sky is FULL of small figures ──
   Like a star chart: many little groups of stars joined by fine golden
   threads at different depths. The camera passes through some of them;
   the Leo pattern is just the one that ends up mattering. */
type Cluster = {
  stars: { x: number; y: number; z: number; size: number; tw: number }[];
  links: { a: number; b: number; birth: number }[];
  dashed: boolean;
  birth: number;
};

function buildClusters(): Cluster[] {
  const clusters: Cluster[] = [];
  for (let c = 0; c < 14; c++) {
    const cx = (prand(c * 31 + 5) - 0.5) * 8.5;
    const cy = (prand(c * 47 + 9) - 0.5) * 5.5;
    const cz = 4.5 + prand(c * 53 + 13) * 19;
    const n = 4 + Math.floor(prand(c * 61 + 17) * 3);
    const stars = Array.from({ length: n }, (_, i) => ({
      x: cx + (prand(c * 71 + i * 7 + 19) - 0.5) * 2.1,
      y: cy + (prand(c * 83 + i * 11 + 23) - 0.5) * 1.6,
      z: cz + (prand(c * 89 + i * 13 + 29) - 0.5) * 1.2,
      size: 0.035 + prand(c * 97 + i * 17 + 31) * 0.045,
      tw: prand(c * 101 + i * 19) * Math.PI * 2,
    }));
    // a chain through the stars + one or two cross links, like a chart figure
    const links: Cluster["links"] = [];
    for (let i = 0; i < n - 1; i++) {
      links.push({ a: i, b: i + 1, birth: 0.44 + prand(c * 7 + i * 3) * 0.22 });
    }
    if (n > 4 && prand(c * 113) > 0.4) {
      links.push({ a: 0, b: n - 2, birth: 0.5 + prand(c * 127) * 0.18 });
    }
    clusters.push({
      stars,
      links,
      dashed: c % 3 === 0,
      birth: 0.2 + prand(c * 131 + 41) * 0.18,
    });
  }
  return clusters;
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

    const particles = buildParticles();
    const pattern = particles.filter((p) => p.slot);
    const clusters = buildClusters();
    let W = 0;
    let H = 0;
    let raf = 0;
    let running = true;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
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
    };

    /* project world → screen; returns null when behind camera */
    const project = (
      x: number,
      y: number,
      dist: number,
      f: number,
      cx: number,
      cy: number
    ) => {
      if (dist < 0.18) return null;
      return {
        sx: cx + ((x - pointer.x * 0.55) * f) / dist,
        sy: cy + ((y - pointer.y * 0.35) * f) / dist,
        s: f / dist,
      };
    };

    const onClick = (e: MouseEvent) => {
      const p = scrollYProgress.get();
      const camZ = cameraZ(p);
      const f = Math.min(H * 1.05, W * 1.32);
      const cx = W / 2;
      const cy = H / 2;
      let best: Particle | null = null;
      let bestD = 44;
      for (const pt of particles) {
        const pos = particlePos(pt, p);
        const pr = project(pos.x, pos.y, pos.z - camZ, f, cx, cy);
        if (!pr) continue;
        const d = Math.hypot(pr.sx - e.clientX, pr.sy - e.clientY);
        if (d < bestD) {
          bestD = d;
          best = pt;
        }
      }
      if (best) best.lit = !best.lit;
    };

    const cameraZ = (p: number) =>
      TRAVEL * smooth(0.04, 0.68, p) - PULLBACK * smooth(0.74, 0.97, p);

    /* pattern particles drift from scatter → slot during phase 3 */
    const particlePos = (pt: Particle, p: number) => {
      if (!pt.slot || !pt.scatter) return { x: pt.x, y: pt.y, z: pt.z };
      const t = smooth(0.4, 0.6, p);
      return {
        x: pt.scatter.x + (pt.slot.x - pt.scatter.x) * t,
        y: pt.scatter.y + (pt.slot.y - pt.scatter.y) * t,
        z: pt.scatter.z + (PATTERN_Z - pt.scatter.z) * t,
      };
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

      /* deep-wine background with a breathing vignette — never flat */
      const bg = ctx.createRadialGradient(cx, cy * 1.05, 0, cx, cy, Math.max(W, H) * 0.75);
      const warmth = 0.05 + smooth(0.18, 0.5, p) * 0.05;
      bg.addColorStop(0, `rgba(31, 14, 19, ${0.9 + warmth})`);
      bg.addColorStop(0.55, "#120709");
      bg.addColorStop(1, "#0A0608");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* subtle magenta / gold ambience growing with depth */
      const amb = smooth(0.2, 0.55, p) * 0.09;
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

      /* how much the ambient field dims when the pattern takes the stage */
      const fieldDim = 1 - 0.55 * smooth(0.72, 0.95, p);

      /* ambient particles — wrapped so the tunnel never ends */
      for (const pt of particles) {
        if (pt.slot) continue;
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
        if (pr.sx < -80 || pr.sx > W + 80 || pr.sy < -80 || pr.sy > H + 80) continue;

        const twinkle = reduced ? 1 : 0.65 + 0.35 * Math.sin(pt.tw + t * pt.twS);
        const color = pt.lit ? MAGENTA : pt.color;
        const r = Math.max(0.4, pt.size * pr.s * (pt.lit ? 1.7 : 1));

        if (rel < 2.2) {
          /* bokeh: near lights blur into soft discs */
          const bok = 1 - smooth(0.2, 2.2, rel);
          const R = r * (1 + bok * 5);
          const a = born * twinkle * (0.28 - bok * 0.2) * fieldDim;
          softDot(ctx, pr.sx, pr.sy, R, color, a, 0);
        } else {
          /* every light is a diffuse glow — no hard-edged circles */
          const a = born * twinkle * Math.min(0.9, 3.2 / rel + 0.12) * fieldDim;
          const R = r * (pt.glow || pt.lit ? 4 : 2.6) * (pt.lit ? 1.3 : 1);
          softDot(ctx, pr.sx, pr.sy, R, color, a, pt.glow || pt.lit ? 0.4 : 0.3);
        }
      }

      /* mini-constellations everywhere — the star-chart sky */
      for (const cl of clusters) {
        const born = smooth(cl.birth, cl.birth + 0.12, p);
        if (born <= 0.01) continue;
        const dimmed = born * fieldDim;

        /* fine threads between the cluster's stars */
        const linkBase = smooth(0.44, 0.48, p);
        if (linkBase > 0) {
          if (cl.dashed) ctx.setLineDash([3, 6]);
          for (const ln of cl.links) {
            const lt = smooth(ln.birth, ln.birth + 0.06, p);
            if (lt <= 0) continue;
            const A = cl.stars[ln.a];
            const B = cl.stars[ln.b];
            const dA = A.z - camZ;
            const dB = B.z - camZ;
            if (dA < 0.25 || dB < 0.25) continue;
            const pa = project(A.x, A.y, dA, f, cx, cy);
            const pb = project(B.x, B.y, dB, f, cx, cy);
            if (!pa || !pb) continue;
            const ex = pa.sx + (pb.sx - pa.sx) * lt;
            const ey = pa.sy + (pb.sy - pa.sy) * lt;
            const la = Math.min(0.4, 2.4 / dA) * dimmed * lt;
            ctx.strokeStyle = `rgba(217, 174, 111, ${la})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(pa.sx, pa.sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
          }
          if (cl.dashed) ctx.setLineDash([]);
        }

        /* the cluster's small stars — tiny sparkles once connected */
        for (const st of cl.stars) {
          const d = st.z - camZ;
          if (d < 0.25) continue;
          const pr = project(st.x, st.y, d, f, cx, cy);
          if (!pr) continue;
          if (pr.sx < -40 || pr.sx > W + 40 || pr.sy < -40 || pr.sy > H + 40) continue;
          const twk = reduced ? 1 : 0.6 + 0.4 * Math.sin(st.tw + t * 0.8);
          const r = Math.max(0.5, st.size * pr.s);
          const a = Math.min(0.85, 2.6 / d + 0.1) * dimmed * twk;
          softDot(ctx, pr.sx, pr.sy, r * 2.6, ORO, a * 0.8, 0.4);
          if (linkBase > 0 && r > 1.6) {
            ctx.fillStyle = `rgba(255, 233, 194, ${a * 0.9})`;
            sparkle(ctx, pr.sx, pr.sy, r * 0.9);
          }
        }
      }

      /* golden connections — drawn one by one, partial strokes */
      const lineBase = smooth(0.46, 0.5, p);
      if (lineBase > 0) {
        ctx.lineCap = "round";
        LINKS.forEach(([a, b], i) => {
          const lt = smooth(0.48 + (i / LINKS.length) * 0.2, 0.48 + (i / LINKS.length) * 0.2 + 0.05, p);
          if (lt <= 0) return;
          const pa = particlePos(pattern[a], p);
          const pb = particlePos(pattern[b], p);
          const A = project(pa.x, pa.y, pa.z - camZ, f, cx, cy);
          const B = project(pb.x, pb.y, pb.z - camZ, f, cx, cy);
          if (!A || !B) return;
          const ex = A.sx + (B.sx - A.sx) * lt;
          const ey = A.sy + (B.sy - A.sy) * lt;
          ctx.strokeStyle = `rgba(217, 174, 111, ${0.55 * lt})`;
          ctx.lineWidth = 1.1;
          ctx.shadowColor = "rgba(217,174,111,0.7)";
          ctx.shadowBlur = lt >= 1 ? 6 : 2;
          ctx.beginPath();
          ctx.moveTo(A.sx, A.sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
      }

      /* pattern particles — soft lights at first, then four-point stars
         with cross flare as the figure gathers */
      const gather = smooth(0.4, 0.6, p);
      pattern.forEach((pt, i) => {
        const pos = particlePos(pt, p);
        const pr = project(pos.x, pos.y, pos.z - camZ, f, cx, cy);
        if (!pr) return;
        const hero = (pt.slot?.mag ?? 5) <= 2.3;
        const pulse = reduced ? 1 : 1 + 0.1 * gather * Math.sin(t * 1.6 + i);
        const twinkle = reduced ? 1 : 0.75 + 0.25 * Math.sin(pt.tw + t * pt.twS);
        const color = pt.lit ? MAGENTA : pt.color;
        const r = Math.max(0.6, pt.size * pr.s * pulse * (pt.lit ? 1.4 : 1));
        const a = (0.55 + 0.45 * gather) * twinkle;

        /* ambient halo, always diffuse */
        softDot(ctx, pr.sx, pr.sy, r * (3.2 + gather * 1.6), color, a * 0.8, 0.35);

        /* the star body blooms with the gathering: cross rays + sparkle */
        if (gather > 0.05) {
          const flare = a * gather;
          const rayLen = r * (hero ? 3.1 : 2.3);
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${flare * 0.5})`;
          ctx.lineWidth = Math.max(0.6, r * 0.09);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(pr.sx - rayLen, pr.sy);
          ctx.lineTo(pr.sx + rayLen, pr.sy);
          ctx.moveTo(pr.sx, pr.sy - rayLen);
          ctx.lineTo(pr.sx, pr.sy + rayLen);
          ctx.stroke();

          ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.9)`;
          ctx.shadowBlur = r * 0.9;
          ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, flare + 0.25)})`;
          sparkle(ctx, pr.sx, pr.sy, r * (hero ? 1.15 : 0.95));
          ctx.shadowBlur = 0;
        }

        /* white-hot core — soft, never a hard ring */
        softDot(
          ctx,
          pr.sx,
          pr.sy,
          r * (gather > 0.05 ? 0.55 : 0.8),
          [255, 255, 255],
          a * (hero ? 0.95 : 0.6),
          0.45
        );
      });

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
        {/* the canvas dissolves at its edges so the field melts into the
            neighbouring chapters — no hard seam anywhere */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_82%,transparent_100%)]"
        />

        {/* ── text overlays, one per phase ─────────────────────── */}
        <Overlay progress={scrollYProgress} range={[0.03, 0.08, 0.16, 0.21]}>
          <Chapter>Capítulo II · Señales</Chapter>
          <Heading>
            Tus días se convierten en{" "}
            <Accent tone="cream">señales sueltas.</Accent>
          </Heading>
          <Sub>Un solo día cambia muy poco.</Sub>
          <Hint>Toca una luz para encenderla</Hint>
        </Overlay>

        <Overlay progress={scrollYProgress} range={[0.26, 0.31, 0.4, 0.45]}>
          <Heading>
            Cada registro deja una <Accent tone="gold">luz.</Accent>
          </Heading>
        </Overlay>

        <Overlay progress={scrollYProgress} range={[0.5, 0.55, 0.64, 0.69]}>
          <Chapter>Capítulo III · Conexiones</Chapter>
          <Heading>
            La repetición empieza a <Accent tone="gold">conectar.</Accent>
          </Heading>
        </Overlay>

        <Overlay progress={scrollYProgress} range={[0.78, 0.84, 0.97, 1]}>
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
