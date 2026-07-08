"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSign } from "../SignContext";
import { figureArt } from "@/lib/zodiac/helpers";
import { softDot, colorA, prand, ramp } from "@/lib/canvas";

/**
 * Capítulo IX — el momento donde aparece la evidencia. The climax.
 * The screen is full of registros — words and numbers floating in depth.
 * They don't fade: each one breaks into golden particles. The dust is
 * pulled into curved rivers, accumulates into a luminous cloud, and
 * then — a cinematic flare — the first star ignites. Then another.
 * Lines draw themselves like luminous ink. And thousands of particles
 * travel those lines to build the animal: an illustration made entirely
 * of light, never an image. A final golden flare runs the whole figure,
 * the camera eases back, and everything stays alive, breathing.
 * "Descubrir una constelación por primera vez."
 */

const WORDS = [
  "proteína", "agua", "déficit", "sueño", "peso", "calorías", "entreno",
  "pasos", "azúcar", "carbs",
];
const NUMBERS = [
  "73.1", "132 g", "7 h 12 m", "1.8 L", "1.847 kcal", "62 g", "10.234",
  "48%", "-320 kcal", "71.9", "2.1 L", "6 h 40 m", "309", "150 g", "39 g",
  "548 kcal", "72.4", "8 h 05 m", "12.019", "44%",
];

type Token = {
  text: string;
  x: number; // fraction of W
  y: number;
  depth: number; // 0.4 far — 1 near
  size: number;
  isNumber: boolean;
  stagger: number; // when it disintegrates
  swirlDir: number;
};

function buildTokens(): Token[] {
  const out: Token[] = [];
  for (let i = 0; i < 54; i++) {
    const isNumber = i % 2 === 0;
    const pool = isNumber ? NUMBERS : WORDS;
    out.push({
      text: pool[Math.floor(prand(i * 7.3) * pool.length)],
      x: 0.06 + prand(i * 3.1) * 0.88,
      y: 0.1 + prand(i * 5.7) * 0.78,
      depth: 0.4 + prand(i * 9.1) * 0.6,
      size: 10 + prand(i * 11.3) * 9,
      isNumber,
      stagger: 0.14 + prand(i * 13.7) * 0.17,
      swirlDir: prand(i * 17.1) > 0.5 ? 1 : -1,
    });
  }
  return out;
}

