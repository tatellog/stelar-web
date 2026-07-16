"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Reveal from "../Reveal";
import { useJourney, FOCUS_TXT, MOMENTO_TXT } from "../JourneyContext";

/**
 * Capítulo X — Patrones reales.
 * "AI detects patterns" convinces nobody — and neither do fading cards.
 * Each card ANIMATES the discovery itself: the bars grow, the outlier
 * lights up, the snack appears after the short nights, the protein
 * reaches its goal, the deficit ring holds. The visitor watches the
 * evidence happen. Never a diagnosis: everything comes from records.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

type Example = {
  visual: ReactNode;
  text: ReactNode;
};

/* ── 1 · Fridays exceed the weekly average ─────────────────────────── */

function FridayBars() {
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const h = [26, 22, 19, 24, 46, 28, 23];
  return (
    <svg viewBox="0 0 170 90" className="w-52 shrink-0 sm:w-64" aria-hidden>
      {days.map((d, i) => {
        const friday = i === 4;
        return (
          <g key={d}>
            <motion.rect
              x={14 + i * 21}
              width={9}
              rx={4.5}
              fill={friday ? "#E8B872" : "#F4ECDE"}
              initial={{ height: 0, y: 68, opacity: 0 }}
              whileInView={{
                height: h[i],
                y: 68 - h[i],
                opacity: friday ? 0.95 : 0.42,
              }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: EASE }}
            />
            <text
              x={18.5 + i * 21}
              y={80}
              textAnchor="middle"
              fill={friday ? "#E8B872" : "#F4ECDE"}
              opacity={friday ? 0.9 : 0.35}
              style={{ font: "600 7.5px 'Hanken Grotesk', sans-serif" }}
            >
              {d}
            </text>
          </g>
        );
      })}
      {/* the weekly average, drawn as a chart hairline — with its number */}
      <motion.line
        x1={10}
        y1={44}
        x2={160}
        y2={44}
        stroke="#D9AE6F"
        strokeWidth={0.6}
        strokeDasharray="3 4"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.55 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1.2 }}
      />
      <motion.text
        x={161}
        y={41}
        textAnchor="end"
        fill="#D9AE6F"
        style={{ font: "italic 8px 'Cormorant Garamond', serif" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.85 }}
        viewport={{ once: true }}
        transition={{ delay: 1.5 }}
      >
        prom. 1900 kcal
      </motion.text>
      <motion.text
        x={94}
        y={28}
        textAnchor="end"
        fill="#FFE9C2"
        style={{ font: "italic 8.5px 'Cormorant Garamond', serif" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.95 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.9 }}
      >
        2450 kcal
      </motion.text>
      {/* the discovery: friday glows and names itself */}
      <motion.g
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 1.7 }}
      >
        <rect x={81} y={2} width={36} height={14} rx={7} fill="rgba(232,184,114,0.14)" stroke="#E8B872" strokeOpacity={0.6} strokeWidth={0.6} />
        <text x={99} y={12} textAnchor="middle" fill="#FFE9C2" style={{ font: "700 8.5px 'Hanken Grotesk', sans-serif" }}>
          +28%
        </text>
      </motion.g>
      <motion.circle
        cx={102.5}
        cy={68 - 46}
        r={7}
        initial={{ opacity: 0 }}
        fill="none"
        stroke="#FFE9C2"
        strokeWidth={0.6}
        whileInView={{ r: [5, 11], opacity: [0.7, 0] }}
        viewport={{ margin: "-10%" }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 2, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ── 2 · short nights, late snacks ─────────────────────────────────── */

function SleepSnacks() {
  return (
    <svg viewBox="0 0 170 90" className="w-52 shrink-0 sm:w-64" aria-hidden>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {/* the night, shorter than it should be */}
          <motion.rect
            x={20 + i * 44}
            width={10}
            rx={5}
            fill="#C18FFF"
            initial={{ height: 0, y: 58, opacity: 0 }}
            whileInView={{ height: 26, y: 32, opacity: 0.75 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 + i * 0.35, ease: EASE }}
          />
          <motion.text
            x={25 + i * 44}
            y={70}
            textAnchor="middle"
            fill="#C18FFF"
            style={{ font: "italic 8px 'Cormorant Garamond', serif" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.85 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 + i * 0.35 }}
          >
            5 h
          </motion.text>
          {/* …and the snack that follows it, late */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.5 + i * 0.35, ease: EASE }}
            style={{ transformOrigin: `${39 + i * 44}px 24px` }}
          >
            <circle cx={39 + i * 44} cy={24} r={3.4} fill="#F4ECDE" opacity={0.9} />
            <circle cx={39 + i * 44} cy={24} r={7} fill="none" stroke="#F4ECDE" strokeOpacity={0.3} strokeWidth={0.5} />
          </motion.g>
        </g>
      ))}
      <motion.text
        x={85}
        y={12}
        textAnchor="middle"
        fill="#D9AE6F"
        style={{ font: "italic 8.5px 'Cormorant Garamond', serif" }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.9 }}
        viewport={{ once: true }}
        transition={{ delay: 2.6 }}
      >
        snack nocturno · 23:40
      </motion.text>
    </svg>
  );
}

