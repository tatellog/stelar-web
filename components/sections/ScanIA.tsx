"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PhoneMockup from "../PhoneMockup";
import { softDot, colorA, prand, ramp } from "@/lib/canvas";

/**
 * Capítulo VII — Scan IA.
 * A photograph floats into the center, freezes… and dissolves into
 * particles. The particles order themselves into nutrition — proteína,
 * calorías, carbohidratos, grasas — and the evidence enters the phone.
 * Not a form. Magic.
 */

const CLUSTERS = [
  { label: "Proteína", value: "38 g", color: "#E0AEA0", x: 0.22, y: 0.34 },
  { label: "Calorías", value: "520 kcal", color: "#E91E63", x: 0.78, y: 0.3 },
  { label: "Carbohidratos", value: "45 g", color: "#E8B872", x: 0.2, y: 0.62 },
  { label: "Grasas", value: "18 g", color: "#FFC56B", x: 0.8, y: 0.6 },
];

const TAGS = [
  { text: "pollo", x: "-12%", y: "18%" },
  { text: "arroz", x: "78%", y: "6%" },
  { text: "verduras", x: "84%", y: "72%" },
  { text: "proteína estimada", x: "-18%", y: "78%" },
];

const PARTICLE_COLORS = ["#E8B872", "#F4ECDE", "#9BB98F", "#E0AEA0", "#FFC56B"];
const N = 240;
const PHOTO = { x: 0.5, y: 0.42 }; // viewport fractions
const PHONE = { x: 0.5, y: 0.6 };

