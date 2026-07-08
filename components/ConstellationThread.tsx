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

const IGNITE0 = 0.03; // first star, on the hero
const IGNITE1 = 0.68; // last star, entering the patterns chapter
const FADE0 = 0.76; // hand-off to the evidence/emblem chapters
const FADE1 = 0.84;

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

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;
      const t = now / 1000;

      const alive = ramp(p, IGNITE0, IGNITE0 + 0.02) * (1 - ramp(p, FADE0, FADE1));
      if (alive <= 0.01) {
        return;
      }

      // a small sky chart, top-right, out of the chapters' stage
      const mobile = W < 640;
      const S = mobile ? Math.min(W * 0.3, 130) : Math.min(W * 0.17, H * 0.3);
      const rect = {
        x: W - S - (mobile ? 16 : 44),
        y: mobile ? 84 : 96,
        w: S,
        h: S,
      };
      const fig = figureFit(signRef.current, rect, 0.1);
      const n = fig.pts.length;

      /* lines shimmer once both ends are lit */
      fig.lines.forEach(([a, b], li) => {
        const litA = ramp(p, IGNITE0 + (a / n) * (IGNITE1 - IGNITE0), IGNITE0 + (a / n) * (IGNITE1 - IGNITE0) + 0.02);
        const litB = ramp(p, IGNITE0 + (b / n) * (IGNITE1 - IGNITE0), IGNITE0 + (b / n) * (IGNITE1 - IGNITE0) + 0.02);
        const on = Math.min(litA, litB);
        if (on <= 0) return;
        const A = fig.pts[a];
        const B = fig.pts[b];
        const shimmer = 0.75 + 0.25 * Math.sin(t * 0.9 + li * 2.2);
        ctx.strokeStyle = colorA("#D9AE6F", 0.2 * on * shimmer * alive);
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
          softDot(ctx, px, py, 3.2, "#FFE9C2", 0.4 * Math.sin(k * Math.PI) * alive, 0.45);
        }
      });

      /* the stars: dim seeds first, then each chapter ignites one more */
      fig.pts.forEach((pt, i) => {
        const i0 = IGNITE0 + (i / n) * (IGNITE1 - IGNITE0);
        const lit = ramp(p, i0, i0 + 0.02);
        const hero = pt.mag <= 2.3;
        const breath = 0.85 + 0.15 * Math.sin(t * 0.8 + i * 2.1);

        // the unlit future, barely there — the promise of what's coming
        softDot(ctx, pt.x, pt.y, 2.2, "#F4ECDE", 0.1 * (1 - lit) * alive, 0.4);

        if (lit <= 0) return;
        // ignition pop
        if (lit < 1) {
          ctx.strokeStyle = colorA("#FFE9C2", (1 - lit) * 0.6 * alive);
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3 + lit * 10, 0, Math.PI * 2);
          ctx.stroke();
        }
        const r = (hero ? 2.6 : 1.8) * (0.5 + 0.5 * lit);
        softDot(ctx, pt.x, pt.y, r * 3.6, hero ? "#FBD7E3" : "#E8B872", 0.3 * lit * breath * alive, 0.3);
        sparkle(ctx, pt.x, pt.y, r, "#FFF6E5", Math.min(1, 0.9 * lit * breath) * alive);
      });

      /* stray dust drifting toward the chart — the universe feeding it */
      for (let k = 0; k < 7; k++) {
        const kt = (t * 0.05 + prand(k * 7.7)) % 1;
        const a0 = prand(k * 3.1) * Math.PI * 2;
        const sx = rect.x + rect.w / 2 + Math.cos(a0) * S * (1.4 - kt * 0.9);
        const sy = rect.y + rect.h / 2 + Math.sin(a0) * S * (1.4 - kt * 0.9);
        softDot(ctx, sx, sy, 1.2, "#E8B872", 0.22 * Math.sin(kt * Math.PI) * alive, 0.4);
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
