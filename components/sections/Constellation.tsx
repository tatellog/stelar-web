"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../Reveal";
import LottieGlow from "../LottieGlow";
import skyAmbient from "@/lib/lottie/month-sky-ambient.json";
import { FIGURES } from "@/lib/zodiac/figures";
import type { ZodiacSign, ZodiacStar } from "@/lib/zodiac/types";

const SIGNS = Object.keys(FIGURES) as ZodiacSign[];

/** A star is a "hero" (anchor of the figure) below this magnitude —
 *  same convention as the app's flare renderer. */
const HERO_MAG = 2;

/**
 * The real constellation chapter: the 12 hand-traced zodiac figures from
 * the app (same coords, magnitudes and lines), lit the way the app lights
 * them — magenta with a white-hot core, star by star, over the sign's
 * pictorial art resting on its golden halo.
 */
export default function Constellation() {
  const [sign, setSign] = useState<ZodiacSign>("leo");
  const def = FIGURES[sign];
  const namedAnchor = def.stars.find((s) => s.name && s.role);

  return (
    <section className="relative py-32 sm:py-44">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold/80">
            Capítulo V · Tu constelación
          </p>
          <h2 className="font-sans text-4xl font-black leading-[1.1] tracking-tight text-cream sm:text-6xl">
            Tu constelación no se desbloquea.
            <br />
            <span className="font-serif italic font-medium text-gold text-glow-gold">
              Se revela.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.3} className="mx-auto mt-8 max-w-xl">
          <p className="text-lg leading-relaxed text-cream/60">
            Cada día que vuelves enciende una estrella de tu signo. Cuando tu
            evidencia completa la figura, tu constelación brilla entera.
          </p>
        </Reveal>

        {/* sign picker — the 12 real glyphs */}
        <Reveal delay={0.45}>
          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-2">
            {SIGNS.map((s) => (
              <button
                key={s}
                onClick={() => setSign(s)}
                aria-label={FIGURES[s].label}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-500 ${
                  sign === s
                    ? "border-pink-soft/70 text-pink shadow-[0_0_20px_rgba(233,30,99,0.25)]"
                    : "hairline border text-cream/45 hover:border-cream/25 hover:text-cream/80"
                }`}
              >
                <Glyph sign={s} />
              </button>
            ))}
          </div>
        </Reveal>

        {/* the figure itself */}
        <div className="relative mx-auto mt-10 max-w-md">
          <LottieGlow
            data={skyAmbient}
            className="pointer-events-none absolute -inset-14 opacity-40"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={sign}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <SignFigure sign={sign} />
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-gold/30" />
                <p className="text-xs uppercase tracking-[0.35em] text-gold">
                  {def.label}
                </p>
                <span className="h-px w-8 bg-gold/30" />
              </div>
              <p className="mt-3 min-h-[1.5rem] font-serif text-lg italic text-cream/55">
                {namedAnchor
                  ? `${namedAnchor.name} — ${namedAnchor.role}.`
                  : "Cada estrella, un día que volviste."}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/** Glyph rendered from the app's real line SVGs via CSS mask so it
 *  inherits the button's currentColor. */
function Glyph({ sign }: { sign: ZodiacSign }) {
  const url = `url(/zodiaco/${sign}.svg)`;
  return (
    <span
      aria-hidden
      className="inline-block h-5 w-5 bg-current"
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

/** Star radius from magnitude — the app's flare convention scaled to a
 *  100-unit viewBox: heroes read clearly bigger, faint connectors small. */
function starR(s: ZodiacStar) {
  return s.mag <= HERO_MAG ? 2.1 : Math.max(0.9, 1.75 - s.mag * 0.18);
}

function SignFigure({ sign }: { sign: ZodiacSign }) {
  const def = FIGURES[sign];
  const starDelay = (i: number) => 0.2 + i * 0.16;
  const lineDelay = (i: number) => 0.5 + i * 0.16;

  return (
    <div className="relative mx-auto aspect-square w-full">
      {/* the reveal's golden halo, behind the art */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,246,229,0.10)_0%,rgba(232,184,114,0.09)_40%,rgba(217,174,111,0.05)_72%,transparent_100%)]" />

      {/* the sign's pictorial art, resting free over the halo */}
      <motion.div
        className="absolute inset-[6%]"
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 0.5, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src={`/zodiac-art/${sign}-art.png`}
          alt={`Arte de ${def.label}`}
          fill
          sizes="(max-width: 640px) 90vw, 448px"
          className="object-contain"
        />
      </motion.div>

      {/* the live figure — the app's exact stars and lines */}
      <svg viewBox="0 0 100 100" className="relative h-full w-full" aria-hidden>
        {/* connecting lines, drawn in order */}
        {def.lines.map(([a, b], i) => (
          <motion.line
            key={`l${i}`}
            x1={def.stars[a].x * 100}
            y1={def.stars[a].y * 100}
            x2={def.stars[b].x * 100}
            y2={def.stars[b].y * 100}
            stroke="rgba(244,236,222,0.5)"
            strokeWidth="0.35"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: lineDelay(i), ease: "easeInOut" }}
          />
        ))}

        {def.stars.map((s, i) => {
          const r = starR(s);
          const hero = s.mag <= HERO_MAG;
          return (
            <motion.g
              key={`s${i}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: starDelay(i) }}
            >
              {/* magenta halo — the achievement colour */}
              <circle
                cx={s.x * 100}
                cy={s.y * 100}
                r={r * 2.4}
                fill={hero ? "rgba(233,30,99,0.28)" : "rgba(233,30,99,0.18)"}
              />
              {/* star body with white-hot core */}
              <circle
                cx={s.x * 100}
                cy={s.y * 100}
                r={r}
                fill={hero ? "#FBD7E3" : "#F4ECDE"}
                className="glow-dot"
              />
              {hero && (
                <circle cx={s.x * 100} cy={s.y * 100} r={r * 0.45} fill="#FFFFFF" />
              )}
            </motion.g>
          );
        })}

        {/* names on the anchor stars, arriving last */}
        {def.stars.map((s, i) =>
          s.name && s.mag <= 2.3 ? (
            <motion.text
              key={`n${i}`}
              x={s.x * 100 + (s.x > 0.72 ? -3 : 3)}
              y={s.y * 100 - 3}
              textAnchor={s.x > 0.72 ? "end" : "start"}
              fill="rgba(255,233,194,0.8)"
              fontSize="3.4"
              letterSpacing="0.5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 1.6 + i * 0.1 }}
            >
              {s.name}
            </motion.text>
          ) : null
        )}
      </svg>
    </div>
  );
}
