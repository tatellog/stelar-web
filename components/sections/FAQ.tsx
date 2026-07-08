"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../Reveal";

/** Preguntas — short questions, shorter answers. */

const QA: [string, string][] = [
  ["¿Necesito un Apple Watch?", "No. Stelar funciona completo sin ningún wearable."],
  ["¿Puedo usar Garmin?", "Sí — junto con Apple Health, Oura y Samsung Health."],
  ["¿Puedo usar Samsung Health?", "Sí, es una de las integraciones de la beta."],
  [
    "¿Puedo usar Stelar sin wearables?",
    "Sí. Los wearables suman contexto, nunca son requisito.",
  ],
  [
    "¿La IA siempre acierta con la comida?",
    "No siempre — estima. Por eso puedes ajustar todo antes de guardar.",
  ],
  ["¿Puedo editar los resultados de la IA?", "Siempre. Tú tienes la última palabra."],
  ["¿Mis datos son privados?", "Sí. Tus registros son tuyos y nunca se venden."],
  ["¿Cuánto cuesta?", "La beta es gratuita. Los planes llegarán más adelante."],
];

export default function FAQ() {
  const [open, setOpen] = useState(-1);

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6">
        <Reveal className="text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Preguntas
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-4xl">
            Lo que todos{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              preguntan.
            </span>
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-col gap-2.5">
          {QA.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={q}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className={`rounded-2xl border transition-colors duration-500 ${
                  isOpen ? "border-gold/30 bg-gold/[0.04]" : "border-cream/10 bg-deep/40"
                } backdrop-blur-sm`}
              >
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-cream/90">{q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.4 }}
                    className={`shrink-0 text-lg leading-none ${isOpen ? "text-gold" : "text-cream/40"}`}
                    aria-hidden
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 font-serif text-base italic text-cream/60">
                        {a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
