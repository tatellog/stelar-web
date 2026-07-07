"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../Reveal";
import PhoneMockup from "../PhoneMockup";
import DiaScreen from "../screens/DiaScreen";
import SemanaScreen from "../screens/SemanaScreen";
import MesScreen from "../screens/MesScreen";

const SCREENS = [
  { id: "dia", label: "Día", node: <DiaScreen /> },
  { id: "semana", label: "Semana", node: <SemanaScreen /> },
  { id: "mes", label: "Mes", node: <MesScreen /> },
];

const CYCLE_MS = 5200;

/**
 * Capítulo V — Tu Órbita.
 * The phone appears for the FIRST time in the journey — only now that the
 * metaphor is understood. Floating, large, alive: Día, Semana and Mes
 * animate themselves in a slow automatic cycle. Not screenshots.
 */
export default function Evidence() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SCREENS.length), CYCLE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="orbita" className="relative py-32 sm:py-44">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_55%,rgba(233,30,99,0.06),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
              Capítulo V · Tu Órbita
            </p>
            <h2 className="font-sans text-4xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
              Todo esto sucede dentro de{" "}
              <span className="font-serif italic font-medium text-pink text-glow-pink">
                Stelar.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-cream/60">
              Tus datos se convierten en evidencia.
            </p>
            <p className="mt-3 max-w-md text-lg leading-relaxed text-cream/60">
              No números. No dashboards.{" "}
              <span className="text-cream">Evidencia.</span>
            </p>
          </Reveal>

          {/* cycle indicator */}
          <Reveal delay={0.5}>
            <div className="mt-10 flex items-center gap-3">
              {SCREENS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIdx(i)}
                  className={`rounded-full border px-4 py-1.5 text-xs tracking-[0.2em] transition-all duration-500 ${
                    i === idx
                      ? "border-pink-soft/60 text-cream shadow-[0_0_18px_rgba(233,30,99,0.2)]"
                      : "hairline border text-cream/40 hover:text-cream/70"
                  }`}
                >
                  {s.label.toUpperCase()}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mx-auto w-full max-w-[300px]">
          <div className="animate-float-slow">
            <PhoneMockup>
              <AnimatePresence mode="wait">
                <motion.div
                  key={SCREENS[idx].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="h-full"
                >
                  {SCREENS[idx].node}
                </motion.div>
              </AnimatePresence>
            </PhoneMockup>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
