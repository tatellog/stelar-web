"use client";

import { motion } from "framer-motion";

/** "Semana" — relations forming: an orbit with two linked signals + repeats. */
export default function SemanaScreen() {
  return (
    <div className="flex h-full flex-col px-5 pb-5 pt-12 text-cream">
      <p className="text-[9px] uppercase tracking-[0.3em] text-gold/80">
        Semana
      </p>
      <h3 className="font-sans text-xl font-semibold tracking-tight">¿Qué empezó a repetirse?</h3>

      <div className="relative mt-2 flex-1">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <g className="animate-orbit" style={{ transformBox: "fill-box" }}>
            <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(217,174,111,0.18)" strokeWidth="0.3" strokeDasharray="1 2" />
          </g>
          <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(244,236,222,0.1)" strokeWidth="0.3" />

          <motion.line
            x1="34"
            y1="62"
            x2="68"
            y2="36"
            stroke="rgba(244,236,222,0.4)"
            strokeWidth="0.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: 0.8, ease: "easeInOut" }}
          />
          <motion.circle
            cx="34"
            cy="62"
            r="3.4"
            fill="#FF4886"
            className="glow-dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
          <motion.circle
            cx="68"
            cy="36"
            r="2.8"
            fill="#D9AE6F"
            className="glow-dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          />
        </svg>
      </div>

      <div className="space-y-2">
        {[
          { t: "Dormir 7+ h → registro constante", n: "3 veces" },
          { t: "Entrenar → más agua", n: "2 veces" },
        ].map((r, i) => (
          <motion.div
            key={r.t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.4 + i * 0.5 }}
            className="flex items-center justify-between rounded-xl border border-cream/10 bg-cream/[0.04] p-2.5"
          >
            <p className="text-[10px] leading-snug text-cream/85">{r.t}</p>
            <span className="ml-2 shrink-0 rounded-full border border-gold/30 px-2 py-0.5 text-[8px] tracking-widest text-gold">
              {r.n}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
