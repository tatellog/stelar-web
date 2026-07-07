"use client";

import { motion } from "framer-motion";
import Reveal from "../Reveal";
import { PrimaryCTA } from "../CTAButton";

const STARS = [
  { x: 90, y: 60 },
  { x: 200, y: 120 },
  { x: 330, y: 50 },
  { x: 460, y: 110 },
  { x: 590, y: 45 },
  { x: 700, y: 100 },
  { x: 540, y: 170 },
  { x: 260, y: 190 },
];

// almost complete — one link left undrawn, for the reader to finish
const LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [3, 6],
  [1, 7],
];

export default function FinalCTA() {
  return (
    <section id="beta" className="relative overflow-hidden py-36 sm:py-48">
      <svg
        viewBox="0 0 800 240"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 mx-auto w-full max-w-4xl opacity-80"
      >
        {LINKS.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={STARS[a].x}
            y1={STARS[a].y}
            x2={STARS[b].x}
            y2={STARS[b].y}
            stroke="rgba(244,236,222,0.25)"
            strokeWidth="0.8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.4 + i * 0.25, ease: "easeInOut" }}
          />
        ))}
        {STARS.map((s, i) => (
          <motion.circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={i % 3 === 0 ? 3 : 2}
            fill={i % 4 === 0 ? "#D9AE6F" : "#F4ECDE"}
            className="glow-dot"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.9 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.12 }}
          />
        ))}
      </svg>

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center">
        <Reveal>
          <h2 className="font-sans text-4xl font-black leading-[1.08] tracking-tight text-cream sm:text-6xl">
            No puedes cambiar lo que{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              no puedes ver.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-cream/60">
            Empieza a ver los patrones que están construyendo tus resultados.
          </p>
        </Reveal>

        <Reveal delay={0.5} className="mt-12">
          <PrimaryCTA href="mailto:hola@stelar.app?subject=Quiero%20unirme%20a%20la%20beta">
            Únete a la beta
          </PrimaryCTA>
        </Reveal>

        <Reveal delay={0.7} className="mt-16">
          <p className="font-serif text-xl italic text-cream/40">
            Stelar. Haz visible lo invisible.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
