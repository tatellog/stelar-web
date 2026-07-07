"use client";

import { motion } from "framer-motion";
import { figureSubset } from "@/lib/zodiac/helpers";

// The month's figure is the real Leo (first 6 stars) — the same
// constellation the app reveals as your evidence accumulates.
const LEO = figureSubset("leo", { x: 12, y: 14, w: 76, h: 66 }, 6);

const NODES = LEO.pts.map((p, i) => ({
  x: p.x,
  y: p.y,
  r: p.mag <= 2.3 ? 3.2 : 2.3,
  c: p.mag <= 2.3 ? "#FF4886" : i % 2 ? "#F4ECDE" : "#D9AE6F",
}));

const LINKS = LEO.lines;

/** "Mes" — the month's constellation revealing itself with stroke animation. */
export default function MesScreen() {
  return (
    <div className="flex h-full flex-col px-5 pb-5 pt-12 text-cream">
      <p className="text-[9px] uppercase tracking-[0.3em] text-gold/80">Mes</p>
      <h3 className="font-sans text-xl font-semibold tracking-tight">¿Qué reveló este mes?</h3>

      <div className="relative mt-2 flex-1">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {LINKS.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              stroke="rgba(244,236,222,0.4)"
              strokeWidth="0.4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.6 + i * 0.3, ease: "easeInOut" }}
            />
          ))}
          {NODES.map((n, i) => (
            <motion.circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.c}
              className="glow-dot"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.15 }}
            />
          ))}
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.6 }}
        className="rounded-2xl border border-cream/10 bg-cream/[0.04] p-3"
      >
        <p className="text-[9px] uppercase tracking-[0.25em] text-pink">
          Tu mes reveló
        </p>
        <p className="mt-1 text-[11px] leading-snug text-cream/80">
          Volviste 4 veces después de un mal día. Esa es tu constante más
          fuerte.
        </p>
      </motion.div>
    </div>
  );
}
