"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";
import { useSign } from "./SignContext";
import { figureFit } from "@/lib/zodiac/helpers";
import { softDot, sparkle, colorA, ramp, prand } from "@/lib/canvas";
import { runWhenVisible } from "@/lib/visibleLoop";

/**
 * El hilo — the protagonist of the whole landing.
 * The visitor's constellation lives in a corner of the sky for the ENTIRE
 * journey and never resets: every chapter scrolled ignites another star,
 * lines appear once both ends are lit, pulses travel the finished threads.
 * By the time the climax chapters take the stage (and the full figure
 * becomes the scene itself), this thread hands over and dissolves.
 * The subconscious read: everything I've seen was building this.
 */

const IGNITE1 = 0.58; // last star, entering the patterns chapter
const FADE0 = 0.64; // hand-off before the evidence/emblem climax
const FADE1 = 0.71;

export default function ConstellationThread() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const { sign } = useSign();
  const signRef = useRef(sign);
  signRef.current = sign;

  const { scrollYProgress } = useScroll();
  useEffect(() =>
    scrollYProgress.on("change", (v) => {
      progress.current = v;
    }),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    // the fitted figure is recomputed only when sign or viewport change
    let figCache: ReturnType<typeof figureFit> | null = null;
    let figCacheKey = "";
    // ignition is TIME-based once scroll crosses each threshold — a
    // scroll-mapped pop freezes mid-ring if the user stops scrolling
    let litA: number[] = [];

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;
      const t = now / 1000;

      const fade = ramp(p, FADE0, FADE1);
      const alive = 1 - fade;
      if (alive <= 0.01) {
        return;
      }
      // the farewell: the threads let go first, then each star sails
      // toward the center stage where the full figure is about to appear
      const lineAlive = Math.max(0, 1 - fade * 2.2);
      const scx = W / 2;
      const scy = H / 2;

      // a small sky chart, top-right, out of the chapters' stage
      const mobile = W < 640;
      const S = mobile ? Math.min(W * 0.3, 130) : Math.min(W * 0.17, H * 0.3);
      const rect = {
        x: W - S - (mobile ? 16 : 44),
        y: mobile ? 84 : 96,
        w: S,
        h: S,
      };
      const figKey = `${signRef.current}|${W}x${H}`;
      if (figCacheKey !== figKey) {
        figCache = figureFit(signRef.current, rect, 0.1);
        figCacheKey = figKey;
        litA = figCache.pts.map(() => 0);
      }
      const fig = figCache!;
      const n = fig.pts.length;

      // scroll decides WHICH stars are on; time carries them there
      for (let i = 0; i < n; i++) {
        // the first star seeds itself on load — the signature starts at zero
        const target = p >= (i / n) * IGNITE1 ? 1 : 0;
        litA[i] += (target - litA[i]) * 0.09;
        if (Math.abs(target - litA[i]) < 0.004) litA[i] = target;
      }

      /* lines shimmer once both ends are lit */
      if (lineAlive > 0.01)
        fig.lines.forEach(([a, b], li) => {
          const on = Math.min(litA[a], litA[b]);
          if (on <= 0) return;
          const A = fig.pts[a];
          const B = fig.pts[b];
          const shimmer = 0.75 + 0.25 * Math.sin(t * 0.9 + li * 2.2);
          ctx.strokeStyle = colorA("#D9AE6F", 0.2 * on * shimmer * lineAlive);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          // the thread draws itself from A toward B as it turns on
          ctx.lineTo(A.x + (B.x - A.x) * on, A.y + (B.y - A.y) * on);
          ctx.stroke();

          // a pulse of energy travels the finished threads, one at a time
          if (on >= 1) {
            const k = (t * 0.16 + li * 0.47) % 1;
            const px = A.x + (B.x - A.x) * k;
            const py = A.y + (B.y - A.y) * k;
            softDot(ctx, px, py, 3.2, "#FFE9C2", 0.4 * Math.sin(k * Math.PI) * lineAlive, 0.45);
          }
        });

      /* the stars: dim seeds first, then each chapter ignites one more */
      fig.pts.forEach((pt, i) => {
        const lit = litA[i];
        const hero = pt.mag <= 2.3;
        const breath = 0.85 + 0.15 * Math.sin(t * 0.8 + i * 2.1);

        // staggered departure: a flash, then the star sails to the stage
        const dp = fade <= 0 ? 0 : Math.min(1, Math.max(0, (fade - (i / n) * 0.3) / 0.7));
        const dep = dp * dp * (3 - 2 * dp);
        const x = pt.x + (scx - pt.x) * dep;
        const y = pt.y + (scy - pt.y) * dep;
        const starA = 1 - dep;
        const surge = 1 + Math.sin(dep * Math.PI) * 0.7;

        // the unlit future, barely there — the promise of what's coming
        softDot(ctx, x, y, 2.2, "#F4ECDE", 0.1 * (1 - lit) * starA, 0.4);

        if (lit <= 0.01) return;
        // ignition pop — brief, always completes (time-driven)
        if (lit < 0.98) {
          ctx.strokeStyle = colorA("#FFE9C2", (1 - lit) * lit * 1.4 * starA);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(x, y, 3 + lit * 9, 0, Math.PI * 2);
          ctx.stroke();
        }
        const r = (hero ? 2.6 : 1.8) * (0.5 + 0.5 * lit);
        softDot(ctx, x, y, r * 3.6, hero ? "#FBD7E3" : "#E8B872", Math.min(0.6, 0.3 * lit * breath * surge) * starA, 0.3);
        sparkle(ctx, x, y, r, "#FFF6E5", Math.min(1, 0.9 * lit * breath * surge) * starA);
        // a faint golden wake while it departs
        if (dep > 0.02 && dep < 0.98) {
          softDot(
            ctx,
            pt.x + (scx - pt.x) * dep * 0.82,
            pt.y + (scy - pt.y) * dep * 0.82,
            2,
            "#FFE9C2",
            0.25 * Math.sin(dep * Math.PI) * starA,
            0.4,
          );
        }
      });

      /* stray dust drifting toward the chart — the universe feeding it */
      for (let k = 0; k < 7; k++) {
        const kt = (t * 0.05 + prand(k * 7.7)) % 1;
        const a0 = prand(k * 3.1) * Math.PI * 2;
        const sx = rect.x + rect.w / 2 + Math.cos(a0) * S * (1.4 - kt * 0.9);
        const sy = rect.y + rect.h / 2 + Math.sin(a0) * S * (1.4 - kt * 0.9);
        softDot(ctx, sx, sy, 1.2, "#E8B872", 0.22 * Math.sin(kt * Math.PI) * lineAlive, 0.4);
      }

    };
    const stopLoop = runWhenVisible(canvas, draw);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5]"
    />
  );
}