const PPT = 18; // particles born from each token
const N_EMBLEM = 1350; // the animal, made of light
const N_RESIDUAL = 34;

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

    const tokens = buildTokens();

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

    /* the animal, sampled from the emblem's real pixels — so the dust
       builds the true figure, aligned with the constellation */
    let emblemPts: { x: number; y: number; b: number }[] = [];
    const emblem = new Image();
    emblem.src = `/emblems/${sign}/f10.png`;
    emblem.onload = () => {
      const S = 130;
      const off = document.createElement("canvas");
      off.width = S;
      off.height = S;
      const octx = off.getContext("2d");
      if (!octx) return;
      octx.drawImage(emblem, 0, 0, S, S);
      const data = octx.getImageData(0, 0, S, S).data;
      const pts: { x: number; y: number; b: number }[] = [];
      for (let y = 0; y < S; y += 1) {
        for (let x = 0; x < S; x += 1) {
          const a = data[(y * S + x) * 4 + 3];
          if (a > 60) {
            pts.push({ x: x / S - 0.5, y: y / S - 0.5, b: a / 255 });
          }
        }
      }
      emblemPts = pts
        .map((pt, i) => ({ pt, k: prand(i * 3.7) }))
        .sort((u, v) => u.k - v.k)
        .slice(0, N_EMBLEM)
        .map((u) => u.pt);
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0, sx: -1, sy: -1 };
    type Wave = { t0: number; dist: number[] };
    const waves: Wave[] = [];

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.sx = e.clientX - rect.left;
      pointer.sy = e.clientY - rect.top;
      pointer.tx = (pointer.sx / W) * 2 - 1;
      pointer.ty = (pointer.sy / H) * 2 - 1;
    };

    let starScreen: { x: number; y: number }[] = [];
    let adjacency: number[][] = [];
    let lineList: readonly (readonly [number, number])[] = [];

    const onClick = (e: MouseEvent) => {
      if (progress.current < 0.7) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let best = -1;
      let bd = 40;
      starScreen.forEach((st, k) => {
        const d = Math.hypot(st.x - mx, st.y - my);
        if (d < bd) {
          bd = d;
          best = k;
        }
      });
      if (best < 0) return;
      const dist = Array(starScreen.length).fill(Infinity);
      dist[best] = 0;
      const q = [best];
      while (q.length) {
        const u = q.shift()!;
        lineList.forEach(([a, b]) => {
          const v = a === u ? b : b === u ? a : -1;
          if (v >= 0 && dist[v] > dist[u] + 1) {
            dist[v] = dist[u] + 1;
            q.push(v);
          }
        });
      }
      waves.push({ t0: performance.now() / 1000, dist });
      if (waves.length > 3) waves.shift();
    };

    const bell = (v: number) => Math.exp(-v * v * 4);

    let raf = 0;
    const draw = (now: number) => {
      const t = now / 1000;
      const p = progress.current;
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H);
      const cx = W / 2;
      const cy = H * 0.47;

      // the camera: an almost imperceptible dolly in, then it steps back
      const dolly =
        1 + 0.06 * ramp(p, 0.3, 0.88) - 0.045 * ramp(p, 0.93, 1);
      const rot = pointer.x * 0.045; // < 3 degrees
      const proj = (x: number, y: number, par = 1) => {
        let dx = (x - cx) * dolly;
        let dy = (y - cy) * dolly;
        const rx = dx * Math.cos(rot) - dy * Math.sin(rot);
        const ry = dx * Math.sin(rot) + dy * Math.cos(rot);
        return {
          x: cx + rx + pointer.x * 8 * par,
          y: cy + ry + pointer.y * 6 * par,
        };
      };

      for (let i = waves.length - 1; i >= 0; i--) {
        if (t - waves[i].t0 > 4) waves.splice(i, 1);
      }

      const gather = ramp(p, 0.5, 0.62); // the luminous cloud
      const cloudFade = ramp(p, 0.72, 0.84);
      const flare1 = bell((p - 0.625) / 0.018);
      const finalFlare = ramp(p, 0.915, 0.94);
      const flarePulse = bell((p - 0.925) / 0.02);

      /* ── the data field: words and numbers, floating in depth ──── */
      tokens.forEach((tk, i) => {
        const dis = ramp(p, tk.stagger, tk.stagger + 0.07);
        const born = ramp(p, 0.01 + prand(i * 2.9) * 0.06, 0.06 + prand(i * 2.9) * 0.06);
        if (born <= 0) return;

        const driftX = Math.sin(t * 0.14 + i * 2.1) * 10 * tk.depth;
        const driftY = Math.cos(t * 0.11 + i * 1.7) * 8 * tk.depth;
        const base = proj(tk.x * W + driftX, tk.y * H + driftY, tk.depth);

        // the token, until it breaks
        const alpha = born * (0.24 + tk.depth * 0.42) * (1 - dis);
        if (alpha > 0.01) {
          ctx.fillStyle = colorA(tk.isNumber ? "#F4ECDE" : "#D9AE6F", alpha);
          ctx.font = `${tk.isNumber ? 700 : 400} ${tk.size * tk.depth + 6}px 'Hanken Grotesk', sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(tk.text, base.x, base.y);
        }

        // …into golden dust
        if (dis > 0) {
          const tw2 = tk.text.length * tk.size * 0.32;
          for (let j = 0; j < PPT; j++) {
            const seed = i * 31 + j * 7;
            // born inside the glyphs
            const gx = base.x + (prand(seed) - 0.5) * tw2;
            const gy = base.y + (prand(seed * 1.7) - 0.5) * tk.size * 1.1;
            // scatter softly as the word breaks
            const sx0 = gx + (prand(seed * 2.3) - 0.5) * 30 * dis;
            const sy0 = gy + (prand(seed * 3.1) - 0.5) * 26 * dis - dis * 8;

            // the invisible force: curved rivers toward the center
            const pull = ramp(p, 0.3 + prand(seed * 4.7) * 0.17, 0.47 + prand(seed * 4.7) * 0.17);
            const dxs = sx0 - cx;
            const dys = sy0 - cy;
            const r0 = Math.hypot(dxs, dys) || 1;
            const th0 = Math.atan2(dys, dxs);
            const rr = r0 * Math.pow(1 - pull, 1.4);
            const th = th0 + tk.swirlDir * pull * (1.7 + prand(seed * 5.3) * 1.5);

            // the accumulation: a tilted river of golden glitter that
            // keeps flowing — dense at its core, loose at the edges
            const dirA = -0.52;
            let sPos = (prand(seed * 6.1) * 2 - 1) + t * 0.045 * tk.swirlDir;
            sPos = ((sPos % 2) + 2) % 2 - 1;
            const nRaw = prand(seed * 7.7) * 2 - 1;
            const nOff = Math.pow(Math.abs(nRaw), 1.7) * Math.sign(nRaw);
            const bandLen = R * 0.27;
            const bandW = R * 0.052 * (1 + Math.abs(sPos) * 0.8);
            let x = cx + Math.cos(th) * rr;
            let y = cy + Math.sin(th) * rr * 0.94;
            if (gather > 0) {
              const gx2 = cx + Math.cos(dirA) * sPos * bandLen - Math.sin(dirA) * nOff * bandW;
              const gy2 = cy + Math.sin(dirA) * sPos * bandLen + Math.cos(dirA) * nOff * bandW;
              x += (gx2 - x) * gather;
              y += (gy2 - y) * gather;
            }

            const residual = j % 16 === 0;
            let a =
              dis *
              (0.22 + prand(seed * 8.3) * 0.4) *
              (0.6 + 0.4 * Math.sin(t * (1 + prand(seed) * 1.4) + seed));
            if (!residual) a *= 1 - cloudFade;
            else if (cloudFade > 0) {
              // a few grains keep floating forever — never fully static
              x += Math.sin(t * 0.3 + seed) * 30 * cloudFade;
              y += Math.cos(t * 0.24 + seed * 1.3) * 24 * cloudFade;
              a *= 0.5;
            }
            if (gather > 0) a *= 1 - Math.abs(sPos) * 0.45; // the river fades at its ends
            if (a <= 0.01) continue;
            const roll = prand(seed * 10.1);
            const color =
              roll > 0.93 ? "#FFF6E5" : roll > 0.74 ? "#FF9E57" : roll > 0.48 ? "#FFC56B" : "#E8B872";
            if (roll < 0.09 && gather > 0.25) {
              // out-of-focus grains — bokeh, like the reference
              softDot(ctx, x, y, 3.6 + prand(seed * 11.9) * 2.6, color, Math.min(0.5, a * 0.6), 0.3);
            } else {
              const sz = 0.6 + prand(seed * 9.7) * (roll > 0.8 ? 2 : 1.2) + gather * 0.3;
              ctx.fillStyle = colorA(color, Math.min(0.9, a));
              ctx.beginPath();
              ctx.arc(x, y, sz, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      });

      /* ── the heart: an elegant star with an anamorphic flare ────── */
      if (gather > 0) {
        const int2 = gather * (1 - cloudFade) * (0.75 + 0.1 * Math.sin(t * 1.2)) + flare1;
        const breathe2 = 1 + 0.05 * Math.sin(t * 1.4);
        // the long horizontal flare, thin and cinematic
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(17 + flare1 * 9, 0.36);
        softDot(ctx, 0, 0, R * 0.045 * breathe2, "#FFE9C2", 0.42 * int2, 0.22);
        ctx.restore();
        // a subtler vertical ray
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(0.42, 4.6);
        softDot(ctx, 0, 0, R * 0.038, "#FFE9C2", 0.2 * int2, 0.28);
        ctx.restore();
        // tight warm halo + white-hot core — never a fuzzy ball
        softDot(ctx, cx, cy, R * 0.05 * breathe2, "#FFC56B", 0.42 * int2, 0.3);
        softDot(ctx, cx, cy, R * 0.013, "#FFF6E5", Math.min(1, int2), 0.55);
      }

      /* ── the constellation ──────────────────────────────────────── */
      const S = R * 0.6;
      const fig = figureArt(sign, S);
      lineList = fig.lines;
      const stars = fig.pts.map((pt) => {
        const pos = proj(cx + pt.x, cy + pt.y, 0.3);
        return { ...pos, mag: pt.mag };
      });
      starScreen = stars;
      if (!adjacency.length) adjacency = stars.map(() => []);

      const wavePulse = (k: number) => {
        let v = 0;
        for (const w of waves) {
          const front = (t - w.t0) * 3.6;
          const d = w.dist[k];
          if (isFinite(d)) v += Math.exp(-((d - front) * (d - front)) / 0.3);
        }
        return Math.min(1, v);
      };

      // lines: luminous ink, one after another
      fig.lines.forEach(([a, b], li) => {
        const lt = ramp(p, 0.72 + li * 0.009, 0.745 + li * 0.009);
        if (lt <= 0) return;
        const A = stars[a];
        const B = stars[b];
        const ink = 1 - Math.pow(1 - lt, 3);
        const ex = A.x + (B.x - A.x) * ink;
        const ey = A.y + (B.y - A.y) * ink;
        const wv = Math.max(wavePulse(a), wavePulse(b));
        // the final flare travels the figure, line by line
        const sweep = finalFlare > 0 ? bell((finalFlare * fig.lines.length - li) / 1.4) : 0;
        const alive = 0.3 + 0.06 * Math.sin(t * 0.9 + li * 1.7);
        ctx.strokeStyle = colorA("#D9AE6F", (alive + wv * 0.4 + sweep * 0.45) * lt);
        ctx.lineWidth = 0.8 + sweep * 0.7 + wv * 0.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        // the tip of the ink, while it travels
        if (ink < 1) softDot(ctx, ex, ey, 4.5, "#FFE9C2", 0.6, 0.45);
        if (sweep > 0.05) {
          const k = Math.min(1, Math.max(0, finalFlare * fig.lines.length - li));
          softDot(ctx, A.x + (B.x - A.x) * k, A.y + (B.y - A.y) * k, 6, "#FFE9C2", 0.7 * sweep, 0.4);
        }
      });

      // stars: they don't appear — they ignite, one after another
      stars.forEach((st, k) => {
        const born = ramp(p, 0.64 + k * 0.012, 0.652 + k * 0.012);
        if (born <= 0) return;
        const hero = st.mag <= 2.3;
        const wv = wavePulse(k);
        const breath = 1 + 0.06 * Math.sin(t * 1.4 + k * 2.2);
        const r =
          (hero ? 3.6 : 2.3) * breath * (1 + wv * 0.35 + flarePulse * 0.3);
        const ignite = 1 + (1 - born) * 2.2; // the flash of ignition
        softDot(ctx, st.x, st.y, r * 5.5 * ignite, hero ? "#FBD7E3" : "#E8B872", born * (hero ? 0.5 : 0.36) + wv * 0.25, 0.3);
        ctx.strokeStyle = colorA("#FFF6E5", (0.45 + wv * 0.3) * born);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(st.x - r * 2.2, st.y);
        ctx.lineTo(st.x + r * 2.2, st.y);
        ctx.moveTo(st.x, st.y - r * 2.2);
        ctx.lineTo(st.x, st.y + r * 2.2);
        ctx.stroke();
        softDot(ctx, st.x, st.y, r, "#FFF6E5", born * 0.95, 0.5);
      });

      /* ── the animal, built from particles that ride the lines ───── */
      const build = ramp(p, 0.78, 0.93);
      if (build > 0 && emblemPts.length && fig.lines.length) {
        for (let j = 0; j < emblemPts.length; j++) {
          const e = ramp(build, prand(j * 1.3) * 0.55, prand(j * 1.3) * 0.55 + 0.45);
          if (e <= 0) continue;
          const tg = emblemPts[j];
          // it starts somewhere on the constellation's lines…
          const li = j % fig.lines.length;
          const A = stars[fig.lines[li][0]];
          const B = stars[fig.lines[li][1]];
          const u = prand(j * 2.9);
          const lx = A.x + (B.x - A.x) * u;
          const ly = A.y + (B.y - A.y) * u;
          // …and finds its place in the figure
          const target = proj(cx + tg.x * S, cy + tg.y * S, 0.3);
          const k = 1 - Math.pow(1 - e, 2.4);
          const x = lx + (target.x - lx) * k + Math.sin(t * 0.7 + j) * 0.7;
          const y = ly + (target.y - ly) * k + Math.cos(t * 0.6 + j * 1.3) * 0.7;
          const tw2 = 0.55 + 0.45 * Math.sin(t * (0.8 + prand(j * 4.1)) + j * 2.6);
          const a = e * tg.b * (0.22 + tw2 * 0.3) * (1 + flarePulse * 0.5);
          ctx.fillStyle = colorA(prand(j * 5.7) > 0.9 ? "#FFF6E5" : "#E8B872", Math.min(0.8, a));
          ctx.beginPath();
          ctx.arc(x, y, 0.9 + tg.b * 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      /* ── residual gold, so it never sits still ──────────────────── */
      if (build > 0.5) {
        for (let i = 0; i < N_RESIDUAL; i++) {
          const ang = prand(i * 6.7) * Math.PI * 2 + t * 0.05 * (i % 2 ? 1 : -1);
          const rr = R * (0.24 + prand(i * 8.9) * 0.26);
          const x = cx + Math.cos(ang) * rr;
          const y = cy + Math.sin(ang) * rr * 0.8;
          const a = 0.16 * Math.abs(Math.sin(t * 0.4 + i * 2.1)) * (build - 0.5) * 2;
          ctx.fillStyle = colorA("#E8B872", a);
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      canvas.style.cursor = p > 0.7 ? "pointer" : "default";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("click", onClick);
    };
  }, [sign]);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.07, 0.14, 0.2], [0, 1, 1, 0]);
  const midOpacity = useTransform(p, [0.38, 0.46, 0.56, 0.64], [0, 1, 1, 0]);
  const finalOpacity = useTransform(p, [0.94, 0.985], [0, 1]);
  const finalY = useTransform(p, [0.94, 0.995], [18, 0]);

  return (
    <section ref={ref} className="relative h-[520vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[9%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo IX · La evidencia
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Otras apps muestran números.{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              Stelar encuentra evidencia.
            </span>
          </h2>
        </motion.div>

        {/* while the dust gathers */}
        <motion.div
          style={{ opacity: midOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[10%] z-10 mx-auto max-w-xl px-6 text-center"
        >
          <p className="font-sans text-2xl font-black leading-snug tracking-tight text-cream sm:text-3xl">
            No puedes cambiar{" "}
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              lo que no puedes ver.
            </span>
          </p>
        </motion.div>

        {/* after the revelation */}
        <motion.div
          style={{ opacity: finalOpacity, y: finalY }}
          className="pointer-events-none absolute inset-x-0 bottom-[9%] z-10 mx-auto max-w-xl px-6 text-center"
        >
          <p className="font-serif text-2xl italic text-gold text-glow-gold sm:text-3xl">
            Ahora puedes verlo.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream/60 sm:text-base">
            Y una constelación ya no vuelve a parecer un grupo de estrellas.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
