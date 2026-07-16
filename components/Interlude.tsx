"use client";

import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";

/**
 * El interludio — el observatorio pregunta.
 * Una pregunta suave a mitad del viaje, estilo Astrology Club: eliges,
 * el cielo te responde con una línea propia, y tu respuesta tiñe
 * capítulos posteriores. Siempre se puede pasar de largo con scroll.
 */

export type InterludeOption<V extends string> = { value: V; label: string };

export default function Interlude<V extends string>({
  question,
  options,
  value,
  onSelect,
  ack,
}: {
  question: string;
  options: InterludeOption<V>[];
  value: V | null;
  onSelect: (v: V) => void;
  ack: Record<V, string>;
}) {
  return (
    <section className="relative flex min-h-[72vh] items-center justify-center px-6 py-24">
      <Reveal className="max-w-2xl text-center">
        <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold/80">
          El observatorio pregunta
        </p>
        <h3 className="font-serif text-3xl italic leading-snug text-cream sm:text-4xl">
          {question}
        </h3>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {options.map((o) => {
            const chosen = value === o.value;
            return (
              <button
                key={o.value}
                onClick={() => onSelect(o.value)}
                aria-pressed={chosen}
                className={`rounded-full border px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-500 ${
                  chosen
                    ? "border-gold/70 bg-gold/[0.1] text-gold shadow-[0_0_26px_rgba(232,184,114,0.25)]"
                    : "border-cream/20 text-cream/75 hover:border-gold/50 hover:text-cream"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* el cielo responde */}
        <div className="mt-8 min-h-[2.5rem]">
          <AnimatePresence mode="wait">
            {value && (
              <motion.p
                key={value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="font-serif text-lg italic text-gold/90"
              >
                {ack[value]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </section>
  );
}
