"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import LottieGlow from "../LottieGlow";
import heroGlow from "@/lib/lottie/auth-hero-glow.json";
import { figureSubset } from "@/lib/zodiac/helpers";

/**
 * Pinned chapter: "Haz visible lo invisible".
 * The screen holds still while scroll does the work —
 * scattered signals drift into place, lines connect them,
 * and the word describing what you see changes:
 * datos sueltos → evidencia → patrón.
 */

type Signal = {
  label: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  r: number;
};

/* The pattern the signals converge into is the app's REAL Leo figure —
   its first 7 stars (Regulus → Chort), so "patrón" literally reveals
   the constellation the app draws. */
const LEO = figureSubset("leo", { x: 90, y: 50, w: 540, h: 300 }, 7);

const SIGNAL_META = [
  { label: "comida", fromX: 80, fromY: 60, color: "#FF4886", r: 4.2 },
  { label: "sueño", fromX: 560, fromY: 40, color: "#F4ECDE", r: 3.4 },
  { label: "entreno", fromX: 120, fromY: 330, color: "#D9AE6F", r: 3.8 },
  { label: "agua", fromX: 620, fromY: 300, color: "#F4ECDE", r: 3 },
  { label: "peso", fromX: 340, fromY: 370, color: "#FF4886", r: 3.6 },
  { label: "ánimo", fromX: 40, fromY: 200, color: "#D9AE6F", r: 3 },
  { label: "volver", fromX: 660, fromY: 130, color: "#F4ECDE", r: 3.2 },
];

const SIGNALS: Signal[] = SIGNAL_META.map((m, i) => ({
  ...m,
  toX: LEO.pts[i].x,
  toY: LEO.pts[i].y,
  // anchors of the real figure land slightly bigger
  r: LEO.pts[i].mag <= 2.3 ? m.r + 0.8 : m.r,
}));

// deliberately incomplete — the constellation only finishes in chapter IV
const LINKS = LEO.lines.slice(0, -2);

const PHASES = [
  {
    word: "señales sueltas",
    color: "text-cream/50",
    sub: "Un solo día cambia muy poco.",
  },
  {
    word: "repetición",
    color: "text-gold text-glow-gold",
    sub: "Los días repetidos cuentan una historia.",
  },
  {
    word: "un patrón",
    color: "text-pink text-glow-pink",
    sub: "Y cuando la repetición se conecta, aparece lo que antes no podías ver.",
  },
];

