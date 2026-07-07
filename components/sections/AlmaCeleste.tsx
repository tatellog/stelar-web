"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * Final reveal chapter, pinned while you scroll:
 * everything darkens → a central star is born → particles fall into orbit →
 * golden lines connect the evidence → the app's real Alma Celeste art is
 * revealed inside its ceremonial halo, aura and god rays. Emotional, never
 * gaming.
 */
export default function AlmaCeleste() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = scrollYProgress;

  // 1. the world dims
  const dim = useTransform(p, [0, 0.18], [0, 0.88]);
  // intro line
  const introOpacity = useTransform(p, [0.02, 0.1, 0.2, 0.28], [0, 1, 1, 0]);
  // 2. central star
  const starOpacity = useTransform(p, [0.16, 0.28, 0.6, 0.72], [0, 1, 1, 0]);
  const starScale = useTransform(p, [0.16, 0.34], [0.4, 1]);
  // 3. orbiting particles
  const orbitOpacity = useTransform(p, [0.26, 0.4, 0.85, 1], [0, 1, 1, 0.45]);
  const orbitTurn = useTransform(p, [0.25, 1], [0, 130]);
  // 5. the reveal — the app's real ceremonial layers
  const raysOpacity = useTransform(p, [0.52, 0.75], [0, 0.55]);
  const auraOpacity = useTransform(p, [0.5, 0.78], [0, 0.85]);
  const haloOpacity = useTransform(p, [0.55, 0.72], [0, 0.9]);
  const haloScale = useTransform(p, [0.55, 0.8], [0.82, 1]);
  const artOpacity = useTransform(p, [0.58, 0.82], [0, 1]);
  const artScale = useTransform(p, [0.58, 0.88], [0.92, 1]);
  const artY = useTransform(p, [0.58, 0.88], [18, 0]);
  // 6. final glow + words
  const finalGlow = useTransform(p, [0.8, 0.96], [0, 0.65]);
  const textOpacity = useTransform(p, [0.78, 0.88], [0, 1]);
  const textY = useTransform(p, [0.78, 0.88], [24, 0]);

  return (
    <section id="alma" ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* darkness closing in */}
        <motion.div
          style={{ opacity: dim }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_90%_at_50%_50%,rgba(9,2,7,0.55)_0%,#090207_78%)]"
        />

        {/* opening line of the chapter */}
        <motion.p
          style={{ opacity: introOpacity }}
          className="absolute top-[18%] px-6 text-center font-serif text-2xl italic text-cream/70 sm:text-3xl"
        >
          Cuando tu evidencia se acumula, algo empieza a tomar forma.
        </motion.p>

        <div className="relative w-full max-w-[21rem] px-6 sm:max-w-sm">
          {/* god rays — turning almost imperceptibly behind everything */}
          <motion.div
            style={{ opacity: raysOpacity }}
            className="pointer-events-none absolute -inset-24"
          >
            <div className="h-full w-full animate-orbit" style={{ animationDuration: "220s" }}>
              <Image src="/reveal/god-rays.svg" alt="" fill className="object-contain" />
            </div>
          </motion.div>

          {/* golden aura — the soft radial seal */}
          <motion.div
            style={{ opacity: auraOpacity }}
            className="pointer-events-none absolute -inset-16"
          >
            <Image src="/reveal/golden-aura.svg" alt="" fill className="object-contain" />
          </motion.div>

          {/* ceremonial halo — the broken art-deco ring */}
          <motion.div
            style={{ opacity: haloOpacity, scale: haloScale }}
            className="pointer-events-none absolute -inset-6"
          >
            <Image src="/reveal/ceremonial-halo.svg" alt="" fill className="object-contain" />
          </motion.div>

          <svg viewBox="0 0 400 480" className="w-full" aria-hidden>
            {/* final aura */}
            <motion.ellipse
              cx="200"
              cy="240"
              rx="170"
              ry="220"
              fill="url(#aura)"
              style={{ opacity: finalGlow }}
            />

            {/* central star — the seed the art grows from */}
            <motion.g
              style={{
                opacity: starOpacity,
                scale: starScale,
                transformBox: "fill-box",
                transformOrigin: "center",
              }}
            >
              <circle cx="200" cy="240" r="5" fill="#F4ECDE" className="glow-dot" />
              <circle cx="200" cy="240" r="14" fill="none" stroke="rgba(255,72,134,0.4)" strokeWidth="0.6" />
              <circle cx="200" cy="240" r="26" fill="none" stroke="rgba(217,174,111,0.2)" strokeWidth="0.5" strokeDasharray="1 3" />
            </motion.g>

            {/* orbiting evidence + golden connections */}
            <OrbitingEvidence
              opacity={orbitOpacity}
              turn={orbitTurn}
              progress={p}
            />

            <defs>
              <radialGradient id="aura">
                <stop offset="0%" stopColor="#D9AE6F" stopOpacity="0.14" />
                <stop offset="55%" stopColor="#FF4886" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#0A0608" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          {/* the Alma Celeste itself — the app's real golden art */}
          <motion.div
            style={{ opacity: artOpacity, scale: artScale, y: artY }}
            className="pointer-events-none absolute inset-x-8 inset-y-2"
          >
            <Image
              src="/art/alma-celeste.png"
              alt="Alma Celeste"
              fill
              className="object-contain drop-shadow-[0_0_50px_rgba(217,174,111,0.35)]"
            />
          </motion.div>
        </div>

        {/* closing words */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute bottom-[6%] max-w-xl px-6 text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <p className="text-xs uppercase tracking-[0.35em] text-gold">
              Alma Celeste
            </p>
            <span className="rounded-full border border-gold/30 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-gold/70">
              Próximamente
            </span>
          </div>
          <h2 className="mt-3 font-sans text-3xl font-black leading-snug tracking-tight text-cream sm:text-4xl">
            Lo que repites empieza a{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              tomar forma.
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/55 sm:text-base">
            Una representación visual de la identidad que estás construyendo
            con tus hábitos. No es un premio. Es un reflejo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* Deterministic pseudo-random, rounded so SSR and client agree. */
function prand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 10000) / 10000;
}

const EVIDENCE_ANGLES = Array.from({ length: 7 }, (_, i) => ({
  angle: (i / 7) * Math.PI * 2 + prand(i) * 0.5,
  rx: 70 + prand(i + 10) * 60,
  ry: 100 + prand(i + 20) * 80,
  r: 1.6 + prand(i + 30) * 1.8,
  color: prand(i + 40) > 0.7 ? "#FF4886" : prand(i + 40) > 0.35 ? "#D9AE6F" : "#F4ECDE",
}));

const DUST = Array.from({ length: 26 }, (_, i) => ({
  angle: prand(i + 50) * Math.PI * 2,
  rx: 50 + prand(i + 60) * 110,
  ry: 70 + prand(i + 70) * 140,
  r: 0.5 + prand(i + 80) * 1,
}));

function OrbitingEvidence({
  opacity,
  turn,
  progress,
}: {
  opacity: MotionValue<number>;
  turn: MotionValue<number>;
  progress: MotionValue<number>;
}) {
  const round = (v: number) => Math.round(v * 100) / 100;
  const pts = EVIDENCE_ANGLES.map((e) => ({
    ...e,
    x: round(200 + Math.cos(e.angle) * e.rx),
    y: round(240 + Math.sin(e.angle) * e.ry),
  }));

  return (
    <motion.g
      style={{
        opacity,
        rotate: turn,
        transformBox: "fill-box",
        transformOrigin: "200px 240px",
      }}
    >
      {DUST.map((d, i) => (
        <circle
          key={`d${i}`}
          cx={round(200 + Math.cos(d.angle) * d.rx)}
          cy={round(240 + Math.sin(d.angle) * d.ry)}
          r={d.r}
          fill="rgba(244,236,222,0.35)"
        />
      ))}
      {/* golden threads connecting the evidence, drawn in sequence */}
      {pts.map((p, i) => {
        const next = pts[(i + 1) % pts.length];
        return (
          <GoldThread key={`l${i}`} a={p} b={next} i={i} progress={progress} />
        );
      })}
      {pts.map((p, i) => (
        <circle
          key={`p${i}`}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={p.color}
          className="glow-dot"
        />
      ))}
    </motion.g>
  );
}

function GoldThread({
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
  const start = 0.38 + (i / 7) * 0.16;
  const pathLength = useTransform(progress, [start, start + 0.08], [0, 1]);
  const opacity = useTransform(progress, [start, start + 0.04], [0, 0.45]);
  return (
    <motion.line
      x1={a.x}
      y1={a.y}
      x2={b.x}
      y2={b.y}
      stroke="#D9AE6F"
      strokeWidth="0.6"
      style={{ pathLength, opacity }}
    />
  );
}
