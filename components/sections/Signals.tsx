"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Capítulo II — Señales.
 * Glowing four-point stars appear as you scroll: one per action (comida,
 * entreno, sueño, agua, proteína). Isolated. No lines. No meaning yet.
 * Each one can be touched — it ignites in magenta, the app's achievement
 * colour: the first interactive promise of the journey.
 */

const NAMED = [
  { label: "comida", x: "16%", y: "24%", c: "#FF4886", at: 0.1 },
  { label: "entreno", x: "78%", y: "18%", c: "#E8B872", at: 0.18 },
  { label: "sueño", x: "26%", y: "66%", c: "#FBD7E3", at: 0.26 },
  { label: "agua", x: "72%", y: "70%", c: "#8FBEDB", at: 0.34 },
  { label: "proteína", x: "52%", y: "13%", c: "#E0AEA0", at: 0.42 },
];

/* deterministic scatter for the anonymous signals that keep arriving */
function prand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 10000) / 10000;
}
const ANON = Array.from({ length: 20 }, (_, i) => ({
  x: `${7 + prand(i) * 86}%`,
  y: `${10 + prand(i + 40) * 78}%`,
  size: 10 + prand(i + 80) * 10,
  at: 0.45 + prand(i + 120) * 0.45,
  dur: 3 + prand(i + 160) * 3,
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
        {NAMED.map((s) => (
          <NamedSignal key={s.label} s={s} progress={scrollYProgress} />
        ))}
        {ANON.map((s, i) => (
          <AnonSignal key={i} s={s} progress={scrollYProgress} />
        ))}

        <div className="pointer-events-none relative z-10 max-w-2xl px-6 text-center">
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
          <motion.p
            style={{ opacity: subOpacity }}
            className="mx-auto mt-3 text-xs uppercase tracking-[0.3em] text-cream/35"
          >
            Toca una señal para encenderla
          </motion.p>
        </div>
      </div>
    </section>
  );
}

/** Classic four-point sparkle path, centered at (0,0). */
function starPath(R: number) {
  const d = R * 0.22;
  return `M0 ${-R} Q ${d} ${-d} ${R} 0 Q ${d} ${d} 0 ${R} Q ${-d} ${d} ${-R} 0 Q ${-d} ${-d} 0 ${-R} Z`;
}

function NamedSignal({
  s,
  progress,
}: {
  s: (typeof NAMED)[number];
  progress: MotionValue<number>;
}) {
  const [lit, setLit] = useState(false);
  const opacity = useTransform(progress, [s.at, s.at + 0.08], [0, 1]);
  const color = lit ? "#FF4886" : s.c;

  return (
    <motion.button
      style={{ left: s.x, top: s.y, opacity }}
      onClick={() => setLit((v) => !v)}
      aria-label={`Señal: ${s.label}`}
      className="group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2.5 outline-none"
    >
      <span className="relative block h-12 w-12">
        {/* ambient halo */}
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}55 0%, ${color}18 45%, transparent 70%)`,
          }}
          animate={{ scale: lit ? [1, 1.5, 1.25] : [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: lit ? 2.4 : 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* ignition ring on touch */}
        {lit && (
          <motion.span
            key="ring"
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${color}88` }}
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
        )}
        {/* the star itself: cross flare + four-point body + white-hot core */}
        <motion.svg
          viewBox="-24 -24 48 48"
          className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-125"
          animate={{ scale: lit ? 1.25 : 1, rotate: lit ? 45 : 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 22px ${color}66)` }}
        >
          <line x1="-22" y1="0" x2="22" y2="0" stroke={color} strokeWidth="0.7" opacity="0.55" />
          <line x1="0" y1="-22" x2="0" y2="22" stroke={color} strokeWidth="0.7" opacity="0.55" />
          <path d={starPath(11)} fill={color} />
          <circle r="2.6" fill="#FFFFFF" />
        </motion.svg>
      </span>
      <span
        className={`text-[12px] tracking-[0.28em] transition-colors duration-500 ${
          lit ? "text-cream" : "text-cream/55 group-hover:text-cream/85"
        }`}
      >
        {s.label}
        {lit && <span className="ml-2 text-[10px] tracking-[0.2em] text-pink">· encendida</span>}
      </span>
    </motion.button>
  );
}

function AnonSignal({
  s,
  progress,
}: {
  s: (typeof ANON)[number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [s.at, s.at + 0.06], [0, 1]);
  return (
    <motion.span
      style={{ left: s.x, top: s.y, opacity, width: s.size, height: s.size }}
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
    >
      <motion.svg
        viewBox="-12 -12 24 24"
        className="h-full w-full"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 6px rgba(244,236,222,0.8))" }}
      >
        <path d={starPath(7)} fill="#F4ECDE" opacity="0.9" />
      </motion.svg>
    </motion.span>
  );
}
