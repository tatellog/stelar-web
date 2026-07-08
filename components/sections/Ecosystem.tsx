"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { softDot, colorA, prand, ramp } from "@/lib/canvas";
import { useSign } from "../SignContext";
import { figureArt } from "@/lib/zodiac/helpers";

/**
 * Capítulo VII — Todo termina en un mismo universo.
 * Not a layout of logos around a hole: a gravitational phenomenon.
 * Scattered apps float at different depths. A force is born at the
 * center — lensing, an accretion disk of fast particles, light bending.
 * Each astro falls with its own physics: some orbit once, some almost
 * escape, all stretch and break into brand-colored particles at the
 * horizon. Then silence. Then the hole gives back: rivers of gold that
 * settle into the visitor's real constellation, with the emblem
 * emerging faintly behind. apps dispersas → datos absorbidos →
 * energía transformada → constelación revelada.
 */

type Source = {
  id: string;
  name: string;
  icon: string;
  tint: string;
  hx: number; // scattered home, fraction of viewport
  hy: number;
  depth: number; // 0.4 far — 1 near (scale, blur, alpha)
  swirl: number; // radians of gravitational curve while falling
  escape: number; // how much it swings outward before falling
  accel: number; // fall easing exponent (higher = accelerates later)
  order: number;
};

const SOURCES: Source[] = [
  { id: "googlefit", name: "Google Fit", icon: "/brands/googlefit.svg", tint: "#FFD36B", hx: 0.16, hy: 0.24, depth: 0.9, swirl: 1.8, escape: 0, accel: 1.7, order: 0 },
  { id: "fitbit", name: "Fitbit", icon: "/brands/fitbit.svg", tint: "#6FD6B8", hx: 0.82, hy: 0.17, depth: 0.7, swirl: -2.4, escape: 0.16, accel: 1.3, order: 1 },
  { id: "whoop", name: "WHOOP", icon: "/brands/whoop.svg", tint: "#F4ECDE", hx: 0.31, hy: 0.7, depth: 0.5, swirl: 0.9, escape: 0, accel: 2, order: 2 },
  { id: "garmin", name: "Garmin", icon: "/brands/garmin.svg", tint: "#7FB4E8", hx: 0.88, hy: 0.6, depth: 1, swirl: 5.6, escape: 0, accel: 1.15, order: 3 },
  { id: "samsung", name: "Samsung Health", icon: "/brands/samsung.svg", tint: "#9FC2F0", hx: 0.11, hy: 0.52, depth: 0.6, swirl: -1.2, escape: 0.32, accel: 1.4, order: 4 },
  { id: "oura", name: "Oura", icon: "/brands/ouraring.svg", tint: "#C18FFF", hx: 0.44, hy: 0.13, depth: 0.8, swirl: 2.8, escape: 0, accel: 1.8, order: 5 },
  { id: "polar", name: "Polar", icon: "/brands/polar.svg", tint: "#FF6B7E", hx: 0.68, hy: 0.86, depth: 0.55, swirl: -0.7, escape: 0, accel: 2.2, order: 6 },
  { id: "strava", name: "Strava", icon: "/brands/strava.svg", tint: "#FF9E57", hx: 0.24, hy: 0.4, depth: 0.95, swirl: -5.2, escape: 0, accel: 1.15, order: 7 },
  { id: "suunto", name: "Suunto", icon: "/brands/suunto.svg", tint: "#F4ECDE", hx: 0.6, hy: 0.28, depth: 0.45, swirl: 1.4, escape: 0.2, accel: 1.5, order: 8 },
  { id: "huawei", name: "Huawei Health", icon: "/brands/huawei.svg", tint: "#FF8B8B", hx: 0.9, hy: 0.38, depth: 0.65, swirl: -2, escape: 0, accel: 1.6, order: 9 },
  { id: "applewatch", name: "Apple Watch", icon: "/brands/apple.svg", tint: "#F7EFDF", hx: 0.4, hy: 0.84, depth: 1, swirl: 3.2, escape: 0, accel: 1.3, order: 10 },
  { id: "applehealth", name: "Apple Health", icon: "/brands/apple.svg", tint: "#FFB3C2", hx: 0.79, hy: 0.74, depth: 0.9, swirl: -3, escape: 0.12, accel: 1.4, order: 11 },
];

