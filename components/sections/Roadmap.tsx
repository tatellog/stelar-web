"use client";

import { motion } from "framer-motion";
import Reveal from "../Reveal";

/**
 * Roadmap — Stelar is in beta, and says so with confidence.
 * What already shines, and what is still being drawn in the sky.
 */

const LIVE = ["Scan IA", "Órbita", "Detección de patrones", "Wearables"];

const COMING = [
  "Coach IA",
  "Notificaciones inteligentes",
  "Insights avanzados",
  "Más integraciones",
];

export default function Roadmap() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="text-center">
          <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold">
            Roadmap
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Construido con{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              nuestra comunidad.
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {LIVE.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-gold/30 bg-gold/[0.05] px-4 py-5 text-center"
            >
              <span className="text-gold" aria-hidden>
                ✦
              </span>
              <p className="mt-2 text-sm font-semibold text-cream/90">{item}</p>
              <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.22em] text-gold/80">
                En beta
              </p>
            </motion.div>
          ))}
          {COMING.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-dashed border-cream/15 px-4 py-5 text-center"
            >
              <motion.span
                className="inline-block h-2 w-2 rounded-full bg-cream/30"
                whileInView={{ opacity: [0.3, 0.8, 0.3] }}
                viewport={{ margin: "-10%" }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }}
              />
              <p className="mt-2 text-sm font-semibold text-cream/60">{item}</p>
              <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.22em] text-cream/35">
                En camino
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
