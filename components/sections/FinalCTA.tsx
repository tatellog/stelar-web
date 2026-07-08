"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../Reveal";
import { useSign } from "../SignContext";
import { figureInRect } from "@/lib/zodiac/helpers";

/**
 * Capítulo XII — Final.
 * The complete constellation rests, very faint, behind the words. The
 * emblem breathes. And the only action left is the promise itself.
 */
export default function FinalCTA() {
  const { sign } = useSign();
  const fig = figureInRect(sign, { x: 140, y: 30, w: 520, h: 260 });

  return (
    <section id="beta" className="relative overflow-hidden py-36 sm:py-48">
      {/* the emblem, breathing softly behind everything */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.img
          src={`/emblems/${sign}/f10.png`}
          alt=""
          animate={{ scale: [1, 1.045, 1], opacity: [0.13, 0.19, 0.13] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full object-contain"
        />
      </motion.div>

      {/* the constellation, complete at last — very faint */}
      <svg
        viewBox="0 0 800 320"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-6 mx-auto w-full max-w-4xl opacity-70"
      >
        {fig.lines.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={fig.pts[a].x}
            y1={fig.pts[a].y}
            x2={fig.pts[b].x}
            y2={fig.pts[b].y}
            stroke="rgba(217,174,111,0.22)"
            strokeWidth="0.8"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.3 + i * 0.18, ease: "easeInOut" }}
          />
        ))}
        {fig.pts.map((s, i) => (
          <motion.circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.mag <= 2.3 ? 2.8 : 1.8}
            fill={s.mag <= 2.3 ? "#D9AE6F" : "#F4ECDE"}
            className="glow-dot"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.75 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
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
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-cream/60">
            Stelar convierte tus registros en evidencia visual para mostrarte
            los patrones que están construyendo tus resultados.
          </p>
        </Reveal>

        <Reveal delay={0.5} className="mt-12">
          <BetaButton />
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
