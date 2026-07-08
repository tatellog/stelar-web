"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  const emblemOpacity = useTransform(p, [0.3, 0.55], [0, 0.72]);
  // ceremonial layers
  const auraOpacity = useTransform(p, [0.45, 0.8], [0, 0.8]);
  const haloOpacity = useTransform(p, [0.55, 0.78], [0, 0.85]);
  const haloScale = useTransform(p, [0.55, 0.85], [0.85, 1]);
  const textOpacity = useTransform(p, [0.8, 0.9], [0, 1]);
  const textY = useTransform(p, [0.8, 0.9], [24, 0]);

  // scroll → paint frame (preloaded so the paint never stutters).
  // The paint stops before the last frames: partially revealed, on purpose.
  const [frame, setFrame] = useState(0);
  const frameValue = useTransform(p, [0.32, 0.75], [0, FRAMES - 3]);
  useMotionValueEvent(frameValue, "change", (v) => {
    setFrame(Math.min(FRAMES - 3, Math.max(0, Math.round(v))));
  });
  useEffect(() => {
    for (let i = 0; i < FRAMES; i++) {
      const img = new window.Image();
      img.src = `/emblems/${sign}/f${String(i).padStart(2, "0")}.png`;
    }
  }, [sign]);

  return (
    <section id="emblema" ref={ref} className="relative h-[380vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* the chapter opens */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="absolute top-[14%] z-10 max-w-2xl px-6 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold/80">
            Capítulo XI · El emblema
          </p>
          <h2 className="font-sans text-3xl font-black leading-tight tracking-tight text-cream sm:text-5xl">
            Tus hábitos dejan más que datos.{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              Dejan una marca.
            </span>
          </h2>
        </motion.div>

        <div className="relative w-full max-w-[22rem] px-6 sm:max-w-md">
          {/* golden aura */}
          <motion.div
            style={{ opacity: auraOpacity }}
            className="pointer-events-none absolute -inset-16"
          >
            <Image src="/reveal/golden-aura.svg" alt="" fill sizes="100vw" className="object-contain" />
          </motion.div>

          {/* ceremonial halo */}
          <motion.div
            style={{ opacity: haloOpacity, scale: haloScale }}
            className="pointer-events-none absolute -inset-4"
          >
            <Image src="/reveal/ceremonial-halo.svg" alt="" fill sizes="100vw" className="object-contain" />
          </motion.div>

          {/* the emblem, painted into being by the scroll */}
          <motion.div
            style={{ opacity: emblemOpacity }}
            className="absolute inset-[10%]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/emblems/${sign}/f${String(frame).padStart(2, "0")}.png`}
              alt={`Emblema de ${def.label}`}
              className="h-full w-full object-contain"
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
            {def.lines.map(([a, b], i) => (
              <BrighteningLine key={i} def={def} a={a} b={b} i={i} progress={p} />
            ))}
            {def.stars.map((s, i) => (
              <g key={i}>
                <circle
                  cx={s.x * 100}
                  cy={s.y * 100}
                  r={s.mag <= 2 ? 4.6 : 3}
                  fill={s.mag <= 2 ? "rgba(233,30,99,0.3)" : "rgba(233,30,99,0.16)"}
                />
                <circle
                  cx={s.x * 100}
                  cy={s.y * 100}
                  r={s.mag <= 2 ? 1.9 : 1.2}
                  fill={s.mag <= 2 ? "#FBD7E3" : "#F4ECDE"}
                  className="glow-dot"
                />
              </g>
            ))}
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
  const opacity = useTransform(progress, [start, start + 0.1], [0.18, 0.7]);
  return (
    <motion.line
      x1={def.stars[a].x * 100}
      y1={def.stars[a].y * 100}
      x2={def.stars[b].x * 100}
      y2={def.stars[b].y * 100}
      stroke="#D9AE6F"
      strokeWidth="0.4"
      style={{ opacity }}
    />
  );
}
