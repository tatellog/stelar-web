"use client";

import { motion } from "framer-motion";
import LottieGlow from "../LottieGlow";
import ringGlow from "@/lib/lottie/cycle-ring-glow.json";

/** "Hoy" — the day view: ring, deficit bar filling, cards fading in. */
export default function DiaScreen() {
  return (
    <div className="flex h-full flex-col px-5 pb-5 pt-12 text-cream">
      <p className="text-[9px] uppercase tracking-[0.3em] text-gold/80">Hoy</p>
      <h3 className="font-sans text-xl font-semibold tracking-tight">¿Cómo voy hoy?</h3>

      {/* ring — with the app's real cycle-ring-glow lottie breathing behind */}
      <div className="relative mt-4 flex justify-center">
        <LottieGlow
          data={ringGlow}
          className="pointer-events-none absolute -inset-3 opacity-70"
        />
        <svg viewBox="0 0 120 120" className="relative h-28 w-28">
          <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(244,236,222,0.08)" strokeWidth="6" />
          <motion.circle
            cx="60"
            cy="60"
            r="46"
            fill="none"
            stroke="#FF4886"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="289"
            transform="rotate(-90 60 60)"
            initial={{ strokeDashoffset: 289 }}
            animate={{ strokeDashoffset: 289 * 0.28 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ filter: "drop-shadow(0 0 8px rgba(255,72,134,0.5))" }}
          />
          <text x="60" y="57" textAnchor="middle" fill="#F4ECDE" fontSize="17" fontWeight="600">
            72%
          </text>
          <text x="60" y="74" textAnchor="middle" fill="rgba(244,236,222,0.5)" fontSize="8" letterSpacing="1.5">
            DEL DÍA
          </text>
        </svg>
      </div>

      {/* deficit bar filling */}
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-[9px] tracking-[0.2em] text-cream/50">
          <span>DÉFICIT DE HOY</span>
          <span>−320 kcal</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-cream/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-soft to-pink"
            initial={{ width: 0 }}
            animate={{ width: "64%" }}
            transition={{ duration: 2.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ boxShadow: "0 0 10px rgba(255,72,134,0.4)" }}
          />
        </div>
      </div>

      {/* cards fading in */}
      <div className="mt-4 space-y-2">
        {[
          { t: "Desayuno registrado", d: "32 g proteína" },
          { t: "Caminata · 40 min", d: "Señal de movimiento" },
        ].map((c, i) => (
          <motion.div
            key={c.t}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.2 + i * 0.5 }}
            className="rounded-xl border border-cream/10 bg-cream/[0.04] p-2.5"
          >
            <p className="text-[11px] text-cream/90">{c.t}</p>
            <p className="text-[9px] tracking-wide text-gold/70">{c.d}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
