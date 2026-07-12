"use client";

import type { ReactNode } from "react";

/**
 * The real "Tu Órbita" tab chrome, miniaturized: header, Día/Semana/Mes
 * segmented control, content, and the app's tab bar with the REGISTRAR fab.
 */
export default function OrbitaChrome({
  active,
  title,
  subtitle,
  children,
}: {
  active: "dia" | "semana" | "mes";
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const tabs: [string, string][] = [
    ["dia", "Día"],
    ["semana", "Semana"],
    ["mes", "Mes"],
  ];
  return (
    <div className="flex h-full flex-col px-4 pb-3 pt-9 text-cream">
      <h3 className="font-sans text-lg font-black tracking-tight">
        <span className="text-pink-soft">Tu</span> Órbita
      </h3>

      <div className="mt-2 flex rounded-full border border-cream/10 p-0.5 text-[10px] tracking-[0.15em]">
        {tabs.map(([id, label]) => (
          <span
            key={id}
            className={`flex-1 rounded-full py-1 text-center transition-colors ${
              active === id
                ? "bg-pink-soft/25 font-semibold text-pink"
                : "text-cream/50"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <p className="mt-2.5 font-sans text-[14px] font-semibold leading-tight">
        {title}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-[10px] leading-snug text-cream/50">{subtitle}</p>
      )}

      <div className="min-h-0 flex-1">{children}</div>

      {/* tab bar + fab */}
      <div className="mt-1.5 flex items-center gap-1.5">
        <div className="flex flex-1 items-center justify-around rounded-full border border-cream/10 bg-cream/[0.03] px-1.5 py-1.5 text-[6px] tracking-[0.12em] text-cream/45">
          <span>HOY</span>
          <span>COMIDAS</span>
          <span>PROGRESO</span>
          <span className="rounded-full bg-pink-soft/20 px-1.5 py-0.5 font-semibold text-pink">
            ÓRBITA
          </span>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-soft shadow-[0_0_14px_rgba(233,30,99,0.55)]">
          <svg width="11" height="11" viewBox="0 0 20 20" aria-hidden>
            <path
              d="M10 1 L11.8 8.2 L19 10 L11.8 11.8 L10 19 L8.2 11.8 L1 10 L8.2 8.2 Z"
              fill="#FFFFFF"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
