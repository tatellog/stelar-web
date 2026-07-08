"use client";

import { motion } from "framer-motion";
import Reveal from "../Reveal";

/**
 * Capítulo X — Patrones reales.
 * "AI detects patterns" convinces nobody. Examples do. Four discoveries,
 * written exactly the way Stelar would surface them: two dimensions of
 * your life, one hairline of light between them, and a sentence that
 * comes only from your own records. Never a diagnosis.
 */

type Example = {
  a: { label: string; color: string };
  b: { label: string; color: string };
  text: React.ReactNode;
};

const EXAMPLES: Example[] = [
  {
    a: { label: "Viernes", color: "#E8B872" },
    b: { label: "Calorías", color: "#FF9E57" },
    text: (
      <>
        Los viernes promedias{" "}
        <em className="not-italic font-serif italic text-gold">un 26% más de calorías.</em>
      </>
    ),
  },
  {
    a: { label: "Sueño", color: "#C18FFF" },
    b: { label: "Snacks", color: "#FBD7E3" },
    text: (
      <>
        Cuando duermes menos de 6 horas,{" "}
        <em className="not-italic font-serif italic text-gold">
          los snacks nocturnos aumentan.
        </em>
      </>
    ),
  },
  {
    a: { label: "Entreno", color: "#FF9E57" },
    b: { label: "Proteína", color: "#E0AEA0" },
    text: (
      <>
        Los días que entrenas,{" "}
        <em className="not-italic font-serif italic text-gold">
          casi siempre alcanzas tu meta de proteína.
        </em>
      </>
    ),
  },
  {
    a: { label: "Agua", color: "#8FBEDB" },
    b: { label: "Déficit", color: "#FF4886" },
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
  return (
    <section className="relative overflow-hidden py-32 sm:py-44">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            Capítulo X · Patrones reales
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Patrones que normalmente{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              no notarías.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 flex flex-col gap-5 sm:mt-20">
          {EXAMPLES.map((ex, i) => (
            <EvidenceCard key={i} ex={ex} index={i} />
          ))}
        </div>

        <Reveal delay={0.2} className="mt-14 text-center">
          <p className="text-sm leading-relaxed text-cream/55">
            Nada de esto es un diagnóstico.{" "}
            <span className="font-serif italic text-gold">
              Todo sale de tus propios registros.
            </span>
          </p>
          <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-cream/35">
            Detección de patrones · Automática
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** one discovery: two stars, a thread of light, and the sentence */
function EvidenceCard({ ex, index }: { ex: Example; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-5 rounded-3xl border border-cream/10 bg-deep/40 px-6 py-6 backdrop-blur-sm sm:flex-row sm:gap-8 sm:px-8"
    >
      {/* the two dimensions, connected */}
      <svg viewBox="0 0 150 56" className="w-36 shrink-0" aria-hidden>
        <defs>
          <radialGradient id={`exA${index}`}>
            <stop offset="0%" stopColor={ex.a.color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={ex.a.color} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`exB${index}`}>
            <stop offset="0%" stopColor={ex.b.color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={ex.b.color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.line
          x1="30"
          y1="24"
          x2="120"
          y2="24"
          stroke="#D9AE6F"
          strokeOpacity="0.45"
          strokeWidth="0.7"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.35 + index * 0.08 }}
        />
        {/* the pulse that keeps traveling between them */}
        <motion.circle
          r="1.8"
          cy="24"
          fill="#FFE9C2"
          animate={{ cx: [30, 120, 30], opacity: [0, 0.9, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.7 }}
        />
        <circle cx="30" cy="24" r="13" fill={`url(#exA${index})`} />
        <Star4 x={30} y={24} r={4.2} fill="#FFF6E5" />
        <circle cx="120" cy="24" r="13" fill={`url(#exB${index})`} />
        <Star4 x={120} y={24} r={4.2} fill="#FFF6E5" />
        <text
          x="30"
          y="48"
          textAnchor="middle"
          fill={ex.a.color}
          style={{ font: "600 7.5px 'Hanken Grotesk', sans-serif", letterSpacing: "0.12em" }}
        >
          {ex.a.label.toUpperCase()}
        </text>
        <text
          x="120"
          y="48"
          textAnchor="middle"
          fill={ex.b.color}
          style={{ font: "600 7.5px 'Hanken Grotesk', sans-serif", letterSpacing: "0.12em" }}
        >
          {ex.b.label.toUpperCase()}
        </text>
      </svg>

      <p className="text-center text-base leading-relaxed text-cream/85 sm:text-left sm:text-lg">
        {ex.text}
      </p>
    </motion.div>
  );
}

function Star4({ x, y, r, fill }: { x: number; y: number; r: number; fill: string }) {
  const w = r * 0.26;
  return (
    <path
      d={`M ${x} ${y - r} Q ${x + w} ${y - w} ${x + r} ${y} Q ${x + w} ${y + w} ${x} ${y + r} Q ${x - w} ${y + w} ${x - r} ${y} Q ${x - w} ${y - w} ${x} ${y - r} Z`}
      fill={fill}
      opacity={0.92}
    />
  );
}
