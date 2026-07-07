"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../Reveal";
import PhoneMockup from "../PhoneMockup";
import DiaScreen from "../screens/DiaScreen";
import SemanaScreen from "../screens/SemanaScreen";
import MesScreen from "../screens/MesScreen";

type Level = "dia" | "semana" | "mes";

const LEVELS: {
  id: Level;
  label: string;
  caption: string;
  question: string;
  copy: string;
}[] = [
  {
    id: "dia",
    label: "Día",
    caption: "Un punto",
    question: "¿Cómo voy hoy?",
    copy: "Una sola señal. Suficiente para saber si hoy te acercas.",
  },
  {
    id: "semana",
    label: "Semana",
    caption: "Una relación",
    question: "¿Qué empezó a repetirse?",
    copy: "Dos señales que aparecen juntas ya no son casualidad.",
  },
  {
    id: "mes",
    label: "Mes",
    caption: "Un patrón",
    question: "¿Qué reveló este mes sobre mí?",
    copy: "Tu evidencia acumulada dibuja algo que ningún día suelto podía mostrarte.",
  },
];

const SCREENS: Record<Level, React.ReactNode> = {
  dia: <DiaScreen />,
  semana: <SemanaScreen />,
  mes: <MesScreen />,
};

/** Interactive chapter: one solar system, three depths of reading. */
export default function Orbita() {
  const [level, setLevel] = useState<Level>("dia");
  const active = LEVELS.find((l) => l.id === level)!;

  return (
    <section id="orbita" className="relative py-32 sm:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(255,72,134,0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VI · Órbita
          </p>
          <h2 className="font-sans text-5xl font-black leading-tight tracking-tight text-cream sm:text-6xl">
            No son datos.{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              Es evidencia.
            </span>
          </h2>
        </Reveal>

        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          {/* left: solar system + level controls */}
          <div>
            <SolarSystem level={level} />

            <div className="mt-10 grid grid-cols-3 gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onMouseEnter={() => setLevel(l.id)}
                  onFocus={() => setLevel(l.id)}
                  onClick={() => setLevel(l.id)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-500 ${
                    level === l.id
                      ? "border-pink/50 bg-pink/[0.07] shadow-[0_0_30px_rgba(255,72,134,0.15)]"
                      : "hairline border bg-cream/[0.02] hover:border-cream/20"
                  }`}
                >
                  <p className="text-[9px] uppercase tracking-[0.25em] text-cream/40">
                    {l.caption}
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium tracking-wide transition-colors duration-500 ${
                      level === l.id ? "text-cream" : "text-cream/60"
                    }`}
                  >
                    {l.label}
                  </p>
                </button>
              ))}
            </div>

            <div className="relative mt-8 min-h-[7rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="font-serif text-3xl italic text-cream">
                    {active.question}
                  </h3>
                  <p className="mt-3 max-w-md leading-relaxed text-cream/60">
                    {active.copy}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* right: the living mockup, lit by the active level */}
          <motion.div
            className="mx-auto w-full max-w-[270px]"
            animate={{
              filter:
                level === "mes"
                  ? "drop-shadow(0 0 50px rgba(255,72,134,0.28))"
                  : level === "semana"
                    ? "drop-shadow(0 0 40px rgba(217,174,111,0.22))"
                    : "drop-shadow(0 0 30px rgba(244,236,222,0.12))",
            }}
            transition={{ duration: 1 }}
          >
            <div className="animate-float-slow">
              <PhoneMockup>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={level}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                  >
                    {SCREENS[level]}
                  </motion.div>
                </AnimatePresence>
              </PhoneMockup>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


/**
 * One system, three depths — the app's real Órbita art:
 * Día is the living galaxy, Semana the map of relations,
 * Mes the black hole where everything you repeated collapses into shape.
 */
const ART: Record<Level, { src: string; alt: string }> = {
  dia: { src: "/art/orbit-day.png", alt: "Órbita del día" },
  semana: { src: "/art/orbit-week.png", alt: "Órbita de la semana" },
  mes: { src: "/art/orbit-month.png", alt: "Órbita del mes" },
};

function SolarSystem({ level }: { level: Level }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* faint permanent rings behind the art */}
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <g className="animate-orbit" style={{ transformBox: "fill-box" }}>
          <ellipse cx="200" cy="200" rx="190" ry="150" fill="none" stroke="rgba(217,174,111,0.12)" strokeWidth="0.7" strokeDasharray="2 5" />
        </g>
        <g className="animate-orbit-reverse" style={{ transformBox: "fill-box" }}>
          <ellipse cx="200" cy="200" rx="150" ry="118" fill="none" stroke="rgba(244,236,222,0.08)" strokeWidth="0.7" />
        </g>
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={level}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-6"
        >
          {level === "dia" ? (
            /* the galaxy turns, imperceptibly */
            <div className="h-full w-full animate-orbit" style={{ animationDuration: "160s" }}>
              <Image src={ART.dia.src} alt={ART.dia.alt} fill sizes="(max-width: 640px) 90vw, 448px" className="object-contain drop-shadow-[0_0_40px_rgba(233,30,99,0.25)]" />
            </div>
          ) : level === "mes" ? (
            /* the black hole breathes */
            <motion.div
              className="relative h-full w-full"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image src={ART.mes.src} alt={ART.mes.alt} fill sizes="(max-width: 640px) 90vw, 448px" className="object-contain drop-shadow-[0_0_30px_rgba(217,174,111,0.2)]" />
            </motion.div>
          ) : (
            /* the week art is delicate semi-transparent line work —
               stack it twice so it reads on the dark sky */
            <div className="relative h-full w-full">
              <Image src={ART.semana.src} alt={ART.semana.alt} fill sizes="(max-width: 640px) 90vw, 448px" className="object-contain" />
              <Image src={ART.semana.src} alt="" fill sizes="(max-width: 640px) 90vw, 448px" className="object-contain drop-shadow-[0_0_30px_rgba(244,236,222,0.2)]" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