/* ── 3 · training days reach the protein goal ──────────────────────── */

function TrainProtein() {
  return (
    <svg viewBox="0 0 170 90" className="w-52 shrink-0 sm:w-64" aria-hidden>
      {/* entreno pulses… */}
      <motion.circle
        cx={30}
        cy={45}
        r={5}
        fill="#FF9E57"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.95 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      />
      <motion.circle
        cx={30}
        cy={45}
        initial={{ r: 6, opacity: 0 }}
        fill="none"
        stroke="#FF9E57"
        strokeWidth={0.7}
        whileInView={{ r: [6, 14], opacity: [0.7, 0] }}
        viewport={{ margin: "-10%" }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.6, ease: "easeOut" }}
      />
      <text x={30} y={62} textAnchor="middle" fill="#FF9E57" opacity={0.85} style={{ font: "600 7.5px 'Hanken Grotesk', sans-serif" }}>
        ENTRENO
      </text>
      {/* …the signal travels… */}
      <motion.line
        x1={40}
        y1={45}
        x2={104}
        y2={45}
        stroke="#D9AE6F"
        strokeWidth={0.6}
        strokeOpacity={0.5}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.7 }}
      />
      <motion.circle
        r={2}
        cy={45}
        initial={{ cx: 40, opacity: 0 }}
        fill="#FFE9C2"
        whileInView={{ cx: [40, 104], opacity: [0, 0.9, 0] }}
        viewport={{ margin: "-10%" }}
        transition={{ duration: 1.6, repeat: Infinity, delay: 1.6, ease: "easeInOut" }}
      />
      {/* …and the protein fills to its goal */}
      <motion.line
        x1={108}
        y1={20}
        x2={140}
        y2={20}
        stroke="#D9AE6F"
        strokeWidth={0.6}
        strokeDasharray="3 4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ delay: 1 }}
      />
      <motion.rect
        x={118}
        width={12}
        rx={6}
        fill="#E0AEA0"
        initial={{ height: 0, y: 68 }}
        whileInView={{ height: 48, y: 20 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 1.4, ease: EASE }}
        opacity={0.85}
      />
      <text x={124} y={80} textAnchor="middle" fill="#E0AEA0" opacity={0.85} style={{ font: "600 7.5px 'Hanken Grotesk', sans-serif" }}>
        PROTEÍNA
      </text>
      {/* the goal, reached */}
      <motion.path
        d="M 146 20 l 3.5 4 l 6 -7"
        fill="none"
        stroke="#FFE9C2"
        strokeWidth={1.4}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.95 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 2.6 }}
      />
    </svg>
  );
}

/* ── 4 · more water, steadier deficit ──────────────────────────────── */

