"use client";

import { motion } from "framer-motion";
import OrbitaChrome from "./OrbitaChrome";

const DAYS: { d: string; h: number }[] = [
  { d: "L", h: 52 },
  { d: "M", h: 26 },
  { d: "X", h: 0 },
  { d: "J", h: 0 },
  { d: "V", h: 0 },
  { d: "S", h: 0 },
  { d: "D", h: 0 },
];

/** The real Semana view: "la forma de tu semana" — golden day bars. */
export default function SemanaScreen() {
  return (
    <OrbitaChrome
      active="semana"
      title="¿Qué descubriste esta semana?"
      subtitle="Tu semana todavía se está escribiendo."
    >
      <div className="flex h-full flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <p className="font-serif text-[13px] italic">Tu semana apenas empieza.</p>
          <p className="mt-0.5 text-[9px] text-cream/55">
            <span className="font-sans text-base font-black text-cream">5</span>{" "}
            días por delante
          </p>
        </motion.div>

        <p className="mt-4 text-[7.5px] uppercase tracking-[0.28em] text-gold">
          La forma de tu semana
        </p>

        <div className="mt-2 flex items-end justify-between px-1" style={{ height: 64 }}>
          {DAYS.map((day, i) => (
            <div key={day.d} className="flex w-5 flex-col items-center justify-end gap-1.5 self-stretch">
              {day.h > 0 ? (
                <motion.span
                  className="w-2.5 rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #FFE9C2 0%, #D9AE6F 100%)",
                    boxShadow: "0 0 10px rgba(232,184,114,0.7)",
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: day.h }}
                  transition={{ duration: 1.1, delay: 0.5 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                />
              ) : (
                <motion.span
                  className="h-1 w-1 rounded-full bg-cream/25"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                />
              )}
              <span className="text-[7px] tracking-widest text-cream/45">{day.d}</span>
            </div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.6 }}
          className="mt-2 text-[8px] text-cream/50"
        >
          El oro son tus días en déficit.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 2 }}
          className="mt-3 rounded-xl border border-cream/10 bg-cream/[0.04] p-2"
        >
          <p className="text-[7px] uppercase tracking-[0.25em] text-gold/80">
            Constante
          </p>
          <p className="mt-0.5 text-[8.5px] leading-snug text-cream/70">
            Tu ritmo se mantiene esta semana.
          </p>
        </motion.div>
      </div>
    </OrbitaChrome>
  );
}
