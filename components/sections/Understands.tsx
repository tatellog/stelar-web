"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { softDot, sparkle, colorA, ramp, prand } from "@/lib/canvas";
import { runWhenVisible } from "@/lib/visibleLoop";

/**
 * Capítulo VI — Todo lo que Stelar puede entender de ti.
 * A living solar system: Stelar is the star, and every category the app
 * understands is an astro orbiting it. No list, no grid, no cards —
 * the visitor should leave thinking "this tracks much more than calories".
 * Hover names a category; tapping it pulls the camera toward it.
 */

type Cat = {
  id: string;
  label: string;
  desc: string;
  color: string;
  r: number; // orbit radius (fraction of R)
  size: number;
  speed: number;
  phase: number;
  tilt: number;
};

const CATS: Cat[] = [
  { id: "comidas", label: "Comidas", desc: "Foto, texto o quick log — calorías y proteína.", color: "#E8B872", r: 0.36, size: 6.5, speed: 0.1, phase: 0.4, tilt: -0.14 },
  { id: "entreno", label: "Entreno", desc: "Tus sesiones, junto a su efecto en todo lo demás.", color: "#FF9E57", r: 0.52, size: 6, speed: 0.082, phase: 2.2, tilt: 0.1 },
  { id: "peso", label: "Peso", desc: "La tendencia, no el número de un solo día.", color: "#F4ECDE", r: 0.66, size: 5.5, speed: 0.07, phase: 4.1, tilt: -0.08 },
  { id: "agua", label: "Agua", desc: "Los vasos que suman más de lo que crees.", color: "#8FBEDB", r: 0.44, size: 5, speed: 0.094, phase: 5.3, tilt: 0.16 },
  { id: "sueno", label: "Sueño", desc: "Las noches que explican tus días.", color: "#C18FFF", r: 0.6, size: 6, speed: 0.076, phase: 1.1, tilt: -0.2 },
  { id: "energia", label: "Energía", desc: "Cómo amaneces y cómo cierras el día.", color: "#FFC56B", r: 0.5, size: 5, speed: 0.088, phase: 3.4, tilt: 0.05 },
  { id: "animo", label: "Ánimo", desc: "El contexto detrás de tus decisiones.", color: "#FBD7E3", r: 0.72, size: 5.5, speed: 0.064, phase: 5.9, tilt: 0.12 },
  { id: "ciclo", label: "Ciclo", desc: "Tu fase, leída junto a todo lo demás.", color: "#FF4886", r: 0.56, size: 5.5, speed: 0.08, phase: 3.6, tilt: -0.05 },
  { id: "fotos", label: "Fotos de progreso", desc: "El progreso que la báscula no muestra.", color: "#E0AEA0", r: 0.78, size: 5, speed: 0.058, phase: 2.9, tilt: 0.18 },
  { id: "wearables", label: "Wearables", desc: "Apple Health, Garmin, Oura y Samsung Health.", color: "#D9AE6F", r: 0.86, size: 6, speed: 0.052, phase: 4.7, tilt: -0.12 },
];

const SQUASH = 0.52;
const N_DUST = 130;
const LABEL_FONT = "600 12px 'Hanken Grotesk', sans-serif";
const DESC_FONT = "italic 15px 'Cormorant Garamond', serif";
const labelUC = CATS.map((c) => c.label.toUpperCase());