export default function RevealScene() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section id="promesa" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-gold/80">
          Capítulo III · Conexiones
        </p>
        <h2 className="mb-4 text-center font-sans text-3xl font-black leading-tight tracking-tight text-cream sm:text-5xl">
          Tus días se convierten en
        </h2>

        {/* the changing word */}
        <div className="relative mb-2 h-[4.5rem] w-full max-w-2xl sm:h-[5.5rem]">
          {PHASES.map((phase, i) => (
            <PhaseWord key={phase.word} phase={phase} i={i} progress={scrollYProgress} />
          ))}
        </div>

        <Sky progress={scrollYProgress} />

        {/* the changing subline */}
        <div className="relative mt-2 h-16 w-full max-w-xl text-center">
          {PHASES.map((phase, i) => (
            <PhaseSub key={phase.word} phase={phase} i={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* phase windows over scroll progress: [0–0.33] [0.33–0.66] [0.66–1] */
function phaseRange(i: number): [number, number, number, number] {
  const start = i / 3;
  const end = (i + 1) / 3;
  if (i === 0) return [0, 0.01, end - 0.06, end];
  if (i === 2) return [start, start + 0.06, 0.99, 1];
  return [start, start + 0.06, end - 0.06, end];
}

function PhaseWord({
  phase,
  i,
  progress,
}: {
  phase: (typeof PHASES)[number];
  i: number;
  progress: MotionValue<number>;
}) {
  const [a, b, c, d] = phaseRange(i);
  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, b], [18, 0]);
  return (
    <motion.p
      style={{ opacity, y }}
      className={`absolute inset-0 text-center font-serif text-5xl italic sm:text-7xl ${phase.color}`}
    >
      {phase.word}
    </motion.p>
  );
}

function PhaseSub({
  phase,
  i,
  progress,
}: {
  phase: (typeof PHASES)[number];
  i: number;
  progress: MotionValue<number>;
}) {
  const [a, b, c, d] = phaseRange(i);
  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  return (
    <motion.p
      style={{ opacity }}
      className="absolute inset-0 text-base leading-relaxed text-cream/60 sm:text-lg"
    >
      {phase.sub}
    </motion.p>
  );
}

function Sky({ progress }: { progress: MotionValue<number> }) {
  // ambient glow blooms only when the pattern appears
  const glow = useTransform(progress, [0.68, 0.95], [0, 0.6]);

  return (
    <div className="relative w-full max-w-2xl">
      {/* the app's gold star lottie ignites when the pattern appears */}
      <motion.div
        style={{ opacity: glow }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2"
      >
        <LottieGlow data={heroGlow} className="h-full w-full" />
      </motion.div>
      <svg viewBox="0 0 700 400" className="w-full" aria-hidden>
        <motion.ellipse
          cx="380"
          cy="200"
          rx="260"
          ry="150"
          fill="url(#revealGlow)"
          style={{ opacity: glow }}
        />
        {LINKS.map(([a, b], i) => (
          <SkyLink key={i} a={SIGNALS[a]} b={SIGNALS[b]} i={i} progress={progress} />
        ))}
        {SIGNALS.map((s, i) => (
          <SkySignal key={s.label} s={s} i={i} progress={progress} />
        ))}
        <defs>
          <radialGradient id="revealGlow">
            <stop offset="0%" stopColor="#FF4886" stopOpacity="0.14" />
            <stop offset="60%" stopColor="#2B0D24" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#090207" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function SkySignal({
  s,
  i,
  progress,
}: {
  s: Signal;
  i: number;
  progress: MotionValue<number>;
}) {
  // drift into place across phase 1 → 2, each with its own timing
  const t0 = 0.06 + i * 0.02;
  const t1 = 0.5 + i * 0.015;
  const cx = useTransform(progress, [t0, t1], [s.fromX, s.toX]);
  const cy = useTransform(progress, [t0, t1], [s.fromY, s.toY]);
  const opacity = useTransform(progress, [0.02 + i * 0.02, 0.1 + i * 0.02], [0, 1]);
  // labels are readable while the signals are still "loose data", then fade
  const labelOpacity = useTransform(progress, [0.08, 0.16, 0.3, 0.42], [0, 0.6, 0.6, 0]);
  // right-edge signals label to the left so nothing clips the viewBox
  const anchorEnd = s.fromX > 560;
  const lx = useTransform(cx, (v) => (anchorEnd ? v - 10 : v + 10));
  const ly = useTransform(cy, (v) => v - 8);

  return (
    <g>
      <motion.circle
        r={s.r}
        fill={s.color}
        className="glow-dot"
        style={{ cx, cy, opacity }}
      />
      <motion.text
        style={{ x: lx, y: ly, opacity: labelOpacity }}
        fill="rgba(244,236,222,0.7)"
        fontSize="11"
        letterSpacing="2"
        textAnchor={anchorEnd ? "end" : "start"}
      >
        {s.label}
      </motion.text>
    </g>
  );
}

function SkyLink({
  a,
  b,
  i,
  progress,
}: {
  a: Signal;
  b: Signal;
  i: number;
  progress: MotionValue<number>;
}) {
  // lines only begin once the points have settled (phase 2 → 3)
  const start = 0.52 + (i / LINKS.length) * 0.3;
  const pathLength = useTransform(progress, [start, start + 0.1], [0, 1]);
  const opacity = useTransform(progress, [start, start + 0.05], [0, 0.5]);

  const x1 = useTransform(progress, [0.06 + 0.02, 0.5], [a.fromX, a.toX]);
  const y1 = useTransform(progress, [0.06 + 0.02, 0.5], [a.fromY, a.toY]);
  const x2 = useTransform(progress, [0.06 + 0.02, 0.5], [b.fromX, b.toX]);
  const y2 = useTransform(progress, [0.06 + 0.02, 0.5], [b.fromY, b.toY]);

  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      style={{ pathLength, opacity }}
      stroke="#D9AE6F"
      strokeWidth="0.9"
    />
  );
}
