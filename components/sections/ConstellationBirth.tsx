"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useSign } from "../SignContext";
import { FIGURES } from "@/lib/zodiac/figures";
import { figureFit } from "@/lib/zodiac/helpers";
import type { ZodiacSign } from "@/lib/zodiac/types";

/**
 * Capítulo IV — Tu constelación. COMPLETE REDESIGN.
 * Not a tab selector swapping an SVG: a living volume of cosmic dust where
 * a constellation is BORN. Camera advances into the universe; choosing a
 * sign makes the dust gravitate; stars are born one by one; lines draw
 * themselves with energy travelling through them; the emblem is discovered
 * behind the stars as light. Hover = tooltip per Stelar category, click =
 * energy wave through the figure, sign change = 2.5s cinematic morph,
 * long-press = the golden ritual.
 */

const SIGNS = Object.keys(FIGURES) as ZodiacSign[];
const CATS = ["Movimiento", "Entrenamiento", "Sueño", "Proteína", "Agua", "Déficit", "Registro"];

const DEPTH = 22; // universe depth
const FZ = 10; // constellation plane
const TRAVEL = 4; // camera advance
const FRAMES = 11;

const LECHE: [number, number, number] = [244, 236, 222];
const MAGENTA: [number, number, number] = [255, 72, 134];
const ORO: [number, number, number] = [217, 174, 111];
const ROSA: [number, number, number] = [251, 215, 227];
const ORO_LUZ: [number, number, number] = [255, 233, 194];

function prand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixC = (
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number
): [number, number, number] => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

function softDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  c: readonly [number, number, number],
  alpha: number,
  midStop = 0.35
) {
  if (alpha <= 0.004 || R <= 0.3) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, R);
  g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${alpha})`);
  g.addColorStop(midStop, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.45})`);
  g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
}

function sparklePath(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
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

/* figure world-data per sign, cached */
const figCache = new Map<ZodiacSign, ReturnType<typeof buildFigure>>();
function buildFigure(sign: ZodiacSign) {
  const fit = figureFit(sign, { x: -2.6, y: -1.95, w: 5.2, h: 3.9 });
  const stars = fit.pts.map((p, i) => ({
    x: p.x,
    y: p.y,
    mag: p.mag,
    name: p.name,
    scatter: {
      x: p.x + (prand(i * 13 + 7) - 0.5) * 6,
      y: p.y + (prand(i * 17 + 11) - 0.5) * 4,
    },
    tw: prand(i * 19) * Math.PI * 2,
  }));
  // adjacency for the energy wave
  const adj: number[][] = stars.map(() => []);
  fit.lines.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });
  return { stars, lines: fit.lines, adj };
}
function getFigure(sign: ZodiacSign) {
  if (!figCache.has(sign)) figCache.set(sign, buildFigure(sign));
  return figCache.get(sign)!;
}

/* emblem reveal frames, cached per sign */
const emblemCache = new Map<string, HTMLImageElement[]>();
function getEmblem(sign: string) {
  if (!emblemCache.has(sign)) {
    const imgs = Array.from({ length: FRAMES }, (_, i) => {
      const img = new Image();
      img.src = `/emblems/${sign}/f${String(i).padStart(2, "0")}.png`;
      return img;
    });
    emblemCache.set(sign, imgs);
  }
  return emblemCache.get(sign)!;
}

