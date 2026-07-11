"use client";

import { motion } from "framer-motion";
import Reveal from "../Reveal";
import PhoneMockup from "../PhoneMockup";
import DiaScreen from "../screens/DiaScreen";

/**
 * El producto, resumido — the section the story never had.
 * One phone, and every capability named around it with a single
 * sentence, Apple-style. No paragraphs. Everything discoverable.
 */

type Feature = { name: string; line: string; color: string };

const LEFT: Feature[] = [
  { name: "Quick Log", line: "Registra comidas en segundos.", color: "#E8B872" },
  { name: "Scan IA", line: "Foto o texto.", color: "#FF4886" },
  { name: "Comidas", line: "Calorías y proteína, sin fricción.", color: "#E0AEA0" },
  { name: "Peso", line: "Sigue tus cambios físicos.", color: "#F4ECDE" },
];

const RIGHT: Feature[] = [
  { name: "Órbita", line: "Entiende tu progreso.", color: "#FF9E57" },
  { name: "Calendario", line: "Edita cualquier día anterior.", color: "#8FBEDB" },
  { name: "Wearables", line: "Sincronización automática.", color: "#C18FFF" },
  { name: "Fotos", line: "El progreso que la báscula no ve.", color: "#FBD7E3" },
];

const BOTTOM: Feature = {
  name: "Ciclo",
  line: "Tu fase, junto a todo lo demás.",
  color: "#FF4886",
};

function FeatureItem({
  f,
  align,
  index,
}: {
  f: Feature;
  align: "left" | "right" | "center";
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay: 0.15 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`group ${
        align === "right"
          ? "sm:text-right"
          : align === "center"
            ? "text-center"
            : "sm:text-left"
      } text-center`}
    >
      <p
        className={`flex items-center gap-2 text-sm font-semibold tracking-wide text-cream/90 ${
          align === "center"
            ? "justify-center"
            : align === "right"
              ? "justify-center sm:justify-end"
              : "justify-center sm:justify-start"
        }`}
      >
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full transition-shadow duration-500 group-hover:shadow-[0_0_10px_currentColor] ${
            align === "right" ? "sm:hidden" : ""
          }`}
          style={{ background: f.color, color: f.color }}
        />
        <span>{f.name}</span>
        {align === "right" && (
          <span
            className="hidden h-1.5 w-1.5 rounded-full transition-shadow duration-500 group-hover:shadow-[0_0_10px_currentColor] sm:inline-block"
            style={{ background: f.color, color: f.color }}
          />
        )}
      </p>
      <p className="mt-1 font-serif text-sm italic text-cream/60">{f.line}</p>
    </motion.div>
  );
}

export default function ProductOverview() {
  return (
    <section className="relative overflow-hidden py-32 sm:py-44">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">
            El producto
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Todo en{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              un solo lugar.
            </span>
          </h2>
        </Reveal>

        <div className="mt-16 grid items-center gap-10 sm:mt-24 sm:grid-cols-[1fr_auto_1fr] sm:gap-12">
          {/* left constellation of capabilities */}
          <div className="order-2 grid grid-cols-2 gap-8 sm:order-1 sm:grid-cols-1 sm:justify-items-end sm:gap-12">
            {LEFT.map((f, i) => (
              <FeatureItem key={f.name} f={f} align="right" index={i} />
            ))}
          </div>

          {/* the phone, breathing at the center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 mx-auto w-[210px] sm:order-2 sm:w-[240px]"
          >
            <div className="relative animate-float-slow">
              <div className="pointer-events-none absolute -inset-14 rounded-full bg-[radial-gradient(circle,rgba(233,30,99,0.1)_0%,rgba(217,174,111,0.05)_50%,transparent_75%)]" />
              <PhoneMockup>
                <DiaScreen />
              </PhoneMockup>
            </div>
          </motion.div>

          {/* right constellation of capabilities */}
          <div className="order-3 grid grid-cols-2 gap-8 sm:grid-cols-1 sm:gap-12">
            {RIGHT.map((f, i) => (
              <FeatureItem key={f.name} f={f} align="left" index={i} />
            ))}
          </div>
        </div>

        <div className="mt-12 sm:mt-14">
          <FeatureItem f={BOTTOM} align="center" index={0} />
        </div>
      </div>
    </section>
  );
}
