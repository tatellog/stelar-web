"use client";

import { motion } from "framer-motion";
import Reveal from "../Reveal";

const KNOWNS = ["Sabes qué comer.", "Sabes que moverte ayuda.", "Sabes que dormir importa."];

/** Editorial statement of the problem, with stars that appear and fade without connecting. */
export default function Problem() {
  return (
    <section className="relative py-32 sm:py-44">
      <DisconnectedStars />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <Reveal className="mb-14">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Capítulo I · El problema
          </p>
        </Reveal>
        {KNOWNS.map((line, i) => (
          <Reveal key={line} delay={i * 0.15}>
            <p className="font-sans text-3xl font-bold leading-snug tracking-tight text-cream/85 sm:text-4xl">
              {line}
            </p>
          </Reveal>
        ))}

        <Reveal delay={0.5} className="mt-16">
          <p className="text-sm uppercase tracking-[0.3em] text-cream/40">
            Pero sigues preguntándote
          </p>
        </Reveal>

        <Reveal delay={0.7} className="mt-6">
          <p className="font-serif text-4xl italic leading-tight text-pink text-glow-pink sm:text-5xl">
            ¿Por qué empiezo bien y luego abandono?
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** Stars blink in and out, never forming lines — the pattern that can't be seen yet. */
function DisconnectedStars() {
  const stars = [
    { x: "12%", y: "18%", d: 0 },
    { x: "82%", y: "12%", d: 1.2 },
    { x: "70%", y: "70%", d: 0.6 },
    { x: "22%", y: "78%", d: 1.8 },
    { x: "48%", y: "8%", d: 2.4 },
    { x: "90%", y: "45%", d: 0.9 },
    { x: "6%", y: "50%", d: 2.0 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cream glow-dot"
          style={{ left: s.x, top: s.y }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{
            duration: 4.5,
            delay: s.d,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
