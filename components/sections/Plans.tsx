"use client";

import { motion } from "framer-motion";
import Reveal from "../Reveal";

/**
 * Planes — future value, communicated early. Nothing purchasable yet:
 * the beta is free, PRO is a promise with a "Próximamente" badge.
 */

const FREE = [
  "Registro diario",
  "Quick Log",
  "Peso",
  "Agua",
  "Órbita Día",
];

const PRO = [
  "Scan IA ilimitado",
  "Órbita Semana",
  "Órbita Mes",
  "Detección de patrones IA",
  "Wearables",
  "Insights avanzados",
];

export default function Plans() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Planes
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Elige{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              tu viaje.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {/* free — where everyone begins */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-cream/12 bg-deep/40 p-7 backdrop-blur-sm"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-cream/60">Free</p>
            <p className="mt-2 font-serif text-lg italic text-cream/70">
              Empieza a ver.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {FREE.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-cream/75">
                  <span className="h-1 w-1 rounded-full bg-cream/40" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* pro — the full sky */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl border border-gold/40 bg-gold/[0.05] p-7 shadow-[0_0_50px_rgba(232,184,114,0.08)] backdrop-blur-sm"
          >
            <span className="absolute -top-3 right-6 rounded-full border border-gold/50 bg-deep px-3 py-1 text-[9px] uppercase tracking-[0.22em] text-gold">
              Próximamente
            </span>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Pro</p>
            <p className="mt-2 font-serif text-lg italic text-gold/90">
              El cielo completo.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {PRO.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-cream/85">
                  <span className="text-[10px] text-gold" aria-hidden>
                    ✦
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <Reveal delay={0.2} className="mt-8 text-center">
          <p className="text-sm text-cream/50">
            La beta es gratuita.{" "}
            <span className="font-serif italic text-gold">
              Los planes llegan más adelante.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
