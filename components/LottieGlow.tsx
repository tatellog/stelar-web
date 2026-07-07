"use client";

import Lottie from "lottie-react";

/** Thin wrapper over the app's real Lottie files (assets/lottie). */
export default function LottieGlow({
  data,
  className,
}: {
  data: object;
  className?: string;
}) {
  return <Lottie animationData={data} loop autoplay className={className} />;
}
