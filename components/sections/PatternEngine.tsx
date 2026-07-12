"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { softDot, sparkle, colorA, ramp, prand } from "@/lib/canvas";
import { runWhenVisible } from "@/lib/visibleLoop";

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

/* laid out like a real constellation figure: a top arc, a left branch,
   a central spine and a right cluster — short adjacent links, almost no
   crossings, asymmetric but balanced */
const NODES: Node[] = [
  { id: "comida", label: "Comida", x: 0.34, y: 0.36, color: "#E8B872", r: 7 },
  { id: "entreno", label: "Entreno", x: 0.7, y: 0.28, color: "#FF9E57", r: 7 },
  { id: "sueno", label: "Sueño", x: 0.22, y: 0.62, color: "#C18FFF", r: 6.5 },
  { id: "peso", label: "Peso", x: 0.58, y: 0.74, color: "#F4ECDE", r: 6 },
  { id: "agua", label: "Agua", x: 0.47, y: 0.2, color: "#8FBEDB", r: 5.5 },
  { id: "deficit", label: "Déficit", x: 0.57, y: 0.5, color: "#E91E63", r: 8 },
  { id: "proteina", label: "Proteína", x: 0.79, y: 0.54, color: "#E0AEA0", r: 6.5 },
  { id: "ciclo", label: "Ciclo", x: 0.37, y: 0.55, color: "#FBD7E3", r: 5.5 },
];

// [a, b, strength 0..1] — the strongest relations glow and pulse
const EDGES: [number, number, number][] = [
  [1, 5, 1], // entreno — déficit
  [2, 0, 0.9], // sueño — comida
  [6, 3, 0.85], // proteína — peso
  [0, 5, 0.8], // comida — déficit
  [4, 0, 0.4], // agua — comida
  [4, 1, 0.35], // agua — entreno: the top arc
  [7, 2, 0.5], // ciclo — sueño
  [7, 3, 0.4], // ciclo — peso
  [1, 6, 0.5], // entreno — proteína
  [5, 6, 0.45], // déficit — proteína
  [5, 3, 0.6], // déficit — peso
];

/* one gradient per edge per frame was 660 gradient objects/s — at
   0.7-1.1px width a solid midpoint blend is visually identical */
const hexRGB = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const EDGE_COLOR = EDGES.map(([a, b]) => {
  const pa = hexRGB(NODES[a].color);
  const pb = hexRGB(NODES[b].color);
  return `rgb(${(pa[0] + pb[0]) >> 1},${(pa[1] + pb[1]) >> 1},${(pa[2] + pb[2]) >> 1})`;
});

