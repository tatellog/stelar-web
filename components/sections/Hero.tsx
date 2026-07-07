"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import { PrimaryCTA } from "../CTAButton";
import LottieGlow from "../LottieGlow";
import heroGlow from "@/lib/lottie/auth-hero-glow.json";

/**
 * Capítulo I — Oscuridad.
 * No interface. No phone. No product. Only space: the ambient starfield,
 * one single star being born, and the words. The star leans toward the
 * cursor; scrolling pulls a trail out of it, down into the journey.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 40, damping: 18, mass: 0.8 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  // the star drifts gently toward the cursor
  const starX = useTransform(sx, (v) => v * 26);
  const starY = useTransform(sy, (v) => v * 18);

  // scroll: the star leaves a trail and the chapter recedes
  const trail = useTransform(scrollYProgress, [0.02, 0.45], [0, 1]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const drift = useTransform(scrollYProgress, [0, 1], [0, -70]);

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ opacity: fade, y: drift }}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center"
      >
        {/* the single star, slowly born */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ x: starX, y: starY }}
          className="relative mb-2 h-36 w-36 sm:h-44 sm:w-44"
        >
          <LottieGlow data={heroGlow} className="h-full w-full" />
          {/* the trail it leaves when you begin to move */}
          <svg
            viewBox="0 0 100 160"
            className="pointer-events-none absolute left-1/2 top-[62%] h-64 w-24 -translate-x-1/2"
            aria-hidden
          >
            <motion.path
              d="M50 8 C 46 50, 56 90, 48 150"
              fill="none"
              stroke="url(#heroTrail)"
              strokeWidth="1.2"
              style={{ pathLength: trail, opacity: trail }}
            />
            <defs>
              <linearGradient id="heroTrail" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF6E5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF4886" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 2.2 }}
          className="mb-6 text-xs uppercase tracking-[0.4em] text-gold/90"
        >
          Haz visible lo invisible
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 2.6, ease: [0.22, 1, 0.36, 1] }}
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
          transition={{ duration: 1.5, delay: 3.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-cream/70"
        >
          La parte más difícil es que no puedes ver los patrones que están
          formando tus resultados.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 4.0 }}
          className="mt-10"
        >
          <PrimaryCTA href="#senales">Comienza el viaje</PrimaryCTA>
        </motion.div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 4.6 }}
        style={{ opacity: fade }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
