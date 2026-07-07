"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 2.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-deep/90 via-deep/60 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="#" className="flex items-center gap-3.5">
          <Image
            src="/art/stelar-icon.png"
            alt=""
            width={44}
            height={44}
            className="animate-orbit"
          />
          <Image
            src="/art/stelar-wordmark.png"
            alt="Stelar"
            width={130}
            height={32}
            className="h-[26px] w-auto opacity-95"
          />
        </a>
        <div className="hidden items-center gap-10 text-sm tracking-[0.15em] text-cream/65 md:flex">
          <a href="#promesa" className="transition-colors hover:text-cream">
            El viaje
          </a>
          <a href="#orbita" className="transition-colors hover:text-cream">
            Órbita
          </a>
          <a href="#emblema" className="transition-colors hover:text-cream">
            El emblema
          </a>
        </div>
        <a
          href="#beta"
          className="rounded-full border border-pink-soft/60 px-6 py-2.5 text-sm font-medium tracking-wide text-cream transition-all duration-300 hover:bg-pink-soft/10 hover:shadow-[0_0_24px_rgba(233,30,99,0.35)]"
        >
          Únete a la beta
        </a>
      </nav>
    </motion.header>
  );
}
