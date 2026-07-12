"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { softDot, colorA, prand, ramp } from "@/lib/canvas";
import { runWhenVisible } from "@/lib/visibleLoop";

/**
 * Capítulo VII — Todo termina en un mismo universo.
 * Not a layout of logos around a hole: a gravitational phenomenon.
 * Scattered apps float at different depths. A force is born at the
 * center — lensing, an accretion disk of fast particles, light bending.
 * The hole itself is a vortex: a dense field of tiny stars whose light
 * stretches into concentric trails spiraling around the void. Each
 * astro falls with its own physics, breaks into brand-colored
 * particles and is absorbed. Then silence — and the hole gives back
 * slow rivers of gold. apps dispersas → datos absorbidos →
 * energía transformada.
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

/* solo el MVP: los astros correctos */
const SOURCES: Source[] = [
  { id: "applehealth", name: "Apple Health", icon: "/brands/apple.svg", tint: "#FBD7E3", hx: 0.2, hy: 0.24, depth: 1, swirl: -3, escape: 0.12, accel: 1.4, order: 0 },
  { id: "garmin", name: "Garmin", icon: "/brands/garmin.svg", tint: "#8FBEDB", hx: 0.84, hy: 0.2, depth: 0.85, swirl: 5.6, escape: 0, accel: 1.15, order: 1 },
  { id: "oura", name: "Oura", icon: "/brands/ouraring.svg", tint: "#C18FFF", hx: 0.15, hy: 0.66, depth: 0.6, swirl: 2.8, escape: 0.2, accel: 1.8, order: 2 },
  { id: "samsung", name: "Samsung Health", icon: "/brands/samsung.svg", tint: "#E8B872", hx: 0.82, hy: 0.72, depth: 0.75, swirl: -1.8, escape: 0.3, accel: 1.5, order: 3 },
];

const FALL0 = 0.42;
const FALL_STEP = 0.085;
const FALL_LEN = 0.07;

const N_TRAILS = 430; // star-trail rings of the vortex
const N_STARS = 900; // the dense field of tiny stars

/* seeded statics baked once — the draw loop must not re-derive them
   (430 trails × 2 passes + 900 stars × ~8 prand each = ~14k sin/frame) */
const STARS = Array.from({ length: N_STARS }, (_, i) => {
  const born0 = 0.01 + prand(i * 1.9) * 0.16;
  const below = prand(i * 2.7) > 0.3;
  return {
    born0,
    born1: born0 + 0.08,
    clustered: i % 2 === 0,
    ang: below ? Math.PI * (0.15 + prand(i * 4.1) * 0.7) : prand(i * 4.1) * Math.PI * 2,
    rrF: 1.15 + Math.pow(prand(i * 6.3), 0.7) * 2.4,
    yJitF: (prand(i * 7.9) - 0.5) * 0.5,
    fx: prand(i * 3.7),
    fy: prand(i * 8.3),
    twS: 0.3 + prand(i * 1.3) * 0.6,
    size: 0.4 + prand(i * 13.7) * 1.05,
  };
});

const TRAILS = Array.from({ length: N_TRAILS }, (_, i) => {
  const u = prand(i * 3.9);
  const longRing = prand(i * 15.7) > 0.42;
  // the inner disk runs hot: ~15% of the close trails glow old gold
  const warm = u < 0.34 && prand(i * 21.3) > 0.55;
  return {
    rF: 1.3 + Math.pow(u, 1.35) * 1.9,
    a00: prand(i * 7.1) * Math.PI * 2,
    len: longRing ? 2 + prand(i * 9.3) * 3.4 : 0.3 + prand(i * 9.3) * 0.9,
    alpha:
      (longRing ? 0.06 + prand(i * 11.7) * 0.13 : 0.16 + prand(i * 11.7) * 0.24) *
      (warm ? 1.25 : 1),
    color: warm ? (prand(i * 27.7) > 0.7 ? "#FFE9C2" : "#D9AE6F") : "#F4ECDE",
    lw: 0.4 + prand(i * 13.1) * 0.75,
  };
});

