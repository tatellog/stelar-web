"use client";

import { motion } from "framer-motion";

const enter = (show: boolean, delay: number) => ({
  initial: false as const,
  animate: { opacity: show ? 1 : 0, y: show ? 0 : 10 },
  transition: { duration: 0.7, delay: show ? delay : 0, ease: [0.22, 1, 0.36, 1] as const },
});

/** The real post-scan sheet, miniaturized: TU PLATILLO → MOMENTO →
 *  INGREDIENTES DETECTADOS → EN TOTAL → CONFIRMAR. */
export default function ScanResultScreen({ show }: { show: boolean }) {
  return (
    <div className="flex h-full flex-col px-3 pb-3 pt-9 text-cream">
      <motion.div {...enter(show, 0.3)}>
        <p className="text-[8.5px] uppercase tracking-[0.28em] text-pink">
          Tu platillo
        </p>
        <div className="mt-1 rounded-xl border border-cream/12 bg-cream/[0.04] px-2.5 py-2">
          <p className="text-[11px] font-semibold leading-snug">
            Salmón con tomates cherry y crema
          </p>
        </div>
      </motion.div>

      <motion.div {...enter(show, 0.5)} className="mt-2">
        <p className="text-[8.5px] uppercase tracking-[0.28em] text-pink">
          Momento
        </p>
        <div className="mt-1 flex gap-1">
          {["Desayuno", "Comida", "Cena", "Snack"].map((m) => (
            <span
              key={m}
              className={`flex-1 rounded-full border px-1 py-1 text-center text-[6px] tracking-wide ${
                m === "Cena"
                  ? "border-gold/50 bg-gold/15 text-gold-soft"
                  : "border-cream/10 text-cream/45"
              }`}
            >
              {m === "Cena" ? "☾ " : ""}
              {m}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div {...enter(show, 0.7)} className="mt-2">
        <p className="text-[8.5px] uppercase tracking-[0.28em] text-pink">
          Ingredientes detectados
        </p>
        <div className="mt-1 flex flex-col gap-1">
          <div className="flex items-center justify-between rounded-lg border border-cream/[0.08] px-2 py-1.5">
            <span>
              <span className="block text-[10px] font-semibold">Salmón</span>
              <span className="text-[8px] text-cream/50">
                38 g proteína · 309 kcal
              </span>
            </span>
            <span className="rounded-md border border-cream/15 px-1.5 py-0.5 text-[8.5px] text-cream/80">
              150 g
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-cream/[0.08] px-2 py-1.5">
            <span className="text-[10px] font-semibold">Tomates cherry</span>
            <span className="rounded-md border border-cream/15 px-1.5 py-0.5 text-[8.5px] text-cream/80">
              50 g
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-cream/[0.08] px-2 py-1.5">
            <span className="text-[10px] font-semibold">Crema</span>
            <span className="rounded-md border border-cream/15 px-1.5 py-0.5 text-[8.5px] text-cream/80">
              30 g
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div {...enter(show, 0.95)} className="mt-auto">
        <div className="flex items-baseline justify-between px-0.5">
          <span className="text-[8px] uppercase tracking-[0.25em] text-cream/50">
            En total
          </span>
          <span className="text-[9px] text-cream/85">
            <b>39 g</b> proteína · <b>548</b> kcal · <b>2 g</b> azúcar
          </span>
        </div>
        <div className="mt-1.5 rounded-full bg-pink-soft py-1.5 text-center text-[9.5px] font-semibold tracking-[0.2em] text-white shadow-[0_0_16px_rgba(233,30,99,0.45)]">
          CONFIRMAR
        </div>
      </motion.div>
    </div>
  );
}
