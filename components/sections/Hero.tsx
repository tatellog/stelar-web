"use client";

import { useRef } from "react";
import { motion, useTransform, useScroll, useInView } from "framer-motion";

/**
 * Capítulo I — Oscuridad.
 * No interface. No phone. No product. Only space: the ambient starfield
 * and the words. The scroll invitation pulls you down into the journey.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  // the descending beam must not keep animating ten chapters below
  const inView = useInView(ref);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // scroll: the chapter recedes into the dark
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const drift = useTransform(scrollYProgress, [0, 1], [0, -70]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ opacity: fade, y: drift }}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      >
        {/* CSS-only entrance: the headline is the LCP — it must paint
            before hydration, not 1.6s after it */}
        <p
          className="hero-rise mb-6 text-[13px] uppercase tracking-[0.4em] text-gold/90"
          style={{ animationDelay: "0.1s" }}
        >
          Haz visible lo invisible
        </p>

        <h1
          className="hero-rise font-sans text-4xl font-black leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl"
          style={{ animationDelay: "0.25s" }}
        >
          Perder peso no es{" "}
          <span className="font-serif italic font-medium text-pink text-glow-pink">
            la parte más difícil.
          </span>
        </h1>

        <p
          className="hero-rise mt-7 max-w-xl text-lg leading-relaxed text-cream/70"
          style={{ animationDelay: "0.55s" }}
        >
          La parte más difícil es que no puedes ver los patrones que están
          formando tus resultados.
        </p>

        {/* the invitation: not a button — the journey begins by descending */}
        <a
          href="#senales"
          className="hero-rise group mt-14 flex flex-col items-center gap-4"
          style={{ animationDelay: "0.9s" }}
        >
          <span className="text-[12.5px] uppercase tracking-[0.35em] text-cream/50 transition-colors duration-500 group-hover:text-cream/80">
            Desliza para comenzar el viaje
          </span>
          <span className="relative flex h-14 w-px overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
            <motion.span
              animate={inView ? { y: ["-100%", "160%"] } : { y: "-100%" }}
              transition={
                inView
                  ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
              }
              className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-gold/80 to-transparent"
            />
          </span>
        </a>

        {/* or let the journey drive */}
        <button
          onClick={() => window.dispatchEvent(new Event("stelar:autopilot"))}
          className="hero-rise mt-8 rounded-full border border-gold/30 px-6 py-2.5 font-serif text-base italic text-cream/75 transition-all duration-500 hover:border-gold/60 hover:text-gold hover:shadow-[0_0_24px_rgba(232,184,114,0.18)]"
          style={{ animationDelay: "1.15s" }}
        >
          Deja que el viaje te lleve ▸
        </button>
      </motion.div>
    </section>
  );
}