export default function ConstellationBirth() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { sign, setSign } = useSign();
  const signRef = useRef<ZodiacSign>(sign);
  const morphRef = useRef<{ to: ZodiacSign; start: number } | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* sign changes arriving from the selector → cinematic morph */
  useEffect(() => {
    if (sign !== signRef.current && !morphRef.current) {
      morphRef.current = { to: sign, start: performance.now() };
    }
  }, [sign]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    getEmblem(signRef.current); // warm the default emblem

    /* the universe: cosmic dust in volume */
    const dust = Array.from({ length: 620 }, (_, i) => ({
      x: (prand(i) - 0.5) * 11,
      y: (prand(i + 100) - 0.5) * 7,
      z: prand(i + 200) * DEPTH,
      size: 0.014 + prand(i + 300) * 0.05,
      color: (() => {
        const r = prand(i + 900);
        return r > 0.93 ? MAGENTA : r > 0.8 ? ORO : r > 0.72 ? ROSA : LECHE;
      })(),
      tw: prand(i + 600) * Math.PI * 2,
      twS: 0.25 + prand(i + 700) * 0.7,
      dx: (prand(i + 800) - 0.5) * 0.04,
      dy: (prand(i + 850) - 0.5) * 0.028,
    }));

    /* transition sparks (born when a figure dissolves) */
    let sparks: { x: number; y: number; a0: number; r0: number; born: number }[] = [];

    /* energy waves from clicked stars: depths per star */
    let waves: { start: number; depths: number[] }[] = [];

    let W = 0;
    let H = 0;
    let raf = 0;
    let running = true;
    let hoverIdx = -1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const press = { held: false, since: 0, ritual: 0, flashed: false, flash: 0 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const camDist = (p: number, now: number) => {
      let zoomOut = 0;
      if (morphRef.current) {
        const mt = (now - morphRef.current.start) / 1000;
        zoomOut = Math.sin(Math.min(1, mt / 2.5) * Math.PI) * 0.9;
      }
      return FZ - TRAVEL * smooth(0.14, 0.36, p) + zoomOut;
    };

    /* morph envelope: 1 → 0 (dissolve) → 1 (rebirth); swaps sign mid-way */
    const morphEnv = (now: number) => {
      const m = morphRef.current;
      if (!m) return 1;
      const t = (now - m.start) / 1000;
      if (t < 0.6) return 1 - smooth(0, 0.6, t);
      if (t < 1.4) {
        if (signRef.current !== m.to) {
          signRef.current = m.to;
          getEmblem(m.to);
          /* spawn the swirl of freed particles */
          const fig = getFigure(m.to);
          sparks = fig.stars.flatMap((s, i) =>
            Array.from({ length: 5 }, (_, k) => ({
              x: s.x,
              y: s.y,
              a0: prand(i * 31 + k * 7) * Math.PI * 2,
              r0: 0.3 + prand(i * 37 + k * 11) * 1.6,
              born: now,
            }))
          );
          waves = [];
        }
        return 0;
      }
      if (t < 2.5) return smooth(1.4, 2.5, t);
      morphRef.current = null;
      sparks = [];
      return 1;
    };

    const project = (x: number, y: number, dist: number, f: number, cx: number, cy: number) => {
      if (dist < 0.18) return null;
      return {
        sx: cx + ((x - pointer.x * 0.5) * f) / dist,
        sy: cy + ((y - pointer.y * 0.32) * f) / dist,
        s: f / dist,
      };
    };

    /* star position: spiral gather from scatter → slot */
    const starPos = (fig: ReturnType<typeof buildFigure>, i: number, gather: number) => {
      const st = fig.stars[i];
      const vx = st.scatter.x - st.x;
      const vy = st.scatter.y - st.y;
      const ang = (1 - gather) * 1.9;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      const k = 1 - gather;
      return {
        x: st.x + (vx * cos - vy * sin) * k,
        y: st.y + (vx * sin + vy * cos) * k,
      };
    };

    const screenStars = () => {
      /* projected star positions for hit-testing (uses last frame params) */
      const p = reduced ? 1 : scrollYProgress.get();
      const now = performance.now();
      const fig = getFigure(signRef.current);
      const f = H * 1.05;
      const cx = W / 2;
      const cy = H / 2;
      const gather = smooth(0.36, 0.5, p);
      const d = camDist(p, now);
      return fig.stars.map((_, i) => {
        const pos = starPos(fig, i, gather);
        const pr = project(pos.x, pos.y, d, f, cx, cy);
        return pr ? { x: pr.sx, y: pr.sy } : null;
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / W) * 2 - 1;
      pointer.ty = (e.clientY / H) * 2 - 1;
      /* star hover */
      const rect = canvas.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) return;
      const pts = screenStars();
      let best = -1;
      let bestD = 34;
      pts.forEach((pt, i) => {
        if (!pt) return;
        const d = Math.hypot(pt.x - e.clientX, pt.y - (e.clientY - rect.top));
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      hoverIdx = best;
      canvas.style.cursor = best >= 0 ? "pointer" : "default";
      const tip = tooltipRef.current;
      if (tip) {
        if (best >= 0) {
          const fig = getFigure(signRef.current);
          const st = fig.stars[best];
          tip.textContent = st.name ? `${CATS[best % CATS.length]} · ${st.name}` : CATS[best % CATS.length];
          tip.style.opacity = "1";
          tip.style.left = `${pts[best]!.x}px`;
          tip.style.top = `${pts[best]!.y - 34}px`;
        } else {
          tip.style.opacity = "0";
        }
      }
    };

    const onClick = () => {
      if (hoverIdx < 0 || morphRef.current) return;
      /* BFS depths from the clicked star → the wave travels the figure */
      const fig = getFigure(signRef.current);
      const depths = fig.stars.map(() => -1);
      const q = [hoverIdx];
      depths[hoverIdx] = 0;
      while (q.length) {
        const v = q.shift()!;
        for (const n of fig.adj[v]) {
          if (depths[n] === -1) {
            depths[n] = depths[v] + 1;
            q.push(n);
          }
        }
      }
      waves.push({ start: performance.now(), depths });
      if (waves.length > 3) waves.shift();
    };

    const onDown = () => {
      press.held = true;
      press.since = performance.now();
    };
    const onUp = () => {
      press.held = false;
      press.flashed = false;
    };

    const draw = (now: number) => {
      if (!running) return;
      const p = reduced ? 0.98 : scrollYProgress.get();
      const t = now / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      /* ritual: long-press builds the golden state */
      const wantRitual = press.held && now - press.since > 450 ? 1 : 0;
      press.ritual += (wantRitual - press.ritual) * (wantRitual ? 0.03 : 0.05);
      const rit = press.ritual;
      if (rit > 0.96 && !press.flashed) {
        press.flashed = true;
        press.flash = now;
      }

      const env = morphEnv(now);
      const fig = getFigure(signRef.current);
      const emblem = getEmblem(signRef.current);
      const d = camDist(p, now);
      const f = H * 1.05;
      const cx = W / 2;
      const cy = H / 2;

      /* deep background — a volume, never flat; darkens during the ritual */
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0, `rgba(28, 12, 17, ${1 - rit * 0.35})`);
      bg.addColorStop(0.55, "#100608");
      bg.addColorStop(1, "#0A0608");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const gather = smooth(0.36, 0.5, p);
      /* the universe searching for a shape: gentle screen-space swirl */
      const swirl =
        (smooth(0.34, 0.42, p) * (1 - smooth(0.52, 0.62, p)) * 0.05 + rit * 0.04) *
        (reduced ? 0 : 1);

      /* cosmic dust */
      const dustDim = (1 - 0.4 * smooth(0.72, 0.9, p)) * (1 - rit * 0.55);
      for (const pt of dust) {
        const wx = pt.x + pt.dx * (reduced ? 0 : t);
        const wy = pt.y + pt.dy * (reduced ? 0 : t);
        let rel = (pt.z - (FZ - d)) % DEPTH;
        if (rel < 0) rel += DEPTH;
        rel += 0.2;
        const pr = project(wx, wy, rel, f, cx, cy);
        if (!pr) continue;
        let sx = pr.sx;
        let sy = pr.sy;
        if (swirl > 0.001) {
          const ox = sx - cx;
          const oy = sy - cy;
          const a = swirl * (1.6 - Math.min(1.4, rel / DEPTH));
          sx = cx + ox * Math.cos(a) - oy * Math.sin(a);
          sy = cy + ox * Math.sin(a) + oy * Math.cos(a);
        }
        if (sx < -60 || sx > W + 60 || sy < -60 || sy > H + 60) continue;
        const twk = reduced ? 1 : 0.6 + 0.4 * Math.sin(pt.tw + t * pt.twS);
        const r = Math.max(0.4, pt.size * pr.s);
        if (rel < 2) {
          const bok = 1 - smooth(0.2, 2, rel);
          softDot(ctx, sx, sy, r * (1 + bok * 5), pt.color, (0.24 - bok * 0.17) * twk * dustDim, 0);
        } else {
          softDot(ctx, sx, sy, r * 2.5, pt.color, Math.min(0.8, 2.6 / rel + 0.1) * twk * dustDim, 0.3);
        }
      }

      /* ── the emblem, discovered behind the stars as light ── */
      const reveal = smooth(0.76, 0.96, p) * env;
      const emblemA = (reveal * 0.4 + rit * 0.35) * (0.75 + 0.25 * Math.sin(t * 0.4));
      if (emblemA > 0.01) {
        const frame = Math.min(FRAMES - 1, Math.floor((reveal * 0.85 + rit * 0.15) * (FRAMES - 1) + rit * 3));
        const img = emblem[frame];
        if (img?.complete && img.naturalWidth > 0) {
          const eh = (3.6 * f) / d;
          const ew = eh * (img.naturalWidth / img.naturalHeight);
          ctx.globalCompositeOperation = "screen";
          ctx.globalAlpha = Math.min(0.85, emblemA);
          ctx.drawImage(img, cx - ew / 2, cy - eh / 2, ew, eh);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
        }
      }

      /* ── transition sparks (a figure dissolving into orbiting dust) ── */
      if (sparks.length) {
        for (const sp of sparks) {
          const st = (now - sp.born) / 1000;
          const ang = sp.a0 + st * 1.6;
          const rr = sp.r0 * (1 + st * 0.25);
          const pr = project(sp.x + Math.cos(ang) * rr * 0.35, sp.y + Math.sin(ang) * rr * 0.28, d, f, cx, cy);
          if (!pr) continue;
          softDot(ctx, pr.sx, pr.sy, Math.max(1.5, 0.05 * pr.s), ORO_LUZ, 0.5, 0.4);
        }
      }

      /* ── the constellation being born ── */
      const goldMix = rit; // the ritual turns everything gold
      const lineColor = mixC(ORO, ORO_LUZ, goldMix);

      /* lines: drawn one by one, with energy travelling through them */
      fig.lines.forEach(([a, b], i) => {
        const ls = 0.56 + (i / fig.lines.length) * 0.16;
        const lt = smooth(ls, ls + 0.05, p) * env;
        if (lt <= 0.01) return;
        const pa = starPos(fig, a, gather);
        const pb = starPos(fig, b, gather);
        const A = project(pa.x, pa.y, d, f, cx, cy);
        const B = project(pb.x, pb.y, d, f, cx, cy);
        if (!A || !B) return;
        const ex = A.sx + (B.sx - A.sx) * lt;
        const ey = A.sy + (B.sy - A.sy) * lt;
        const shimmer = reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 0.9 + i * 1.7);
        ctx.strokeStyle = `rgba(${lineColor[0]},${lineColor[1]},${lineColor[2]},${(0.4 + goldMix * 0.3) * lt * shimmer})`;
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";
        ctx.shadowColor = `rgba(${lineColor[0]},${lineColor[1]},${lineColor[2]},0.7)`;
        ctx.shadowBlur = lt >= 1 ? 5 : 2;
        ctx.beginPath();
        ctx.moveTo(A.sx, A.sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.shadowBlur = 0;

        /* energy: small lights travelling the completed line */
        if (lt >= 1 && !reduced) {
          const k = (t * 0.14 + i * 0.37) % 1;
          softDot(ctx, A.sx + (B.sx - A.sx) * k, A.sy + (B.sy - A.sy) * k, 5, ORO_LUZ, 0.5 + goldMix * 0.3, 0.45);
        }
      });

      /* stars: born one at a time — glow, expansion ring, spark burst */
      fig.stars.forEach((st, i) => {
        const bs = 0.46 + i * 0.026;
        const birth = smooth(bs, bs + 0.045, p) * env;
        if (birth <= 0.01) return;
        const pos = starPos(fig, i, gather);
        const pr = project(pos.x, pos.y, d, f, cx, cy);
        if (!pr) return;
        const hero = st.mag <= 2.3;

        /* wave response */
        let waveBoost = 0;
        for (const wv of waves) {
          const wt = (now - wv.start) / 1000 - wv.depths[i] * 0.14;
          if (wt > 0 && wt < 0.7) waveBoost = Math.max(waveBoost, Math.sin((wt / 0.7) * Math.PI));
        }

        const hovered = i === hoverIdx;
        const basePulse = reduced ? 1 : 1 + 0.07 * Math.sin(t * 0.55 + st.tw);
        const scl = basePulse * (hovered ? 1.35 : 1) * (1 + waveBoost * 0.4);
        const color = mixC(hero ? MAGENTA : i % 2 ? ORO : ROSA, ORO_LUZ, goldMix);
        const R = (hero ? 0.115 : 0.08) * pr.s * scl * (0.4 + 0.6 * birth);
        const alpha = (0.75 + 0.25 * birth) * birth * (1 + waveBoost * 0.3);

        /* halo + flare rays + sparkle body + white core */
        softDot(ctx, pr.sx, pr.sy, R * 3.4 + (hovered ? 8 : 0), color, alpha * 0.6, 0.35);
        const rayLen = R * (hero ? 2.9 : 2.2) * (1 + waveBoost * 0.3);
        ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${alpha * 0.5})`;
        ctx.lineWidth = Math.max(0.6, R * 0.09);
        ctx.beginPath();
        ctx.moveTo(pr.sx - rayLen, pr.sy);
        ctx.lineTo(pr.sx + rayLen, pr.sy);
        ctx.moveTo(pr.sx, pr.sy - rayLen);
        ctx.lineTo(pr.sx, pr.sy + rayLen);
        ctx.stroke();
        ctx.shadowColor = `rgba(${color[0]},${color[1]},${color[2]},0.9)`;
        ctx.shadowBlur = R * 0.9;
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, alpha + 0.2)})`;
        sparklePath(ctx, pr.sx, pr.sy, R);
        ctx.shadowBlur = 0;
        softDot(ctx, pr.sx, pr.sy, R * 0.5, [255, 255, 255], alpha * (hero ? 0.95 : 0.6), 0.45);

        /* birth: expansion ring + radial sparks */
        if (birth < 1 && birth > 0.02) {
          const br = R * (1 + birth * 4);
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${(1 - birth) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, br, 0, Math.PI * 2);
          ctx.stroke();
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2 + st.tw;
            softDot(
              ctx,
              pr.sx + Math.cos(a) * br * 1.1,
              pr.sy + Math.sin(a) * br * 1.1,
              2.4,
              color,
              (1 - birth) * 0.7,
              0.4
            );
          }
        }
      });

      /* the ritual flash */
      if (press.flash && now - press.flash < 900) {
        const ft = (now - press.flash) / 900;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
        g.addColorStop(0, `rgba(255, 246, 229, ${(1 - ft) * 0.28})`);
        g.addColorStop(1, "rgba(255,246,229,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress]);

  const selectorOpacity = useTransform(scrollYProgress, [0.28, 0.34], [0, 1]);
  const captionOpacity = useTransform(scrollYProgress, [0.84, 0.9], [0, 1]);
  const def = FIGURES[sign];
  const anchor = def.stars.find((s) => s.name && s.role);

  return (
    <section id="constelacion" ref={ref} className="relative h-[520vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_84%,transparent_100%)]"
        />

        {/* elegant star tooltip, driven from the engine */}
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full border border-gold/30 bg-deep/70 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.25em] text-cream/85 opacity-0 backdrop-blur-sm transition-opacity duration-300"
        />

        {/* estado 1 — the chapter opens */}
        <Overlay progress={scrollYProgress} range={[0.02, 0.06, 0.14, 0.19]}>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold/80">
            Capítulo IV · Tu constelación
          </p>
          <h2 className="font-sans text-4xl font-black leading-[1.08] tracking-tight text-cream sm:text-6xl">
            No aparece.{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              Se revela.
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-cream/60">
            Cada acción repetida deja una señal. Las señales terminan formando
            algo que antes no podías ver.
          </p>
        </Overlay>

        {/* estado 3 — the sign selector emerges with the gravity */}
        <motion.div
          style={{ opacity: selectorOpacity }}
          className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-3 px-6"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/40">
            Elige tu signo
          </p>
          <div className="flex max-w-2xl flex-wrap items-center justify-center gap-1.5">
            {SIGNS.map((s) => (
              <button
                key={s}
                onClick={() => setSign(s)}
                aria-label={FIGURES[s].label}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${
                  sign === s
                    ? "border-pink-soft/70 text-pink shadow-[0_0_18px_rgba(233,30,99,0.3)]"
                    : "hairline border text-cream/45 hover:border-cream/25 hover:text-cream/85"
                }`}
              >
                <Glyph sign={s} />
              </button>
            ))}
          </div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-cream/25">
            Mantén presionado para el ritual
          </p>
        </motion.div>

        {/* estado 7 — the discovery, named */}
        <motion.div
          style={{ opacity: captionOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[10%] z-10 mx-auto max-w-xl px-6 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/30" />
            <p className="text-xs uppercase tracking-[0.35em] text-gold">
              {def.label}
            </p>
            <span className="h-px w-8 bg-gold/30" />
          </div>
          <p className="mt-3 font-serif text-lg italic text-cream/60">
            {anchor
              ? `${anchor.name} — ${anchor.role}.`
              : "Cada estrella, un día que volviste."}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

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
      className="pointer-events-none absolute inset-x-0 top-[14%] z-10 mx-auto max-w-3xl px-6 text-center"
    >
      {children}
    </motion.div>
  );
}

function Glyph({ sign }: { sign: ZodiacSign }) {
  const url = `url(/zodiaco/${sign}.svg)`;
  return (
    <span
      aria-hidden
      className="inline-block h-[18px] w-[18px] bg-current"
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