/* chart-star + cluster statics, baked once (were ~1.2k prand/frame) */
const CHART_STARS = Array.from({ length: 240 }, (_, i) => ({
  born0: prand(i * 1.7) * 0.6,
  fx: prand(i * 3.3),
  fy: prand(i * 7.1),
  mag: prand(i * 9.7),
}));
const CLUSTERS = Array.from({ length: 11 }, (_, c) => ({
  born0: 0.2 + prand(c * 13.1) * 0.5,
  ang: prand(c * 5.9) * Math.PI * 2,
  radF: 0.22 + prand(c * 8.3) * 0.42,
  pts: Array.from({ length: 4 + Math.floor(prand(c * 11.3) * 3) }, (_, k) => ({
    dx: prand(c * 17 + k * 7) - 0.5,
    dy: prand(c * 23 + k * 11) - 0.5,
    r: 0.9 + prand(c * 29 + k) * 0.8,
  })),
}));

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

    let hovered = -1;

    const nodePos = (n: Node, i: number, t: number) => {
      // gentle drift — the lights breathe in place
      const fx = Math.sin(t * 0.00023 + i * 2.1) * 14;
      const fy = Math.cos(t * 0.00019 + i * 1.7) * 11;
      // portrait screens: compact the figure on BOTH axes — otherwise the
      // fractions of a tall viewport stretch it into a skinny column
      const mob = W < 640;
      const kx = mob ? 0.9 : 1;
      const ky = mob ? 0.55 : 1;
      const x = (0.5 + (n.x - 0.5) * kx) * W + fx;
      const y = (0.47 + (n.y - 0.47) * ky) * H + fy;
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

        // hundreds of chart stars, born in waves; the bright ones queue
        // their atlas labels for a second pass (font set once, not 17×)
        type Bright = { x: number; y: number; a: number; born: number; i: number };
        const bright: Bright[] = [];
        ctx.fillStyle = "#F4ECDE";
        for (let i = 0; i < 240; i++) {
          const st = CHART_STARS[i];
          const born = ramp(chart, st.born0, st.born0 + 0.3);
          if (born <= 0) continue;
          const x = st.fx * W + Math.sin(t * 0.0002 + i) * 3;
          const y = st.fy * H + Math.cos(t * 0.00017 + i * 1.3) * 2.5;
          const tw = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.0006 + i * 2.1));
          const a = (0.14 + st.mag * 0.4) * born * tw;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(x, y, 0.4 + st.mag * 1.2, 0, Math.PI * 2);
          ctx.fill();
          if (st.mag > 0.93) bright.push({ x, y, a, born, i });
        }
        ctx.globalAlpha = 1;
        if (bright.length) {
          // cross flares + atlas labels
          ctx.font = "400 10px 'Hanken Grotesk', sans-serif";
          ctx.textAlign = "left";
          ctx.lineWidth = 0.5;
          for (const b of bright) {
            ctx.strokeStyle = colorA("#FFF6E5", b.a * 0.8);
            ctx.beginPath();
            ctx.moveTo(b.x - 5, b.y);
            ctx.lineTo(b.x + 5, b.y);
            ctx.moveTo(b.x, b.y - 5);
            ctx.lineTo(b.x, b.y + 5);
            ctx.stroke();
            ctx.fillStyle = colorA("#F4ECDE", 0.3 * b.born);
            ctx.fillText(GREEK[b.i % GREEK.length], b.x + 7, b.y - 4);
          }
        }

        // small chart figures: clusters joined by hairline strokes
        for (let c = 0; c < 11; c++) {
          const cl = CLUSTERS[c];
          const born = ramp(chart, cl.born0, cl.born0 + 0.25);
          if (born <= 0) continue;
          const fx = ccx + Math.cos(cl.ang) * R * cl.radF;
          const fy = ccy + Math.sin(cl.ang) * R * cl.radF * 0.9;
          let px2 = 0;
          let py2 = 0;
          ctx.fillStyle = colorA("#F4ECDE", 0.5 * born);
          ctx.strokeStyle = colorA("#F4ECDE", 0.13 * born);
          ctx.lineWidth = 0.5;
          for (let k = 0; k < cl.pts.length; k++) {
            const pt = cl.pts[k];
            const sx = fx + pt.dx * R * 0.13;
            const sy = fy + pt.dy * R * 0.1;
            ctx.beginPath();
            ctx.arc(sx, sy, pt.r, 0, Math.PI * 2);
            ctx.fill();
            if (k > 0) {
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

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = EDGE_COLOR[ei];
        ctx.lineWidth = strength >= 0.8 ? 1.1 : 0.7;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.globalAlpha = 1;

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
        ctx.font = "600 12px 'Hanken Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(n.label.toUpperCase(), x, y + R * 0.62 + 14);
      });

    };
    const stopLoop = runWhenVisible(canvas, draw);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
    };
  }, []);

  const introOpacity = useTransform(scrollYProgress, [0.02, 0.08, 0.2, 0.28], [0, 1, 1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.72, 0.82, 0.96, 1], [0, 1, 1, 0.9]);
  const outroY = useTransform(scrollYProgress, [0.72, 0.82], [28, 0]);

  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
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
          className="pointer-events-none absolute inset-x-0 top-[max(12%,5.5rem)] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold">
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
          <p className="text-[13px] uppercase tracking-[0.35em] text-gold">
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