export default function Understands() {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);

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

    const pointer = { x: -1, y: -1 };
    let hovered = -1;
    // focus: the camera flies toward a tapped category
    let focus = -1;
    let zoom = 0; // eased 0..1

    /* the ellipse opens continuously with the viewport's aspect ratio —
       a binary portrait check made near-square viewports (tablets) jump */
    const sqOf = () =>
      Math.min(0.8, Math.max(SQUASH, SQUASH + (H / W - 0.85) * 0.75));

    /* position of a category on its tilted elliptical orbit */
    const catPos = (c: Cat, t: number, R: number, cx: number, cy: number, slow: number) => {
      const sq = sqOf();
      const a = c.phase + t * c.speed * slow;
      const ex = Math.cos(a) * c.r * R;
      const ey = Math.sin(a) * c.r * R * sq;
      const x = cx + ex * Math.cos(c.tilt) - ey * Math.sin(c.tilt);
      const y = cy + ex * Math.sin(c.tilt) + ey * Math.cos(c.tilt);
      // depth: astros on the near side are bigger and brighter
      const depth = 0.75 + 0.25 * Math.sin(a);
      return { x, y, depth, a };
    };

    const frame = (t: number) => {
      const R = H > W ? Math.min(W * 0.44, H * 0.3) : Math.min(W * 0.46, H * 0.44);
      const cx = W / 2;
      const cy = H * 0.52;
      // orbits slow to near-still while the camera visits a category
      const slow = 1 - zoom * 0.85;
      return { R, cx, cy, slow, t: t / 1000 };
    };

    const hitAt = (px: number, py: number, now: number) => {
      const { R, cx, cy, slow, t } = frame(now);
      let best = -1;
      let bestD = 34;
      for (let i = 0; i < CATS.length; i++) {
        const pos = catPos(CATS[i], t, R, cx, cy, slow);
        const d = Math.hypot(pos.x - px, pos.y - py);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      hovered = hitAt(pointer.x, pointer.y, performance.now());
      canvas.style.cursor = hovered >= 0 ? "pointer" : "default";
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const hit = hitAt(e.clientX - rect.left, e.clientY - rect.top, performance.now());
      focus = hit === focus ? -1 : hit;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    canvas.addEventListener("click", onClick);

    // text metrics measured once on the first frame (fonts already loaded)
    const labelHalf: number[] = [];
    const descHalf: number[] = [];

    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;
      const { R, cx, cy, slow, t } = frame(now);

      // camera: ease toward the focused astro
      zoom += ((focus >= 0 ? 1 : 0) - zoom) * 0.055;
      const fPos = focus >= 0 ? catPos(CATS[focus], t, R, cx, cy, slow) : null;
      const scale = 1 + zoom * 0.7;
      const tx = fPos ? (cx - fPos.x) * zoom : 0;
      const ty = fPos ? (cy - fPos.y) * zoom * 0.7 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx + tx / scale, -cy + ty / scale);

      /* ambient dust, very quiet */
      for (let i = 0; i < N_DUST; i++) {
        const dx = prand(i * 3.7) * W;
        const dy = prand(i * 7.1) * H;
        const tw = 0.4 + 0.6 * Math.sin(t * 0.5 + i * 2.3);
        softDot(ctx, dx, dy, 0.9 + prand(i * 11.3) * 1.4, "#F4ECDE", 0.1 * tw, 0.4);
      }

      const appear = ramp(p, 0.06, 0.14);

      /* orbit rings — cartographic hairlines, never HUD */
      for (let i = 0; i < CATS.length; i++) {
        const c = CATS[i];
        const born = ramp(p, 0.1 + i * 0.045, 0.16 + i * 0.045);
        if (born <= 0) continue;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(c.tilt);
        ctx.strokeStyle = colorA("#D9AE6F", (0.05 + (hovered === i || focus === i ? 0.09 : 0)) * born);
        ctx.lineWidth = 0.5;
        if (i % 3 === 1) ctx.setLineDash([2, 7]);
        ctx.beginPath();
        ctx.ellipse(0, 0, c.r * R, c.r * R * sqOf(), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      /* la estrella Stelar — the heart everything orbits */
      const pulse = 1 + 0.05 * Math.sin(t * 1.4);
      const heart = appear * pulse;
      if (heart > 0) {
        softDot(ctx, cx, cy, R * 0.24, "#E91E63", 0.14 * appear, 0.25);
        softDot(ctx, cx, cy, R * 0.12, "#FBD7E3", 0.32 * appear, 0.3);
        // anamorphic glint
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(9, 0.34);
        softDot(ctx, 0, 0, R * 0.04, "#FFE9C2", 0.38 * appear, 0.3);
        ctx.restore();
        sparkle(ctx, cx, cy, 9 * pulse, "#FFF6E5", 0.95 * appear);
        softDot(ctx, cx, cy, 3.6, "#FFFFFF", appear, 0.5);
      }

      /* the IA thinking out loud: every few seconds two astros exchange a
         hairline of light with a pulse traveling it — tiny relationships,
         seen, not explained */
      const think = ramp(p, 0.3, 0.4);
      if (think > 0) {
        for (let rel = 0; rel < 2; rel++) {
          const cycle = Math.floor(t / 3.2) + rel * 7;
          const ph = ((t / 3.2) % 1 + rel * 0.5) % 1;
          const ai = Math.floor(prand(cycle * 13.7) * CATS.length);
          const bi = (ai + 1 + Math.floor(prand(cycle * 29.3) * (CATS.length - 1))) % CATS.length;
          const bornA = ramp(p, 0.1 + ai * 0.045, 0.16 + ai * 0.045);
          const bornB = ramp(p, 0.1 + bi * 0.045, 0.16 + bi * 0.045);
          if (bornA >= 1 && bornB >= 1) {
            const A = catPos(CATS[ai], t, R, cx, cy, slow);
            const B = catPos(CATS[bi], t, R, cx, cy, slow);
            const env = Math.sin(ph * Math.PI) * think;
            ctx.strokeStyle = colorA("#FFE9C2", 0.16 * env);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(A.x, A.y);
            ctx.lineTo(B.x, B.y);
            ctx.stroke();
            softDot(ctx, A.x + (B.x - A.x) * ph, A.y + (B.y - A.y) * ph, 3.4, "#FFE9C2", 0.6 * env, 0.45);
          }
        }
      }

      /* the categories, born one by one */
      const positions = CATS.map((c) => catPos(c, t, R, cx, cy, slow));
      // label metrics are constant — measure once (after webfonts load,
      // so the cached widths are the real ones), not 600×/s
      ctx.font = LABEL_FONT;
      ctx.textAlign = "center";
      if (labelHalf.length === 0 && document.fonts.status === "loaded") {
        for (const lu of labelUC) labelHalf.push(ctx.measureText(lu).width / 2);
      }
      let hotDesc: { text: string; x: number; y: number; idx: number } | null = null;
      for (let i = 0; i < CATS.length; i++) {
        const c = CATS[i];
        const b0 = 0.1 + i * 0.045;
        const born = ramp(p, b0, b0 + 0.06);
        if (born <= 0) continue;
        const pos = positions[i];
        const isHot = hovered === i || focus === i;
        const s = c.size * pos.depth * (0.5 + 0.5 * born) * (isHot ? 1.25 : 1);
        const al = pos.depth * born;

        // birth ring
        if (born < 1) {
          ctx.strokeStyle = colorA(c.color, (1 - born) * 0.5);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, s * (1 + born * 3.5), 0, Math.PI * 2);
          ctx.stroke();
        }

        softDot(ctx, pos.x, pos.y, s * 3.8 + (isHot ? 6 : 0), c.color, 0.42 * al, 0.3);
        sparkle(ctx, pos.x, pos.y, s * 0.8, "#FFF6E5", Math.min(1, 0.55 + 0.45 * al));
        softDot(ctx, pos.x, pos.y, s * 0.4, "#FFFFFF", Math.min(1, al + 0.25), 0.5);

        // a tiny moon — pure ornament, very small
        const ma = t * 1.6 + i * 2.1;
        softDot(ctx, pos.x + Math.cos(ma) * s * 2.4, pos.y + Math.sin(ma) * s * 1.5, 1.1, c.color, 0.5 * al, 0.45);

        /* the name is always visible once born — this chapter exists to
           make the breadth of the product legible. On very tight systems
           (landscape phones) only the hovered/focused astro is named. */
        const tight = R < 175;
        let flipUp = false;
        for (let j = 0; j < CATS.length; j++) {
          if (j >= i) break; // the elder keeps the floor below
          const o = positions[j];
          if (Math.abs(o.x - pos.x) < 76 && Math.abs(o.y - pos.y) < 46) {
            flipUp = true;
            break;
          }
        }
        const ly = flipUp ? pos.y - s * 2.2 - 10 : pos.y + s * 2.2 + 12;
        const la = (tight && !isHot ? 0 : born) * (0.55 + (isHot ? 0.4 : 0)) * (0.6 + 0.4 * pos.depth);
        ctx.fillStyle = colorA("#F4ECDE", Math.min(0.95, la));
        const half = labelHalf[i] ?? ctx.measureText(labelUC[i]).width / 2;
        const lx = Math.min(W - 10 - half, Math.max(10 + half, pos.x));
        ctx.fillText(labelUC[i], lx, ly);

        // hover / focus: description queued — drawn after the loop so the
        // label font is set once per frame, not per category
        if (isHot && (hovered === i ? 1 : zoom) > 0.2) {
          hotDesc = { text: c.desc, x: pos.x, y: flipUp ? ly - 17 : ly + 18, idx: i };
        }
      }
      if (hotDesc) {
        ctx.fillStyle = colorA("#D9AE6F", 0.9);
        ctx.font = DESC_FONT;
        if (descHalf[hotDesc.idx] === undefined) {
          descHalf[hotDesc.idx] = ctx.measureText(hotDesc.text).width / 2;
        }
        const dHalf = descHalf[hotDesc.idx];
        const dx = Math.min(W - 12 - dHalf, Math.max(12 + dHalf, hotDesc.x));
        ctx.fillText(hotDesc.text, dx, hotDesc.y);
      }

      ctx.restore();
    };
    const stopLoop = runWhenVisible(canvas, draw);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.08, 0.6, 0.68], [0, 1, 1, 0]);
  const hintOpacity = useTransform(p, [0.55, 0.62, 0.78, 0.84], [0, 1, 1, 0]);
  const outroOpacity = useTransform(p, [0.82, 0.9], [0, 1]);
  const outroY = useTransform(p, [0.82, 0.9], [18, 0]);

  return (
    <section ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [touch-action:pan-y] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_88%,transparent_100%)]"
        />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[max(8%,5.5rem)] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold">
            Capítulo VI · Tu universo
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Todo lo que Stelar puede{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              entender de ti.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Stelar no solo cuenta calorías.{" "}
            <span className="font-serif italic text-gold">Entiende tu día.</span>
          </p>
        </motion.div>

        {/* interaction hint */}
        <motion.p
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-[9%] z-10 text-center text-[11.5px] uppercase tracking-[0.3em] text-cream/35"
        >
          Toca un astro para acercarte
        </motion.p>

        {/* the point, stated once */}
        <motion.div
          style={{ opacity: outroOpacity, y: outroY }}
          className="pointer-events-none absolute inset-x-0 bottom-[8%] z-10 mx-auto max-w-xl px-6 text-center"
        >
          <p className="font-serif text-2xl italic text-gold text-glow-gold sm:text-3xl">
            Mucho más que calorías.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream/60 sm:text-base">
            Cada registro es un astro. Stelar los mantiene en órbita.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
