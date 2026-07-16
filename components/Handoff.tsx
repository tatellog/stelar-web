"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";
import { softDot, sparkle, prand, ramp } from "@/lib/canvas";
import { runWhenVisible } from "@/lib/visibleLoop";

/**
 * El handoff — la costura entre capítulos.
 * Al cruzar el umbral, un hilo de luz se traza hacia abajo, el polvo
 * dorado del capítulo que termina converge hacia él, y una chispa
 * entrega la luz al capítulo que empieza. El viaje se cose en un solo
 * organismo en vez de sentirse como escenas apiladas.
 * Scroll-driven puro (nada anima en reposo) + tabla horneada.
 */

const MOTES = Array.from({ length: 46 }, (_, i) => ({
  fx: (prand(i * 3.1) - 0.5) * 2,
  y0: prand(i * 5.7),
  sz: 0.8 + prand(i * 7.3) * 1.6,
  tw: prand(i * 9.1) * Math.PI * 2,
  twS: 0.4 + prand(i * 11.3) * 0.8,
  gold: prand(i * 13.7) > 0.4,
}));

export default function Handoff() {
  const ref = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
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
      W = canvas.parentElement?.clientWidth ?? 0;
      H = canvas.parentElement?.clientHeight ?? 0;
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
      const t = now / 1000;
      const p = progress.current;
      const cx = W / 2;
      const gone = 1 - ramp(p, 0.9, 1); // everything yields at the end

      /* the thread of light, drawn by the scroll */
      const drawn = ramp(p, 0.12, 0.78);
      const y0 = H * 0.05;
      const yEnd = y0 + (H * 0.92 - y0) * drawn;
      if (drawn > 0.01) {
        ctx.lineCap = "round";
        // wide low-alpha understroke instead of shadowBlur
        ctx.strokeStyle = `rgba(217,174,111,${0.1 * gone})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, y0);
        ctx.lineTo(cx, yEnd);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,233,194,${0.32 * gone})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(cx, y0);
        ctx.lineTo(cx, yEnd);
        ctx.stroke();
      }

      /* dust from the closing chapter converges into the thread */
      const born = ramp(p, 0.04, 0.24);
      if (born > 0.01) {
        for (const m of MOTES) {
          const y = (m.y0 + p * 0.75) % 1;
          const x = cx + m.fx * W * 0.24 * (1 - y * 0.85);
          const a =
            Math.sin(Math.PI * y) *
            (0.16 + 0.22 * Math.abs(Math.sin(t * m.twS + m.tw))) *
            born *
            gone;
          softDot(ctx, x, y * H, m.sz * 2.2, m.gold ? "#E8B872" : "#F4ECDE", a, 0.4);
        }
      }

      /* the spark that hands the light to the next chapter */
      const bloom = ramp(p, 0.6, 0.86);
      if (bloom > 0.01 && drawn > 0.15) {
        softDot(ctx, cx, yEnd, 30 * bloom, "#FFE9C2", 0.45 * bloom * gone, 0.3);
        sparkle(ctx, cx, yEnd, 3.5 + bloom * 5.5, "#FFF6E5", Math.min(1, bloom * 1.2) * gone);
      }
    };
    const stopLoop = runWhenVisible(canvas, draw);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section ref={ref} aria-hidden className="relative h-[44vh]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </section>
  );
}
