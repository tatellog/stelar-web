"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  depth: number; // 0.2 (far) … 1 (near)
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  hue: "white" | "pink" | "gold";
};

const HUES: Record<Star["hue"], string> = {
  white: "244, 236, 222",
  pink: "255, 72, 134",
  gold: "217, 174, 111",
};

/**
 * Fixed full-page canvas of stars with depth:
 * - twinkle slowly
 * - drift with scroll at their own depth (deep parallax)
 * - lean away from the pointer and gently repel near it
 */
export default function Starfield({ density = 0.00014 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let raf = 0;
    let running = true;
    let W = 0;
    let H = 0;

    // pointer target + lerped position so reactions feel liquid, never twitchy
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor(W * H * density);
      stars = Array.from({ length: count }, () => {
        const roll = Math.random();
        const depth = 0.2 + Math.random() * 0.8;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          depth,
          r: (Math.random() * 1.1 + 0.3) * (0.6 + depth * 0.7),
          baseAlpha: (Math.random() * 0.5 + 0.15) * (0.5 + depth * 0.6),
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.4 + 0.1,
          hue: roll > 0.94 ? "pink" : roll > 0.86 ? "gold" : "white",
        };
      });
    };

    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
    };
    const onLeave = () => {
      pointer.tx = -9999;
      pointer.ty = -9999;
    };

    const draw = (t: number) => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const scroll = reduced ? 0 : window.scrollY;
      const cx = W / 2;
      const cy = H / 2;
      const hasPointer = pointer.tx > -9000 && !reduced;

      for (const s of stars) {
        // deep parallax: near stars drift more with scroll
        let sy = s.y - ((scroll * 0.06 * s.depth) % H);
        if (sy < -4) sy += H + 8;
        let sx = s.x;

        if (hasPointer) {
          // lean slightly away from the pointer, scaled by depth
          sx -= (pointer.x - cx) * 0.012 * s.depth;
          sy -= (pointer.y - cy) * 0.012 * s.depth;

          // gentle local repulsion — the sky notices you
          const dx = sx - pointer.x;
          const dy = sy - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 130 && d > 0.01) {
            const push = (1 - d / 130) * 16 * s.depth;
            sx += (dx / d) * push;
            sy += (dy / d) * push;
          }
        }

        const twinkle = reduced
          ? 1
          : 0.6 + 0.4 * Math.sin(s.phase + (t / 1000) * s.speed);
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${HUES[s.hue]}, ${s.baseAlpha * twinkle})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    seed();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", seed);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", seed);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
