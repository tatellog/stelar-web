import type { ReactNode } from "react";

/** iPhone-style frame. Width is controlled by the parent via className. */
export default function PhoneMockup({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[9/19] rounded-[2.6rem] border border-cream/15 bg-plum-deep p-2 shadow-[0_0_80px_rgba(255,72,134,0.12),0_40px_80px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* notch */}
      <div className="absolute left-1/2 top-4 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black/90" />
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-gradient-to-b from-wine via-deep to-plum-deep">
        {children}
      </div>
    </div>
  );
}
