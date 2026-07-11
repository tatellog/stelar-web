"use client";

import { motion } from "framer-motion";
import OrbitaChrome from "./OrbitaChrome";

/** The real Día view: concentric rings (calorías / proteína / entreno)
 *  over a magenta bloom, then "HOY ESTÁS EN Déficit". */
export default function DiaScreen() {
  const rings = [
    { r: 46, color: "#E91E63", pct: 0.76, delay: 0.3 }, // calorías
    { r: 37, color: "#E0AEA0", pct: 0.55, delay: 0.55 }, // proteína
    { r: 28, color: "#C18FFF", pct: 0.92, delay: 0.8 }, // entreno
  ];
  return (
    <OrbitaChrome active="dia" title="¿Cómo voy hoy?" subtitle="Martes, 7 de julio">
      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative -my-1">
          {/* the magenta bloom behind the rings */}
          <div className="absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(233,30,99,0.3)_0%,rgba(233,30,99,0.08)_55%,transparent_75%)]" />
          <svg viewBox="0 0 120 120" className="relative h-36 w-36">
            {rings.map((ring) => {
              const C = 2 * Math.PI * ring.r;
              return (
                <g key={ring.r}>
                  <circle
                    cx="60"
                    cy="60"
                    r={ring.r}
                    fill="none"
                    stroke="rgba(244,236,222,0.08)"
                    strokeWidth="5.5"
                  />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r={ring.r}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    transform="rotate(-90 60 60)"
                    initial={{ strokeDashoffset: C }}
                    animate={{ strokeDashoffset: C * (1 - ring.pct) }}
                    transition={{ duration: 1.8, delay: ring.delay, ease: [0.22, 1, 0.36, 1] }}
                    style={{ filter: `drop-shadow(0 0 5px ${ring.color}99)` }}
                  />
                </g>
              );
            })}
            {/* sparkles at the heart */}
            <path d="M60 50 l1.4 5.6 5.6 1.4 -5.6 1.4 -1.4 5.6 -1.4 -5.6 -5.6 -1.4 5.6 -1.4 Z" fill="#FFF6E5" opacity="0.9" />
            <path d="M52 64 l0.8 3.2 3.2 0.8 -3.2 0.8 -0.8 3.2 -0.8 -3.2 -3.2 -0.8 3.2 -0.8 Z" fill="#FFF6E5" opacity="0.6" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.2 }}
          className="mt-1 text-center"
        >
          <p className="text-[9px] uppercase tracking-[0.28em] text-gold">
            Hoy estás en
          </p>
          <p className="font-serif text-xl italic leading-tight">Déficit</p>
          <p className="font-sans text-lg font-black leading-tight text-pink-soft">
            260 <span className="text-[10.5px] font-semibold text-cream/70">kcal</span>
          </p>
          <p className="mt-0.5 font-serif text-[10.5px] italic text-cream/55">
            Aún tienes margen para cerrar el día.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.6 }}
          className="mt-2 flex items-center gap-2.5 text-[9px] text-cream/60"
        >
          {[
            { c: "#E91E63", l: "Calorías", v: "1203 kcal" },
            { c: "#E0AEA0", l: "Proteína", v: "63 g" },
            { c: "#C18FFF", l: "Entreno", v: "Sí" },
          ].map((k) => (
            <span key={k.l} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: k.c }} />
              <span>
                {k.l} <b className="text-cream/90">{k.v}</b>
              </span>
            </span>
          ))}
        </motion.div>
      </div>
    </OrbitaChrome>
  );
}
