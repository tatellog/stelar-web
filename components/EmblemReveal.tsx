"use client";

import { useEffect, useState } from "react";

const FRAMES = 11; // f00 … f10, the app's reveal sequence

/**
 * The sign's emblem painting itself in — the app's real reveal frames
 * (assets/zodiac-art/<sign>-reveal/f00..f10). Frames are preloaded, then
 * stepped through calmly and held on the final emblem.
 */
export default function EmblemReveal({
  sign,
  className = "",
  frameMs = 140,
}: {
  sign: string;
  className?: string;
  frameMs?: number;
}) {
  const [frame, setFrame] = useState(0);
  const [ready, setReady] = useState(false);

  const src = (i: number) =>
    `/emblems/${sign}/f${String(i).padStart(2, "0")}.png`;

  useEffect(() => {
    let cancelled = false;
    setFrame(0);
    setReady(false);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setFrame(FRAMES - 1);
      setReady(true);
      return;
    }

    // preload every frame before playing, so the paint never stutters
    let loaded = 0;
    for (let i = 0; i < FRAMES; i++) {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === FRAMES && !cancelled) setReady(true);
      };
      img.src = src(i);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sign]);

  useEffect(() => {
    if (!ready || frame >= FRAMES - 1) return;
    const t = setTimeout(() => setFrame((f) => f + 1), frameMs);
    return () => clearTimeout(t);
  }, [ready, frame, frameMs]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src(frame)}
      alt={`Emblema de ${sign}`}
      className={`h-full w-full object-contain ${className}`}
      draggable={false}
    />
  );
}