const FALL0 = 0.42;
const FALL_STEP = 0.028;
const FALL_LEN = 0.055;

const N_DISK = 84; // fast particles riding the accretion disk
const N_DUST = 70;
const N_GOLD = 150; // the rivers of gold

export default function Ecosystem() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const { sign } = useSign();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useEffect(() =>
    scrollYProgress.on("change", (v) => {
      progress.current = v;
    }),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.parentElement?.clientWidth ?? 0;
      H = canvas.parentElement?.clientHeight ?? 0;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // brand icons + the sign's emblem
    const icons = new Map<string, HTMLImageElement>();
    for (const s of SOURCES) {
      if (!icons.has(s.icon)) {
        const img = new Image();
        img.src = s.icon;
        icons.set(s.icon, img);
      }
    }
    const emblem = new Image();
    emblem.src = `/emblems/${sign}/f10.png`;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, sx: -1, sy: -1 };
    const manualFall = new Map<string, number>();
    const prevFall = new Map<string, number>();
    const pulses: { t0: number }[] = [];
    let hovered = -1;
    let starHover = -1;

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.sx = e.clientX - rect.left;
      pointer.sy = e.clientY - rect.top;
      pointer.tx = (pointer.sx / W) * 2 - 1;
      pointer.ty = (pointer.sy / H) * 2 - 1;
    };

    const fallOf = (s: Source, p: number, t: number) => {
      const raw = ramp(p, FALL0 + s.order * FALL_STEP, FALL0 + s.order * FALL_STEP + FALL_LEN);
      const m = manualFall.get(s.id);
      const timeF = m === undefined ? 0 : Math.min(1, (t - m) / 1.5);
      const f = Math.max(raw, timeF);
      return Math.pow(f, s.accel); // each astro accelerates differently
    };

    /* gravitational trajectory: polar spiral from its scattered home */
    const sourcePos = (s: Source, p: number, t: number, cx: number, cy: number) => {
      const f = fallOf(s, p, t);
      const floatX = Math.sin(t * 0.22 + s.order * 2.3) * 9 * s.depth * (1 - f);
      const floatY = Math.cos(t * 0.18 + s.order * 1.7) * 7 * s.depth * (1 - f);
      const hx = s.hx * W + floatX;
      const hy = s.hy * H + floatY;

      const dx = hx - cx;
      const dy = hy - cy;
      const r0 = Math.hypot(dx, dy);
      const th0 = Math.atan2(dy, dx);

      // radius decays on a curve; some astros swing outward first
      const r = r0 * Math.pow(1 - f, 1.55) * (1 + s.escape * Math.sin(Math.PI * f));
      const th = th0 + s.swirl * f + pointer.x * 0.03 * (1 - f);
      return {
        x: cx + Math.cos(th) * r,
        y: cy + Math.sin(th) * r * 0.96,
        f,
      };
    };

    let raf = 0;
    const draw = (now: number) => {
      const t = now / 1000;
      const p = progress.current;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;

      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H);
      const cx = W / 2 + pointer.x * 12;
      const cy = H * 0.5 + pointer.y * 9;

      const grav1 = ramp(p, 0.16, 0.3); // the force being born
      const hole = ramp(p, 0.3, 0.42); // the hole materializes
      const silence = ramp(p, 0.78, 0.84);
      const emission = ramp(p, 0.83, 0.93); // rivers of gold
      const constel = ramp(p, 0.875, 0.965);
      const emblemP = ramp(p, 0.93, 1);

      const bhR = R * (0.024 * grav1 + 0.078 * hole);
      const diskAlpha = hole * (1 - silence * 0.55) * (1 - emission * 0.45);

      /* ── space dust: paths curve as gravity is born ───────────── */
      for (let i = 0; i < N_DUST; i++) {
        const bx = prand(i * 3.7) * W;
        const by = prand(i * 8.3) * H;
        // straight drift becomes a curved fall toward the center
        const dxs = bx - cx;
        const dys = by - cy;
        const d = Math.hypot(dxs, dys) || 1;
        const pull = grav1 * 26000 / (d * d + 9000);
        const swirl = grav1 * 5200 / (d + 60);
        const ang = Math.atan2(dys, dxs) + Math.PI / 2;
        let x = bx - (dxs / d) * pull * 6 + Math.cos(ang) * swirl * 0.4 + Math.sin(t * 0.13 + i) * 6;
        let y = by - (dys / d) * pull * 6 + Math.sin(ang) * swirl * 0.4 + Math.cos(t * 0.11 + i * 1.7) * 5;
        if (pointer.sx >= 0) {
          const pd = Math.hypot(pointer.sx - x, pointer.sy - y);
          if (pd < 200) {
            x += ((pointer.sx - x) / pd) * (1 - pd / 200) * 7;
            y += ((pointer.sy - y) / pd) * (1 - pd / 200) * 7;
          }
        }
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.5 + i * 2.4));
        softDot(ctx, x, y, 1.2 + prand(i * 13.7) * 1.7, "#F4ECDE", 0.2 * tw, 0.4);
      }

      /* ── the gravitational lens: space darkens toward the center ── */
      if (grav1 > 0) {
        const lens = ctx.createRadialGradient(cx, cy, 0, cx, cy, bhR * 4 + R * 0.05);
        lens.addColorStop(0, `rgba(1,0,1,${0.55 * grav1})`);
        lens.addColorStop(0.5, `rgba(1,0,1,${0.22 * grav1})`);
        lens.addColorStop(1, "rgba(1,0,1,0)");
        ctx.fillStyle = lens;
        ctx.fillRect(0, 0, W, H);
      }

      /* ── the black hole, alive ────────────────────────────────── */
      if (hole > 0.01) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.16 + pointer.x * 0.025);

        // fast particles riding the disk — streaks, motion blur
        for (let i = 0; i < N_DISK; i++) {
          const rd = bhR * (1.18 + prand(i * 3.1) * 1.5);
          const w = (1.1 + prand(i * 5.3) * 1.4) * (bhR * 42) / (rd + 1); // faster inside
          const phi = prand(i * 7.7) * Math.PI * 2 + t * w * 0.11;
          const x1 = Math.cos(phi) * rd;
          const y1 = Math.sin(phi) * rd * 0.3;
          const trail = 0.1 + prand(i * 9.1) * 0.14;
          const x2 = Math.cos(phi - trail) * rd;
          const y2 = Math.sin(phi - trail) * rd * 0.3;
          const front = Math.sin(phi) > 0 ? 1.35 : 0.75; // light bends: brighter in front
          const warm = prand(i * 11.3) > 0.32;
          const col = warm ? "#FFE9C2" : "#FF7EA6";
          const a = (0.1 + prand(i * 13.9) * 0.2) * diskAlpha * front;
          ctx.strokeStyle = colorA(col, a);
          ctx.lineWidth = 0.8 + prand(i * 17.3) * 1.1;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }

        // pulses riding the disk after each absorption
        for (const pu of pulses) {
          const age = t - pu.t0;
          if (age > 1.4) continue;
          const sweep = age * 5;
          ctx.strokeStyle = colorA("#FFE9C2", 0.45 * (1 - age / 1.4) * diskAlpha);
          ctx.lineWidth = bhR * 0.14;
          ctx.beginPath();
          ctx.ellipse(0, 0, bhR * 1.7, bhR * 0.5, 0, sweep, sweep + 1);
          ctx.stroke();
        }

        // the lensed halo: light bending above and below
        ctx.strokeStyle = colorA("#FFE9C2", 0.15 * diskAlpha);
        ctx.lineWidth = bhR * 0.09;
        ctx.beginPath();
        ctx.ellipse(0, 0, bhR * 1.42, bhR * 1.42, 0, Math.PI * 1.06, Math.PI * 1.94);
        ctx.stroke();
        ctx.strokeStyle = colorA("#FFE9C2", 0.07 * diskAlpha);
        ctx.beginPath();
        ctx.ellipse(0, 0, bhR * 1.42, bhR * 1.42, 0, Math.PI * 0.12, Math.PI * 0.88);
        ctx.stroke();

        // photon ring
        ctx.strokeStyle = colorA("#FFF6E5", (0.3 * hole + 0.05) * (1 - emission * 0.3));
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.ellipse(0, 0, bhR * 1.05, bhR * 1.05, 0, 0, Math.PI * 2);
        ctx.stroke();

        // event horizon
        const core = ctx.createRadialGradient(0, 0, 0, 0, 0, bhR);
        core.addColorStop(0, "rgba(1,0,1,1)");
        core.addColorStop(0.85, "rgba(1,0,1,0.98)");
        core.addColorStop(1, "rgba(1,0,1,0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(0, 0, bhR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        if (t - pulses[i].t0 > 1.5) pulses.splice(i, 1);
      }

      /* ── the scattered astros ─────────────────────────────────── */
      const labels = ramp(p, 0.1, 0.2);
      hovered = -1;
      let hoverD = 42;

      SOURCES.forEach((s, i) => {
        const born = ramp(p, 0.03 + i * 0.012, 0.09 + i * 0.012);
        if (born <= 0) return;
        const pos = sourcePos(s, p, t, cx, cy);
        const { f } = pos;
        if (f >= 1) return;

        if (pointer.sx >= 0 && f < 0.05) {
          const d = Math.hypot(pointer.sx - pos.x, pointer.sy - pos.y);
          if (d < hoverD) {
            hoverD = d;
            hovered = i;
          }
        }
        const isHover = hovered === i;

        const size = (7.5 + s.depth * 7.5) * (isHover ? 1.12 : 1);
        const bright = born * (0.35 + s.depth * 0.5) * (1 + f * 1.6) * (isHover ? 1.4 : 1);
        const stretch = ramp(f, 0.78, 0.96);
        const iconFade = 1 - ramp(f, 0.84, 0.96);
        const dirAng = Math.atan2(cy - pos.y, cx - pos.x);

        if (iconFade > 0.01) {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(dirAng);
          ctx.scale(1 + stretch * 2.6, 1 - stretch * 0.6);
          ctx.rotate(-dirAng + (isHover ? Math.sin(t * 2.2) * 0.07 : 0));

          // far astros are softer and blurrier — depth, not layout
          const halo = size * (2.3 + (1 - s.depth) * 1.6);
          softDot(ctx, 0, 0, halo, s.tint, Math.min(0.55, bright * 0.45) * iconFade, 0.26 + s.depth * 0.14);
          const body = ctx.createRadialGradient(-size * 0.25, -size * 0.25, 0, 0, 0, size * 0.85);
          body.addColorStop(0, colorA("#2A171D", 0.92 * iconFade));
          body.addColorStop(1, colorA("#120709", 0.92 * iconFade));
          ctx.fillStyle = body;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = colorA(s.tint, 0.35 * bright * iconFade);
          ctx.lineWidth = 0.9;
          ctx.stroke();

          const img = icons.get(s.icon);
          if (img?.complete && img.naturalWidth > 0) {
            const iw = size * 0.94;
            ctx.globalAlpha = Math.min(1, (0.35 + s.depth * 0.55) * (1 + f) + (isHover ? 0.3 : 0)) * iconFade;
            ctx.drawImage(img, -iw / 2, -iw / 2, iw, iw);
            ctx.globalAlpha = 1;
          }
          ctx.restore();

          // hover: it breathes small particles
          if (isHover) {
            for (let k = 0; k < 6; k++) {
              const ka = t * 1.4 + (k / 6) * Math.PI * 2;
              const kr = size * (1.7 + 0.4 * Math.sin(t * 2.1 + k * 2));
              softDot(ctx, pos.x + Math.cos(ka) * kr, pos.y + Math.sin(ka) * kr * 0.8, 2.2, s.tint, 0.5, 0.45);
            }
          }

          const la = (labels * (0.3 + s.depth * 0.35) + (isHover ? 0.55 : 0)) * iconFade * born;
          if (la > 0.02) {
            ctx.fillStyle = colorA("#F4ECDE", Math.min(0.92, la));
            ctx.font = "600 10px 'Hanken Grotesk', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(s.name.toUpperCase(), pos.x, pos.y + size * 1.9 + 10);
          }
        }

        // disintegration: hundreds of brand-colored particles
        const burst = ramp(f, 0.8, 1);
        if (burst > 0 && burst < 1) {
          for (let k = 0; k < 44; k++) {
            const kk = Math.min(1, burst * 1.5 - prand(i * 31 + k * 7) * 0.5);
            if (kk <= 0) continue;
            const ja = prand(i * 13 + k * 3) * Math.PI * 2;
            const jr = prand(i * 17 + k * 5) * size * 1.4;
            const sx0 = pos.x + Math.cos(ja) * jr;
            const sy0 = pos.y + Math.sin(ja) * jr * 0.7;
            const baseAng = Math.atan2(sy0 - cy, sx0 - cx);
            const sw = (1 - kk) * 2.2;
            const tx = cx + Math.cos(baseAng + sw) * bhR * 0.5;
            const ty = cy + Math.sin(baseAng + sw) * bhR * 0.32;
            softDot(ctx, sx0 + (tx - sx0) * kk, sy0 + (ty - sy0) * kk, 1.5 + prand(k * 9.1) * 2, s.tint, (1 - kk) * 0.7, 0.4);
          }
        }

        const pf = prevFall.get(s.id) ?? 0;
        if (pf < 0.96 && f >= 0.96) pulses.push({ t0: t });
        prevFall.set(s.id, f);
      });

      /* ── the transformation: rivers of gold ───────────────────── */
      const fig = figureArt(sign, R * 0.54);
      const figCx = cx;
      const figCy = cy;
      const stars = fig.pts.map((pt) => ({ x: figCx + pt.x, y: figCy + pt.y, mag: pt.mag }));

      if (emission > 0) {
        for (let i = 0; i < N_GOLD; i++) {
          const u = prand(i * 3.3);
          const streamId = i % 4;
          const w = Math.max(0, Math.min(1, emission * 1.45 - u * 0.45));
          if (w <= 0) continue;
          // a curved river out of the hole
          const baseAng = (streamId / 4) * Math.PI * 2 + 0.8;
          const ang = baseAng + w * 2.3 + Math.sin(t * 0.2 + i) * 0.04;
          const rad = w * R * 0.4 + bhR * 0.4;
          const rx = cx + Math.cos(ang) * rad;
          const ry = cy + Math.sin(ang) * rad * 0.82;
          // …that settles into the constellation
          const st = stars[i % stars.length];
          const grab = ramp(p, 0.88, 0.94);
          const jx = (prand(i * 7.9) - 0.5) * 26 * (1 - grab);
          const jy = (prand(i * 9.7) - 0.5) * 26 * (1 - grab);
          const x = rx + (st.x + jx - rx) * grab;
          const y = ry + (st.y + jy - ry) * grab;
          const settle = ramp(constel, 0.5, 1);
          const a = Math.sin(Math.min(1, w) * Math.PI) * 0.55 * emission * (1 - settle * 0.85);
          softDot(ctx, x, y, 1.6 + prand(i * 5.1) * 2.2, i % 5 === 0 ? "#FFF6E5" : "#E8B872", a, 0.42);
        }
      }

      /* ── the constellation, born from the energy ──────────────── */
      starHover = -1;
      if (constel > 0) {
        // the emblem emerges behind — hidden, ancient, celestial
        if (emblemP > 0 && emblem.complete && emblem.naturalWidth > 0) {
          const es = R * 0.54;
          const shimmer = 0.9 + 0.1 * Math.sin(t * 0.7);
          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.globalAlpha = emblemP * 0.3 * shimmer;
          ctx.drawImage(emblem, figCx - es / 2, figCy - es / 2, es, es);
          ctx.restore();
          // it emerges FROM particles: a dust of gold over its surface
          for (let k = 0; k < 30; k++) {
            const ex = figCx + (prand(k * 3.7) - 0.5) * es * 0.8;
            const ey = figCy + (prand(k * 5.3) - 0.5) * es * 0.8;
            const ea = Math.sin(t * 0.9 + k * 2.1);
            if (ea <= 0.2) continue;
            softDot(ctx, ex, ey, 1.6, "#FFE9C2", 0.3 * ea * emblemP * (1.2 - emblemP), 0.45);
          }
        }

        // star hover?
        if (pointer.sx >= 0) {
          let bd = 34;
          stars.forEach((st, k) => {
            const d = Math.hypot(pointer.sx - st.x, pointer.sy - st.y);
            if (d < bd) {
              bd = d;
              starHover = k;
            }
          });
        }

        // lines: stroke animation + sparks riding them
        fig.lines.forEach(([a, b], li) => {
          const lt = ramp(p, 0.905 + li * 0.006, 0.925 + li * 0.006);
          if (lt <= 0) return;
          const A = stars[a];
          const B = stars[b];
          const ex = A.x + (B.x - A.x) * lt;
          const ey = A.y + (B.y - A.y) * lt;
          const isHot = starHover === a || starHover === b;
          ctx.strokeStyle = colorA("#D9AE6F", (0.34 + (isHot ? 0.3 : 0)) * lt);
          ctx.lineWidth = isHot ? 1.2 : 0.8;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          if (lt >= 1) {
            const k = (t * 0.16 + li * 0.37) % 1;
            softDot(ctx, A.x + (B.x - A.x) * k, A.y + (B.y - A.y) * k, 3.4, "#FFE9C2", 0.5, 0.45);
          }
        });

        // stars: ignite one by one, breathe, small flare
        stars.forEach((st, k) => {
          const born = ramp(p, 0.885 + k * 0.007, 0.9 + k * 0.007);
          if (born <= 0) return;
          const hero = st.mag <= 2.3;
          const isHot = starHover === k;
          const breath = 1 + (isHot ? 0.16 : 0.07) * Math.sin(t * 1.6 + k * 2.4);
          const r = (hero ? 3.4 : 2.2) * breath * (isHot ? 1.2 : 1);
          softDot(ctx, st.x, st.y, r * 5.2, hero ? "#FBD7E3" : "#E8B872", born * (hero ? 0.5 : 0.38), 0.3);
          // a small flare — short cross rays, never huge
          ctx.strokeStyle = colorA("#FFF6E5", 0.5 * born);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(st.x - r * 2.1, st.y);
          ctx.lineTo(st.x + r * 2.1, st.y);
          ctx.moveTo(st.x, st.y - r * 2.1);
          ctx.lineTo(st.x, st.y + r * 2.1);
          ctx.stroke();
          softDot(ctx, st.x, st.y, r, "#FFF6E5", born * 0.95, 0.5);
        });

        // hover tooltip — no box, just words
        if (starHover >= 0 && pointer.sx >= 0) {
          ctx.fillStyle = colorA("#E8B872", 0.9);
          ctx.font = "italic 500 15px 'Cormorant Garamond', serif";
          ctx.textAlign = "center";
          ctx.fillText("Tus datos ya no viven separados.", pointer.sx, pointer.sy - 22);
        }
      }

      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onClick = () => {
      if (hovered < 0) return;
      const s = SOURCES[hovered];
      if (!manualFall.has(s.id)) manualFall.set(s.id, performance.now() / 1000);
    };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("click", onClick);
    };
  }, [sign]);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.07, 0.16, 0.23], [0, 1, 1, 0]);
  const finalOpacity = useTransform(p, [0.94, 0.98], [0, 1]);
  const finalY = useTransform(p, [0.94, 0.99], [22, 0]);

  return (
    <section ref={ref} className="relative h-[520vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[9%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VII · Un mismo universo
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Miles de señales.{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              Una sola historia.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Tus datos viven en muchos lugares. Stelar los reúne para encontrar
            lo que normalmente no puedes ver.
          </p>
        </motion.div>

        {/* after the transformation */}
        <motion.div
          style={{ opacity: finalOpacity, y: finalY }}
          className="pointer-events-none absolute inset-x-0 top-[7%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <h2 className="font-sans text-2xl font-black leading-[1.12] tracking-tight text-cream sm:text-4xl">
            Tus datos nunca estuvieron{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              separados.
            </span>
          </h2>
          <p className="mt-3 font-serif text-lg italic text-cream/70">
            Solo necesitaban un lugar donde encontrarse.
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: finalOpacity }}
          className="absolute inset-x-0 bottom-[8%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="pointer-events-none mx-auto max-w-lg text-sm leading-relaxed text-cream/60 sm:text-base">
            Stelar reúne tus señales de comida, movimiento, sueño, peso y
            wearables para convertirlas en evidencia visual.
          </p>
          <a
            href="#beta"
            className="mt-4 inline-flex items-center gap-1.5 text-sm tracking-wide text-pink transition-colors hover:text-cream"
          >
            Conecta tu universo <span aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
