"use client";

import { softDotRGB } from "@/lib/canvas";
import { runWhenVisible } from "@/lib/visibleLoop";
import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useSign } from "../SignContext";
import { FIGURES } from "@/lib/zodiac/figures";
import { figureArt } from "@/lib/zodiac/helpers";
import type { ZodiacSign } from "@/lib/zodiac/types";

/**
 * Capítulo IV — El observatorio.
 * Not navigation: exploration. Twelve constellations already exist,
 * floating in slow orbits around the one being visited. The universe is
 * a living volume (dust, nebula, breathing camera). Travelling to another
 * constellation dissolves the current one into golden dust and births the
 * next. Stars answer to hover with floating typography; a click sends
 * energy through every connection; the emblem waits behind, like ancient
 * ink.
 */

const SIGNS = Object.keys(FIGURES) as ZodiacSign[];
const CATS = [
  "Movimiento",
  "Sueño",
  "Proteína",
  "Agua",
  "Comida",
  "Déficit",
  "Energía",
  "Ánimo",
  "Ciclo",
  "Registro",
];

const DEPTH = 22;
const FZ = 10;
const TRAVEL = 4;
const FRAMES = 11;
/** side of the shared art/figure box in world units */
const FIG_S = 3.6;

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
  softDotRGB(ctx, x, y, R, c, alpha, midStop);
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

