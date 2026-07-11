"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
  type MotionValue,
} from "framer-motion";
import PhoneMockup from "../PhoneMockup";
import PhoneEmerge from "../PhoneEmerge";
import ScanResultScreen from "../screens/ScanResultScreen";
import { softDot, colorA, prand, ramp } from "@/lib/canvas";
import { runWhenVisible } from "@/lib/visibleLoop";

/**
 * Capítulo VII — Scan IA. The COMPLETE flow, told as one continuous
 * animation: photo → the IA estimates ingredients and portions → the
 * user adjusts → save → the orbit updates instantly. Then the second
 * path: no photo? just write it. Always the same message underneath:
 * the IA helps, the user has the last word.
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
  { label: "Crema", value: "", color: "#F4ECDE", x: 0.2, y: 0.6, editable: true },
  {
    label: "En total",
    value: "", // recalculated live from the edit — the IA never has the last word
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
  { text: "porciones estimadas", x: "-20%", y: "76%" },
];

const TYPED = "Pechuga de pollo con arroz";

const TEXT_RESULT = [
  { label: "Pechuga de pollo", value: "160 g", color: "#E0AEA0" },
  { label: "Arroz", value: "120 g", color: "#E8B872" },
  { label: "En total", value: "471 kcal", color: "#D9AE6F" },
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
  // infinite spinners/caret only tick while the chapter is on screen
  const inView = useInView(ref, { margin: "-5%" });

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

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const p = progress.current;

      const cx = PHOTO.x * W;
      const cy = PHOTO.y * H;
      const photoR = Math.min(H * 0.21, W * 0.3, 175);
      // particles gather where the chips actually live (see the CSS lane)
      const laneW = Math.min(W - 176, 832);

      // the understanding, leaving the plate as light
      const burst = ramp(p, 0.28, 0.38);
      const gather = ramp(p, 0.31, 0.44);
      const fadeAll = ramp(p, 0.5, 0.57);

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
          const gx = W / 2 + (c.x - 0.5) * laneW + jx;
          const gy = c.y * H + jy;

          const x = ex + (gx - ex) * gather + Math.sin(t * 0.0004 + i) * 2.5;
          const y = ey + (gy - ey) * gather + Math.cos(t * 0.00035 + i * 1.3) * 2.5;

          const tw = 0.6 + 0.4 * Math.sin(t * 0.002 + i * 2.2);
          const alpha = burst * (1 - fadeAll) * tw * 0.8;
          const r = 1.5 + prand(i * 23.3) * 2.4;
          softDot(ctx, x, y, r * 2.8, c.color, alpha, 0.32);
        }

        // the flash of understanding — the ring closes in gold
        const flash = ramp(p, 0.28, 0.32) * (1 - ramp(p, 0.34, 0.42));
        if (flash > 0) {
          ctx.strokeStyle = colorA("#FFE9C2", flash * 0.85);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(cx, cy, photoR * (1.06 + ramp(p, 0.28, 0.42) * 0.4), 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      /* the words dissolving into light during the text-log beat */
      const textGlow = ramp(p, 0.79, 0.83) * (1 - ramp(p, 0.86, 0.9));
      if (textGlow > 0) {
        for (let i = 0; i < 40; i++) {
          const a = prand(i * 5.3) * Math.PI * 2;
          const rr = (20 + prand(i * 9.1) * 90) * (0.4 + textGlow);
          softDot(
            ctx,
            W / 2 + Math.cos(a) * rr * 1.6,
            H * 0.4 + Math.sin(a) * rr * 0.6,
            1.4 + prand(i * 13.7) * 2,
            "#E8B872",
            textGlow * 0.6 * (0.4 + 0.6 * Math.sin(t * 0.003 + i)),
            0.35,
          );
        }
      }
    };
    const stopLoop = runWhenVisible(canvas, draw);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
    };
  }, []);

  const p = scrollYProgress;
  const introOpacity = useTransform(p, [0.02, 0.07, 0.14, 0.2], [0, 1, 1, 0]);

  // the photograph in its circular frame
  const photoOpacity = useTransform(p, [0.08, 0.16, 0.5, 0.57], [0, 1, 1, 0]);
  const photoScale = useTransform(p, [0.08, 0.2, 0.44, 0.54], [0.62, 1, 1, 0.9]);
  const photoYv = useTransform(p, [0.08, 0.2], [70, 0]);

  // magenta scanning ring → gold completed ring
  const scanRing = useTransform(p, [0.15, 0.19, 0.26, 0.3], [0, 1, 1, 0]);
  const goldRing = useTransform(p, [0.28, 0.33, 0.46, 0.53], [0, 1, 1, 0]);
  const scanCaption = useTransform(p, [0.16, 0.2, 0.25, 0.29], [0, 1, 1, 0]);
  const doneCaption = useTransform(p, [0.31, 0.35, 0.39, 0.43], [0, 1, 1, 0]);
  const editCaption = useTransform(p, [0.43, 0.47, 0.51, 0.55], [0, 1, 1, 0]);
  const poweredBy = useTransform(p, [0.16, 0.24, 0.86, 0.92], [0, 1, 1, 0]);

  // detected ingredients
  const chipsOpacity = useTransform(p, [0.3, 0.36, 0.5, 0.56], [0, 1, 1, 0]);
  const tagGlow = useTransform(p, [0.31, 0.36, 0.43, 0.48], [0, 1, 1, 0]);
  const editHint = useTransform(p, [0.43, 0.46, 0.52, 0.55], [0, 1, 1, 0]);

  // the user adjusts before saving — the IA never has the last word
  const [cremaG, setCremaG] = useState(30);
  // phone (save beat), typed line, and orbit finale — all state-driven:
  // scroll MotionValues freeze inside phone mockups
  const [showPhone, setShowPhone] = useState(false);
  const [showOrbit, setShowOrbit] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    setCremaG(v >= 0.465 ? 20 : 30);
    setShowPhone(v >= 0.56 && v < 0.73);
    setShowOrbit(v >= 0.9);
  });

  // edit → everything recalculates instantly, orbit included
  const totalKcal = cremaG === 20 ? "503 kcal" : "548 kcal";
  const saveCaption = useTransform(p, [0.58, 0.62, 0.68, 0.72], [0, 1, 1, 0]);
  const orbitOpacity = useTransform(p, [0.895, 0.94], [0, 1]);

  return (
    <section ref={ref} className="relative h-[520vh]">
      <div className="sticky top-0 h-dvh overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* chapter opening — what this is, in one line, plus proof */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[max(10%,5.5rem)] z-10 mx-auto max-w-2xl px-6 text-center"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo VII · Scan IA
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Registra comidas{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              en segundos.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Toma una foto o descríbela. Stelar estima ingredientes y porciones
            — y tú ajustas todo antes de guardar.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {["Escaneo ≈ 5 seg", "Quick log < 10 seg", "Foto o texto"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-cream/12 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-cream/55"
              >
                {chip}
              </span>
            ))}
          </div>
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
              loading="lazy"
              decoding="async"
              width={800}
              height={800}
              draggable={false}
            />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_55%,rgba(10,6,8,0.35)_100%)]" />
          </div>

          {/* magenta scanning ring */}
          <motion.div style={{ opacity: scanRing }} className="absolute inset-0">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#FF4886]/90 shadow-[0_0_28px_rgba(255,72,134,0.45),inset_0_0_22px_rgba(255,72,134,0.2)]" />
            {inView && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF4886] shadow-[0_0_12px_#FF4886]" />
              </motion.div>
            )}
          </motion.div>

          {/* gold ring — the plate, understood */}
          <motion.div
            style={{ opacity: goldRing }}
            className="absolute inset-0 rounded-full border-2 border-gold-soft/90 shadow-[0_0_32px_rgba(232,184,114,0.4),inset_0_0_20px_rgba(232,184,114,0.15)]"
          />

          {/* the IA names what it sees — revealed by the scan itself
              (hover never fires on touch) */}
          {TAGS.map((tag) => (
            <motion.span
              key={tag.text}
              style={{ left: tag.x, top: tag.y, opacity: tagGlow }}
              className="absolute hidden whitespace-nowrap rounded-full border border-gold/40 bg-deep/80 px-3 py-1 font-serif text-xs italic text-gold backdrop-blur-sm sm:block"
            >
              {tag.text}
            </motion.span>
          ))}
          <span className="absolute bottom-[4%] right-[4%] flex items-center gap-1.5 rounded-full bg-deep/70 px-3 py-1.5 text-[11px] tracking-wide text-cream/85 opacity-0 backdrop-blur-md transition-all duration-700 group-hover:opacity-100">
            ⟲ Reescanear
          </span>
        </motion.div>

        {/* captions under the frame — the flow, step by step */}
        <motion.p
          style={{ opacity: scanCaption }}
          className="pointer-events-none absolute inset-x-0 top-[68%] z-10 text-center text-base text-cream/75"
        >
          Escaneando tu plato…
        </motion.p>
        <motion.p
          style={{ opacity: doneCaption }}
          className="pointer-events-none absolute inset-x-0 top-[68%] z-10 text-center text-base text-cream/75"
        >
          Ingredientes detectados.{" "}
          <span className="font-serif italic text-gold">Porciones estimadas.</span>
        </motion.p>
        <motion.p
          style={{ opacity: editCaption }}
          className="pointer-events-none absolute inset-x-0 top-[68%] z-10 text-center text-base text-cream/75"
        >
          Tú ajustas —{" "}
          <span className="font-serif italic text-gold">y todo se recalcula al instante.</span>
        </motion.p>
        <motion.p
          style={{ opacity: saveCaption }}
          className="pointer-events-none absolute inset-x-0 top-[80%] z-10 text-center font-serif text-lg italic text-gold"
        >
          Lo dejaste anotado. Eso ya es algo.
        </motion.p>

        {/* powered by IA */}
        <motion.p
          style={{ opacity: poweredBy }}
          className="pointer-events-none absolute inset-x-0 bottom-[6%] z-10 text-center text-[11px] uppercase tracking-[0.35em] text-cream/45"
        >
          <span className="text-pink">✦</span> Powered by IA · tú siempre tienes el control
        </motion.p>

        {/* the detected ingredients, as the app names them */}
        {INGREDIENTS.map((c) => (
          <motion.div
            key={c.label}
            style={{
              opacity: chipsOpacity,
              left: `calc(50% + (${c.x} - 0.5) * min(100% - 11rem, 52rem))`,
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
                {c.total ? (
                  <motion.span
                    key={totalKcal}
                    initial={{ scale: 1.25, color: "#FFE9C2" }}
                    animate={{ scale: 1, color: "#E8B872" }}
                    transition={{ duration: 0.5 }}
                    className="rounded-md border border-cream/15 px-1.5 py-0.5 text-xs"
                  >
                    {totalKcal}
                  </motion.span>
                ) : c.editable ? (
                  <span className="flex items-center gap-1.5">
                    <motion.span style={{ opacity: editHint }} className="text-xs text-cream/45">
                      −
                    </motion.span>
                    <motion.span
                      key={cremaG}
                      initial={{ scale: 1.25, color: "#FFE9C2" }}
                      animate={{ scale: 1, color: "#F4ECDE" }}
                      transition={{ duration: 0.5 }}
                      className="rounded-md border border-cream/15 px-1.5 py-0.5 text-xs"
                    >
                      {cremaG} g
                    </motion.span>
                    <motion.span style={{ opacity: editHint }} className="text-xs text-cream/45">
                      +
                    </motion.span>
                  </span>
                ) : (
                  <span
                    className="rounded-md border border-cream/15 px-1.5 py-0.5 text-xs"
                    style={{ color: c.color }}
                  >
                    {c.value}
                  </span>
                )}
              </div>
              {c.detail && (
                <p className="mt-1 text-[11px] text-cream/50">{c.detail}</p>
              )}
            </div>
          </motion.div>
        ))}

        {/* the evidence assembles the phone out of the universe */}
        <div className="absolute left-1/2 top-[max(13%,5.5rem)] z-10 w-[min(210px,36vh)] -translate-x-1/2">
          <PhoneEmerge show={showPhone}>
            <PhoneMockup>
              <ScanResultScreen show={showPhone} />
            </PhoneMockup>
          </PhoneEmerge>
        </div>

        {/* the second path: no photo — just write it */}
        <TextLog p={p} inView={inView} />

        {/* the finale: saving feeds the orbit, instantly */}
        <motion.div
          style={{ opacity: orbitOpacity }}
          className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center"
        >
          <div className="relative mx-auto h-28 w-28">
            <motion.div
              initial={false}
              animate={showOrbit ? { scale: [0.85, 1], opacity: [0, 1] } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border border-gold/50 shadow-[0_0_34px_rgba(232,184,114,0.25)]"
            />
            {inView && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-soft shadow-[0_0_10px_#E8B872]" />
              </motion.div>
            )}
            <span className="absolute inset-0 flex items-center justify-center font-serif text-base italic text-gold">
              +{totalKcal}
            </span>
          </div>
          <p className="mt-6 text-base text-cream/75">
            Guardas —{" "}
            <span className="font-serif italic text-gold">
              y tu órbita se actualiza al instante.
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/** The text-log beat lives in its own component: the typewriter drives
 *  ~26 state updates across its scroll band, and only THIS subtree
 *  should re-render for them — never the whole chapter. */
function TextLog({ p, inView }: { p: MotionValue<number>; inView: boolean }) {
  const [chars, setChars] = useState(0);
  const [textDone, setTextDone] = useState(false);
  useMotionValueEvent(p, "change", (v) => {
    setChars(Math.round(Math.max(0, Math.min(1, (v - 0.75) / 0.05)) * TYPED.length));
    setTextDone(v >= 0.81 && v < 0.9);
  });
  const textBeat = useTransform(p, [0.73, 0.77, 0.86, 0.9], [0, 1, 1, 0]);

  return (
    <motion.div
      style={{ opacity: textBeat }}
      className="pointer-events-none absolute inset-x-0 top-[30%] z-10 mx-auto max-w-md px-6 text-center"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-cream/45">
        ¿Sin foto?{" "}
        <span className="normal-case tracking-normal font-serif italic text-gold">Escríbelo.</span>
      </p>
      <div className="mt-6 rounded-full border border-cream/15 bg-deep/60 px-6 py-3.5 backdrop-blur-sm">
        <p className="font-serif text-lg italic text-cream/85">
          {TYPED.slice(0, chars)}
          {inView && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-gold"
            >
              |
            </motion.span>
          )}
        </p>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {TEXT_RESULT.map((r, i) => (
          <motion.span
            key={r.label}
            initial={false}
            animate={{ opacity: textDone ? 1 : 0, y: textDone ? 0 : 10 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="rounded-2xl border border-cream/12 bg-deep/60 px-4 py-2 text-sm text-cream/85 backdrop-blur-sm"
            style={{ boxShadow: `0 0 22px ${r.color}22` }}
          >
            {r.label}{" "}
            <span className="text-xs" style={{ color: r.color }}>
              {r.value}
            </span>
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
