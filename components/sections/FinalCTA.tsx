"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Reveal from "../Reveal";
import { useSign } from "../SignContext";
import { useJourney, FOCUS_TXT } from "../JourneyContext";
import { FIGURES } from "@/lib/zodiac/figures";
import type { ZodiacSign } from "@/lib/zodiac/types";
import { joinBeta } from "@/lib/beta";
import { saveEmblemCard } from "@/lib/emblemCard";

/**
 * Capítulo XII — Final.
 * The complete constellation rests, very faint, behind the words. The
 * emblem breathes. And the only action left is the promise itself.
 */
export default function FinalCTA() {
  const { sign } = useSign();
  const { focus } = useJourney();
  const def = FIGURES[sign];
  // infinite animations only tick while the closing sky is on screen
  const artRef = useRef<HTMLDivElement>(null);
  const artInView = useInView(artRef, { margin: "-10%" });

  return (
    <section id="beta" className="relative overflow-hidden py-36 sm:py-48">
      {/* the emblem and its constellation, aligned in the same art box —
          the figure was traced over the emblem, so they share coordinates */}
      <motion.div
        initial={{ opacity: 0, scale: 1.09 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 3.4, ease: "easeOut" }}
        ref={artRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[21rem] w-[21rem] -translate-x-1/2 -translate-y-1/2 sm:h-[30rem] sm:w-[30rem]"
      >
        <motion.img
          src={`/emblems/${sign}/f10.webp`}
          alt=""
          loading="lazy"
          decoding="async"
          width={480}
          height={480}
          animate={
            artInView
              ? { scale: [1, 1.045, 1], opacity: [0.14, 0.2, 0.14] }
              : { scale: 1, opacity: 0.14 }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full object-contain"
        />
        <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="ctaStarHero">
              <stop offset="0%" stopColor="rgba(251,215,227,0.5)" />
              <stop offset="40%" stopColor="rgba(233,30,99,0.15)" />
              <stop offset="100%" stopColor="rgba(233,30,99,0)" />
            </radialGradient>
            <radialGradient id="ctaStarDim">
              <stop offset="0%" stopColor="rgba(255,233,194,0.36)" />
              <stop offset="45%" stopColor="rgba(232,184,114,0.1)" />
              <stop offset="100%" stopColor="rgba(232,184,114,0)" />
            </radialGradient>
          </defs>
          {def.lines.map(([a, b], i) => (
            <motion.line
              key={i}
              x1={def.stars[a].x * 100}
              y1={def.stars[a].y * 100}
              x2={def.stars[b].x * 100}
              y2={def.stars[b].y * 100}
              stroke="rgba(217,174,111,0.4)"
              strokeWidth="0.3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4 + i * 0.16, ease: "easeInOut" }}
            />
          ))}
          {/* energy keeps traveling every finished connection — a pool of
              three travelers cycles the lines instead of one infinite
              animator per line (SVG attrs animate on the main thread) */}
          {artInView &&
            [0, 1, 2].map((d) => {
              const seq = def.lines.filter((_, i) => i % 3 === d);
              if (!seq.length) return null;
              const cxs: number[] = [];
              const cys: number[] = [];
              const ops: number[] = [];
              for (const [a, b] of seq) {
                const A = def.stars[a];
                const B = def.stars[b];
                cxs.push(A.x * 100, (A.x + B.x) * 50, B.x * 100);
                cys.push(A.y * 100, (A.y + B.y) * 50, B.y * 100);
                ops.push(0, 0.85, 0);
              }
              return (
                <motion.circle
                  key={`e${d}`}
                  r={0.7}
                  fill="#FFE9C2"
                  initial={{ cx: cxs[0], cy: cys[0], opacity: 0 }}
                  animate={{ cx: cxs, cy: cys, opacity: ops }}
                  transition={{
                    duration: 2.4 * seq.length,
                    delay: 2.2 + d * 0.9,
                    repeat: Infinity,
                    repeatDelay: 1.1,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          {def.stars.map((st, i) => {
            const hero = st.mag <= 2.3;
            const x = st.x * 100;
            const y = st.y * 100;
            const r = hero ? 2 : 1.3;
            const w = r * 0.26;
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
              >
                <circle cx={x} cy={y} r={hero ? 5.5 : 3.4} fill={`url(#${hero ? "ctaStarHero" : "ctaStarDim"})`} />
                <path
                  d={`M ${x} ${y - r} Q ${x + w} ${y - w} ${x + r} ${y} Q ${x + w} ${y + w} ${x} ${y + r} Q ${x - w} ${y + w} ${x - r} ${y} Q ${x - w} ${y - w} ${x} ${y - r} Z`}
                  fill={hero ? "#FFF6E5" : "#F4ECDE"}
                  opacity={hero ? 0.9 : 0.72}
                />
              </motion.g>
            );
          })}
        </svg>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 pt-24 text-center">
        <Reveal>
          <h2 className="font-sans text-4xl font-black leading-[1.08] tracking-tight text-cream sm:text-6xl">
            Tus datos ya cuentan una historia.{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              Stelar te ayuda a entenderla.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-cream/60">
            Deja de acumular números.{" "}
            <span className="font-serif italic text-gold">
              Empieza a descubrir patrones.
            </span>
          </p>
        </Reveal>

        <Reveal delay={0.5} className="mt-12">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <BetaButton sign={sign} />
            <a
              href="#orbita"
              className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-7 py-3.5 text-sm font-semibold tracking-wide text-cream/80 transition-all duration-500 hover:border-gold/50 hover:text-cream"
            >
              Ver demo <span aria-hidden>↺</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.7} className="mt-8">
          <p className="font-serif text-base italic text-cream/45 sm:text-lg">
            {focus
              ? `Empieza a ver lo que tus hábitos ya están diciendo de ${FOCUS_TXT[focus]}.`
              : "Empieza a ver lo que tus hábitos ya están diciendo."}
          </p>
        </Reveal>

        <Reveal delay={0.9} className="mt-16">
          <p className="font-serif text-xl italic text-cream/40">
            Stelar. Haz visible lo invisible.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** The beta CTA: a REAL waitlist. The button opens into an email field,
 *  the email lands in Supabase, and the visitor gets an answer — the
 *  same gesture as the whole journey: a loose light joining the rest. */
function BetaButton({ sign }: { sign: ZodiacSign }) {
  const [hover, setHover] = useState(false);
  const [state, setState] = useState<
    "idle" | "open" | "sending" | "done" | "duplicate" | "error"
  >("idle");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  // on touch the emblem goes straight to the native share sheet
  // (Instagram Stories one tap away); on desktop it downloads
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(
      matchMedia("(pointer: coarse)").matches &&
        typeof navigator.canShare === "function",
    );
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state === "open") inputRef.current?.focus();
  }, [state]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      inputRef.current?.focus();
      return;
    }
    setState("sending");
    const result = await joinBeta(email);
    setState(result === "ok" ? "done" : result);
    if (result === "ok") {
      // the induction: your constellation flares before the confirmation
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 2700);
    }
  };

  if (state === "done" || state === "duplicate") {
    const def = FIGURES[sign];
    const nice = def.label.charAt(0) + def.label.slice(1).toLowerCase();
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex flex-col items-center gap-4"
      >
        {/* la iniciación: tu constelación destella a pantalla completa */}
        <AnimatePresence>
          {celebrate && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.7 } }}
              className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[radial-gradient(circle,rgba(20,8,11,0.9)_0%,rgba(10,6,8,0.96)_100%)]"
            >
              <div className="relative h-64 w-64 sm:h-80 sm:w-80">
                {/* golden burst */}
                {Array.from({ length: 14 }, (_, i) => {
                  const a = (i / 14) * Math.PI * 2;
                  return (
                    <motion.span
                      key={i}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                      animate={{
                        x: Math.cos(a) * (110 + (i % 3) * 34),
                        y: Math.sin(a) * (110 + (i % 3) * 34),
                        opacity: [0, 0.9, 0],
                        scale: 1,
                      }}
                      transition={{ duration: 1.4, delay: 0.55, ease: "easeOut" }}
                      className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-gold-soft shadow-[0_0_10px_rgba(232,184,114,0.9)]"
                    />
                  );
                })}
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  {def.lines.map(([a, b], i) => (
                    <motion.line
                      key={i}
                      x1={def.stars[a].x * 100}
                      y1={def.stars[a].y * 100}
                      x2={def.stars[b].x * 100}
                      y2={def.stars[b].y * 100}
                      stroke="rgba(255,233,194,0.75)"
                      strokeWidth="0.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, delay: 0.15 + i * 0.05, ease: "easeOut" }}
                    />
                  ))}
                  {def.stars.map((st, i) => (
                    <motion.circle
                      key={`s${i}`}
                      cx={st.x * 100}
                      cy={st.y * 100}
                      r={st.mag <= 2.3 ? 1.7 : 1.1}
                      fill="#FFF6E5"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.8, 1], opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                      style={{ transformOrigin: `${st.x * 100}px ${st.y * 100}px` }}
                    />
                  ))}
                </svg>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="mt-6 font-serif text-3xl italic text-gold sm:text-4xl"
              >
                Estás dentro.
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.7 }}
                className="mt-2 text-sm tracking-wide text-cream/65"
              >
                Tu {nice} ya brilla en la lista.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/[0.07] px-7 py-3.5 text-sm font-semibold tracking-wide text-gold">
          <span aria-hidden>✦</span>
          {state === "done"
            ? "Estás dentro. Te escribimos pronto."
            : "Ya estabas en la lista — te escribimos pronto."}
        </p>
        {/* the journey's keepsake: your constellation, ready to share */}
        <button
          onClick={async () => {
            setSaving(true);
            await saveEmblemCard(sign);
            setSaving(false);
          }}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-pink px-7 py-3.5 text-sm font-semibold tracking-wide text-cream transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,72,134,0.5)] disabled:opacity-60"
        >
          {saving
            ? "Dibujando tu cielo…"
            : canShare
              ? "Compartir mi emblema"
              : "Guardar mi emblema"}
          {!saving && <span aria-hidden>✦</span>}
        </button>
        <p className="text-[13px] text-cream/45">
          {canShare
            ? "Súbelo a tus stories — elige Instagram al compartir."
            : "Tu constelación en una imagen, lista para compartir."}
        </p>
      </motion.div>
    );
  }

  if (state !== "idle") {
    return (
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex flex-col items-center gap-2"
      >
        <div className="flex items-center overflow-hidden rounded-full border border-pink-soft/50 bg-deep/70 shadow-[0_0_34px_rgba(233,30,99,0.18)] backdrop-blur-sm focus-within:border-pink-soft">
          <input
            ref={inputRef}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            disabled={state === "sending"}
            className="w-48 bg-transparent px-5 py-3 text-base text-cream placeholder:text-cream/35 focus:outline-none sm:w-64"
          />
          <button
            type="submit"
            disabled={state === "sending"}
            className="m-1 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold tracking-wide text-cream transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,72,134,0.5)] disabled:opacity-60"
          >
            {state === "sending" ? "…" : "Unirme"}
          </button>
        </div>
        {state === "error" ? (
          <p className="text-[13px] text-pink-soft/90">
            Algo falló — inténtalo de nuevo.
          </p>
        ) : (
          <p className="text-[13px] text-cream/45">
            Solo usaremos tu correo para invitarte a la beta.
          </p>
        )}
      </motion.form>
    );
  }

  return (
    <span
      className="relative inline-block"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <AnimatePresence>
        {hover &&
          Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2 + 0.6;
            const dist = 70 + (i % 3) * 26;
            return (
              <motion.span
                key={i}
                aria-hidden
                initial={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist * 0.6,
                  opacity: 0,
                  scale: 0.4,
                }}
                animate={{ x: 0, y: 0, opacity: [0, 0.9, 0], scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.1,
                  delay: i * 0.07,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                  ease: "easeIn",
                }}
                className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-rosa shadow-[0_0_8px_rgba(251,215,227,0.9)]"
              />
            );
          })}
      </AnimatePresence>
      <button
        onClick={() => setState("open")}
        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-pink px-8 py-3.5 text-sm font-semibold tracking-wide text-cream transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,72,134,0.5)]"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-pink to-pink-soft opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative">Únete a la beta</span>
      </button>
    </span>
  );
}