const LENSED = Array.from({ length: 70 }, (_, i) => ({
  rrF: 1.05 + Math.pow(prand(i * 4.3), 1.6) * 0.4,
  a00: prand(i * 6.7) * Math.PI * 2,
  len: 0.5 + prand(i * 8.9) * 1.6,
  alpha: 0.05 + prand(i * 10.3) * 0.14,
  lw: 0.4 + prand(i * 12.7) * 0.6,
}));
const N_GOLD = 150; // the rivers of gold

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
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, sx: -1, sy: -1 };
    const manualFall = new Map<string, number>();
    const prevFall = new Map<string, number>();
    const pulses: { t0: number }[] = [];
    let hovered = -1;

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
      const emission = ramp(p, 0.83, 0.95); // rivers of gold

      const bhR = R * (0.03 * grav1 + 0.105 * hole);
      const diskAlpha = hole * (1 - silence * 0.55) * (1 - emission * 0.45);

      /* ── a dense field of tiny stars; the vortex gathers the near ones ── */
      ctx.fillStyle = "#F4ECDE";
      for (let i = 0; i < N_STARS; i++) {
        const st = STARS[i];
        const born = ramp(p, st.born0, st.born1);
        if (born <= 0) continue;
        const clustered = st.clustered && hole > 0.01; // half crowds the funnel
        let x: number;
        let y: number;
        if (clustered) {
          // biased toward the lower foreground, like the reference
          const rr = bhR * st.rrF;
          x = cx + Math.cos(st.ang) * rr;
          y = cy + Math.sin(st.ang) * rr * 0.3 + st.yJitF * bhR;
        } else {
          x = st.fx * W;
          y = st.fy * H;
        }
        // gravity curves every drift
        const dxs = x - cx;
        const dys = y - cy;
        const d = Math.hypot(dxs, dys) || 1;
        const ang2 = Math.atan2(dys, dxs) + Math.PI / 2;
        const swirlK = grav1 * (3400 / (d + 60));
        x += Math.cos(ang2) * swirlK * 0.25 + Math.sin(t * 0.13 + i) * 2.4;
        y += Math.sin(ang2) * swirlK * 0.25 + Math.cos(t * 0.11 + i * 1.7) * 2;
        if (d < bhR * 1.02 && hole > 0.01) continue; // already beyond the horizon
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * st.twS + i * 2.4));
        ctx.globalAlpha = (clustered ? 0.55 : 0.32) * tw * born * (clustered ? hole : 1);
        ctx.beginPath();
        ctx.arc(x, y, st.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* ── the gravitational lens: space darkens toward the center ── */
      if (grav1 > 0) {
        const lens = ctx.createRadialGradient(cx, cy, 0, cx, cy, bhR * 4 + R * 0.05);
        lens.addColorStop(0, `rgba(1,0,1,${0.55 * grav1})`);
        lens.addColorStop(0.5, `rgba(1,0,1,${0.22 * grav1})`);
        lens.addColorStop(1, "rgba(1,0,1,0)");
        ctx.fillStyle = lens;
        ctx.fillRect(0, 0, W, H);
      }

      /* ── the black hole: dark sphere, accretion disk, lensed ring ── */
      if (hole > 0.01) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.09 + pointer.x * 0.02);
        const squash = 0.2;

        const drawDiskTrail = (tr: (typeof TRAILS)[number]) => {
          const r = bhR * tr.rF;
          const w = (bhR * 22) / (r + 1);
          const a0 = tr.a00 + t * w * 0.06;
          ctx.globalAlpha = tr.alpha * diskAlpha;
          ctx.strokeStyle = tr.color;
          ctx.lineWidth = tr.lw;
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * squash, 0, a0, a0 + tr.len);
          ctx.stroke();
        };

        // the disk, behind the sphere
        for (let i = 0; i < N_TRAILS; i++) drawDiskTrail(TRAILS[i]);
        ctx.globalAlpha = 1;

        // pulses ride the disk after each absorption
        for (const pu of pulses) {
          const age = t - pu.t0;
          if (age > 1.2) continue;
          const k = age / 1.2;
          const r = bhR * (3 - k * 1.8);
          ctx.strokeStyle = colorA("#FFF6E5", 0.3 * Math.sin(k * Math.PI) * diskAlpha);
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * squash, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // the event horizon: a true dark sphere
        const core = ctx.createRadialGradient(0, 0, 0, 0, 0, bhR);
        core.addColorStop(0, "rgba(1,0,1,1)");
        core.addColorStop(0.9, "rgba(1,0,1,1)");
        core.addColorStop(1, "rgba(1,0,1,0)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(0, 0, bhR * 1.04, 0, Math.PI * 2);
        ctx.fill();

        // the lensed image of the disk: light bent around the sphere
        ctx.strokeStyle = "#F4ECDE";
        for (const ln of LENSED) {
          const rr = bhR * ln.rrF;
          const w2 = (bhR * 26) / (rr + 1);
          const a0 = ln.a00 + t * w2 * 0.05;
          ctx.globalAlpha = ln.alpha * diskAlpha;
          ctx.lineWidth = ln.lw;
          ctx.beginPath();
          ctx.arc(0, 0, rr, a0, a0 + ln.len);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // photon ring — the thin bright edge
        ctx.strokeStyle = colorA("#FFF6E5", (0.28 * hole + 0.04) * (1 - emission * 0.3));
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 0, bhR * 1.05, 0, Math.PI * 2);
        ctx.stroke();
        softDot(ctx, 0, 0, bhR * 1.5, "#F4ECDE", 0.05 * diskAlpha, 0);

        // the disk, in front of the sphere — the lower half crosses it
        ctx.save();
        ctx.beginPath();
        ctx.rect(-bhR * 4, bhR * squash * 0.4, bhR * 8, bhR * 4);
        ctx.clip();
        for (let i = 0; i < N_TRAILS; i++) drawDiskTrail(TRAILS[i]);
        ctx.globalAlpha = 1;
        ctx.restore();

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

        const size = (11 + s.depth * 9) * (isHover ? 1.12 : 1);
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
            ctx.font = "600 12px 'Hanken Grotesk', sans-serif";
            ctx.textAlign = "center";
            // keep the label inside the viewport on narrow screens
            const half = ctx.measureText(s.name.toUpperCase()).width / 2;
            const lx = Math.min(W - 10 - half, Math.max(10 + half, pos.x));
            ctx.fillText(s.name.toUpperCase(), lx, pos.y + size * 1.9 + 10);
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

        /* continuous life: while an astro still floats, it sends small
           pulses of information toward the force — not a static logo */
        if (grav1 > 0.15 && f < 0.6) {
          const cyc = t / 2.8 + i * 0.41;
          const k = cyc % 1;
          if (k < 0.62) {
            const kk = k / 0.62;
            for (let d = 0; d < 5; d++) {
              const kd = kk - d * 0.05;
              if (kd <= 0 || kd >= 1) continue;
              const bowA = Math.atan2(cy - pos.y, cx - pos.x) + Math.PI / 2;
              const bow = Math.sin(kd * Math.PI) * 26 * (prand(i * 9.1 + Math.floor(cyc)) - 0.5) * 2;
              const px2 = pos.x + (cx - pos.x) * kd + Math.cos(bowA) * bow;
              const py2 = pos.y + (cy - pos.y) * kd + Math.sin(bowA) * bow;
              const av = Math.sin(kd * Math.PI) * grav1 * (1 - f) * 0.7;
              softDot(ctx, px2, py2, 1.5 + prand(i * 3.3 + d) * 1.6, s.tint, av, 0.4);
            }
          }
          // arrival: the force answers with a small warm pulse
          if (k > 0.56 && k < 0.62) {
            softDot(ctx, cx, cy, bhR * 1.6 + 14, "#FFE9C2", 0.2 * grav1, 0.25);
          }
        }
      });

      /* ── the transformation: rivers of gold ───────────────────── */
      if (emission > 0) {
        for (let i = 0; i < N_GOLD; i++) {
          const u = prand(i * 3.3);
          const streamId = i % 4;
          const w = Math.max(0, Math.min(1, emission * 1.45 - u * 0.45));
          if (w <= 0) continue;
          // a curved river out of the hole, drifting into the dark
          const baseAng = (streamId / 4) * Math.PI * 2 + 0.8;
          const ang = baseAng + w * 2.3 + Math.sin(t * 0.2 + i) * 0.04;
          const rad = w * R * 0.44 + bhR * 0.4;
          const x = cx + Math.cos(ang) * rad;
          const y = cy + Math.sin(ang) * rad * 0.82;
          const a = Math.sin(Math.min(1, w) * Math.PI) * 0.5 * emission;
          softDot(ctx, x, y, 1.6 + prand(i * 5.1) * 2.2, i % 5 === 0 ? "#FFF6E5" : "#E8B872", a, 0.42);
        }
      }

      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
    };
    const stopLoop = runWhenVisible(canvas, draw);

    /* tap = this astro falls now. The hit-test runs on the event coords —
       on touch there is no pointermove before the click. */
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const ex = e.clientX - rect.left;
      const ey = e.clientY - rect.top;
      const t = performance.now() / 1000;
      const p = progress.current;
      const ccx = W / 2 + pointer.x * 12;
      const ccy = H * 0.5 + pointer.y * 9;
      for (const s of SOURCES) {
        const pos = sourcePos(s, p, t, ccx, ccy);
        if (pos.f < 0.05 && Math.hypot(ex - pos.x, ey - pos.y) < 46) {
          if (!manualFall.has(s.id)) manualFall.set(s.id, t);
          return;
        }
      }
    };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("click", onClick);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.07, 0.16, 0.23], [0, 1, 1, 0]);
  const finalOpacity = useTransform(p, [0.94, 0.98], [0, 1]);
  const finalY = useTransform(p, [0.94, 0.99], [22, 0]);

  return (
    <section ref={ref} className="relative h-[520vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[max(9%,5.5rem)] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold">
            Capítulo VIII · Wearables
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Todos tus datos.{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              Un solo lugar.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            No importa dónde viva tu información —{" "}
            <span className="font-serif italic text-gold">Stelar la reúne toda.</span>{" "}
            Apple Health, Garmin, Oura y Samsung Health.
          </p>
        </motion.div>

        {/* after the transformation */}
        <motion.div
          style={{ opacity: finalOpacity, y: finalY }}
          className="pointer-events-none absolute inset-x-0 top-[max(7%,5.5rem)] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <h2 className="font-sans text-2xl font-black leading-[1.12] tracking-tight text-cream sm:text-4xl">
            Tu información se vuelve{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              una sola historia.
            </span>
          </h2>
          <p className="mt-3 font-serif text-lg italic text-cream/70">
            Tus datos solo necesitaban un lugar donde encontrarse.
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: finalOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[8%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <div className="pointer-events-none mx-auto flex max-w-lg flex-wrap items-center justify-center gap-2">
            {["Entrenos", "Sueño", "Pasos", "Ritmo cardiaco", "Actividad"].map((k) => (
              <span
                key={k}
                className="rounded-full border border-cream/12 px-3.5 py-1.5 text-[11.5px] uppercase tracking-[0.2em] text-cream/55"
              >
                {k}
              </span>
            ))}
          </div>
          <p className="pointer-events-none mt-4 text-[11.5px] uppercase tracking-[0.3em] text-cream/35">
            Sincronización automática
          </p>
          <a
            href="#beta"
            className="pointer-events-auto mt-4 inline-flex items-center gap-1.5 py-2 text-sm tracking-wide text-pink transition-colors hover:text-cream"
          >
            Conecta tu universo <span aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
