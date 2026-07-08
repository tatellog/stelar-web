"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import PhoneMockup from "../PhoneMockup";
import ScanResultScreen from "../screens/ScanResultScreen";
import { softDot, colorA, prand, ramp } from "@/lib/canvas";

/**
 * Capítulo VII — Scan IA. The real flow of the app, told as a scene:
 * the photograph floats in inside its circular frame, the magenta ring
 * scans it ("Escaneando tu plato…"), the ring turns gold when the plate
 * is understood, the detected ingredients emerge as light — and the
 * evidence enters the phone, ready to CONFIRMAR.
 */

const PHOTO = { x: 0.5, y: 0.42 }; // viewport fractions

const INGREDIENTS = [
  {
    label: "Salmón",
    value: "150 g",
    detail: "38 g proteína · 309 kcal",
    color: "#E0AEA0",
    x: 0.19,
    y: 0.32,
  },
  { label: "Tomates cherry", value: "50 g", color: "#FF4886", x: 0.81, y: 0.3 },
  { label: "Crema", value: "30 g", color: "#F4ECDE", x: 0.2, y: 0.6 },
  {
    label: "En total",
    value: "548 kcal",
    detail: "39 g proteína · 2 g azúcar",
    color: "#E8B872",
    x: 0.8,
    y: 0.62,
    total: true,
  },
];

const TAGS = [
  { text: "salmón", x: "-14%", y: "22%" },
  { text: "tomates cherry", x: "72%", y: "10%" },
  { text: "crema", x: "80%", y: "70%" },
  { text: "proteína estimada", x: "-20%", y: "76%" },
];

