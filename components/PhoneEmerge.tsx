"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Phones never simply appear: they assemble out of the universe.
 * A swarm of particles converges, the glass condenses out of a blur,
 * and only then the phone exists. On leave, it dissolves back — the
 * universe stays alive.
 */

const N = 22;

/* deterministic scatter for each particle */
const part = (i: number) => {
  const a = i * 2.399963; // golden angle — even, organic spread
  const d = 90 + ((i * 37) % 5) * 34;
  return {
    // integers: SSR and client must serialize the exact same transform
    x: Math.round(Math.cos(a) * d),
    y: Math.round(Math.sin(a) * d * 0.85),
    size: 2 + ((i * 13) % 3),
    gold: i % 3 === 0,
  };
};

export default function PhoneEmerge({
  show,
  children,
  className = "",
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* the swarm that assembles the glass */}
      {Array.from({ length: N }, (_, i) => {
        const s = part(i);
        return (
          <motion.span
            key={i}
            aria-hidden
            initial={{ x: s.x, y: s.y, opacity: 0, scale: 1 }}
            animate={
              show
                ? { x: 0, y: 0, opacity: [0, 0.9, 0], scale: 0.6 }
                : { x: s.x, y: s.y, opacity: 0, scale: 1 }
            }
            transition={{ duration: 1, delay: (i % 7) * 0.06, ease: "easeIn" }}
            className={`pointer-events-none absolute left-1/2 top-1/2 rounded-full ${
              s.gold
                ? "bg-gold-soft shadow-[0_0_10px_rgba(232,184,114,0.9)]"
                : "bg-rosa shadow-[0_0_8px_rgba(251,215,227,0.8)]"
            }`}
            style={{ width: s.size, height: s.size }}
          />
        );
      })}

      {/* the phone condenses out of the blur, a beat after the swarm */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 46, filter: "blur(16px)" }}
        animate={
          show
            ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, scale: 0.9, y: 46, filter: "blur(16px)" }
        }
        transition={{
          duration: 1.1,
          delay: show ? 0.3 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