export default function ScanIA() {
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

    let raf = 0;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;

      const explode = ramp(p, 0.32, 0.48);
      const gather = ramp(p, 0.5, 0.68);
      const intake = ramp(p, 0.78, 0.94);

      if (explode > 0 && intake < 1) {
        const photoR = Math.min(H * 0.24, W * 0.32, 190);
        const cx = PHOTO.x * W;
        const cy = PHOTO.y * H;
        const kx = W < 640 ? 0.7 : 1;

        for (let i = 0; i < N; i++) {
          // birth point: inside the plate
          const a0 = prand(i * 3.1) * Math.PI * 2;
          const r0 = Math.sqrt(prand(i * 5.7)) * photoR * 0.7;
          const bx = cx + Math.cos(a0) * r0;
          const by = cy + Math.sin(a0) * r0 * 0.8;

          // explosion: outward with per-particle distance
          const dist = (0.6 + prand(i * 7.3)) * photoR * 1.5;
          const ex = bx + Math.cos(a0) * dist * explode;
          const ey = by + Math.sin(a0) * dist * explode - explode * 30;

          // gather: each particle belongs to a macro cluster
          const c = CLUSTERS[i % CLUSTERS.length];
          const jx = (prand(i * 11.9) - 0.5) * 90;
          const jy = (prand(i * 13.7) - 0.5) * 60;
          const gx = (0.5 + (c.x - 0.5) * kx) * W + jx;
          const gy = c.y * H + jy;

          // intake: everything streams into the phone
          const px = PHONE.x * W + (prand(i * 17.3) - 0.5) * 40;
          const py = PHONE.y * H + (prand(i * 19.1) - 0.5) * 80;

          let x = ex + (gx - ex) * gather;
          let y = ey + (gy - ey) * gather;
          x += (px - x) * intake;
          y += (py - y) * intake;

          // drift + shimmer
          x += Math.sin(t * 0.0004 + i) * 2.5;
          y += Math.cos(t * 0.00035 + i * 1.3) * 2.5;

          const color =
            gather > 0.5 ? c.color : PARTICLE_COLORS[i % PARTICLE_COLORS.length];
          const tw = 0.65 + 0.35 * Math.sin(t * 0.002 + i * 2.2);
          const alpha = explode * (1 - intake * 0.92) * tw * 0.85;
          const r = 1.6 + prand(i * 23.3) * 2.6 + gather * 0.6;
          softDot(ctx, x, y, r * 2.8, color, alpha, 0.32);
        }

        // freeze flash — the instant the photo is captured
        const flash = ramp(p, 0.3, 0.34) * (1 - ramp(p, 0.36, 0.44));
        if (flash > 0) {
          ctx.strokeStyle = colorA("#FFE9C2", flash * 0.9);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(cx, cy, photoR * (1 + ramp(p, 0.3, 0.44) * 0.5), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.08, 0.2, 0.27], [0, 1, 1, 0]);

  // the photograph: floats in from below, centers, freezes, dissolves
  const photoX = useTransform(p, [0.1, 0.27], ["-30%", "0%"]);
  const photoY = useTransform(p, [0.1, 0.27], ["34%", "0%"]);
  const photoRotate = useTransform(p, [0.1, 0.27, 0.32], [-9, -2, 0]);
  const photoScale = useTransform(p, [0.1, 0.27, 0.31], [0.72, 1, 1.04]);
  const photoOpacity = useTransform(p, [0.12, 0.22, 0.32, 0.42], [0, 1, 1, 0]);

  // macro labels appear as the particles settle
  const clusterOpacity = useTransform(p, [0.58, 0.68, 0.76, 0.86], [0, 1, 1, 0]);
  const midCopy = useTransform(p, [0.56, 0.64, 0.74, 0.82], [0, 1, 1, 0]);

  // the phone receives the evidence
  const phoneOpacity = useTransform(p, [0.74, 0.84], [0, 1]);
  const phoneY = useTransform(p, [0.74, 0.88], [70, 0]);
  const row1 = useTransform(p, [0.84, 0.88], [0, 1]);
  const row2 = useTransform(p, [0.86, 0.9], [0, 1]);
  const row3 = useTransform(p, [0.88, 0.92], [0, 1]);
  const row4 = useTransform(p, [0.9, 0.94], [0, 1]);
  const rows = [row1, row2, row3, row4];

  return (
    <section ref={ref} className="relative h-[380vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[10%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VII · Scan IA
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Registra comida{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              sin romper tu día.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Una foto puede convertirse en nutrición.
          </p>
        </motion.div>

        {/* the photograph */}
        <motion.div
          style={{
            x: photoX,
            y: photoY,
            rotate: photoRotate,
            scale: photoScale,
            opacity: photoOpacity,
            left: `${PHOTO.x * 100}%`,
            top: `${PHOTO.y * 100}%`,
            marginLeft: "-19vh",
            marginTop: "-19vh",
          }}
          className="group absolute z-10 h-[38vh] max-h-[330px] w-[38vh] max-w-[330px]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-3xl border border-cream/15 shadow-[0_30px_80px_rgba(0,0,0,0.55)] transition-shadow duration-700 group-hover:shadow-[0_0_60px_rgba(232,184,114,0.35)]">
            {/* the table */}
            <div className="absolute inset-0 bg-[linear-gradient(150deg,#241014_0%,#170a0d_60%,#100608_100%)]" />
            {/* the plate */}
            <div className="absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_38%_32%,#F7F0E2_0%,#E9DFC9_55%,#CBBFA4_100%)] shadow-[inset_0_-8px_24px_rgba(0,0,0,0.18),0_18px_40px_rgba(0,0,0,0.45)]" />
            {/* pollo */}
            <div className="absolute left-[30%] top-[34%] h-[26%] w-[34%] rounded-[45%] bg-[radial-gradient(circle_at_35%_30%,#E8B872_0%,#C98F4E_65%,#A9723B_100%)] shadow-[0_5px_12px_rgba(0,0,0,0.3)]" />
            {/* arroz */}
            <div className="absolute left-[48%] top-[52%] h-[22%] w-[28%] rounded-[50%] bg-[radial-gradient(circle_at_45%_35%,#F7F2E4_0%,#E6DCC2_70%,#D0C3A3_100%)] shadow-[0_4px_10px_rgba(0,0,0,0.25)]" />
            {/* verduras */}
            <div className="absolute left-[32%] top-[56%] h-[11%] w-[11%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#AECB9E_0%,#7E9B6E_100%)]" />
            <div className="absolute left-[42%] top-[62%] h-[8%] w-[8%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#9BB98F_0%,#6E8A60_100%)]" />
            <div className="absolute left-[26%] top-[48%] h-[7%] w-[7%] rounded-full bg-[radial-gradient(circle_at_40%_35%,#C3D6B4_0%,#8AA579_100%)]" />
            {/* photo sheen */}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,246,229,0.07)_48%,transparent_62%)]" />
          </div>

          {/* hover: the IA already sees what's on the plate */}
          {TAGS.map((tag) => (
            <span
              key={tag.text}
              style={{ left: tag.x, top: tag.y }}
              className="absolute whitespace-nowrap rounded-full border border-gold/40 bg-deep/80 px-3 py-1 font-serif text-xs italic text-gold opacity-0 backdrop-blur-sm transition-all duration-700 group-hover:opacity-100"
            >
              {tag.text}
            </span>
          ))}
        </motion.div>

        {/* the macros, named as the particles settle */}
        {CLUSTERS.map((c) => (
          <motion.div
            key={c.label}
            style={{
              opacity: clusterOpacity,
              left: `calc(50% + (${c.x} - 0.5) * min(100%, 88rem))`,
              top: `${c.y * 100}%`,
            }}
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <p
              className="font-sans text-2xl font-black tracking-tight sm:text-3xl"
              style={{ color: c.color, textShadow: `0 0 24px ${c.color}66` }}
            >
              {c.value}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-cream/55">
              {c.label}
            </p>
          </motion.div>
        ))}

        <motion.div
          style={{ opacity: midCopy }}
          className="pointer-events-none absolute inset-x-0 bottom-[8%] z-10 mx-auto max-w-md px-6 text-center"
        >
          <p className="text-base leading-relaxed text-cream/65">
            Toma una foto. Stelar detecta ingredientes, estima macros y{" "}
            <span className="font-serif italic text-gold">
              los convierte en evidencia para tu día.
            </span>
          </p>
          <p className="mt-3 text-xs tracking-[0.2em] text-cream/40">
            pollo · arroz · verduras
          </p>
        </motion.div>

        {/* the evidence enters the phone */}
        <motion.div
          style={{ opacity: phoneOpacity, y: phoneY }}
          className="absolute left-1/2 top-[16%] z-10 w-[200px] -translate-x-1/2"
        >
          <PhoneMockup>
            <div className="flex h-full flex-col px-3 pb-3 pt-10 text-cream">
              <p className="font-sans text-[13px] font-black tracking-tight">
                <span className="text-pink-soft">Tu</span> registro
              </p>
              <div className="mt-2 rounded-xl border border-cream/10 bg-cream/[0.04] p-2.5">
                <p className="font-serif text-[11px] italic">Pollo con arroz</p>
                <p className="mt-0.5 text-[7px] uppercase tracking-[0.25em] text-gold">
                  Detectado con una foto
                </p>
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                {CLUSTERS.map((c, i) => (
                  <motion.div
                    key={c.label}
                    style={{ opacity: rows[i] }}
                    className="flex items-center justify-between rounded-lg border border-cream/[0.07] px-2.5 py-1.5"
                  >
                    <span className="flex items-center gap-1.5 text-[8px] text-cream/60">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }}
                      />
                      {c.label}
                    </span>
                    <span className="text-[9px] font-bold text-cream/90">{c.value}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p
                style={{ opacity: rows[3] }}
                className="mt-auto text-center font-serif text-[9px] italic text-cream/50"
              >
                Evidencia para tu día.
              </motion.p>
            </div>
          </PhoneMockup>
        </motion.div>
      </div>
    </section>
  );
}
