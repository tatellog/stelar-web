import type { ReactNode } from "react";

export function PrimaryCTA({
  children,
  href = "#beta",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-pink px-8 py-3.5 text-sm font-semibold tracking-wide text-cream transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,72,134,0.45)]"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-pink to-pink-soft opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="relative">{children}</span>
    </a>
  );
}

export function SecondaryCTA({
  children,
  href = "#promesa",
}: {
  children: ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-gold/40 px-8 py-3.5 text-sm font-medium tracking-wide text-gold transition-all duration-500 hover:border-gold/80 hover:shadow-[0_0_30px_rgba(217,174,111,0.25)]"
    >
      {children}
    </a>
  );
}
