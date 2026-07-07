"use client";

import Reveal from "../Reveal";

const ROWS: { others: string; stelar: string }[] = [
  { others: "Cuentan calorías", stelar: "Revela patrones" },
  { others: "Muestran números", stelar: "Muestra evidencia" },
  { others: "Te dicen qué hacer", stelar: "Te ayuda a entenderte" },
  { others: "Castigan el error", stelar: "Valora volver" },
];

export default function Comparison() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="mb-16 text-center">
          <h2 className="font-sans text-4xl font-black leading-tight tracking-tight text-cream sm:text-5xl">
            Otra forma de{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              acompañarte.
            </span>
          </h2>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-3xl border hairline">
            <div className="grid grid-cols-2 border-b hairline">
              <div className="px-6 py-5 text-xs uppercase tracking-[0.3em] text-cream/40 sm:px-10">
                Otras apps
              </div>
              <div className="border-l hairline bg-pink/[0.04] px-6 py-5 text-xs uppercase tracking-[0.3em] text-gold sm:px-10">
                Stelar
              </div>
            </div>

            {ROWS.map((row, i) => (
              <div
                key={row.stelar}
                className={`grid grid-cols-2 ${i < ROWS.length - 1 ? "border-b hairline" : ""}`}
              >
                <div className="flex items-center gap-3 px-6 py-6 text-cream/45 sm:px-10">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-cream/25" />
                  <span className="text-sm sm:text-base">{row.others}</span>
                </div>
                <div className="flex items-center gap-3 border-l hairline bg-pink/[0.04] px-6 py-6 text-cream sm:px-10">
                  <StarBullet />
                  <span className="text-sm font-medium sm:text-base">
                    {row.stelar}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StarBullet() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
      <path
        d="M6 0.5 L7.1 4.9 L11.5 6 L7.1 7.1 L6 11.5 L4.9 7.1 L0.5 6 L4.9 4.9 Z"
        fill="#FF4886"
        className="glow-dot"
      />
    </svg>
  );
}