const N = 210;

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

      const cx = PHOTO.x * W;
      const cy = PHOTO.y * H;
      const photoR = Math.min(H * 0.21, W * 0.3, 175);
      const kx = W < 640 ? 0.62 : 1;

      // the understanding, leaving the plate as light
      const burst = ramp(p, 0.46, 0.58);
      const gather = ramp(p, 0.5, 0.66);
      const fadeAll = ramp(p, 0.7, 0.78);

      if (burst > 0 && fadeAll < 1) {
        for (let i = 0; i < N; i++) {
          const a0 = prand(i * 3.1) * Math.PI * 2;
          // born on the ring itself
          const bx = cx + Math.cos(a0) * photoR;
          const by = cy + Math.sin(a0) * photoR;

          const dist = (0.3 + prand(i * 7.3)) * photoR * 0.9;
          const ex = bx + Math.cos(a0) * dist * burst;
          const ey = by + Math.sin(a0) * dist * burst;

          const c = INGREDIENTS[i % INGREDIENTS.length];
          const jx = (prand(i * 11.9) - 0.5) * 110;
          const jy = (prand(i * 13.7) - 0.5) * 54;
          const gx = (0.5 + (c.x - 0.5) * kx) * W + jx;
          const gy = c.y * H + jy;

          const x = ex + (gx - ex) * gather + Math.sin(t * 0.0004 + i) * 2.5;
          const y = ey + (gy - ey) * gather + Math.cos(t * 0.00035 + i * 1.3) * 2.5;

          const tw = 0.6 + 0.4 * Math.sin(t * 0.002 + i * 2.2);
          const alpha = burst * (1 - fadeAll) * tw * 0.8;
          const r = 1.5 + prand(i * 23.3) * 2.4;
          softDot(ctx, x, y, r * 2.8, c.color, alpha, 0.32);
        }

        // the flash of understanding — the ring closes in gold
        const flash = ramp(p, 0.46, 0.5) * (1 - ramp(p, 0.52, 0.6));
        if (flash > 0) {
          ctx.strokeStyle = colorA("#FFE9C2", flash * 0.85);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(cx, cy, photoR * (1.06 + ramp(p, 0.46, 0.6) * 0.4), 0, Math.PI * 2);
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
  const introOpacity = useTransform(p, [0.02, 0.08, 0.16, 0.23], [0, 1, 1, 0]);

  // the photograph in its circular frame
  const photoOpacity = useTransform(p, [0.1, 0.2, 0.7, 0.77], [0, 1, 1, 0]);
  const photoScale = useTransform(p, [0.1, 0.24, 0.5, 0.66], [0.62, 1, 1, 0.9]);
  const photoYv = useTransform(p, [0.1, 0.24], [70, 0]);

  // magenta scanning ring → gold completed ring
  const scanRing = useTransform(p, [0.22, 0.28, 0.44, 0.49], [0, 1, 1, 0]);
  const goldRing = useTransform(p, [0.46, 0.52, 0.68, 0.75], [0, 1, 1, 0]);
  const scanCaption = useTransform(p, [0.24, 0.3, 0.42, 0.47], [0, 1, 1, 0]);
  const doneCaption = useTransform(p, [0.5, 0.56, 0.64, 0.7], [0, 1, 1, 0]);
  const poweredBy = useTransform(p, [0.22, 0.3, 0.62, 0.7], [0, 1, 1, 0]);

  // detected ingredients
  const chipsOpacity = useTransform(p, [0.56, 0.64, 0.7, 0.77], [0, 1, 1, 0]);

  // the phone receives the evidence
  const [showPhone, setShowPhone] = useState(false);
  useMotionValueEvent(p, "change", (v) => setShowPhone(v >= 0.76));

  return (
    <section ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* chapter opening */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[10%] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VI · Scan IA
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

        {/* the photograph, inside its circular frame — like in the app */}
        <motion.div
          style={{
            opacity: photoOpacity,
            scale: photoScale,
            y: photoYv,
            left: `${PHOTO.x * 100}%`,
            top: `${PHOTO.y * 100}%`,
          }}
          className="group absolute z-10 h-[42vh] max-h-[350px] w-[42vh] max-w-[350px] -translate-x-1/2 -translate-y-1/2"
        >
          {/* halo behind the frame */}
          <div className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(233,30,99,0.12)_0%,rgba(233,30,99,0.04)_55%,transparent_75%)]" />

          {/* the plate */}
          <div className="absolute inset-[6%] overflow-hidden rounded-full shadow-[0_24px_70px_rgba(0,0,0,0.6)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/art/meal-scan.jpg"
              alt="Salmón con tomates cherry y crema"
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_55%,rgba(10,6,8,0.35)_100%)]" />
          </div>

          {/* magenta scanning ring */}
          <motion.div style={{ opacity: scanRing }} className="absolute inset-0">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#FF4886]/90 shadow-[0_0_28px_rgba(255,72,134,0.45),inset_0_0_22px_rgba(255,72,134,0.2)]" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF4886] shadow-[0_0_12px_#FF4886]" />
            </motion.div>
          </motion.div>

          {/* gold ring — the plate, understood */}
          <motion.div
            style={{ opacity: goldRing }}
            className="absolute inset-0 rounded-full border-2 border-gold-soft/90 shadow-[0_0_32px_rgba(232,184,114,0.4),inset_0_0_20px_rgba(232,184,114,0.15)]"
          />

          {/* hover: the IA already sees the plate */}
          {TAGS.map((tag) => (
            <span
              key={tag.text}
              style={{ left: tag.x, top: tag.y }}
              className="absolute whitespace-nowrap rounded-full border border-gold/40 bg-deep/80 px-3 py-1 font-serif text-xs italic text-gold opacity-0 backdrop-blur-sm transition-all duration-700 group-hover:opacity-100"
            >
              {tag.text}
            </span>
          ))}
          <span className="absolute bottom-[4%] right-[4%] flex items-center gap-1.5 rounded-full bg-deep/70 px-3 py-1.5 text-[11px] tracking-wide text-cream/85 opacity-0 backdrop-blur-md transition-all duration-700 group-hover:opacity-100">
            ⟲ Reescanear
          </span>
        </motion.div>

        {/* captions under the frame */}
        <motion.p
          style={{ opacity: scanCaption }}
          className="pointer-events-none absolute inset-x-0 top-[68%] z-10 text-center text-base text-cream/75"
        >
          Escaneando tu plato…
        </motion.p>
        <motion.p
          style={{ opacity: doneCaption }}
          className="pointer-events-none absolute inset-x-0 top-[68%] z-10 text-center font-serif text-lg italic text-gold"
        >
          Lo dejaste anotado. Eso ya es algo.
        </motion.p>

        {/* powered by IA */}
        <motion.p
          style={{ opacity: poweredBy }}
          className="pointer-events-none absolute inset-x-0 bottom-[6%] z-10 text-center text-[11px] uppercase tracking-[0.35em] text-cream/45"
        >
          <span className="text-pink">✦</span> Powered by IA
        </motion.p>

        {/* the detected ingredients, as the app names them */}
        {INGREDIENTS.map((c) => (
          <motion.div
            key={c.label}
            style={{
              opacity: chipsOpacity,
              left: `calc(50% + (${c.x} - 0.5) * min(100% - 11rem, 80rem))`,
              top: `${c.y * 100}%`,
            }}
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
          >
            <div
              className={`rounded-2xl border px-4 py-2.5 backdrop-blur-sm ${
                c.total
                  ? "border-gold/40 bg-gold/[0.07]"
                  : "border-cream/12 bg-deep/60"
              }`}
              style={{ boxShadow: `0 0 26px ${c.color}22` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-semibold ${c.total ? "uppercase tracking-[0.2em] text-gold text-xs" : "text-cream/90"}`}
                >
                  {c.label}
                </span>
                <span
                  className="rounded-md border border-cream/15 px-1.5 py-0.5 text-xs text-cream/80"
                  style={{ color: c.color }}
                >
                  {c.value}
                </span>
              </div>
              {c.detail && (
                <p className="mt-1 text-[11px] text-cream/50">{c.detail}</p>
              )}
            </div>
          </motion.div>
        ))}

        {/* the evidence enters the phone, ready to confirm */}
        <motion.div
          initial={false}
          animate={{ opacity: showPhone ? 1 : 0, y: showPhone ? 0 : 80 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-1/2 top-[13%] z-10 w-[210px] -translate-x-1/2"
        >
          <PhoneMockup>
            <ScanResultScreen show={showPhone} />
          </PhoneMockup>
        </motion.div>
      </div>
    </section>
  );
}
