"use client";

import { useEffect, useRef, useState } from "react";
import { softDot, sparkle } from "@/lib/canvas";
import { runWhenVisible } from "@/lib/visibleLoop";

/**
 * El cursor-estrella — solo desktop (pointer fine, sin reduced-motion).
 * Una estrella pequeña y viva reemplaza la flecha; deja una estela de
 * polvo dorado y florece sobre todo lo interactivo. El click emite un
 * pequeño estallido. La página deja de ser un video: es un lugar.
 */

type Grain = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  gold: boolean;
};

export default function StarCursor() {
  const [on, setOn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fine = matchMedia("(pointer: fine)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !reduced) setOn(true);
  }, []);

  useEffect(() => {
    if (!on) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    document.documentElement.classList.add("star-cursor");

    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const pos = { x: -100, y: -100 };
    let seen = false; // don't draw the star until the pointer exists
    let hot = false;
    let hotK = 0;
    let press = 0;
    let walked = 0;
    const grains: Grain[] = [];

    const spawn = (n: number, spread: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 0.2 + Math.random() * spread;
        grains.push({
          x: pos.x,
          y: pos.y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v + 0.12,
          life: 0,
          max: 26 + Math.random() * 22,
          size: 0.8 + Math.random() * 1.4,
          gold: Math.random() > 0.35,
        });
        if (grains.length > 90) grains.shift();
      }
    };

    const onMove = (e: PointerEvent) => {
      walked += Math.hypot(e.clientX - pos.x, e.clientY - pos.y);
      pos.x = e.clientX;
      pos.y = e.clientY;
      seen = true;
      // dust is born from movement, roughly every few px walked
      while (walked > 9) {
        walked -= 9;
        spawn(1, 0.5);
      }
    };
    const onOver = (e: Event) => {
      const t = e.target as HTMLElement | null;
      hot = !!t?.closest?.(
        "a, button, [role=button], input, textarea, select, summary, label",
      );
    };
    const onDown = () => {
      press = 1;
      spawn(9, 1.8);
    };
    const onLeave = () => {
      seen = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      hotK += ((hot ? 1 : 0) - hotK) * 0.16;
      press *= 0.9;

      for (let i = grains.length - 1; i >= 0; i--) {
        const g = grains[i];
        g.life++;
        if (g.life >= g.max) {
          grains.splice(i, 1);
          continue;
        }
        g.x += g.vx;
        g.y += g.vy;
        g.vx *= 0.965;
        g.vy *= 0.965;
        const k = 1 - g.life / g.max;
        softDot(ctx, g.x, g.y, g.size * 2.4, g.gold ? "#E8B872" : "#F4ECDE", 0.4 * k, 0.4);
      }

      if (!seen) return;
      const r = 5 + hotK * 3.5 + press * 3;
      // the bloom ring on interactive things
      if (hotK > 0.02) {
        ctx.strokeStyle = `rgba(232,184,114,${0.45 * hotK})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r * 2.1, 0, Math.PI * 2);
        ctx.stroke();
      }
      softDot(ctx, pos.x, pos.y, r * 3.4, hotK > 0.4 ? "#FFE9C2" : "#F4ECDE", 0.28 + hotK * 0.2, 0.35);
      sparkle(ctx, pos.x, pos.y, r, "#FFF6E5", 0.95);
    };

    const stopLoop = runWhenVisible(canvas, draw);

    return () => {
      stopLoop();
      document.documentElement.classList.remove("star-cursor");
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [on]);

  if (!on) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90]"
    />
  );
}
