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
import { figureFit } from "@/lib/zodiac/helpers";

/**
 * Capítulo III — Conexiones.
 * The signals from chapter II drift into place and thin golden lines
 * connect them, drawn progressively, until the REAL Leo figure is
 * unmistakably taking shape — deliberately left one line short.
 * Same star language as chapter II: four-point sparkles with flare.
 */

const VIEW = { w: 700, h: 400 };
// the full Leo figure, fitted to the canvas so the lion reads clearly
const LEO = figureFit("leo", { x: 40, y: 20, w: 620, h: 360 });

// one signal per Leo star — "volver" lands on Regulus, el corazón del león
const META = [
  { label: "volver", color: "#FF4886" },
  { label: "sueño", color: "#FBD7E3" },
  { label: "comida", color: "#E0AEA0" },
  { label: "proteína", color: "#E8B872" },
  { label: "agua", color: "#8FBEDB" },
  { label: "entreno", color: "#FF9E57" },
  { label: "ánimo", color: "#C18FFF" },
  { label: "pasos", color: "#FFC56B" },
  { label: "peso", color: "#F4ECDE" },
];

/* scattered origins around the edges, deterministic */
function prand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 10000) / 10000;
}

const SIGNALS = LEO.pts.map((p, i) => ({
  ...META[i % META.length],
  toX: p.x,
  toY: p.y,
  mag: p.mag,
  name: p.name,
  // spread the origins across the width (index-based) so no corner clumps
  fromX: 50 + (i / 8) * 600 + (prand(i + 3) - 0.5) * 90,
  fromY: i % 2 === 0 ? 10 + prand(i + 11) * 70 : 310 + prand(i + 11) * 80,
}));

// deliberately one line short — the figure completes in chapter IV
const LINKS = LEO.lines.slice(0, -1);

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

/** Classic four-point sparkle path, centered at (0,0). */
function starPath(R: number) {
  const d = R * 0.22;
  return `M0 ${-R} Q ${d} ${-d} ${R} 0 Q ${d} ${d} 0 ${R} Q ${-d} ${d} ${-R} 0 Q ${-d} ${-d} 0 ${-R} Z`;
}

function Sky({ progress }: { progress: MotionValue<number> }) {
  // the gold star lottie ignites on Regulus when the pattern appears
  const glow = useTransform(progress, [0.7, 0.95], [0, 0.85]);
  const regulus = SIGNALS[0];

  return (
    <div className="relative w-full max-w-3xl">
      <motion.div
        style={{
          opacity: glow,
          left: `${(regulus.toX / VIEW.w) * 100}%`,
          top: `${(regulus.toY / VIEW.h) * 100}%`,
        }}
        className="pointer-events-none absolute z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2"
      >
        <LottieGlow data={heroGlow} className="h-full w-full" />
      </motion.div>

      <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="w-full" aria-hidden>
        {LINKS.map(([a, b], i) => (
          <SkyLink key={i} a={SIGNALS[a]} b={SIGNALS[b]} i={i} progress={progress} />
        ))}
        {SIGNALS.map((s, i) => (
          <SkySignal key={i} s={s} i={i} progress={progress} />
        ))}
      </svg>
    </div>
  );
}

function SkySignal({
  s,
  i,
  progress,
}: {
  s: (typeof SIGNALS)[number];
  i: number;
  progress: MotionValue<number>;
}) {
  const hero = s.mag <= 2.3;
  const R = hero ? 11 : s.mag <= 3 ? 7.5 : 6;

  // drift into place across phase 1 → 2
  const t0 = 0.05 + i * 0.018;
  const t1 = 0.48 + i * 0.014;
  const x = useTransform(progress, [t0, t1], [s.fromX, s.toX]);
  const y = useTransform(progress, [t0, t1], [s.fromY, s.toY]);
  const opacity = useTransform(progress, [t0, t0 + 0.06], [0, 1]);
  // labels readable while signals are loose, then fade
  const labelOpacity = useTransform(progress, [0.08, 0.16, 0.3, 0.42], [0, 0.65, 0.65, 0]);
  const anchorEnd = s.fromX > 560;
  const lx = useTransform(x, (v) => (anchorEnd ? v - R - 6 : v + R + 6));
  const ly = useTransform(y, (v) => v - R - 4);

  return (
    <g>
      <motion.g style={{ x, y, opacity }}>
        <motion.g
          animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.12, 1] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
          style={{
            filter: `drop-shadow(0 0 8px ${s.color}) drop-shadow(0 0 20px ${s.color}55)`,
          }}
        >
          {hero && (
            <>
              <line x1={-R * 2} y1="0" x2={R * 2} y2="0" stroke={s.color} strokeWidth="0.7" opacity="0.5" />
              <line x1="0" y1={-R * 2} x2="0" y2={R * 2} stroke={s.color} strokeWidth="0.7" opacity="0.5" />
            </>
          )}
          <path d={starPath(R)} fill={s.color} />
          <circle r={R * 0.24} fill="#FFFFFF" />
        </motion.g>
      </motion.g>
      <motion.text
        style={{ x: lx, y: ly, opacity: labelOpacity }}
        fill="rgba(244,236,222,0.75)"
        fontSize="12"
        letterSpacing="2.5"
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
  a: (typeof SIGNALS)[number];
  b: (typeof SIGNALS)[number];
  i: number;
  progress: MotionValue<number>;
}) {
  // golden threads, drawn one after another once the points settled
  const start = 0.5 + (i / LINKS.length) * 0.34;
  const pathLength = useTransform(progress, [start, start + 0.09], [0, 1]);
  const opacity = useTransform(progress, [start, start + 0.04], [0, 0.75]);

  const x1 = useTransform(progress, [0.08, 0.5], [a.fromX, a.toX]);
  const y1 = useTransform(progress, [0.08, 0.5], [a.fromY, a.toY]);
  const x2 = useTransform(progress, [0.08, 0.5], [b.fromX, b.toX]);
  const y2 = useTransform(progress, [0.08, 0.5], [b.fromY, b.toY]);

  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      style={{ pathLength, opacity }}
      stroke="#D9AE6F"
      strokeWidth="1.1"
      strokeLinecap="round"
      filter="drop-shadow(0 0 4px rgba(217,174,111,0.6))"
    />
  );
}