/* ── the visited figure, full size ─────────────────────────────── */
const figCache = new Map<ZodiacSign, ReturnType<typeof buildFigure>>();
function buildFigure(sign: ZodiacSign) {
  // art space: the coords were traced over the emblem, so figure and
  // emblem share the same box and stay perfectly aligned, undistorted
  const fit = figureArt(sign, FIG_S);
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

/* ── the miniatures that float in orbit ───────────────────────── */
const miniCache = new Map<ZodiacSign, { pts: { x: number; y: number; mag: number }[]; lines: readonly (readonly [number, number])[] }>();
function getMini(sign: ZodiacSign) {
  if (!miniCache.has(sign)) {
    const fit = figureArt(sign, 1);
    miniCache.set(sign, { pts: fit.pts, lines: fit.lines });
  }
  return miniCache.get(sign)!;
}

/* orbital parameters — every sign owns a slot in the observatory */
const ORBITS = SIGNS.map((sign, k) => ({
  sign,
  angle0: (k / SIGNS.length) * Math.PI * 2 + prand(k + 77) * 0.3,
  rx: 3.1 + prand(k + 401) * 1.0,
  ry: 1.8 + prand(k + 411) * 0.6,
  z: 8.6 + prand(k + 421) * 3.4,
  speed: (0.006 + prand(k + 431) * 0.005) * (k % 2 ? 1 : -1),
}));

/* soft nebula blobs — the sky is never flat */
const NEBULAE = Array.from({ length: 6 }, (_, i) => ({
  x: (prand(i + 501) - 0.5) * 9,
  y: (prand(i + 511) - 0.5) * 5.5,
  z: 12 + prand(i + 521) * 8,
  R: 2.6 + prand(i + 531) * 2.4,
  color: i % 3 === 0 ? MAGENTA : i % 3 === 1 ? ORO : ([90, 40, 60] as [number, number, number]),
  alpha: 0.05 + prand(i + 541) * 0.035,
  dx: (prand(i + 551) - 0.5) * 0.02,
}));

const emblemCache = new Map<string, HTMLImageElement[]>();
function getEmblem(sign: string) {
  if (!emblemCache.has(sign)) {
    emblemCache.set(
      sign,
      Array.from({ length: FRAMES }, (_, i) => {
        const img = new Image();
        img.src = `/emblems/${sign}/f${String(i).padStart(2, "0")}.webp`;
        return img;
      })
    );
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
  const selectRef = useRef(setSign);
  selectRef.current = setSign;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

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

    // NOTE: emblem frames are NOT preloaded here — getEmblem() kicks off
    // the requests on the first visible frame (the loop is IO-gated), so
    // ~1 MB of PNGs never competes with the initial page load
    SIGNS.forEach(getMini);

    const dust = Array.from({ length: 560 }, (_, i) => ({
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

    let sparks: { x: number; y: number; a0: number; r0: number; born: number }[] = [];
    let waves: { start: number; depths: number[] }[] = [];

    let W = 0;
    let H = 0;
    let running = true;
    let hoverIdx = -1;
    let hoverSign: ZodiacSign | null = null;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const press = { held: false, since: 0, ritual: 0, flashed: false, flash: 0, waved: false };
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
      const breathe = reduced ? 0 : Math.sin(now / 14000) * 0.08;
      return FZ - TRAVEL * smooth(0.14, 0.36, p) + zoomOut + breathe;
    };

    const morphEnv = (now: number) => {
      const m = morphRef.current;
      if (!m) return 1;
      const t = (now - m.start) / 1000;
      if (t < 0.6) return 1 - smooth(0, 0.6, t);
      if (t < 1.4) {
        if (signRef.current !== m.to) {
          const old = getFigure(signRef.current);
          sparks = old.stars.flatMap((s, i) =>
            Array.from({ length: 5 }, (_, k) => ({
              x: s.x,
              y: s.y,
              a0: prand(i * 31 + k * 7) * Math.PI * 2,
              r0: 0.3 + prand(i * 37 + k * 11) * 1.6,
              born: now,
            }))
          );
          signRef.current = m.to;
          getEmblem(m.to);
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

    const frameParams = (now: number) => {
      const p = reduced ? 0.98 : scrollYProgress.get();
      const d = camDist(p, now);
      /* responsive focal: on narrow/portrait screens the width rules so
         the figure and its emblem never overflow the viewport */
      const f = Math.min(H * 1.05, W * 1.32);
      const bx = reduced ? 0 : Math.sin(now / 9000) * 7;
      const by = reduced ? 0 : Math.cos(now / 11500) * 5;
      return { p, d, f, cx: W / 2 + bx, cy: H / 2 + by };
    };

    const miniCenter = (k: number, now: number, d: number, f: number, cx: number, cy: number) => {
      const o = ORBITS[k];
      const ang = o.angle0 + (reduced ? 0 : (now / 1000) * o.speed);
      /* portrait: compress the orbits horizontally and stretch them
         vertically so the observatory stays on screen */
      const aspect = W / H;
      const kx = Math.min(1, aspect * 1.3);
      const ky = aspect < 0.8 ? 1.45 : 1;
      const wx = Math.cos(ang) * o.rx * kx;
      const wy = Math.sin(ang) * o.ry * ky;
      const dist = o.z - (FZ - d);
      return { pr: project(wx, wy, dist, f, cx, cy), wx, wy, dist };
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / W) * 2 - 1;
      pointer.ty = (e.clientY / H) * 2 - 1;
      updateHover(e);
    };

    /* hit-testing shared by hover (mouse) and tap (touch: pointerdown
       fires without any previous pointermove, so the tap must set the
       hover state itself before the click handler reads it) */
    const updateHover = (e: { clientX: number; clientY: number }) => {
      const rect = canvas.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) {
        hoverIdx = -1;
        hoverSign = null;
        return;
      }
      const now = performance.now();
      const { p, d, f, cx, cy } = frameParams(now);
      const ey = e.clientY - rect.top;

      /* stars of the visited figure */
      const fig = getFigure(signRef.current);
      const gather = smooth(0.36, 0.5, p);
      let bestStar = -1;
      let bestD = 34;
      fig.stars.forEach((_, i) => {
        const pos = starPos(fig, i, gather);
        const pr = project(pos.x, pos.y, d, f, cx, cy);
        if (!pr) return;
        const dd = Math.hypot(pr.sx - e.clientX, pr.sy - ey);
        if (dd < bestD) {
          bestD = dd;
          bestStar = i;
        }
      });
      hoverIdx = bestStar;

      /* orbiting miniatures */
      hoverSign = null;
      if (bestStar < 0 && smooth(0.24, 0.34, p) > 0.5) {
        for (let k = 0; k < ORBITS.length; k++) {
          if (ORBITS[k].sign === signRef.current) continue;
          const { pr } = miniCenter(k, now, d, f, cx, cy);
          if (!pr) continue;
          const rad = 0.55 * pr.s * 0.62;
          if (Math.hypot(pr.sx - e.clientX, pr.sy - ey) < Math.max(34, rad)) {
            hoverSign = ORBITS[k].sign;
            break;
          }
        }
      }

      canvas.style.cursor = bestStar >= 0 || hoverSign ? "pointer" : "default";
      const tip = tooltipRef.current;
      if (tip) {
        if (bestStar >= 0) {
          const st = fig.stars[bestStar];
          const pos = starPos(fig, bestStar, gather);
          const pr = project(pos.x, pos.y, d, f, cx, cy)!;
          tip.textContent = st.name
            ? `${CATS[bestStar % CATS.length]} · ${st.name}`
            : CATS[bestStar % CATS.length];
          tip.style.opacity = "1";
          tip.style.left = `${pr.sx}px`;
          tip.style.top = `${pr.sy - 30}px`;
        } else {
          tip.style.opacity = "0";
        }
      }
    };

    const onClick = () => {
      if (morphRef.current) return;
      if (hoverIdx >= 0) {
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
        return;
      }
      if (hoverSign) selectRef.current(hoverSign);
    };

    const onDown = (e: PointerEvent) => {
      updateHover(e);
      press.held = true;
      press.since = performance.now();
      press.waved = false;
    };
    const onUp = () => {
      press.held = false;
      press.flashed = false;
    };

    const draw = (now: number) => {
      if (!running) return;
      const t = now / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      /* long-press: on a star = energy; on the sky = the golden ritual */
      const overStar = hoverIdx >= 0;
      const holding = press.held && now - press.since > 450;
      if (holding && overStar && !press.waved) {
        press.waved = true;
        onClick();
      }
      const wantRitual = holding && !overStar ? 1 : 0;
      press.ritual += (wantRitual - press.ritual) * (wantRitual ? 0.03 : 0.05);
      const rit = press.ritual;
      if (rit > 0.96 && !press.flashed) {
        press.flashed = true;
        press.flash = now;
      }

      const env = morphEnv(now);
      const fig = getFigure(signRef.current);
      const emblem = getEmblem(signRef.current);
      const { p, d, f, cx, cy } = frameParams(now);

      /* living background */
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0, `rgba(28, 12, 17, ${1 - rit * 0.35})`);
      bg.addColorStop(0.55, "#100608");
      bg.addColorStop(1, "#0A0608");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      /* camera roll: barely there, stronger while travelling between signs */
      let roll = reduced ? 0 : Math.sin(t * 0.05) * 0.006 + rit * 0.015;
      if (morphRef.current) {
        const mt = (now - morphRef.current.start) / 1000;
        roll += Math.sin(Math.min(1, mt / 2.5) * Math.PI) * 0.05;
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(roll);
      ctx.translate(-cx, -cy);

      /* nebula — soft volumes drifting far away */
      for (const nb of NEBULAE) {
        const dist = nb.z - (FZ - d);
        const pr = project(nb.x + nb.dx * t, nb.y, dist, f, cx, cy);
        if (!pr) continue;
        const breathe = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 0.12 + nb.z);
        softDot(ctx, pr.sx, pr.sy, nb.R * pr.s, nb.color, nb.alpha * breathe * (1 - rit * 0.5), 0.5);
      }

      const gather = smooth(0.36, 0.5, p);
      const dustDim = (1 - 0.4 * smooth(0.72, 0.9, p)) * (1 - rit * 0.55);
      for (const pt of dust) {
        const wx = pt.x + pt.dx * (reduced ? 0 : t);
        const wy = pt.y + pt.dy * (reduced ? 0 : t);
        let rel = (pt.z - (FZ - d)) % DEPTH;
        if (rel < 0) rel += DEPTH;
        rel += 0.2;
        const pr = project(wx, wy, rel, f, cx, cy);
        if (!pr) continue;
        if (pr.sx < -60 || pr.sx > W + 60 || pr.sy < -60 || pr.sy > H + 60) continue;
        const twk = reduced ? 1 : 0.6 + 0.4 * Math.sin(pt.tw + t * pt.twS);
        const r = Math.max(0.4, pt.size * pr.s);
        if (rel < 2) {
          const bok = 1 - smooth(0.2, 2, rel);
          softDot(ctx, pr.sx, pr.sy, r * (1 + bok * 5), pt.color, (0.24 - bok * 0.17) * twk * dustDim, 0);
        } else {
          softDot(ctx, pr.sx, pr.sy, r * 2.5, pt.color, Math.min(0.8, 2.6 / rel + 0.1) * twk * dustDim, 0.3);
        }
      }

      /* ── the observatory: eleven constellations in slow orbit ── */
      const obsAlpha = smooth(0.24, 0.36, p) * (1 - rit * 0.6);
      if (obsAlpha > 0.01) {
        ctx.letterSpacing = "2px";
        ctx.font = "600 12px 'Hanken Grotesk', system-ui, sans-serif";
        ctx.textAlign = "center";
        for (let k = 0; k < ORBITS.length; k++) {
          const o = ORBITS[k];
          if (o.sign === signRef.current) continue;
          const { pr, dist } = miniCenter(k, now, d, f, cx, cy);
          if (!pr || dist < 0.4) continue;
          const mini = getMini(o.sign);
          const hovered = hoverSign === o.sign;
          const scale = pr.s * 0.62 * (hovered ? 1.06 : 1);
          const pulse = reduced ? 1 : 0.9 + 0.1 * Math.sin(t * 0.7 + k);
          const a = obsAlpha * (hovered ? 1 : 0.78) * Math.min(1, 4.6 / dist) * pulse;

          /* orbit halo — always faintly present, alive on hover */
          softDot(ctx, pr.sx, pr.sy, scale * 0.9, ORO, hovered ? 0.14 : 0.05, 0.5);

          for (const [la, lb] of mini.lines) {
            const A = mini.pts[la];
            const B = mini.pts[lb];
            ctx.strokeStyle = `rgba(217,174,111,${a * 0.65})`;
            ctx.lineWidth = hovered ? 0.9 : 0.7;
            ctx.beginPath();
            ctx.moveTo(pr.sx + A.x * scale, pr.sy + A.y * scale);
            ctx.lineTo(pr.sx + B.x * scale, pr.sy + B.y * scale);
            ctx.stroke();
          }
          for (const st of mini.pts) {
            const anchorStar = st.mag <= 2.3;
            const sr = anchorStar ? 2.6 : 1.7;
            const sx = pr.sx + st.x * scale;
            const sy = pr.sy + st.y * scale;
            softDot(ctx, sx, sy, sr * (hovered ? 2.8 : 2.3), hovered ? ORO_LUZ : LECHE, a, 0.4);
            if (anchorStar) {
              ctx.fillStyle = `rgba(255,233,194,${a * 0.95})`;
              sparklePath(ctx, sx, sy, sr * 1.4);
            }
          }
          /* the name is always there — a chart label, brighter on hover;
             clamped so it never bleeds off the edge of the sky */
          const label = FIGURES[o.sign].label;
          const half = ctx.measureText(label).width / 2;
          const lx = Math.min(W - half - 12, Math.max(half + 12, pr.sx));
          const ly = Math.min(H - 10, pr.sy + scale * 0.62 + 18);
          ctx.fillStyle = `rgba(244,236,222,${obsAlpha * (hovered ? 0.9 : 0.4) * Math.min(1, 4.6 / dist)})`;
          ctx.fillText(label, lx, ly);
        }
        ctx.letterSpacing = "0px";
      }

      /* ── the emblem: ancient ink behind the stars ── */
      const reveal = smooth(0.74, 0.94, p) * env;
      const emblemA = (reveal * 0.34 + rit * 0.35) * (0.8 + 0.2 * Math.sin(t * 0.4));
      if (emblemA > 0.01) {
        const frame = Math.min(FRAMES - 1, Math.floor((reveal * 0.85 + rit * 0.15) * (FRAMES - 1) + rit * 3));
        const img = emblem[frame];
        if (img?.complete && img.naturalWidth > 0) {
          const eh = (FIG_S * f) / d;
          const ew = eh * (img.naturalWidth / img.naturalHeight);
          ctx.globalCompositeOperation = "screen";
          ctx.globalAlpha = Math.min(0.8, emblemA);
          ctx.drawImage(img, cx - ew / 2, cy - eh / 2, ew, eh);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
        }
      }

      /* dissolving figure → orbiting golden dust */
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

      /* ── the visited constellation ── */
      const goldMix = rit;
      const lineColor = mixC(ORO, ORO_LUZ, goldMix);

      fig.lines.forEach(([a, b], i) => {
        const ls = 0.5 + (i / fig.lines.length) * 0.16;
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
        /* the glow is a wide low-alpha understroke — never shadowBlur,
           which forces a blur pass per draw call */
        ctx.lineCap = "round";
        ctx.strokeStyle = `rgba(${lineColor[0]},${lineColor[1]},${lineColor[2]},${0.16 * lt * shimmer})`;
        ctx.lineWidth = lt >= 1 ? 4 : 2.4;
        ctx.beginPath();
        ctx.moveTo(A.sx, A.sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.strokeStyle = `rgba(${lineColor[0]},${lineColor[1]},${lineColor[2]},${(0.4 + goldMix * 0.3) * lt * shimmer})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(A.sx, A.sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        if (lt >= 1 && !reduced) {
          const k = (t * 0.14 + i * 0.37) % 1;
          softDot(ctx, A.sx + (B.sx - A.sx) * k, A.sy + (B.sy - A.sy) * k, 5, ORO_LUZ, 0.5 + goldMix * 0.3, 0.45);
        }
      });

      fig.stars.forEach((st, i) => {
        const bs = 0.4 + i * 0.024;
        const birth = smooth(bs, bs + 0.045, p) * env;
        if (birth <= 0.01) return;
        const pos = starPos(fig, i, gather);
        const pr = project(pos.x, pos.y, d, f, cx, cy);
        if (!pr) return;
        const hero = st.mag <= 2.3;

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
        // the sparkle's bloom: one extra soft stamp instead of shadowBlur
        softDot(ctx, pr.sx, pr.sy, R * 1.5, color, alpha * 0.5, 0.4);
        ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${Math.min(1, alpha + 0.2)})`;
        sparklePath(ctx, pr.sx, pr.sy, R);
        softDot(ctx, pr.sx, pr.sy, R * 0.5, [255, 255, 255], alpha * (hero ? 0.95 : 0.6), 0.45);

        /* tiny particles escaping the star, very subtle */
        if (!reduced && birth >= 1) {
          const ek = (t * 0.1 + i * 0.6) % 1;
          softDot(ctx, pr.sx + R * 2 * ek, pr.sy - R * (1 + ek), 1.6, color, (1 - ek) * 0.35, 0.4);
        }

        if (birth < 1 && birth > 0.02) {
          const br = R * (1 + birth * 4);
          ctx.strokeStyle = `rgba(${color[0]},${color[1]},${color[2]},${(1 - birth) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pr.sx, pr.sy, br, 0, Math.PI * 2);
          ctx.stroke();
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2 + st.tw;
            softDot(ctx, pr.sx + Math.cos(a) * br * 1.1, pr.sy + Math.sin(a) * br * 1.1, 2.4, color, (1 - birth) * 0.7, 0.4);
          }
        }
      });

      ctx.restore();

      if (press.flash && now - press.flash < 900) {
        const ft = (now - press.flash) / 900;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.6);
        g.addColorStop(0, `rgba(255, 246, 229, ${(1 - ft) * 0.28})`);
        g.addColorStop(1, "rgba(255,246,229,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

    };

    resize();
    const stopLoop = runWhenVisible(canvas, draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      running = false;
      stopLoop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollYProgress]);

  const hintOpacity = useTransform(scrollYProgress, [0.3, 0.38, 0.5, 0.56], [0, 1, 1, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.88, 0.94], [0, 1]);
  const def = FIGURES[sign];
  const anchor = def.stars.find((s) => s.name && s.role);

  return (
    <section id="constelacion" ref={ref} className="relative h-[520vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [touch-action:pan-y] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_84%,transparent_100%)]"
        />

        {/* floating typography — no box, just light */}
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full whitespace-nowrap font-serif text-base italic text-cream/90 opacity-0 transition-opacity duration-300 [text-shadow:0_0_18px_rgba(217,174,111,0.6)]"
        />

        {/* the chapter opens */}
        <Overlay progress={scrollYProgress} range={[0.02, 0.06, 0.14, 0.19]}>
          <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold/80">
            Capítulo IV · El observatorio
          </p>
          <h2 className="font-sans text-4xl font-black leading-[1.08] tracking-tight text-cream sm:text-6xl">
            Tu constelación no se desbloquea.{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              Se revela.
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-md text-lg leading-relaxed text-cream/60">
            Cada acción repetida enciende otra estrella. Con el tiempo, esas
            estrellas se vuelven algo que reconoces.
          </p>
        </Overlay>

        {/* observatory hint */}
        <motion.p
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-10 z-10 text-center text-[11.5px] uppercase tracking-[0.3em] text-cream/35"
        >
          Explora el cielo — viaja a otra constelación
        </motion.p>

        {/* the discovery, named + the closing invitation */}
        <motion.div
          style={{ opacity: ctaOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[max(8%,5.5rem)] z-10 mx-auto max-w-xl px-6 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/30" />
            <p className="text-[13px] uppercase tracking-[0.35em] text-gold">
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

        <motion.div
          style={{ opacity: ctaOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-10 z-20 mx-auto max-w-lg px-6 text-center"
        >
          <p className="text-base leading-relaxed text-cream/65">
            Estas constelaciones existen desde hace siglos.{" "}
            <span className="font-serif italic text-gold">La tuya no.</span>
          </p>
          <p className="mt-1 text-base text-cream/65">
            La revelarás con tus propios datos.
          </p>
          <a
            href="#beta"
            className="pointer-events-auto mt-6 inline-flex items-center justify-center rounded-full bg-pink-soft px-8 py-3.5 text-sm font-semibold tracking-wide text-cream transition-all duration-500 hover:shadow-[0_0_40px_rgba(233,30,99,0.45)]"
          >
            Revela mi constelación
          </a>
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
      className="pointer-events-none absolute inset-x-0 top-[max(14%,5.5rem)] z-10 mx-auto max-w-3xl px-6 text-center"
    >
      {children}
    </motion.div>
  );
}
