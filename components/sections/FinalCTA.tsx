"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../Reveal";
import { useSign } from "../SignContext";
import { FIGURES } from "@/lib/zodiac/figures";

/**
 * Capítulo XII — Final.
 * The complete constellation rests, very faint, behind the words. The
 * emblem breathes. And the only action left is the promise itself.
 */
export default function FinalCTA() {
  const { sign } = useSign();
  const def = FIGURES[sign];

  return (
    <section id="beta" className="relative overflow-hidden py-36 sm:py-48">
      {/* the emblem and its constellation, aligned in the same art box —
          the figure was traced over the emblem, so they share coordinates */}
      <motion.div
        initial={{ opacity: 0, scale: 1.09 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 3.4, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 sm:h-[30rem] sm:w-[30rem]"
      >
        <motion.img
          src={`/emblems/${sign}/f10.png`}
          alt=""
          animate={{ scale: [1, 1.045, 1], opacity: [0.14, 0.2, 0.14] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full object-contain"
        />
        <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="ctaStarHero">
              <stop offset="0%" stopColor="rgba(251,215,227,0.5)" />
              <stop offset="40%" stopColor="rgba(233,30,99,0.15)" />
              <stop offset="100%" stopColor="rgba(233,30,99,0)" />
            </radialGradient>
            <radialGradient id="ctaStarDim">
              <stop offset="0%" stopColor="rgba(255,233,194,0.36)" />
              <stop offset="45%" stopColor="rgba(232,184,114,0.1)" />
              <stop offset="100%" stopColor="rgba(232,184,114,0)" />
            </radialGradient>
          </defs>
          {def.lines.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={def.stars[a].x * 100}
              y1={def.stars[a].y * 100}
              x2={def.stars[b].x * 100}
              y2={def.stars[b].y * 100}
              stroke="rgba(217,174,111,0.4)"
              strokeWidth="0.3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4 + i * 0.16, ease: "easeInOut" }}
            />
          ))}
          {/* energy keeps traveling every finished connection — the
              constellation is complete, and alive */}
          {def.lines.map(([a, b], i) => (
            <motion.circle
              key={`e${i}`}
              r={0.7}
              fill="#FFE9C2"
              animate={{
                cx: [def.stars[a].x * 100, def.stars[b].x * 100],
                cy: [def.stars[a].y * 100, def.stars[b].y * 100],
                opacity: [0, 0.85, 0],
              }}
              transition={{
                duration: 2.6,
                delay: 2.2 + i * 0.9,
                repeat: Infinity,
                repeatDelay: def.lines.length * 0.35,
                ease: "easeInOut",
              }}
            />
          ))}
          {def.stars.map((st, i) => {
            const hero = st.mag <= 2.3;
            const x = st.x * 100;
            const y = st.y * 100;
            const r = hero ? 2 : 1.3;
            const w = r * 0.26;
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
              >
                <circle cx={x} cy={y} r={hero ? 5.5 : 3.4} fill={`url(#${hero ? "ctaStarHero" : "ctaStarDim"})`} />
                <path
                  d={`M ${x} ${y - r} Q ${x + w} ${y - w} ${x + r} ${y} Q ${x + w} ${y + w} ${x} ${y + r} Q ${x - w} ${y + w} ${x - r} ${y} Q ${x - w} ${y - w} ${x} ${y - r} Z`}
                  fill={hero ? "#FFF6E5" : "#F4ECDE"}
                  opacity={hero ? 0.9 : 0.72}
                />
              </motion.g>
            );
          })}
        </svg>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center">
        <Reveal>
          <h2 className="font-sans text-4xl font-black leading-[1.08] tracking-tight text-cream sm:text-6xl">
            Tus datos ya cuentan una historia.{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              Stelar te ayuda a entenderla.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-cream/60">
            Deja de acumular números.{" "}
            <span className="font-serif italic text-gold">
              Empieza a descubrir patrones.
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.5} className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <BetaButton />
            <a
              href="#orbita"
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-7 py-3.5 text-sm font-semibold tracking-wide text-cream/80 transition-all duration-500 hover:border-gold/50 hover:text-cream"
            >
              Ver demo <span aria-hidden>↺</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.7} className="mt-8">
          <p className="font-serif text-base italic text-cream/45 sm:text-lg">
            Empieza a ver lo que tus hábitos ya están diciendo.
          </p>
        </Reveal>

        <Reveal delay={0.9} className="mt-16">
          <p className="font-serif text-xl italic text-cream/40">
            Stelar. Haz visible lo invisible.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** The beta CTA: on hover, stray particles are drawn into the button —
 *  the same gesture as the whole journey: loose lights becoming one. */
function BetaButton() {
  const [hover, setHover] = useState(false);

  return (
    <span
      className="relative inline-block"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <AnimatePresence>
        {hover &&
          Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2 + 0.6;
            const dist = 70 + (i % 3) * 26;
            return (
              <motion.span
                key={i}
                aria-hidden
                initial={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist * 0.6,
                  opacity: 0,
                  scale: 0.4,
                }}
                animate={{ x: 0, y: 0, opacity: [0, 0.9, 0], scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.1,
                  delay: i * 0.07,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeIn",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-rosa shadow-[0_0_8px_rgba(251,215,227,0.9)]"
              />
            );
          })}
      </AnimatePresence>
      <a
        href="mailto:hola@stelar.app?subject=Quiero%20unirme%20a%20la%20beta"
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-pink px-8 py-3.5 text-sm font-semibold tracking-wide text-cream transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,72,134,0.5)]"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-pink to-pink-soft opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative">Únete a la beta</span>
      </a>
    </span>
  );
}
