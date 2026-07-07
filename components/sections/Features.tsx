"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Reveal from "../Reveal";

const FEATURES: {
  name: string;
  icon: string;
  question: string;
  copy: string;
  visual: ReactNode;
}[] = [
  {
    name: "Hoy",
    icon: "/icons/north-star.svg",
    question: "¿Cómo voy hoy?",
    copy: "Te muestra si tus decisiones de hoy te acercan a tu objetivo.",
    visual: <TodayRing />,
  },
  {
    name: "Comidas",
    icon: "/icons/food-vect.svg",
    question: "¿Qué estoy consumiendo?",
    copy: "Registra comida rápido y entiende proteína, calorías y agua. Cada comida es una fase de tu luna.",
    visual: <MoonPhases />,
  },
  {
    name: "Progreso",
    icon: "/icons/progress.svg",
    question: "¿Qué cambió?",
    copy: "Peso, fotos, medidas y evolución sin culpa.",
    visual: <ProgressLine />,
  },
  {
    name: "Órbita",
    icon: "/icons/orbits.svg",
    question: "¿Qué patrón apareció?",
    copy: "Descubre relaciones reales entre tus hábitos usando tu propia evidencia.",
    visual: <MiniConstellation />,
  },
];

export default function Features() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-20 max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo III · El mapa
          </p>
          <h2 className="font-sans text-4xl font-black leading-tight tracking-tight text-cream sm:text-5xl">
            No es una lista de funciones. Es la forma en que empiezas a{" "}
            <span className="font-serif italic font-medium text-pink">verte.</span>
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.12}>
              <article className="group relative h-full overflow-hidden rounded-3xl border hairline bg-cream/[0.03] p-8 transition-all duration-700 hover:border-pink/25 hover:bg-cream/[0.05]">
                <div className="mb-8 flex h-36 items-center justify-center">
                  {f.visual}
                </div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold/80">
                  <Image src={f.icon} alt="" width={18} height={18} className="opacity-80" />
                  {f.name}
                </p>
                <h3 className="mt-2 font-serif text-2xl italic text-cream">
                  {f.question}
                </h3>
                <p className="mt-3 leading-relaxed text-cream/60">{f.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Micro mockups ─────────────────────────────────────────────── */

function TodayRing() {
  return (
    <svg viewBox="0 0 120 120" className="h-32 w-32" aria-hidden>
      <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(244,236,222,0.08)" strokeWidth="6" />
      <motion.circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke="#FF4886"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="289"
        transform="rotate(-90 60 60)"
        initial={{ strokeDashoffset: 289 }}
        whileInView={{ strokeDashoffset: 289 * 0.28 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        style={{ filter: "drop-shadow(0 0 8px rgba(255,72,134,0.5))" }}
      />
      <text x="60" y="57" textAnchor="middle" fill="#F4ECDE" fontSize="17" fontWeight="600">
        72%
      </text>
      <text x="60" y="74" textAnchor="middle" fill="rgba(244,236,222,0.5)" fontSize="8" letterSpacing="1.5">
        DEL DÍA
      </text>
    </svg>
  );
}

/** The app's real moon phases — each logged meal fills the day's moon. */
function MoonPhases() {
  const moons = [
    { src: "/art/moon-phase-0.png", label: "Desayuno" },
    { src: "/art/moon-phase-2.png", label: "Comida" },
    { src: "/art/moon-phase-4.png", label: "Cena" },
  ];
  return (
    <div className="flex w-full max-w-[240px] items-end justify-between">
      {moons.map((m, i) => (
        <motion.div
          key={m.label}
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 + i * 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={m.src}
            alt=""
            width={56}
            height={56}
            className="drop-shadow-[0_0_14px_rgba(251,215,227,0.35)]"
          />
          <span className="text-[9px] uppercase tracking-[0.2em] text-cream/45">
            {m.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ProgressLine() {
  return (
    <svg viewBox="0 0 220 110" className="h-32 w-full max-w-[220px]" aria-hidden>
      <motion.path
        d="M10 30 C 50 34, 70 58, 105 60 S 175 78, 210 88"
        fill="none"
        stroke="#D9AE6F"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
        style={{ filter: "drop-shadow(0 0 6px rgba(217,174,111,0.5))" }}
      />
      {[
        { x: 10, y: 30 },
        { x: 105, y: 60 },
        { x: 210, y: 88 },
      ].map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#F4ECDE"
          className="glow-dot"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 + i * 0.7 }}
        />
      ))}
    </svg>
  );
}

function MiniConstellation() {
  const pts = [
    { x: 40, y: 80 },
    { x: 85, y: 30 },
    { x: 140, y: 60 },
    { x: 180, y: 25 },
    { x: 165, y: 95 },
  ];
  const links = [
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 4],
  ];
  return (
    <svg viewBox="0 0 220 120" className="h-32 w-full max-w-[220px]" aria-hidden>
      {links.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={pts[a].x}
          y1={pts[a].y}
          x2={pts[b].x}
          y2={pts[b].y}
          stroke="rgba(244,236,222,0.35)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 + i * 0.3, ease: "easeInOut" }}
        />
      ))}
      {pts.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === 2 ? 4 : 2.8}
          fill={i === 2 ? "#FF4886" : "#F4ECDE"}
          className="glow-dot"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
        />
      ))}
    </svg>
  );
}
