"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import OrbitaChrome from "./OrbitaChrome";
import { useSign } from "../SignContext";

/** The real Mes view: the emblem resting inside its ceremonial frame,
 *  "% revelado" and the month's discovery. */
export default function MesScreen() {
  const { sign } = useSign();
  const name = sign.charAt(0).toUpperCase() + sign.slice(1);
  const glyphUrl = `url(/zodiaco/${sign}.svg)`;

  return (
    <OrbitaChrome
      active="mes"
      title="¿Qué estás construyendo?"
      subtitle="No es una meta. Es lo que tus acciones empezaron a construir."
    >
      <div className="flex h-full flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-36 w-36"
        >
          {/* golden halo + ceremonial frame + the emblem itself */}
          <div className="absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(232,184,114,0.22)_0%,rgba(217,174,111,0.08)_55%,transparent_75%)]" />
          <Image src="/reveal/emblem-frame.svg" alt="" fill sizes="144px" className="object-contain" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/emblems/${sign}/f10.webp`}
            alt={`Emblema de ${name}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-[15%] h-[70%] w-[70%] object-contain"
            draggable={false}
          />
          <span
            aria-hidden
            className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1 bg-gold"
            style={{
              WebkitMaskImage: glyphUrl,
              maskImage: glyphUrl,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1 }}
        >
          <p className="font-serif text-xl italic leading-tight">{name}</p>
          <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.28em] text-gold">
            87% revelado
          </p>
          <p className="mt-1.5 text-[10px] leading-snug text-cream/55">
            Tu {name} se dibuja con tu constancia, no con tu peso.
          </p>
          <p className="mt-1 text-[10.5px] font-semibold text-pink">
            Algo se reveló este mes.
          </p>
          <p className="mt-0.5 font-serif text-[10.5px] italic text-cream/60">
            Tu {name} ya puede verse.
          </p>
        </motion.div>
      </div>
    </OrbitaChrome>
  );
}
