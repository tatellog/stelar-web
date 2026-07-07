"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Capítulo II — Señales.
 * Small glowing dots appear as you scroll: one per action (comida,
 * entreno, sueño, agua, proteína). Isolated. No lines. No meaning yet.
 * The universe slowly fills, still disconnected.
 */

const NAMED = [
  { label: "comida", x: "18%", y: "26%", c: "#FF4886", at: 0.1 },
  { label: "entreno", x: "76%", y: "20%", c: "#D9AE6F", at: 0.18 },
  { label: "sueño", x: "28%", y: "68%", c: "#F4ECDE", at: 0.26 },
  { label: "agua", x: "70%", y: "72%", c: "#F4ECDE", at: 0.34 },
  { label: "proteína", x: "50%", y: "16%", c: "#FF4886", at: 0.42 },
];

/* deterministic scatter for the anonymous signals that keep arriving */
function prand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 10000) / 10000;
}
const ANON = Array.from({ length: 22 }, (_, i) => ({
  x: `${8 + prand(i) * 84}%`,
  y: `${10 + prand(i + 40) * 78}%`,
  r: 2 + prand(i + 80) * 2.5,
  at: 0.45 + prand(i + 120) * 0.45,
}));

export default function Signals() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const headOpacity = useTransform(scrollYProgress, [0.05, 0.18], [0, 1]);
  const subOpacity = useTransform(scrollYProgress, [0.5, 0.65], [0, 1]);

  return (
    <section id="senales" ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* the signals, filling the sky but never connecting */}
        {NAMED.map((s) => (
          <NamedSignal key={s.label} s={s} progress={scrollYProgress} />
        ))}
        {ANON.map((s, i) => (
          <AnonSignal key={i} s={s} progress={scrollYProgress} />
        ))}

        <div className="relative z-10 max-w-2xl px-6 text-center">
          <motion.p
            style={{ opacity: headOpacity }}
            className="mb-4 text-xs uppercase tracking-[0.35em] text-gold/80"
          >
            Capítulo II · Señales
          </motion.p>
          <motion.h2
            style={{ opacity: headOpacity }}
            className="font-sans text-4xl font-black leading-tight tracking-tight text-cream sm:text-6xl"
          >
            Cada decisión deja una{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              señal.
            </span>
          </motion.h2>
          <motion.p
            style={{ opacity: subOpacity }}
            className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-cream/60"
          >
            Por sí solas parecen insignificantes.
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function NamedSignal({
  s,
  progress,
}: {
  s: (typeof NAMED)[number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [s.at, s.at + 0.08], [0, 1]);
  return (
    <motion.div
      style={{ left: s.x, top: s.y, opacity }}
      className="pointer-events-none absolute flex items-center gap-2"
    >
      <motion.span
        className="block h-2 w-2 rounded-full glow-dot"
        style={{ backgroundColor: s.c }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="text-[11px] tracking-[0.25em] text-cream/50">
        {s.label}
      </span>
    </motion.div>
  );
}

function AnonSignal({
  s,
  progress,
}: {
  s: (typeof ANON)[number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [s.at, s.at + 0.06], [0, 0.8]);
  return (
    <motion.span
      style={{ left: s.x, top: s.y, opacity, width: s.r, height: s.r }}
      className="pointer-events-none absolute rounded-full bg-cream/80 glow-dot"
    />
  );
}
