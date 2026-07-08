"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import PhoneMockup from "../PhoneMockup";
import DiaScreen from "../screens/DiaScreen";
import SemanaScreen from "../screens/SemanaScreen";
import MesScreen from "../screens/MesScreen";

/**
 * Capítulo IX — Órbita en acción.
 * One phone, three readings. The scroll travels through Día, Semana and
 * Mes: each level answers a different question, and the sky behind the
 * phone changes its light with it.
 */

const LEVELS = [
  {
    id: "dia",
    label: "Día",
    question: "¿Cómo voy hoy?",
    reading:
      "El estado de tu día, leído de una vez: déficit, proteína, calorías, agua.",
    points: ["Estado de déficit", "Proteína y calorías", "Las señales de hoy"],
    tint: "rgba(233,30,99,0.12)",
    accent: "#FF4886",
    node: <DiaScreen />,
  },
  {
    id: "semana",
    label: "Semana",
    question: "¿Qué empezó a repetirse?",
    reading:
      "La semana no es una lista de días: es la forma que tus hábitos empiezan a tomar.",
    points: ["Relaciones entre hábitos", "Evidencia semanal", "Patrones emergentes"],
    tint: "rgba(217,174,111,0.12)",
    accent: "#E8B872",
    node: <SemanaScreen />,
  },
  {
    id: "mes",
    label: "Mes",
    question: "¿Qué reveló este mes sobre mí?",
    reading:
      "El mes muestra lo que se sostuvo, lo que todavía no — y el patrón que domina tu historia.",
    points: ["Patrón dominante", "Lo que se sostuvo", "Lo que todavía no se sostiene"],
    tint: "rgba(193,143,255,0.12)",
    accent: "#C18FFF",
    node: <MesScreen />,
  },
];

export default function OrbitaAction() {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setIdx(Math.min(LEVELS.length - 1, Math.floor(v * LEVELS.length)));
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.04, 1], [0.6, 1, 1]);

  const jumpTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: top + ((i + 0.5) / LEVELS.length) * span,
      behavior: "smooth",
    });
  };

  const level = LEVELS[idx];

  return (
    <section id="orbita" ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* the sky changes with each reading */}
        {LEVELS.map((l, i) => (
          <motion.div
            key={l.id}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 68% 50%, ${l.tint}, transparent 70%)`,
            }}
          />
        ))}

        <motion.div
          style={{ opacity: introOpacity }}
          className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16"
        >
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              Capítulo VIII · Órbita en acción
            </p>
            <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-4xl lg:text-5xl">
              Tu día, tu semana y tu mes tienen{" "}
              <span className="font-serif italic font-medium text-pink text-glow-pink">
                lecturas distintas.
              </span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream/60">
              Stelar no muestra los mismos datos tres veces. Cada nivel
              responde una pregunta diferente.
            </p>

            {/* the question of this level */}
            <div className="mt-8 min-h-[10.5rem] sm:min-h-[11.5rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p
                    className="font-serif text-2xl italic sm:text-3xl"
                    style={{ color: level.accent, textShadow: `0 0 26px ${level.accent}55` }}
                  >
                    {level.question}
                  </p>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream/55">
                    {level.reading}
                  </p>
                  <ul className="mt-4 flex flex-col gap-1.5">
                    {level.points.map((point, i) => (
                      <motion.li
                        key={point}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.14, duration: 0.5 }}
                        className="flex items-center gap-2.5 text-sm text-cream/75"
                      >
                        <span
                          className="h-1 w-1 rounded-full"
                          style={{ background: level.accent, boxShadow: `0 0 8px ${level.accent}` }}
                        />
                        {point}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* travel between readings */}
            <div className="mt-8 flex items-center gap-3">
              {LEVELS.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => jumpTo(i)}
                  className={`rounded-full border px-4 py-1.5 text-xs tracking-[0.2em] transition-all duration-500 ${
                    i === idx
                      ? "border-pink-soft/60 text-cream shadow-[0_0_18px_rgba(233,30,99,0.2)]"
                      : "hairline border text-cream/40 hover:text-cream/70"
                  }`}
                >
                  {l.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-[240px] sm:max-w-[290px]">
            <div className="animate-float-slow">
              <PhoneMockup>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="h-full"
                  >
                    {level.node}
                  </motion.div>
                </AnimatePresence>
              </PhoneMockup>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
