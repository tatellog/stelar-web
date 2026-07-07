"use client";

import { useRef } from "react";
import { motion, useTransform, useScroll } from "framer-motion";

/**
 * Capítulo I — Oscuridad.
 * No interface. No phone. No product. Only space: the ambient starfield
 * and the words. The scroll invitation pulls you down into the journey.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);

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
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 1.2 }}
          className="mb-6 text-xs uppercase tracking-[0.4em] text-gold/90"
        >
          Haz visible lo invisible
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-4xl font-black leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl"
        >
          Perder peso no es{" "}
          <span className="font-serif italic font-medium text-pink text-glow-pink">
            la parte más difícil.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 2.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-cream/70"
        >
          La parte más difícil es que no puedes ver los patrones que están
          formando tus resultados.
        </motion.p>

        {/* the invitation: not a button — the journey begins by descending */}
        <motion.a
          href="#senales"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 3.0 }}
          className="group mt-14 flex flex-col items-center gap-4"
        >
          <span className="text-[11px] uppercase tracking-[0.35em] text-cream/50 transition-colors duration-500 group-hover:text-cream/80">
            Desliza para comenzar el viaje
          </span>
          <span className="relative flex h-14 w-px overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/25 to-transparent" />
            <motion.span
              animate={{ y: ["-100%", "160%"] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-gold/80 to-transparent"
            />
          </span>
        </motion.a>
      </motion.div>
    </section>
  );
}
