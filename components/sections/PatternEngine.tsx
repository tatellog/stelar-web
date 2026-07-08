"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { softDot, sparkle, colorA, ramp } from "@/lib/canvas";

/**
 * Capítulo VI — IA Pattern Engine.
 * The registros become voices: eight floating lights in space that, as you
 * scroll, start talking to each other. Lines draw themselves between them;
 * the strongest relationships glow brighter and send pulses of light.
 * Hovering a node lights up everything it's connected to.
 */

type Node = {
  id: string;
  label: string;
  x: number; // viewport fraction
  y: number;
  color: string;
  r: number;
};

const NODES: Node[] = [
  { id: "comida", label: "Comida", x: 0.3, y: 0.3, color: "#E8B872", r: 7 },
  { id: "entreno", label: "Entreno", x: 0.68, y: 0.24, color: "#FF9E57", r: 7 },
  { id: "sueno", label: "Sueño", x: 0.19, y: 0.6, color: "#C18FFF", r: 6.5 },
  { id: "peso", label: "Peso", x: 0.5, y: 0.76, color: "#F4ECDE", r: 6 },
  { id: "agua", label: "Agua", x: 0.44, y: 0.2, color: "#8FBEDB", r: 5.5 },
  { id: "deficit", label: "Déficit", x: 0.63, y: 0.58, color: "#E91E63", r: 8 },
  { id: "proteina", label: "Proteína", x: 0.8, y: 0.42, color: "#E0AEA0", r: 6.5 },
  { id: "ciclo", label: "Ciclo", x: 0.33, y: 0.46, color: "#FBD7E3", r: 5.5 },
];

// [a, b, strength 0..1] — the strongest relations glow and pulse
const EDGES: [number, number, number][] = [
  [1, 5, 1], // entreno — déficit
  [2, 0, 0.9], // sueño — comida
  [6, 3, 0.85], // proteína — peso
  [0, 5, 0.8], // comida — déficit
  [4, 0, 0.4],
  [4, 1, 0.35],
  [7, 2, 0.5],
  [7, 3, 0.4],
  [1, 6, 0.5],
  [2, 1, 0.35],
  [5, 3, 0.6],
];

export default function PatternEngine() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const pointer = useRef({ x: -1, y: -1 });

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

    let raf = 0;
    let hovered = -1;

    const nodePos = (n: Node, i: number, t: number) => {
      // gentle drift — the lights breathe in place
      const fx = Math.sin(t * 0.00023 + i * 2.1) * 14;
      const fy = Math.cos(t * 0.00019 + i * 1.7) * 11;
      // portrait screens: pull the cloud tighter horizontally
      const kx = W < 640 ? 0.86 : 1;
      const x = (0.5 + (n.x - 0.5) * kx) * W + fx;
      const y = n.y * H + fy;
      return { x, y };
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;

      const pos = NODES.map((n, i) => nodePos(n, i, t));

      // hover detection
      hovered = -1;
      if (pointer.current.x >= 0) {
        let best = 46;
        pos.forEach((pt, i) => {
          const d = Math.hypot(pt.x - pointer.current.x, pt.y - pointer.current.y);
          if (d < best) {
            best = d;
            hovered = i;
          }
        });
      }

      // edges — drawn progressively between 0.28 and 0.68 of the chapter
      EDGES.forEach(([a, b, strength], ei) => {
        const start = 0.28 + (ei / EDGES.length) * 0.32;
        const grow = ramp(p, start, start + 0.09);
        if (grow <= 0) return;
        const A = pos[a];
        const B = pos[b];
        const ex = A.x + (B.x - A.x) * grow;
        const ey = A.y + (B.y - A.y) * grow;

        const isHover = hovered === a || hovered === b;
        const base = strength >= 0.8 ? 0.34 : 0.16;
        const alpha = (base + (isHover ? 0.4 : 0)) * ramp(p, 0.24, 0.34);

        const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
        grad.addColorStop(0, colorA(NODES[a].color, alpha));
        grad.addColorStop(1, colorA(NODES[b].color, alpha));
        ctx.strokeStyle = grad;
        ctx.lineWidth = strength >= 0.8 ? 1.1 : 0.7;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // the strongest relations send pulses of light once connected
        if (strength >= 0.8 && grow >= 1) {
          const speed = 2600 + ei * 700;
          const k = ((t + ei * 900) % speed) / speed;
          const px = A.x + (B.x - A.x) * k;
          const py = A.y + (B.y - A.y) * k;
          softDot(ctx, px, py, 7, "#FFE9C2", 0.5 * ramp(p, 0.5, 0.62), 0.5);
        }
      });

      // nodes — born one by one at the chapter's opening
      NODES.forEach((n, i) => {
        const born = ramp(p, 0.04 + i * 0.028, 0.12 + i * 0.028);
        if (born <= 0) return;
        const { x, y } = pos[i];
        const isHover = hovered === i;
        const pulse = 1 + Math.sin(t * 0.0011 + i * 3.4) * 0.08;
        const R = n.r * 3.6 * pulse * (isHover ? 1.5 : 1);
        const a = born * (0.55 + (isHover ? 0.45 : 0));

        softDot(ctx, x, y, R, n.color, a, 0.28);
        sparkle(ctx, x, y, n.r * (isHover ? 1.5 : 1.05), "#FFF6E5", born * 0.9);

        // label
        const la = born * (isHover ? 0.95 : 0.55);
        ctx.fillStyle = colorA("#F4ECDE", la);
        ctx.font = "600 10px 'Hanken Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.label.toUpperCase(), x, y + R * 0.62 + 14);
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const introOpacity = useTransform(scrollYProgress, [0.02, 0.08, 0.2, 0.28], [0, 1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.72, 0.82, 0.96, 1], [0, 1, 1, 0.9]);
  const outroY = useTransform(scrollYProgress, [0.72, 0.82], [28, 0]);

  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
          }}
          onPointerLeave={() => {
            pointer.current = { x: -1, y: -1 };
          }}
        >
          <canvas
            ref={canvasRef}
            className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_88%,transparent_100%)]"
          />
        </div>

        {/* the chapter opens */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[12%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VI · IA Pattern Engine
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Tus registros empiezan a{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              hablar entre ellos.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Cada dato parece pequeño. Juntos cuentan una historia.
          </p>
        </motion.div>

        {/* the engine, named */}
        <motion.div
          style={{ opacity: outroOpacity, y: outroY }}
          className="pointer-events-none absolute inset-x-0 bottom-[10%] z-10 mx-auto max-w-xl px-6 text-center"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-gold">
            IA Pattern Engine
          </p>
          <p className="mt-4 text-lg leading-relaxed text-cream/70">
            Encuentra relaciones entre tus registros para mostrarte{" "}
            <span className="font-serif italic text-gold">
              patrones que normalmente no verías.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
