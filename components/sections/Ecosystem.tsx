"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSign } from "../SignContext";
import { figureFit } from "@/lib/zodiac/helpers";
import { softDot, sparkle, colorA, ramp, prand } from "@/lib/canvas";

/**
 * Capítulo VIII — Wearables.
 * The story is not the logos: it's that your information lives everywhere
 * and Stelar brings it together. Four sources (the MVP) orbit the Stelar
 * star; every few seconds small particles — workouts, sleep, steps, heart
 * rate, activity — travel inward. Each arrival makes the star pulse, and
 * the visitor's own constellation slowly brightens behind it: one story.
 */

type Source = {
  id: string;
  name: string;
  icon: string;
  tint: string;
  r: number; // orbit radius (fraction of R)
  speed: number;
  phase: number;
  tilt: number;
  streamOffset: number;
};

const SOURCES: Source[] = [
  { id: "apple", name: "Apple Health", icon: "/brands/apple.svg", tint: "#FBD7E3", r: 0.66, speed: 0.055, phase: 0.7, tilt: -0.12, streamOffset: 0 },
  { id: "garmin", name: "Garmin", icon: "/brands/garmin.svg", tint: "#8FBEDB", r: 0.82, speed: 0.042, phase: 2.4, tilt: 0.1, streamOffset: 0.31 },
  { id: "oura", name: "Oura", icon: "/brands/ouraring.svg", tint: "#C18FFF", r: 0.52, speed: 0.068, phase: 4.2, tilt: 0.16, streamOffset: 0.55 },
  { id: "samsung", name: "Samsung Health", icon: "/brands/samsung.svg", tint: "#E8B872", r: 0.74, speed: 0.048, phase: 5.6, tilt: -0.18, streamOffset: 0.78 },
];

/* what travels: each packet is one kind of signal, in its dimension color */
const DATA_KINDS = [
  { label: "entrenos", color: "#FF9E57" },
  { label: "sueño", color: "#C18FFF" },
  { label: "pasos", color: "#E8B872" },
  { label: "ritmo cardiaco", color: "#FF4886" },
  { label: "actividad", color: "#8FBEDB" },
];

const SQUASH = 0.4;
const N_DUST = 150;
const PACKET_N = 9; // particles per traveling packet
const STREAM_PERIOD = 3.4; // seconds between packets per source

const bell = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return Math.sin(t * Math.PI);
};

