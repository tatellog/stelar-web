"use client";

import { motion } from "framer-motion";
import Reveal from "../Reveal";
import { PrimaryCTA } from "../CTAButton";
import { useSign } from "../SignContext";
import { figureInRect } from "@/lib/zodiac/helpers";

// The app's real Aries figure across the closing sky —
// almost complete: its last line is left undrawn, for the reader to finish.
const ARIES = figureInRect("aries", { x: 120, y: 25, w: 560, h: 190 });
const STARS = ARIES.pts;
const LINKS = ARIES.lines.slice(0, -1);

export default function FinalCTA() {
  const { sign } = useSign();
  return (
    <section id="beta" className="relative overflow-hidden py-36 sm:py-48">
      {/* the visitor's emblem, glowing softly behind the calm */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.16 }}
        viewport={{ once: true }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/emblems/${sign}/f10.png`}
          alt=""
          className="h-full w-full object-contain"
        />
      </motion.div>
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
            r={s.mag <= 2.3 ? 3 : 2}
            fill={s.mag <= 2.3 ? "#D9AE6F" : "#F4ECDE"}
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
