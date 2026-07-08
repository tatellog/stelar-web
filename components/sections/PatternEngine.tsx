"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { softDot, sparkle, colorA, ramp, prand } from "@/lib/canvas";

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

    const GREEK = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "λ", "μ", "ν", "σ"];

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;

      const pos = NODES.map((n, i) => nodePos(n, i, t));

      /* ── the finale: the network opens into a celestial chart ──── */
      const chart = ramp(p, 0.58, 0.86);
      if (chart > 0) {
        const R = Math.min(W, H);
        const parX = pointer.current.x >= 0 ? pointer.current.x / W - 0.5 : 0;
        const parY = pointer.current.y >= 0 ? pointer.current.y / H - 0.5 : 0;
        const ccx = W / 2 + parX * 12;
        const ccy = H * 0.48 + parY * 10;

        // a soft nebula behind the heart of the map
        softDot(ctx, ccx, ccy, R * 0.34, "#FBD7E3", 0.05 * chart, 0.2);
        softDot(ctx, ccx, ccy, R * 0.2, "#FFE9C2", 0.05 * chart, 0.25);

        // cartographic rings — some solid, some dashed, slightly tilted
        for (let l = 0; l < 5; l++) {
          const rr = R * (0.14 + l * 0.13);
          const born = ramp(chart, l * 0.1, l * 0.1 + 0.35);
          if (born <= 0) continue;
          if (l % 2 === 1) ctx.setLineDash([2, 8]);
          ctx.strokeStyle = colorA("#F4ECDE", 0.07 * born);
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.ellipse(ccx, ccy, rr, rr * 0.94, -0.06, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // radial graticule spokes
        for (let l = 0; l < 10; l++) {
          const ang = (l / 10) * Math.PI * 2 + 0.2;
          const born = ramp(chart, 0.15 + l * 0.03, 0.4 + l * 0.03);
          if (born <= 0) continue;
          ctx.strokeStyle = colorA("#F4ECDE", 0.04 * born);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(ccx + Math.cos(ang) * R * 0.12, ccy + Math.sin(ang) * R * 0.11);
          ctx.lineTo(ccx + Math.cos(ang) * R * 0.68, ccy + Math.sin(ang) * R * 0.64);
          ctx.stroke();
        }

        // hundreds of chart stars, born in waves
        for (let i = 0; i < 240; i++) {
          const born = ramp(chart, prand(i * 1.7) * 0.6, prand(i * 1.7) * 0.6 + 0.3);
          if (born <= 0) continue;
          const x = prand(i * 3.3) * W + Math.sin(t * 0.0002 + i) * 3;
          const y = prand(i * 7.1) * H + Math.cos(t * 0.00017 + i * 1.3) * 2.5;
          const mag = prand(i * 9.7);
          const tw = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.0006 + i * 2.1));
          const a = (0.14 + mag * 0.4) * born * tw;
          ctx.fillStyle = colorA("#F4ECDE", a);
          ctx.beginPath();
          ctx.arc(x, y, 0.4 + mag * 1.2, 0, Math.PI * 2);
          ctx.fill();
          // the brightest get a tiny cross flare and an atlas label
          if (mag > 0.93) {
            ctx.strokeStyle = colorA("#FFF6E5", a * 0.8);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x - 5, y);
            ctx.lineTo(x + 5, y);
            ctx.moveTo(x, y - 5);
            ctx.lineTo(x, y + 5);
            ctx.stroke();
            ctx.fillStyle = colorA("#F4ECDE", 0.3 * born);
            ctx.font = "400 8px 'Hanken Grotesk', sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(GREEK[i % GREEK.length], x + 7, y - 4);
          }
        }

        // small chart figures: clusters joined by hairline strokes
        for (let c = 0; c < 11; c++) {
          const born = ramp(chart, 0.2 + prand(c * 13.1) * 0.5, 0.45 + prand(c * 13.1) * 0.5);
          if (born <= 0) continue;
          const ang = prand(c * 5.9) * Math.PI * 2;
          const rad = R * (0.22 + prand(c * 8.3) * 0.42);
          const fx = ccx + Math.cos(ang) * rad;
          const fy = ccy + Math.sin(ang) * rad * 0.9;
          const n = 4 + Math.floor(prand(c * 11.3) * 3);
          let px2 = 0;
          let py2 = 0;
          for (let k = 0; k < n; k++) {
            const sx = fx + (prand(c * 17 + k * 7) - 0.5) * R * 0.13;
            const sy = fy + (prand(c * 23 + k * 11) - 0.5) * R * 0.1;
            ctx.fillStyle = colorA("#F4ECDE", 0.5 * born);
            ctx.beginPath();
            ctx.arc(sx, sy, 0.9 + prand(c * 29 + k) * 0.8, 0, Math.PI * 2);
            ctx.fill();
            if (k > 0) {
              ctx.strokeStyle = colorA("#F4ECDE", 0.13 * born);
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(px2, py2);
              ctx.lineTo(sx, sy);
              ctx.stroke();
            }
            px2 = sx;
            py2 = sy;
          }
        }

        // the bright star at the heart of the map
        const breath = 1 + 0.05 * Math.sin(t * 0.0014);
        ctx.save();
        ctx.translate(ccx, ccy);
        ctx.scale(9, 0.4);
        softDot(ctx, 0, 0, R * 0.03 * breath, "#FFE9C2", 0.3 * chart, 0.25);
        ctx.restore();
        softDot(ctx, ccx, ccy, R * 0.05 * breath, "#FFE9C2", 0.35 * chart, 0.25);
        softDot(ctx, ccx, ccy, R * 0.009, "#FFF6E5", 0.95 * chart, 0.55);
      }

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
            Capítulo V · IA Pattern Engine
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