export default function Ecosystem() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const { sign } = useSign();
  const signRef = useRef(sign);
  signRef.current = sign;

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

    /* brand icons */
    const icons = SOURCES.map((s) => {
      const img = new window.Image();
      img.src = s.icon;
      return img;
    });

    let hovered = -1;
    // extra packets fired by taps: [sourceIdx, startSeconds]
    const bursts: [number, number][] = [];

    const srcPos = (s: Source, t: number, R: number, cx: number, cy: number) => {
      const sq = H > W ? 0.7 : SQUASH;
      const a = s.phase + t * s.speed;
      const ex = Math.cos(a) * s.r * R;
      const ey = Math.sin(a) * s.r * R * sq;
      const x = cx + ex * Math.cos(s.tilt) - ey * Math.sin(s.tilt);
      const y = cy + ex * Math.sin(s.tilt) + ey * Math.cos(s.tilt);
      const depth = 0.75 + 0.25 * Math.sin(a);
      return { x, y, depth };
    };

    const frame = () => {
      const R = H > W ? Math.min(W * 0.44, H * 0.3) : Math.min(W * 0.46, H * 0.4);
      return { R, cx: W / 2, cy: H * 0.5 };
    };

    const hitAt = (px: number, py: number, now: number) => {
      const { R, cx, cy } = frame();
      const t = now / 1000;
      for (let i = 0; i < SOURCES.length; i++) {
        const pos = srcPos(SOURCES[i], t, R, cx, cy);
        if (Math.hypot(pos.x - px, pos.y - py) < 38) return i;
      }
      return -1;
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      hovered = hitAt(e.clientX - rect.left, e.clientY - rect.top, performance.now());
      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const hit = hitAt(e.clientX - rect.left, e.clientY - rect.top, performance.now());
      if (hit >= 0) {
        bursts.push([hit, performance.now() / 1000]);
        if (bursts.length > 6) bursts.shift();
      }
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    canvas.addEventListener("click", onClick);

    /* one traveling packet: source → star, on a gentle curve */
    const drawPacket = (
      f: number, // 0..1 along the trip
      sx: number,
      sy: number,
      cx: number,
      cy: number,
      kind: (typeof DATA_KINDS)[number],
      seed: number,
    ) => {
      // control point: perpendicular offset makes the stream arc, not beam
      const mx = (sx + cx) / 2;
      const my = (sy + cy) / 2;
      const dx = cx - sx;
      const dy = cy - sy;
      const L = Math.hypot(dx, dy) || 1;
      const px = -dy / L;
      const py = dx / L;
      const bow = (prand(seed * 7.7) - 0.5) * L * 0.42;

      for (let j = 0; j < PACKET_N; j++) {
        const fj = f - j * 0.035;
        if (fj <= 0 || fj >= 1) continue;
        const u = 1 - fj;
        const bx = u * u * sx + 2 * u * fj * (mx + px * bow) + fj * fj * cx;
        const by = u * u * sy + 2 * u * fj * (my + py * bow) + fj * fj * cy;
        const a = bell(fj) * (0.35 + 0.65 * prand(seed + j * 3.1));
        softDot(ctx, bx, by, 1.6 + prand(seed + j * 5.3) * 2.2, kind.color, a * 0.8, 0.35);
      }
      // the head of the stream shines a little
      if (f > 0 && f < 1) {
        const u = 1 - f;
        const hx = u * u * sx + 2 * u * f * (mx + px * bow) + f * f * cx;
        const hy = u * u * sy + 2 * u * f * (my + py * bow) + f * f * cy;
        softDot(ctx, hx, hy, 4.5, kind.color, bell(f) * 0.9, 0.4);
      }
    };

    let raf = 0;
    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;
      const t = now / 1000;
      const { R, cx, cy } = frame();

      const appear = ramp(p, 0.05, 0.14);
      const streaming = ramp(p, 0.24, 0.34); // when the data starts flowing
      const story = ramp(p, 0.4, 0.82); // the constellation brightening

      /* quiet ambient dust */
      for (let i = 0; i < N_DUST; i++) {
        const dx = prand(i * 3.7) * W;
        const dy = prand(i * 7.1) * H;
        const tw = 0.4 + 0.6 * Math.sin(t * 0.5 + i * 2.3);
        softDot(ctx, dx, dy, 0.9 + prand(i * 11.3) * 1.4, "#F4ECDE", 0.09 * tw, 0.4);
      }

      /* the visitor's constellation, slowly becoming one story */
      if (story > 0) {
        const S = R * 1.15;
        const fig = figureFit(signRef.current, { x: cx - S / 2, y: cy - S / 2, w: S, h: S }, 0.16);
        ctx.strokeStyle = colorA("#D9AE6F", 0.05 + story * 0.14);
        ctx.lineWidth = 0.5;
        fig.lines.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(fig.pts[a].x, fig.pts[a].y);
          ctx.lineTo(fig.pts[b].x, fig.pts[b].y);
          ctx.stroke();
        });
        fig.pts.forEach((pt, i) => {
          const tw = 0.6 + 0.4 * Math.sin(t * 0.8 + i * 2.1);
          softDot(ctx, pt.x, pt.y, 5, "#FFE9C2", (0.08 + story * 0.3) * tw, 0.35);
          sparkle(ctx, pt.x, pt.y, 1.6, "#FFF6E5", (0.15 + story * 0.55) * tw);
        });
      }

      /* orbit hairlines */
      for (let i = 0; i < SOURCES.length; i++) {
        const s = SOURCES[i];
        const born = ramp(p, 0.08 + i * 0.05, 0.15 + i * 0.05);
        if (born <= 0) continue;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(s.tilt);
        ctx.strokeStyle = colorA("#D9AE6F", (0.055 + (hovered === i ? 0.08 : 0)) * born);
        ctx.lineWidth = 0.5;
        if (i % 2) ctx.setLineDash([2, 8]);
        ctx.beginPath();
        ctx.ellipse(0, 0, s.r * R, s.r * R * (H > W ? 0.7 : SQUASH), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      /* data streams + arrival pulses */
      let arriving = 0;
      if (streaming > 0) {
        for (let i = 0; i < SOURCES.length; i++) {
          const s = SOURCES[i];
          const pos = srcPos(s, t, R, cx, cy);
          const cycle = t / STREAM_PERIOD + s.streamOffset;
          const n = Math.floor(cycle);
          const f = (cycle - n) / 0.72; // travel takes 72% of the period
          const kind = DATA_KINDS[(n + i) % DATA_KINDS.length];
          if (f < 1) drawPacket(f, pos.x, pos.y, cx, cy, kind, n * 13.7 + i * 51);
          arriving = Math.max(arriving, bell((f - 0.86) / 0.14) * streaming);

          // tap: an extra burst of everything this source knows
          for (const [bi, bt] of bursts) {
            if (bi !== i) continue;
            const bf = (t - bt) / 1.6;
            if (bf > 0 && bf < 1) {
              drawPacket(bf, pos.x, pos.y, cx, cy, DATA_KINDS[Math.floor(prand(bt) * DATA_KINDS.length)], bt * 17);
              arriving = Math.max(arriving, bell((bf - 0.86) / 0.14));
            }
          }
        }
      }

      /* la estrella Stelar — pulses when data arrives, grows with the story */
      const breath = 1 + 0.05 * Math.sin(t * 1.3);
      const pulse = breath * (1 + arriving * 0.35);
      const glow = appear * (0.65 + story * 0.35);
      softDot(ctx, cx, cy, R * (0.24 + story * 0.06) * pulse, "#E91E63", 0.12 * glow, 0.25);
      softDot(ctx, cx, cy, R * 0.11 * pulse, "#FBD7E3", 0.3 * glow, 0.3);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(8, 0.34);
      softDot(ctx, 0, 0, R * 0.04, "#FFE9C2", (0.3 + arriving * 0.3) * appear, 0.3);
      ctx.restore();
      sparkle(ctx, cx, cy, (8 + story * 3) * pulse, "#FFF6E5", 0.95 * appear);
      softDot(ctx, cx, cy, 3.5, "#FFFFFF", appear, 0.5);

      /* the sources — small worlds with their brand inside */
      for (let i = 0; i < SOURCES.length; i++) {
        const s = SOURCES[i];
        const born = ramp(p, 0.08 + i * 0.05, 0.16 + i * 0.05);
        if (born <= 0) continue;
        const pos = srcPos(s, t, R, cx, cy);
        const isHot = hovered === i;
        const size = (15 + pos.depth * 6) * (0.6 + 0.4 * born) * (isHot ? 1.12 : 1);
        const al = born * (0.55 + 0.45 * pos.depth);

        if (born < 1) {
          ctx.strokeStyle = colorA(s.tint, (1 - born) * 0.5);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, size * (1 + born * 2), 0, Math.PI * 2);
          ctx.stroke();
        }

        softDot(ctx, pos.x, pos.y, size * 2.6 + (isHot ? 8 : 0), s.tint, 0.3 * al, 0.3);
        ctx.fillStyle = colorA("#14080B", 0.92 * al);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = colorA(s.tint, 0.5 * al);
        ctx.lineWidth = 1;
        ctx.stroke();

        const icon = icons[i];
        if (icon.complete && icon.naturalWidth) {
          const iw = size * 1.05;
          ctx.globalAlpha = Math.min(1, al + 0.15);
          ctx.drawImage(icon, pos.x - iw / 2, pos.y - iw / 2, iw, iw);
          ctx.globalAlpha = 1;
        }

        const la = born * (0.5 + (isHot ? 0.4 : 0)) * (0.6 + 0.4 * pos.depth);
        ctx.fillStyle = colorA("#F4ECDE", Math.min(0.92, la));
        ctx.font = "600 10px 'Hanken Grotesk', sans-serif";
        ctx.textAlign = "center";
        const half = ctx.measureText(s.name.toUpperCase()).width / 2;
        const lx = Math.min(W - 10 - half, Math.max(10 + half, pos.x));
        ctx.fillText(s.name.toUpperCase(), lx, pos.y + size + 18);

        if (isHot) {
          ctx.fillStyle = colorA("#D9AE6F", 0.85);
          ctx.font = "italic 13px 'Cormorant Garamond', serif";
          const desc = "entrenos · sueño · pasos · ritmo · actividad";
          const dHalf = ctx.measureText(desc).width / 2;
          const dx = Math.min(W - 12 - dHalf, Math.max(12 + dHalf, pos.x));
          ctx.fillText(desc, dx, pos.y + size + 36);
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.03, 0.09, 0.3, 0.38], [0, 1, 1, 0]);
  const kindsOpacity = useTransform(p, [0.4, 0.48, 0.62, 0.7], [0, 1, 1, 0]);
  const finalOpacity = useTransform(p, [0.78, 0.88], [0, 1]);
  const finalY = useTransform(p, [0.78, 0.88], [18, 0]);

  return (
    <section ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [touch-action:pan-y] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[9%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VIII · Wearables
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Todos tus datos.{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              Un solo lugar.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Conecta Apple Health, Garmin, Oura y Samsung Health para que Stelar
            entienda tu panorama completo.
          </p>
        </motion.div>

        {/* what travels through the streams */}
        <motion.div
          style={{ opacity: kindsOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[9%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Entrenos", "Sueño", "Pasos", "Ritmo cardiaco", "Actividad"].map((k) => (
              <span
                key={k}
                className="rounded-full border border-cream/12 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-cream/55"
              >
                {k}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-cream/35">
            Sincronización automática
          </p>
        </motion.div>

        {/* the point */}
        <motion.div
          style={{ opacity: finalOpacity, y: finalY }}
          className="absolute inset-x-0 bottom-[8%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="pointer-events-none font-serif text-2xl italic text-gold text-glow-gold sm:text-3xl">
            Tu información se vuelve una sola historia.
          </p>
          <a
            href="#beta"
            className="mt-5 inline-flex items-center gap-1.5 text-sm tracking-wide text-pink transition-colors hover:text-cream"
          >
            Conecta tu universo <span aria-hidden>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
