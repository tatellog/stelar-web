"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  type MotionValue,
} from "framer-motion";
import PhoneMockup from "../PhoneMockup";
import OrbitaScreen from "../screens/OrbitaScreen";
import { PrimaryCTA, SecondaryCTA } from "../CTAButton";

/**
 * Interactive opening chapter.
 * Pointer: constellation layers drift at different depths, the first light
 * follows the cursor, orbit rings tilt. Scroll: the light leaves a longer
 * trail, new signals appear and missing links connect.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);

  // normalized pointer (-1 … 1), smoothed so everything feels liquid
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 40, damping: 18, mass: 0.8 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  // parallax depths
  const farX = useTransform(sx, (v) => v * -10);
  const farY = useTransform(sy, (v) => v * -6);
  const nearX = useTransform(sx, (v) => v * -26);
  const nearY = useTransform(sy, (v) => v * -14);
  const phoneRotY = useTransform(sx, (v) => v * 5);
  const phoneRotX = useTransform(sy, (v) => v * -4);

  // the hero slowly recedes as you leave the chapter
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const drift = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section
      ref={ref}
      onPointerMove={onPointerMove}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <HeroConstellation
        farX={farX}
        farY={farY}
        nearX={nearX}
        nearY={nearY}
        pointerX={sx}
        pointerY={sy}
        scroll={scrollYProgress}
      />

      <motion.div
        style={{ opacity: fade, y: drift }}
        className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pb-20 pt-32 lg:grid-cols-[1.15fr_0.85fr] lg:pb-24"
      >
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 2.0 }}
            className="mb-6 text-xs uppercase tracking-[0.35em] text-gold"
          >
            Stelar · Haz visible lo invisible
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 2.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-sans text-4xl font-black leading-[1.05] tracking-tight text-cream sm:text-5xl lg:text-6xl"
          >
            Bajar de peso no es el{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              verdadero problema.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 2.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-cream/70"
          >
            El verdadero problema es que no puedes ver los patrones que te
            hacen avanzar o retroceder.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 3.4 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <PrimaryCTA>Únete a la beta</PrimaryCTA>
            <SecondaryCTA>Haz visible lo invisible</SecondaryCTA>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.8, delay: 3.0, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[280px] lg:max-w-[300px]"
          style={{ perspective: 900 }}
        >
          <OrbitRings pointerX={sx} pointerY={sy} />
          <motion.div
            style={{ rotateY: phoneRotY, rotateX: phoneRotX }}
            className="animate-float-slow"
          >
            <PhoneMockup>
              <OrbitaScreen />
            </PhoneMockup>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 4.2 }}
        style={{ opacity: fade }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}

/** Thin orbit rings behind the phone that tilt subtly with the pointer. */
function OrbitRings({
  pointerX,
  pointerY,
}: {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}) {
  const rx = useTransform(pointerY, (v) => 62 + v * -6);
  const ry = useTransform(pointerX, (v) => 42 + v * 5);

  return (
    <svg
      viewBox="0 0 300 300"
      aria-hidden
      className="pointer-events-none absolute -inset-16 h-auto w-[calc(100%+8rem)]"
    >
      <g className="animate-orbit" style={{ transformBox: "fill-box" }}>
        <motion.ellipse
          cx="150"
          cy="150"
          rx="132"
          style={{ ry: rx }}
          fill="none"
          stroke="rgba(217,174,111,0.16)"
          strokeWidth="0.6"
          strokeDasharray="2 4"
        />
      </g>
      <g className="animate-orbit-reverse" style={{ transformBox: "fill-box" }}>
        <motion.ellipse
          cx="150"
          cy="150"
          style={{ ry }}
          rx="105"
          fill="none"
          stroke="rgba(255,72,134,0.12)"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );
}

/**
 * The birth of the constellation. Layered for parallax; the first light
 * follows the cursor a little, and scrolling draws what entrance left undone.
 */
