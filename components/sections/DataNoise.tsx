"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSign } from "../SignContext";
import { figureInRect } from "@/lib/zodiac/helpers";
import { softDot, sparkle, colorA, prand, ramp } from "@/lib/canvas";

/**
 * Capítulo X — No más datos sueltos.
 * The screen fills with loose numbers — calorías, pasos, macros, peso —
 * until they become noise. Then the noise disperses, and what remains is
 * pulled toward the center: a clean constellation. Evidence, not noise.
 */

const TOKENS = [
  "1.847", "kcal", "62 g", "proteína", "10.234", "pasos", "72.4", "kg",
  "7 h 12 m", "sueño", "2.1 L", "agua", "48%", "carbs", "1.560", "kcal",
  "58 g", "grasas", "9.480", "pasos", "71.9", "kg", "6 h 40 m", "sueño",
  "1.8 L", "agua", "132", "g carbs", "1.923", "kcal", "66 g", "proteína",
  "11.802", "pasos", "72.1", "kg", "8 h 05 m", "sueño", "2.4 L", "agua",
  "-320", "kcal", "44%", "déficit", "1.771", "kcal", "12.019", "pasos",
  "70 g", "proteína", "73.0", "kg", "5 h 58 m", "sueño", "1.5 L", "agua",
  "2.014", "kcal", "61 g", "proteína", "8.732", "pasos", "72.6", "kg",
];

const BULLETS = [
  ["Evidencia", "no ruido."],
  ["Patrones", "no días aislados."],
  ["Claridad", "no culpa."],
  ["Progreso", "no perfección."],
];

export default function DataNoise() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const { sign } = useSign();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
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
    let fig: ReturnType<typeof figureInRect> | null = null;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.parentElement?.clientWidth ?? 0;
      H = canvas.parentElement?.clientHeight ?? 0;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = Math.min(W * 0.62, H * 0.52);
      fig = figureInRect(sign, {
        x: W / 2 - s / 2,
        y: H * 0.44 - s / 2,
        w: s,
        h: s,
      });
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;
      if (!fig) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const overwhelm = ramp(p, 0.3, 0.42); // too many numbers
      const disperse = ramp(p, 0.42, 0.56); // the noise breaks apart
      const gather = ramp(p, 0.56, 0.74); // pulled toward the center
      const constel = ramp(p, 0.68, 0.88); // the constellation settles

      const stars = fig.pts;

      // the loose numbers
      TOKENS.forEach((token, i) => {
        const born = ramp(p, 0.03 + i * 0.004, 0.08 + i * 0.004);
        if (born <= 0) return;

        const bx = (0.08 + prand(i * 3.3) * 0.84) * W;
        const by = (0.12 + prand(i * 7.7) * 0.72) * H;
        const driftX = Math.sin(t * 0.00022 + i * 1.9) * 16;
        const driftY = Math.cos(t * 0.00018 + i * 2.3) * 13;
        // noise shakes when it becomes too much
        const shake = overwhelm * (1 - disperse) * 2.2;
        const sx = Math.sin(t * 0.013 + i * 5.1) * shake;
        const sy = Math.cos(t * 0.017 + i * 3.7) * shake;

        // dispersal pushes each token away from the center
        const dx = bx - W / 2;
        const dy = by - H * 0.44;
        const dd = Math.hypot(dx, dy) || 1;
        const away = disperse * (1 - gather) * 160;

        // then what matters is attracted to its star
        const star = stars[i % stars.length];
        let x = bx + driftX + sx + (dx / dd) * away;
        let y = by + driftY + sy + (dy / dd) * away;
        x += (star.x - x) * gather;
        y += (star.y - y) * gather;

        const textAlpha =
          born * (0.3 + overwhelm * 0.5) * (1 - disperse * 0.55) * (1 - gather);
        if (textAlpha > 0.01) {
          const isNumber = /\d/.test(token);
          ctx.fillStyle = colorA(isNumber ? "#F4ECDE" : "#D9AE6F", textAlpha);
          ctx.font = `${isNumber ? 700 : 400} ${11 + prand(i * 13.1) * 9}px 'Hanken Grotesk', sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(token, x, y);
        }

        // the token becomes light as it arrives
        if (gather > 0) {
          softDot(ctx, x, y, 5.5, "#FFE9C2", gather * (1 - constel) * 0.5, 0.4);
        }
      });

      // the clean constellation
      if (constel > 0) {
        fig.lines.forEach(([a, b], li) => {
          const grow = ramp(constel, li / fig!.lines.length, li / fig!.lines.length + 0.3);
          if (grow <= 0) return;
          const A = stars[a];
          const B = stars[b];
          ctx.strokeStyle = colorA("#D9AE6F", 0.5 * grow);
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(A.x + (B.x - A.x) * grow, A.y + (B.y - A.y) * grow);
          ctx.stroke();
        });
        stars.forEach((s, si) => {
          const hero = s.mag <= 2.3;
          const tw = 0.85 + 0.15 * Math.sin(t * 0.0016 + si * 2.8);
          softDot(
            ctx,
            s.x,
            s.y,
            (hero ? 16 : 9) * tw,
            hero ? "#FBD7E3" : "#F4ECDE",
            constel * (hero ? 0.55 : 0.4),
            0.3,
          );
          sparkle(ctx, s.x, s.y, hero ? 5 : 3, "#FFF6E5", constel * 0.95);
        });
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [sign]);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.08, 0.2, 0.28], [0, 1, 1, 0]);
  const midOpacity = useTransform(p, [0.44, 0.52, 0.62, 0.7], [0, 1, 1, 0]);
  const bulletsOpacity = useTransform(p, [0.78, 0.86], [0, 1]);
  const bulletsY = useTransform(p, [0.78, 0.88], [24, 0]);

  return (
    <section ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_88%,transparent_100%)]"
        />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[10%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo X · No más datos sueltos
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            No necesitas{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              más datos.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Necesitas entender los que ya tienes.
          </p>
        </motion.div>

        {/* the turn */}
        <motion.div
          style={{ opacity: midOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[12%] z-10 mx-auto max-w-xl px-6 text-center"
        >
          <p className="text-lg leading-relaxed text-cream/70 sm:text-xl">
            Otras apps te muestran números.{" "}
            <span className="font-serif italic text-gold">
              Stelar los convierte en evidencia.
            </span>
          </p>
        </motion.div>

        {/* what remains, once the noise is gone */}
        <motion.div
          style={{ opacity: bulletsOpacity, y: bulletsY }}
          className="pointer-events-none absolute inset-x-0 bottom-[8%] z-10 mx-auto max-w-3xl px-6"
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-center sm:grid-cols-4">
            {BULLETS.map(([strong, rest]) => (
              <p key={strong} className="text-sm text-cream/70">
                <span className="font-serif italic text-gold">{strong}</span>
                {", "}
                {rest}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
