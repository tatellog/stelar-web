"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { softDot, sparkle, colorA, prand, ramp } from "@/lib/canvas";

/**
 * Capítulo VIII — Wearables & Ecosystem.
 * Not a row of logos: satellites. Each integration orbits a central star,
 * sending its signal toward the center. Stelar appears where all the
 * signals meet — and everything becomes a single line of evidence.
 */

type Satellite = {
  name: string;
  color: string;
  rx: number; // orbit radii, fraction of min(W,H)
  ry: number;
  speed: number;
  phase: number;
};

const SATELLITES: Satellite[] = [
  { name: "Apple Health", color: "#FF4886", rx: 0.46, ry: 0.15, speed: 0.9, phase: 0.3 },
  { name: "Apple Watch", color: "#F4ECDE", rx: 0.34, ry: 0.11, speed: 1.25, phase: 2.4 },
  { name: "Garmin", color: "#8FBEDB", rx: 0.52, ry: 0.19, speed: 0.72, phase: 4.2 },
  { name: "Oura", color: "#C18FFF", rx: 0.4, ry: 0.13, speed: 1.05, phase: 5.4 },
  { name: "Fitbit", color: "#8FD9C8", rx: 0.48, ry: 0.17, speed: 0.8, phase: 1.5 },
  { name: "Strava", color: "#FF9E57", rx: 0.56, ry: 0.21, speed: 0.62, phase: 3.3 },
  { name: "Google Fit", color: "#FFC56B", rx: 0.42, ry: 0.14, speed: 1.15, phase: 0.9 },
];

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

    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;
      const cx = W / 2;
      const cy = H * 0.46;
      const S = Math.min(W, H) * (W < 640 ? 0.52 : 0.42);

      const signals = ramp(p, 0.34, 0.46); // signals begin to travel
      const centerGlow = ramp(p, 0.4, 0.62);
      const flat = ramp(p, 0.76, 0.94); // everything becomes one line

      // central star
      const breath = 1 + Math.sin(t * 0.0012) * 0.06;
      softDot(
        ctx,
        cx,
        cy,
        (34 + centerGlow * 52) * breath,
        "#FFE9C2",
        (0.4 + centerGlow * 0.5) * (1 - flat * 0.55),
        0.25,
      );
      sparkle(ctx, cx, cy, 9 + centerGlow * 6, "#FFF6E5", 0.95 * (1 - flat * 0.4));

      SATELLITES.forEach((s, i) => {
        const born = ramp(p, 0.05 + i * 0.035, 0.13 + i * 0.035);
        if (born <= 0) return;

        const ang = s.phase + t * 0.00016 * s.speed;
        const ox = cx + Math.cos(ang) * s.rx * S;
        const oy = cy + Math.sin(ang) * s.ry * S;
        const depth = (Math.sin(ang) + 1) / 2; // 0 far — 1 near
        const scale = 0.7 + depth * 0.5;

        // the single line of evidence: satellites become beads on it
        const lx = cx + (i - (SATELLITES.length - 1) / 2) * Math.min(W * 0.11, 90);
        const ly = H * 0.52;
        const x = ox + (lx - ox) * flat;
        const y = oy + (ly - oy) * flat;

        // orbit path, faint
        if (flat < 1) {
          ctx.strokeStyle = colorA(s.color, 0.13 * born * (1 - flat));
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.ellipse(cx, cy, s.rx * S, s.ry * S, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // its signal travels to the center
        if (signals > 0 && flat < 0.5) {
          const cycle = 2200 + i * 500;
          const k = ((t + i * 700) % cycle) / cycle;
          const sx2 = x + (cx - x) * k;
          const sy2 = y + (cy - y) * k;
          ctx.strokeStyle = colorA(s.color, 0.12 * signals * (1 - flat * 2));
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          softDot(ctx, sx2, sy2, 6, s.color, 0.7 * signals * (1 - k) * (1 - flat * 2), 0.45);
        }

        // the satellite
        const tw = 0.8 + 0.2 * Math.sin(t * 0.0021 + i * 2.6);
        softDot(ctx, x, y, 20 * scale * tw, s.color, born * 0.72, 0.3);
        sparkle(ctx, x, y, 5.6 * scale, "#FFF6E5", born * 0.95);

        // label
        const la = born * (0.5 + depth * 0.35) * (1 - flat);
        ctx.fillStyle = colorA("#F4ECDE", la);
        ctx.font = `600 ${Math.round(9 + depth * 2)}px 'Hanken Grotesk', sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(s.name.toUpperCase(), x, y + 24 * scale);
      });

      // the single line of evidence
      if (flat > 0) {
        const half = (SATELLITES.length - 1) / 2;
        const spread = Math.min(W * 0.11, 90) * half + 40;
        const grad = ctx.createLinearGradient(cx - spread, 0, cx + spread, 0);
        grad.addColorStop(0, colorA("#D9AE6F", 0));
        grad.addColorStop(0.5, colorA("#FFE9C2", 0.75 * flat));
        grad.addColorStop(1, colorA("#D9AE6F", 0));
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx - spread * flat, H * 0.52);
        ctx.lineTo(cx + spread * flat, H * 0.52);
        ctx.stroke();
      }

      // faint dust
      for (let i = 0; i < 40; i++) {
        const x = prand(i * 3.7) * W;
        const y = prand(i * 8.1) * H;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * 0.0006 + i * 2.4));
        softDot(ctx, x, y, 1.6, "#F4ECDE", 0.24 * tw, 0.5);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.08, 0.2, 0.28], [0, 1, 1, 0]);
  const iconOpacity = useTransform(p, [0.48, 0.62, 0.86, 0.96], [0, 1, 1, 0.75]);
  const iconScale = useTransform(p, [0.48, 0.66], [0.7, 1]);
  const outroOpacity = useTransform(p, [0.62, 0.72], [0, 1]);
  const outroY = useTransform(p, [0.62, 0.72], [24, 0]);

  return (
    <section ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_88%,transparent_100%)]"
        />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[9%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VIII · Tu ecosistema
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Tus datos pueden vivir en muchos lugares.{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              Tu historia debería vivir en uno.
            </span>
          </h2>
        </motion.div>

        {/* Stelar, where every signal meets */}
        <motion.div
          style={{ opacity: iconOpacity, scale: iconScale }}
          className="pointer-events-none absolute left-1/2 top-[46%] z-10 -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src="/art/stelar-icon-trim.png"
            alt="Stelar"
            width={64}
            height={64}
            className="h-12 w-12 sm:h-16 sm:w-16"
          />
        </motion.div>

        {/* closing copy */}
        <motion.div
          style={{ opacity: outroOpacity, y: outroY }}
          className="pointer-events-none absolute inset-x-0 bottom-[9%] z-10 mx-auto max-w-xl px-6 text-center"
        >
          <p className="text-base leading-relaxed text-cream/65 sm:text-lg">
            Conecta tus entrenamientos, sueño, pasos y mediciones para que
            Stelar pueda leer{" "}
            <span className="font-serif italic text-gold">
              tu progreso completo.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
