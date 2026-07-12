"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * El autopiloto — the journey can carry you.
 * One floating control starts a slow cinematic scroll through the whole
 * story; ANY manual gesture (wheel, touch, keys, click) hands control
 * back instantly. Manual is always one flick away.
 */

const SPEED_VH = 0.45; // viewport-heights per second — cinematic, not sleepy

export default function AutoPilot() {
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  // the hero (or anything else) can start the ride via a DOM event
  useEffect(() => {
    const start = () => {
      setEnded(false);
      setPlaying(true);
    };
    window.addEventListener("stelar:autopilot", start);
    return () => window.removeEventListener("stelar:autopilot", start);
  }, []);

  useEffect(() => {
    if (!playing) return;

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    // hoisted: reading scrollHeight right after a scroll write every
    // frame risks a forced layout
    let max = document.documentElement.scrollHeight - window.innerHeight;
    const onResize = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    const step = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      acc += (window.innerHeight * SPEED_VH * dt) / 1000;
      const px = Math.floor(acc);
      acc -= px;
      // "instant": html has scroll-behavior smooth, and a plain scrollBy
      // would start a native smooth animation every frame (slow + jerky)
      if (px > 0) window.scrollBy({ top: px, behavior: "instant" });
      if (window.scrollY >= max - 2) {
        // journey complete — rest on the final sky
        setPlaying(false);
        setEnded(true);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    /* any human gesture = manual mode, instantly */
    const interrupt = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("#autopilot")) return; // the control itself
      setPlaying(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(
          e.key,
        )
      )
        setPlaying(false);
    };
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchstart", interrupt, { passive: true });
    window.addEventListener("pointerdown", interrupt);
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", onKey);
    };
  }, [playing]);

  const toggle = () => {
    if (!playing && (ended || window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2)) {
      // replay from the top of the sky
      window.scrollTo({ top: 0 });
      setEnded(false);
    }
    setPlaying((v) => !v);
  };

  return (
    <div id="autopilot" className="fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7">
      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 1 }}
        onClick={toggle}
        aria-label={playing ? "Pausar el viaje automático" : "Reproducir el viaje automático"}
        aria-pressed={playing}
        className="group relative flex h-12 items-center gap-2.5 rounded-full border border-cream/20 bg-deep/70 px-4 backdrop-blur-md transition-all duration-500 hover:border-gold/50 hover:shadow-[0_0_28px_rgba(232,184,114,0.22)]"
      >
        {/* breathing halo while the journey drives itself */}
        <AnimatePresence>
          {playing && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 0.75, 0.35] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -inset-px rounded-full border border-gold/40"
            />
          )}
        </AnimatePresence>

        {playing ? (
          <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden className="shrink-0">
            <rect x="1" y="0.5" width="3" height="11" rx="1.2" fill="#E8B872" />
            <rect x="7" y="0.5" width="3" height="11" rx="1.2" fill="#E8B872" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
            <path d="M2.4 1.2 L10.8 6 L2.4 10.8 Z" fill="#F4ECDE" opacity="0.9" />
          </svg>
        )}
        <span className="text-[11.5px] uppercase tracking-[0.22em] text-cream/70 transition-colors duration-500 group-hover:text-cream">
          {playing ? "Pausar" : ended ? "Volver a viajar" : "Viaje automático"}
        </span>
      </motion.button>
    </div>
  );
}
