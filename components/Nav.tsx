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
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a href="#" className="flex items-center gap-2.5">
          <Image
            src="/art/stelar-icon.png"
            alt=""
            width={26}
            height={26}
            className="animate-orbit"
          />
          <Image
            src="/art/stelar-wordmark.png"
            alt="Stelar"
            width={88}
            height={22}
            className="h-[18px] w-auto opacity-90"
          />
        </a>
        <div className="hidden items-center gap-8 text-xs tracking-widest text-cream/60 md:flex">
          <a href="#promesa" className="transition-colors hover:text-cream">
            La promesa
          </a>
          <a href="#orbita" className="transition-colors hover:text-cream">
            Órbita
          </a>
          <a href="#alma" className="transition-colors hover:text-cream">
            Alma Celeste
          </a>
        </div>
        <a
          href="#beta"
          className="rounded-full border border-pink-soft/60 px-5 py-2 text-xs font-medium tracking-wide text-cream transition-all duration-300 hover:bg-pink-soft/10 hover:shadow-[0_0_24px_rgba(233,30,99,0.35)]"
        >
          Únete a la beta
        </a>
      </nav>
    </motion.header>
  );
}
