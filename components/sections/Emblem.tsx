"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { useSign } from "../SignContext";
import { FIGURES } from "@/lib/zodiac/figures";

const FRAMES = 11;

/**
 * Capítulo XI — El emblema. The emotional climax.
 * The visitor's constellation never disappears: as you scroll, its lines
 * brighten, particles converge, and the emblem is painted into being FROM
 * INSIDE the figure — frame by frame, driven by scroll. Discovered, not
 * generated. Never fully revealed: it must feel like a promise.
 */
export default function Emblem() {
  const ref = useRef<HTMLDivElement>(null);
  const { sign } = useSign();
  const def = FIGURES[sign];

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = scrollYProgress;

  // headline opens the chapter, closing words end it
  const introOpacity = useTransform(p, [0.03, 0.12, 0.24, 0.32], [0, 1, 1, 0]);
  // constellation: always there, brightening as the emblem approaches
  const figureGlow = useTransform(p, [0.15, 0.5], [0.45, 1]);
  // the emblem, born from inside — scroll drives the paint frames.
  // It never arrives at full light: the reveal is a promise, not a prize.
  const emblemOpacity = useTransform(p, [0.2, 0.48], [0, 0.72]);
  // golden aura — a pure radial falloff, no visible rim
  const auraOpacity = useTransform(p, [0.42, 0.75], [0, 0.85]);
  const textOpacity = useTransform(p, [0.8, 0.9], [0, 1]);
  const textY = useTransform(p, [0.8, 0.9], [24, 0]);

  // scroll → paint frame (preloaded so the paint never stutters).
  // The paint stops before the last frames: partially revealed, on purpose.
  const [frame, setFrame] = useState(0);
  const frameValue = useTransform(p, [0.22, 0.72], [0, FRAMES - 3]);
  useMotionValueEvent(frameValue, "change", (v) => {
    setFrame(Math.min(FRAMES - 3, Math.max(0, Math.round(v))));
  });
  // preload the paint frames only when the chapter approaches — ~1 MB of
  // PNGs must not compete with the hero's first load
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        for (let i = 0; i < FRAMES; i++) {
          const img = new window.Image();
          img.src = `/emblems/${sign}/f${String(i).padStart(2, "0")}.webp`;
        }
        io.disconnect();
      },
      { rootMargin: "1600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [sign]);

  return (
    <section id="emblema" ref={ref} className="relative h-[380vh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        {/* the chapter opens */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="absolute top-[max(14%,5.5rem)] z-10 max-w-2xl px-6 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold/80">
            Capítulo XII · El emblema
          </p>
          <h2 className="font-sans text-3xl font-black leading-tight tracking-tight text-cream sm:text-5xl">
            Tus hábitos dejan más que datos.{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              Dejan una marca.
            </span>
          </h2>
        </motion.div>

        <div className="relative w-full max-w-[min(24rem,80vh)] px-6 sm:max-w-[min(34rem,72vh)]">
          {/* golden aura — smooth radial falloff, dissolves into the sky
              with no rim (the SVG aura read as a hard circle) */}
          <motion.div
            style={{ opacity: auraOpacity }}
            className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_50%_48%,rgba(255,246,229,0.13)_0%,rgba(217,174,111,0.09)_30%,rgba(217,174,111,0.035)_55%,rgba(217,174,111,0.012)_72%,transparent_88%)] sm:-inset-32"
          />

          {/* the emblem, painted into being by the scroll — same art box as
              the constellation (the figure was traced over this art) */}
          <motion.div
            style={{ opacity: emblemOpacity }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/emblems/${sign}/f${String(frame).padStart(2, "0")}.webp`}
              alt={`Emblema de ${def.label}`}
              className="h-full w-full object-contain"
              loading="lazy"
              decoding="async"
              width={480}
              height={480}
              draggable={false}
            />
          </motion.div>

          {/* the constellation — never disappears; the emblem is born from it */}
          <motion.svg
            viewBox="0 0 100 100"
            className="relative h-auto w-full"
            aria-hidden
            style={{ opacity: figureGlow }}
          >
            <defs>
              <radialGradient id="emblemStarHero">
                <stop offset="0%" stopColor="rgba(251,215,227,0.55)" />
                <stop offset="40%" stopColor="rgba(233,30,99,0.18)" />
                <stop offset="100%" stopColor="rgba(233,30,99,0)" />
              </radialGradient>
              <radialGradient id="emblemStarDim">
                <stop offset="0%" stopColor="rgba(255,233,194,0.4)" />
                <stop offset="45%" stopColor="rgba(232,184,114,0.12)" />
                <stop offset="100%" stopColor="rgba(232,184,114,0)" />
              </radialGradient>
            </defs>
            {def.lines.map(([a, b], i) => (
              <BrighteningLine key={i} def={def} a={a} b={b} i={i} progress={p} />
            ))}
            {def.stars.map((s, i) => {
              const hero = s.mag <= 2;
              const x = s.x * 100;
              const y = s.y * 100;
              const r = hero ? 2.3 : 1.5; // four-point body
              const w = r * 0.26;
              return (
                <g key={i}>
                  {/* diffuse halo — a single soft falloff, never a ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={hero ? 6.5 : 4}
                    fill={`url(#${hero ? "emblemStarHero" : "emblemStarDim"})`}
                  />
                  {/* the star itself: a small four-point sparkle */}
                  <path
                    d={`M ${x} ${y - r} Q ${x + w} ${y - w} ${x + r} ${y} Q ${x + w} ${y + w} ${x} ${y + r} Q ${x - w} ${y + w} ${x - r} ${y} Q ${x - w} ${y - w} ${x} ${y - r} Z`}
                    fill={hero ? "#FFF6E5" : "#F4ECDE"}
                    opacity={hero ? 0.95 : 0.8}
                  />
                </g>
              );
            })}
          </motion.svg>
        </div>

        {/* closing words */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute bottom-[7%] z-10 max-w-xl px-6 text-center"
        >
          <p className="font-serif text-xl italic text-gold sm:text-2xl">
            No lo desbloqueas. Lo revelas.
          </p>
          <p className="mt-4 text-base leading-relaxed text-cream/65 sm:text-lg">
            Cada acción repetida ilumina una parte de tu emblema.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function BrighteningLine({
  def,
  a,
  b,
  i,
  progress,
}: {
  def: (typeof FIGURES)[keyof typeof FIGURES];
  a: number;
  b: number;
  i: number;
  progress: MotionValue<number>;
}) {
  // each line brightens in sequence as the emblem approaches
  const start = 0.12 + (i / def.lines.length) * 0.25;
  const opacity = useTransform(progress, [start, start + 0.1], [0.14, 0.5]);
  return (
    <motion.line
      x1={def.stars[a].x * 100}
      y1={def.stars[a].y * 100}
      x2={def.stars[b].x * 100}
      y2={def.stars[b].y * 100}
      stroke="#D9AE6F"
      strokeWidth="0.3"
      strokeLinecap="round"
      style={{ opacity }}
    />
  );
}
