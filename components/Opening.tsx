"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * La apertura — ~1.8s de ceremonia antes del cielo.
 * El anillo de la marca se traza, la estrella magenta ocupa su lugar,
 * STELAR respira, y el telón se disuelve revelando el hero.
 * Con prefers-reduced-motion no existe.
 */
export default function Opening() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow(false);
      return;
    }
    const t = setTimeout(() => setShow(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0A0608]"
        >
          <div className="flex flex-col items-center gap-7">
            <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
              <defs>
                <linearGradient id="openRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#C447A0" />
                  <stop offset="100%" stopColor="#7A4FBF" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="48"
                cy="48"
                r="35"
                fill="none"
                stroke="url(#openRing)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.05, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* the star takes its place once the ring closes */}
              <motion.circle
                cx="48"
                cy="10"
                r="4.5"
                fill="#FF4886"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.6, 1], opacity: 1 }}
                transition={{ delay: 1.15, duration: 0.45, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 0 9px #FF4886)", transformOrigin: "48px 10px" }}
              />
            </svg>
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.7em" }}
              animate={{ opacity: 1, letterSpacing: "0.45em" }}
              transition={{ delay: 0.45, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="pl-[0.45em] text-sm font-semibold text-cream/90"
            >
              STELAR
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
