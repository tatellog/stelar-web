"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Capítulo V — IA Pattern Engine.
 * Palabras solas sobre el cielo abierto (la red de nodos se retiró a
 * pedido de la usuaria): dos beats de copy que se ceden el escenario,
 * con el starfield global como única escena.
 */
export default function PatternEngine() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, [0.06, 0.2, 0.44, 0.56], [0, 1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0.06, 0.2], [24, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.56, 0.7, 0.92, 1], [0, 1, 1, 0.9]);
  const outroY = useTransform(scrollYProgress, [0.56, 0.7], [28, 0]);

  return (
    <section ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        {/* the chapter opens — outer div owns the centering transform;
            framer's inline y would clobber a Tailwind translate here */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold">
            Capítulo V · IA Pattern Engine
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Tus registros empiezan a{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              hablar entre ellos.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Cada dato parece pequeño. Juntos cuentan una historia.
          </p>
        </motion.div>
        </div>

        {/* the engine, named */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2">
        <motion.div
          style={{ opacity: outroOpacity, y: outroY }}
          className="mx-auto max-w-xl px-6 text-center"
        >
          <p className="text-[13px] uppercase tracking-[0.35em] text-gold">
            IA Pattern Engine
          </p>
          <p className="mt-4 text-lg leading-relaxed text-cream/70">
            Encuentra relaciones entre tus registros para mostrarte{" "}
            <span className="font-serif italic text-gold">
              patrones que normalmente no verías.
            </span>
          </p>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
