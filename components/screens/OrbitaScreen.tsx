"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { figureSubset } from "@/lib/zodiac/helpers";

// The user's constellation on the Órbita screen is the real Leo figure
// (first 6 stars), just like the app draws it.
const LEO = figureSubset("leo", { x: 16, y: 20, w: 68, h: 60 }, 6);

const NODES = LEO.pts.map((p, i) => ({
  x: p.x,
  y: p.y,
  r: p.mag <= 2.3 ? 3.4 : 2.4,
  c: p.mag <= 2.3 ? "#FF4886" : i % 2 ? "#D9AE6F" : "#F4ECDE",
}));

const LINKS = LEO.lines;

/** The Órbita view of the app: a personal constellation over concentric orbits. */
export default function OrbitaScreen() {
  return (
    <div className="flex h-full flex-col px-5 pb-5 pt-12 text-cream">
      <p className="text-[9px] uppercase tracking-[0.3em] text-gold/80">
        Tu evidencia
      </p>
      <h3 className="font-sans text-xl font-semibold tracking-tight">Órbita</h3>

      <div className="relative mt-3 flex-1">
        {/* the real day-orb galaxy, turning at the heart of the screen */}
        <motion.div
          className="absolute inset-[12%] animate-orbit"
          style={{ animationDuration: "180s" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ duration: 2, delay: 0.4 }}
        >
          <Image src="/art/orbit-day.png" alt="" fill sizes="300px" className="object-contain" />
        </motion.div>
        <svg viewBox="0 0 100 100" className="relative h-full w-full">
          {/* orbits */}
          <g className="animate-orbit" style={{ transformBox: "fill-box" }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(217,174,111,0.18)" strokeWidth="0.3" strokeDasharray="1 2" />
          </g>
          <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(244,236,222,0.1)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="16" fill="none" stroke="rgba(255,72,134,0.18)" strokeWidth="0.3" strokeDasharray="0.5 1.5" />

          {LINKS.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              stroke="rgba(244,236,222,0.35)"
              strokeWidth="0.35"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.8 + i * 0.35, ease: "easeInOut" }}
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
              transition={{ duration: 0.8, delay: 0.2 + i * 0.18 }}
            />
          ))}
        </svg>
      </div>

      <div className="rounded-2xl border border-cream/10 bg-cream/[0.04] p-3">
        <p className="text-[9px] uppercase tracking-[0.25em] text-pink">
          Patrón detectado
        </p>
        <p className="mt-1 text-[11px] leading-snug text-cream/80">
          Los días que duermes 7+ horas, tu registro de comidas es 2× más
          constante.
        </p>
      </div>
    </div>
  );
}