function WaterDeficit() {
  return (
    <svg viewBox="0 0 170 90" className="w-52 shrink-0 sm:w-64" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.circle
          key={i}
          cx={22 + i * 16}
          cy={45}
          r={4.5}
          fill="#8FBEDB"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.4 + i * 0.14, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.22, ease: EASE }}
          style={{ transformOrigin: `${22 + i * 16}px 45px` }}
        />
      ))}
      <text x={54} y={64} textAnchor="middle" fill="#8FBEDB" opacity={0.85} style={{ font: "600 7.5px 'Hanken Grotesk', sans-serif" }}>
        AGUA
      </text>
      {/* the deficit ring closes — and holds */}
      <motion.circle
        cx={128}
        cy={45}
        r={17}
        fill="none"
        stroke="#FF4886"
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 0.9 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: 1.5, ease: EASE }}
        transform="rotate(-90 128 45)"
      />
      <motion.circle
        cx={128}
        cy={45}
        r={22}
        fill="none"
        stroke="#FF4886"
        strokeWidth={0.5}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: [0, 0.35, 0] }}
        viewport={{ margin: "-10%" }}
        transition={{ duration: 2.6, repeat: Infinity, delay: 3 }}
      />
      <text x={128} y={48} textAnchor="middle" fill="#FBD7E3" opacity={0.9} style={{ font: "italic 8px 'Cormorant Garamond', serif" }}>
        déficit
      </text>
    </svg>
  );
}

/* ── the chapter ───────────────────────────────────────────────────── */

const EXAMPLES: Example[] = [
  {
    visual: <FridayBars />,
    text: (
      <>
        Los viernes superan{" "}
        <em className="not-italic font-serif italic text-gold">
          consistentemente tu promedio semanal.
        </em>
      </>
    ),
  },
  {
    visual: <SleepSnacks />,
    text: (
      <>
        Los snacks nocturnos aparecieron{" "}
        <em className="not-italic font-serif italic text-gold">
          después de las noches más cortas.
        </em>
      </>
    ),
  },
  {
    visual: <TrainProtein />,
    text: (
      <>
        Cuando entrenas,{" "}
        <em className="not-italic font-serif italic text-gold">
          casi siempre alcanzas tu meta de proteína.
        </em>
      </>
    ),
  },
  {
    visual: <WaterDeficit />,
    text: (
      <>
        Las semanas que tomas más agua,{" "}
        <em className="not-italic font-serif italic text-gold">
          sostienes tu déficit más seguido.
        </em>
      </>
    ),
  },
];

export default function PatternExamples() {
  const { focus, momento } = useJourney();
  // el eco de lo que la visitante le contó al observatorio
  const echo =
    focus && momento
      ? `Empezando por lo que ${MOMENTO_TXT[momento]} le hacen a ${FOCUS_TXT[focus]}.`
      : momento
        ? `Empezando por lo que se esconde en ${MOMENTO_TXT[momento]}.`
        : focus
          ? `Empezando por los que deciden ${FOCUS_TXT[focus]}.`
          : null;
  return (
    <section className="relative overflow-hidden py-32 sm:py-44">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold">
            Capítulo X · Patrones reales
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Patrones que normalmente{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              no notarías.
            </span>
          </h2>
          {echo && (
            <p className="mt-5 font-serif text-lg italic text-gold/90">{echo}</p>
          )}
        </Reveal>

        <div className="mt-16 flex flex-col gap-5 sm:mt-20">
          {EXAMPLES.map((ex, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
              className="flex flex-col items-center gap-4 rounded-3xl border border-cream/10 bg-deep/40 px-6 py-6 backdrop-blur-sm sm:flex-row sm:gap-8 sm:px-8"
            >
              {ex.visual}
              <p className="text-center text-base leading-relaxed text-cream/85 sm:text-left sm:text-lg">
                {ex.text}
              </p>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-14 text-center">
          <p className="text-sm leading-relaxed text-cream/55">
            Nada de esto es un diagnóstico.{" "}
            <span className="font-serif italic text-gold">
              Todo sale de tus propios registros.
            </span>
          </p>
          <p className="mt-5 text-[11.5px] uppercase tracking-[0.3em] text-cream/35">
            Detección de patrones · Automática
          </p>
        </Reveal>
      </div>
    </section>
  );
}
