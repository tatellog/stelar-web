"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { softDot, colorA, prand, ramp } from "@/lib/canvas";

/**
 * Capítulo VII — Todo termina en un mismo lugar.
 * Not integrations: transformation. An elegant black hole — gravity,
 * slow matter, space dust. Each data source is a small planet with its
 * own light and orbit. The gravity grows, the orbits deform, and one by
 * one the planets are pulled in: stretched, brightened, dissolved into
 * particles, absorbed — a wave rides the accretion disk, a small pink
 * pulse is born from the center. When everything has been absorbed, a
 * single Stelar-colored star is born, breathes, and builds the isotype
 * out of particles. Hypnotic, never terror.
 */

type Source = {
  id: string;
  name: string;
  icon: string;
  tint: string;
  a: number; // semi-major axis (fraction of min(W,H))
  e: number; // vertical squash
  tilt: number;
  speed: number;
  phase: number;
  depth: number; // 0 far — 1 near
  order: number; // fall order
};

const SOURCES: Source[] = [
  { id: "googlefit", name: "Google Fit", icon: "/brands/googlefit.svg", tint: "#FFC56B", a: 0.33, e: 0.42, tilt: -0.1, speed: 1.1, phase: 0.6, depth: 0.9, order: 0 },
  { id: "fitbit", name: "Fitbit", icon: "/brands/fitbit.svg", tint: "#8FD9C8", a: 0.42, e: 0.36, tilt: 0.14, speed: 0.85, phase: 2.1, depth: 0.75, order: 1 },
  { id: "whoop", name: "Whoop", icon: "/brands/whoop.svg", tint: "#F4ECDE", a: 0.29, e: 0.5, tilt: 0.24, speed: 1.25, phase: 3.4, depth: 0.6, order: 2 },
  { id: "garmin", name: "Garmin", icon: "/brands/garmin.svg", tint: "#8FBEDB", a: 0.46, e: 0.3, tilt: -0.18, speed: 0.7, phase: 4.6, depth: 1, order: 3 },
  { id: "samsung", name: "Samsung Health", icon: "/brands/samsung.svg", tint: "#A0BEFF", a: 0.38, e: 0.44, tilt: 0.06, speed: 0.95, phase: 5.5, depth: 0.65, order: 4 },
  { id: "oura", name: "Oura", icon: "/brands/ouraring.svg", tint: "#C18FFF", a: 0.31, e: 0.38, tilt: -0.26, speed: 1.15, phase: 1.2, depth: 0.85, order: 5 },
  { id: "polar", name: "Polar", icon: "/brands/polar.svg", tint: "#FF4886", a: 0.44, e: 0.4, tilt: 0.2, speed: 0.78, phase: 0.1, depth: 0.55, order: 6 },
  { id: "strava", name: "Strava", icon: "/brands/strava.svg", tint: "#FF9E57", a: 0.36, e: 0.34, tilt: -0.06, speed: 1.05, phase: 2.9, depth: 0.95, order: 7 },
  { id: "suunto", name: "Suunto", icon: "/brands/suunto.svg", tint: "#F4ECDE", a: 0.48, e: 0.46, tilt: 0.1, speed: 0.62, phase: 3.9, depth: 0.5, order: 8 },
  { id: "huawei", name: "Huawei Health", icon: "/brands/huawei.svg", tint: "#FF7878", a: 0.4, e: 0.32, tilt: -0.22, speed: 0.9, phase: 5.1, depth: 0.7, order: 9 },
  { id: "applewatch", name: "Apple Watch", icon: "/brands/apple.svg", tint: "#F4ECDE", a: 0.27, e: 0.46, tilt: 0.16, speed: 1.3, phase: 1.8, depth: 1, order: 10 },
  { id: "applehealth", name: "Apple Health", icon: "/brands/apple.svg", tint: "#FB7494", a: 0.34, e: 0.4, tilt: -0.14, speed: 1, phase: 4.2, depth: 0.9, order: 11 },
];

const BADGES = [
  " Apple Health",
  "⌚ Apple Watch",
  "🏃 Strava",
  "🛰 Garmin",
  "🌙 Oura",
  "🩵 Fitbit",
  "🏋 Google Fit",
  "＋ más próximamente",
];

