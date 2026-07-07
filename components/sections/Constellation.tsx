"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Reveal from "../Reveal";
import LottieGlow from "../LottieGlow";
import skyAmbient from "@/lib/lottie/month-sky-ambient.json";

const STARS = [
  { x: 120, y: 220 },
  { x: 200, y: 120 },
  { x: 310, y: 170 },
  { x: 400, y: 80 },
  { x: 500, y: 140 },
  { x: 580, y: 240 },
  { x: 470, y: 290 },
  { x: 330, y: 320 },
  { x: 210, y: 300 },
];

const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 0],
  [2, 7],
];

/** A dark constellation that brightens as you scroll — revealed, not unlocked. */
export default function Constellation() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.45"],
  });

  return (
    <section ref={ref} className="relative py-32 sm:py-44">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold/80">
            Capítulo V · La constelación
          </p>
          <h2 className="font-sans text-4xl font-black leading-[1.1] tracking-tight text-cream sm:text-6xl">
            Tu constelación no se desbloquea.
            <br />
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              Se revela.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.3} className="mx-auto mt-8 max-w-xl">
          <p className="text-lg leading-relaxed text-cream/60">
            No aparece por magia. Aparece porque tus acciones dejaron
            suficiente evidencia.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* the app's month-sky ambient lottie, breathing underneath */}
          <LottieGlow
            data={skyAmbient}
            className="pointer-events-none absolute -inset-10 opacity-50"
          />
          <RevealingSky progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

function RevealingSky({ progress }: { progress: MotionValue<number> }) {
  const glow = useTransform(progress, [0.4, 1], [0, 0.5]);

  return (
    <svg viewBox="0 0 700 400" className="w-full" aria-hidden>
      {/* ambient glow grows with the reveal */}
      <motion.ellipse
        cx="350"
        cy="200"
        rx="280"
        ry="160"
        fill="url(#skyGlow)"
        style={{ opacity: glow }}
      />

      {LINKS.map(([a, b], i) => (
        <SkyLine key={i} a={STARS[a]} b={STARS[b]} i={i} progress={progress} />
      ))}
      {STARS.map((s, i) => (
        <SkyStar key={i} s={s} i={i} progress={progress} />
      ))}

      <defs>
        <radialGradient id="skyGlow">
          <stop offset="0%" stopColor="#FF4886" stopOpacity="0.12" />
          <stop offset="60%" stopColor="#2B0D24" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#090207" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function SkyStar({
  s,
  i,
  progress,
}: {
  s: { x: number; y: number };
  i: number;
  progress: MotionValue<number>;
}) {
  const start = (i / STARS.length) * 0.45;
  // every star is faintly there from the beginning — it only brightens
  const opacity = useTransform(progress, [start, start + 0.2], [0.12, 1]);
  const r = i % 4 === 0 ? 4 : 2.8;
  const fill = i % 4 === 0 ? "#FF4886" : i % 3 === 0 ? "#D9AE6F" : "#F4ECDE";
  return (
    <motion.circle
      cx={s.x}
      cy={s.y}
      r={r}
      fill={fill}
      className="glow-dot"
      style={{ opacity }}
    />
  );
}

function SkyLine({
  a,
  b,
  i,
  progress,
}: {
  a: { x: number; y: number };
  b: { x: number; y: number };
  i: number;
  progress: MotionValue<number>;
}) {
  const start = 0.3 + (i / LINKS.length) * 0.55;
  const opacity = useTransform(progress, [start, start + 0.12], [0.04, 0.55]);
  return (
    <motion.line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke="#F4ECDE"
      strokeWidth="1"
      style={{ opacity }}
    />
  );
}