function HeroConstellation({
  farX,
  farY,
  nearX,
  nearY,
  pointerX,
  pointerY,
  scroll,
}: {
  farX: MotionValue<number>;
  farY: MotionValue<number>;
  nearX: MotionValue<number>;
  nearY: MotionValue<number>;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scroll: MotionValue<number>;
}) {
  const points = [
    { x: 180, y: 160 },
    { x: 340, y: 90 },
    { x: 520, y: 170 },
    { x: 660, y: 110 },
    { x: 820, y: 210 },
    { x: 980, y: 140 },
  ];
  const entranceLinks = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
  ];
  // signals that only scrolling brings out
  const scrollSignals = [
    { x: 420, y: 250 },
    { x: 740, y: 280 },
    { x: 900, y: 240 },
  ];

  // the first light leans toward the cursor
  const leadX = useTransform(pointerX, (v) => v * 22);
  const leadY = useTransform(pointerY, (v) => v * 16);

  // scroll draws the missing link and a longer trail
  const lastLink = useTransform(scroll, [0.05, 0.3], [0, 1]);
  const trail = useTransform(scroll, [0, 0.35], [0, 1]);
  const signalsIn = useTransform(scroll, [0.05, 0.25], [0, 0.9]);
  const signalLines = useTransform(scroll, [0.15, 0.4], [0, 1]);

  return (
    <svg
      viewBox="0 0 1200 400"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] w-full opacity-70"
      preserveAspectRatio="xMidYMin slice"
    >
      {/* far layer: entrance constellation */}
      <motion.g style={{ x: farX, y: farY }}>
        {entranceLinks.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={points[a].x}
            y1={points[a].y}
            x2={points[b].x}
            y2={points[b].y}
            stroke="rgba(244,236,222,0.22)"
            strokeWidth="0.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, delay: 0.9 + i * 0.35, ease: "easeInOut" }}
          />
        ))}
        {/* the link entrance never drew — scroll completes it */}
        <motion.line
          x1={points[4].x}
          y1={points[4].y}
          x2={points[5].x}
          y2={points[5].y}
          stroke="rgba(217,174,111,0.4)"
          strokeWidth="0.8"
          style={{ pathLength: lastLink, opacity: lastLink }}
        />
        {points.slice(1).map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i % 2 === 0 ? 2.6 : 2}
            fill={i === 2 ? "#D9AE6F" : "#F4ECDE"}
            className="glow-dot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.9, delay: 1.0 + i * 0.3 }}
          />
        ))}
      </motion.g>

      {/* near layer: the first light + scroll-born signals */}
      <motion.g style={{ x: nearX, y: nearY }}>
        <motion.g style={{ x: leadX, y: leadY }}>
          <motion.circle
            cx={points[0].x}
            cy={points[0].y}
            r="3.5"
            fill="#F4ECDE"
            className="glow-dot"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.9], scale: [0, 1.6, 1] }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          />
          {/* entrance trail */}
          <motion.path
            d={`M ${points[0].x} ${points[0].y} Q ${points[0].x + 60} ${points[0].y - 70} ${points[1].x} ${points[1].y}`}
            fill="none"
            stroke="url(#trail)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
          />
          {/* scroll trail, falling toward the next chapter */}
          <motion.path
            d={`M ${points[0].x} ${points[0].y} Q ${points[0].x - 40} ${points[0].y + 90} ${points[0].x + 30} ${points[0].y + 190}`}
            fill="none"
            stroke="url(#trailDown)"
            strokeWidth="1"
            style={{ pathLength: trail, opacity: trail }}
          />
        </motion.g>

        {scrollSignals.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.2"
            fill={i === 1 ? "#FF4886" : "#F4ECDE"}
            className="glow-dot"
            style={{ opacity: signalsIn }}
          />
        ))}
        <motion.line
          x1={scrollSignals[0].x}
          y1={scrollSignals[0].y}
          x2={scrollSignals[1].x}
          y2={scrollSignals[1].y}
          stroke="rgba(255,72,134,0.3)"
          strokeWidth="0.7"
          style={{ pathLength: signalLines, opacity: signalLines }}
        />
        <motion.line
          x1={scrollSignals[1].x}
          y1={scrollSignals[1].y}
          x2={scrollSignals[2].x}
          y2={scrollSignals[2].y}
          stroke="rgba(244,236,222,0.25)"
          strokeWidth="0.7"
          style={{ pathLength: signalLines, opacity: signalLines }}
        />
      </motion.g>

      <defs>
        <linearGradient id="trail" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4886" stopOpacity="0" />
          <stop offset="100%" stopColor="#FF4886" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="trailDown" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F4ECDE" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF4886" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