// fall schedule: one by one, never together
const FALL0 = 0.46;
const FALL_STEP = 0.031;
const FALL_LEN = 0.05;

export default function Ecosystem() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);

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

    // brand icons
    const icons = new Map<string, HTMLImageElement>();
    for (const s of SOURCES) {
      if (!icons.has(s.icon)) {
        const img = new Image();
        img.src = s.icon;
        icons.set(s.icon, img);
      }
    }
    // the Stelar isotype + particle targets sampled from its pixels
    const iso = new Image();
    iso.src = "/art/stelar-icon-trim.png";
    let isoTargets: { x: number; y: number }[] = [];
    iso.onload = () => {
      const S = 56;
      const off = document.createElement("canvas");
      off.width = S;
      off.height = S;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(iso, 0, 0, S, S);
      const data = octx.getImageData(0, 0, S, S).data;
      const pts: { x: number; y: number }[] = [];
      for (let y = 0; y < S; y += 2) {
        for (let x = 0; x < S; x += 2) {
          if (data[(y * S + x) * 4 + 3] > 110) {
            pts.push({ x: x / S - 0.5, y: y / S - 0.5 });
          }
        }
      }
      // deterministic shuffle so assembly looks organic
      isoTargets = pts
        .map((pt, i) => ({ pt, k: prand(i * 7.7) }))
        .sort((u, v) => u.k - v.k)
        .map((u) => u.pt)
        .slice(0, 220);
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, sx: -1, sy: -1 };
    const manualFall = new Map<string, number>(); // id → t0 (s)
    type Pulse = { t0: number; kind: "wave" | "pink" };
    const pulses: Pulse[] = [];
    const prevFall = new Map<string, number>();
    let hovered = -1;

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.sx = e.clientX - rect.left;
      pointer.sy = e.clientY - rect.top;
      pointer.tx = (pointer.sx / W) * 2 - 1;
      pointer.ty = (pointer.sy / H) * 2 - 1;
    };

    /* fall of a source: scroll-driven, or time-driven when thrown */
    const fallOf = (s: Source, p: number, t: number) => {
      const scrollF = ramp(p, FALL0 + s.order * FALL_STEP, FALL0 + s.order * FALL_STEP + FALL_LEN);
      const m = manualFall.get(s.id);
      const timeF = m === undefined ? 0 : Math.min(1, (t - m) / 1.5);
      return Math.max(scrollF, timeF);
    };

    /* where a source lives right now (canvas coords) */
    const sourcePos = (s: Source, p: number, t: number, cx: number, cy: number, R: number) => {
      const grav = ramp(p, 0.4, 0.6);
      const approach = 1 + 0.32 * ramp(p, 0.24, 0.4);
      const f = fallOf(s, p, t);

      // the orbit slowly deforms before the fall
      const shrink = (1 - grav * 0.14) * Math.pow(1 - f, 1.65);
      const wobble = grav * Math.sin(t * 0.9 + s.phase * 3) * 0.03;
      const ang =
        s.phase +
        t * 0.1 * s.speed +
        f * (2.6 + s.depth) + // the spiral accelerates as it falls
        pointer.x * 0.05;
      const ax = s.a * R * approach * (shrink + wobble);
      const ay = ax * s.e;

      const ox = Math.cos(ang) * ax;
      const oy = Math.sin(ang) * ay;
      const tilt = s.tilt + pointer.x * 0.04;
      return {
        x: cx + ox * Math.cos(tilt) - oy * Math.sin(tilt),
        y: cy + ox * Math.sin(tilt) + oy * Math.cos(tilt),
        ang,
        f,
        near: 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(ang)), // pseudo-depth along the orbit
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
      const cx = W / 2 + pointer.x * 10;
      const cy = H * 0.5 + pointer.y * 8;

      const grav = ramp(p, 0.4, 0.62);
      const bhR = R * (0.028 + grav * 0.085); // the black hole grows slowly
      const starBirth = ramp(p, 0.87, 0.93);
      const isoBuild = ramp(p, 0.9, 0.97);

      /* ── space dust ─────────────────────────────────────────── */
      for (let i = 0; i < 60; i++) {
        const born = ramp(p, 0.02 + prand(i * 5.1) * 0.2, 0.1 + prand(i * 5.1) * 0.2);
        if (born <= 0) continue;
        // dust slowly drifts toward the center as gravity grows
        const bx = prand(i * 3.7) * W;
        const by = prand(i * 8.3) * H;
        const k = grav * 0.25 * prand(i * 11.1);
        const x = bx + (cx - bx) * k + Math.sin(t * 0.14 + i) * 6;
        const y = by + (cy - by) * k + Math.cos(t * 0.11 + i * 1.7) * 5;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.5 + i * 2.4));
        softDot(ctx, x, y, 1.3 + prand(i * 13.7) * 1.8, "#F4ECDE", 0.2 * tw * born, 0.4);
      }

      /* ── the black hole ─────────────────────────────────────── */
      const bhAlpha = 0.25 + grav * 0.75;
      // barely-there distortion at first: a whisper of a ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.16 + pointer.x * 0.02);

      // accretion disk: layered soft ellipses, gold into magenta
      const diskR = bhR * 2.5;
      for (let l = 0; l < 9; l++) {
        const k = l / 8;
        const rr = bhR * 1.25 + (diskR - bhR * 1.25) * k;
        const warm = k < 0.5;
        const col = warm ? "#FFE9C2" : "#E91E63";
        const la = (warm ? 0.11 : 0.05) * (1 - k) * bhAlpha;
        ctx.strokeStyle = colorA(col, la);
        ctx.lineWidth = bhR * 0.34 * (1 - k * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, rr, rr * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // waves riding the disk after each absorption
      for (const pu of pulses) {
        if (pu.kind !== "wave") continue;
        const age = t - pu.t0;
        if (age > 1.4) continue;
        const sweep = age * 5.2;
        ctx.strokeStyle = colorA("#FFE9C2", 0.5 * (1 - age / 1.4) * bhAlpha);
        ctx.lineWidth = bhR * 0.16;
        ctx.beginPath();
        ctx.ellipse(0, 0, bhR * 1.7, bhR * 0.51, 0, sweep, sweep + 1.1);
        ctx.stroke();
      }
      // photon ring — thin, warm, precise
      ctx.strokeStyle = colorA("#FFE9C2", 0.32 * bhAlpha + 0.04);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, bhR * 1.06, bhR * 1.06, 0, 0, Math.PI * 2);
      ctx.stroke();
      // the lensed halo arching over the top (the Interstellar signature)
      ctx.strokeStyle = colorA("#FFE9C2", 0.16 * bhAlpha);
      ctx.lineWidth = bhR * 0.1;
      ctx.beginPath();
      ctx.ellipse(0, 0, bhR * 1.45, bhR * 1.45, 0, Math.PI * 1.08, Math.PI * 1.92);
      ctx.stroke();
      // the event horizon: true dark
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, bhR);
      core.addColorStop(0, "rgba(2,1,2,1)");
      core.addColorStop(0.82, "rgba(2,1,2,0.98)");
      core.addColorStop(1, "rgba(2,1,2,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, bhR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // pink pulses: Stelar learning something
      for (const pu of pulses) {
        if (pu.kind !== "pink") continue;
        const age = t - pu.t0;
        if (age > 1.6) continue;
        const k = age / 1.6;
        ctx.strokeStyle = colorA("#FF4886", 0.38 * (1 - k));
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, bhR * 1.1 + k * R * 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        if (t - pulses[i].t0 > 1.7) pulses.splice(i, 1);
      }

      /* ── the sources: small planets in slow orbit ───────────── */
      const labels = ramp(p, 0.27, 0.36);
      hovered = -1;
      let hoverD = 40;

      SOURCES.forEach((s, i) => {
        const born = ramp(p, 0.07 + i * 0.013, 0.13 + i * 0.013);
        if (born <= 0) return;
        const pos = sourcePos(s, p, t, cx, cy, R);
        const { f } = pos;
        if (f >= 1) return; // absorbed

        // hover only while the sky is stable
        if (pointer.sx >= 0 && f < 0.05) {
          const d = Math.hypot(pointer.sx - pos.x, pointer.sy - pos.y);
          if (d < hoverD) {
            hoverD = d;
            hovered = i;
          }
        }
        const isHover = hovered === i;

        const depth = s.depth * pos.near;
        const size = (9 + depth * 7) * (1 + 0.32 * ramp(p, 0.24, 0.4));
        const bright = born * (0.5 + depth * 0.4) * (1 + f * 1.3) * (isHover ? 1.35 : 1);

        // stretched by gravity as it approaches the horizon
        const stretch = ramp(f, 0.72, 0.95);
        const dirAng = Math.atan2(cy - pos.y, cx - pos.x);
        const iconFade = 1 - ramp(f, 0.8, 0.94);

        if (iconFade > 0.01) {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(dirAng);
          ctx.scale(1 + stretch * 2.2, 1 - stretch * 0.55);
          ctx.rotate(-dirAng + (isHover ? Math.sin(t * 2.4) * 0.08 : 0));

          // its own light
          softDot(ctx, 0, 0, size * 2.6, s.tint, Math.min(0.6, bright * 0.5) * iconFade, 0.3);
          // the small planet
          const body = ctx.createRadialGradient(-size * 0.25, -size * 0.25, 0, 0, 0, size * 0.85);
          body.addColorStop(0, colorA("#2A171D", 0.95 * iconFade));
          body.addColorStop(1, colorA("#120709", 0.95 * iconFade));
          ctx.fillStyle = body;
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = colorA(s.tint, 0.4 * bright * iconFade);
          ctx.lineWidth = 1;
          ctx.stroke();

          const img = icons.get(s.icon);
          if (img?.complete && img.naturalWidth > 0) {
            const iw = size * 0.92;
            ctx.globalAlpha = Math.min(1, bright + 0.25) * iconFade;
            ctx.drawImage(img, -iw / 2, -iw / 2, iw, iw);
            ctx.globalAlpha = 1;
          }
          ctx.restore();

          // label
          const la = (labels * (0.35 + depth * 0.3) + (isHover ? 0.5 : 0)) * iconFade * born;
          if (la > 0.02) {
            ctx.fillStyle = colorA("#F4ECDE", Math.min(0.92, la));
            ctx.font = "600 10px 'Hanken Grotesk', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(s.name.toUpperCase(), pos.x, pos.y + size * 1.7 + 10);
          }
        }

        // dissolving into hundreds of particles, absorbed
        const burst = ramp(f, 0.78, 1);
        if (burst > 0 && burst < 1) {
          for (let k = 0; k < 46; k++) {
            const kk = Math.min(1, burst * 1.5 - prand(i * 31 + k * 7) * 0.5);
            if (kk <= 0) continue;
            const ja = prand(i * 13 + k * 3) * Math.PI * 2;
            const jr = prand(i * 17 + k * 5) * size * 1.1;
            const sx0 = pos.x + Math.cos(ja) * jr;
            const sy0 = pos.y + Math.sin(ja) * jr * 0.7;
            // spiral into the horizon
            const sw = (1 - kk) * 1.9;
            const dx = cx + Math.cos(Math.atan2(sy0 - cy, sx0 - cx) + sw) * bhR * 0.5 - sx0;
            const dy = cy + Math.sin(Math.atan2(sy0 - cy, sx0 - cx) + sw) * bhR * 0.3 - sy0;
            const px2 = sx0 + dx * kk;
            const py2 = sy0 + dy * kk;
            softDot(ctx, px2, py2, 1.6 + prand(k * 9.1) * 2, s.tint, (1 - kk) * 0.7, 0.4);
          }
        }

        // absorption completed this frame → the hole responds
        const pf = prevFall.get(s.id) ?? 0;
        if (pf < 0.97 && f >= 0.97) {
          pulses.push({ t0: t, kind: "wave" }, { t0: t + 0.15, kind: "pink" });
        }
        prevFall.set(s.id, f);
      });

      /* ── the transformation: one star, Stelar-colored ───────── */
      if (starBirth > 0) {
        const breath = 1 + Math.sin(t * 1.5) * 0.05 + Math.sin(t * 0.6) * 0.03;
        const sr = bhR * (0.5 + starBirth * 1.9) * breath;
        softDot(ctx, cx, cy, sr * 2.4, "#FF4886", 0.34 * starBirth * (1 - isoBuild * 0.35), 0.25);
        softDot(ctx, cx, cy, sr, "#FBD7E3", 0.7 * starBirth, 0.35);
        softDot(ctx, cx, cy, sr * 0.4, "#FFF6E5", 0.9 * starBirth, 0.5);

        // the isotype builds itself out of particles
        if (isoBuild > 0 && isoTargets.length) {
          const isoR = R * 0.11;
          isoTargets.forEach((tg, k) => {
            const kk = ramp(isoBuild, k / isoTargets.length * 0.55, k / isoTargets.length * 0.55 + 0.45);
            if (kk <= 0) return;
            const oa = prand(k * 3.3) * Math.PI * 2;
            const od = (0.35 + prand(k * 5.9) * 0.5) * R * 0.35;
            const x = cx + Math.cos(oa) * od * (1 - kk) + tg.x * isoR * 2;
            const y = cy + Math.sin(oa) * od * (1 - kk) + tg.y * isoR * 2;
            softDot(ctx, x, y, 1.5 + kk * 1.2, kk > 0.85 ? "#FFE9C2" : "#FBD7E3", 0.28 + kk * 0.5, 0.45);
          });
          if (iso.complete && iso.naturalWidth > 0 && isoBuild > 0.55) {
            const ia = ramp(isoBuild, 0.55, 1) * 0.95;
            const iw = R * 0.155;
            ctx.globalAlpha = ia;
            ctx.drawImage(iso, cx - iw / 2, cy - iw / 2, iw, iw);
            ctx.globalAlpha = 1;
          }
          // fine orbits, at last
          const orb = ramp(isoBuild, 0.7, 1);
          if (orb > 0) {
            for (let l = 0; l < 3; l++) {
              ctx.strokeStyle = colorA(l === 1 ? "#FF4886" : "#D9AE6F", 0.16 * orb);
              ctx.lineWidth = 0.7;
              ctx.beginPath();
              ctx.ellipse(cx, cy, R * (0.15 + l * 0.045), R * (0.15 + l * 0.045) * (0.4 + l * 0.12), -0.3 + l * 0.3 + t * 0.02 * (l % 2 ? 1 : -1), 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }
      }

      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onClick = () => {
      if (hovered < 0) return;
      const s = SOURCES[hovered];
      if (!manualFall.has(s.id)) {
        manualFall.set(s.id, performance.now() / 1000);
      }
    };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.08, 0.18, 0.25], [0, 1, 1, 0]);
  const finalOpacity = useTransform(p, [0.93, 0.975], [0, 1]);
  const finalY = useTransform(p, [0.93, 0.985], [24, 0]);

  return (
    <section ref={ref} className="relative h-[460vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[10%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VII · Un mismo universo
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Todo termina en{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              un mismo lugar.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Tus datos viven separados.
          </p>
        </motion.div>

        {/* after the transformation */}
        <motion.div
          style={{ opacity: finalOpacity, y: finalY }}
          className="pointer-events-none absolute inset-x-0 top-[8%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <h2 className="font-sans text-2xl font-black leading-[1.15] tracking-tight text-cream sm:text-4xl">
            Tus datos nunca estuvieron separados.{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              Solo necesitaban un lugar donde encontrarse.
            </span>
          </h2>
        </motion.div>

        <motion.div
          style={{ opacity: finalOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[7%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-cream/60 sm:text-base">
            Stelar reúne automáticamente información de tus dispositivos y
            aplicaciones para descubrir patrones que ninguna plataforma puede
            mostrar por separado.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {BADGES.map((b) => (
              <span
                key={b}
                className="rounded-full border border-cream/12 bg-cream/[0.03] px-3 py-1 text-[11px] tracking-wide text-cream/65"
              >
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
