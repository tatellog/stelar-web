"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Nav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 1.1, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-deep/90 via-deep/60 to-transparent backdrop-blur-[6px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <a href="#" className="-my-2 flex shrink-0 items-center gap-2.5 py-2 sm:gap-3.5">
          <Image
            src="/art/stelar-icon-trim.webp"
            alt=""
            width={46}
            height={46}
            className="h-8 w-8 animate-orbit sm:h-[46px] sm:w-[46px]"
          />
          <Image
            src="/art/stelar-wordmark-trim.webp"
            alt="Stelar"
            width={186}
            height={26}
            className="h-[18px] w-auto opacity-95 sm:h-[26px]"
          />
        </a>
        <div className="hidden items-center gap-10 text-sm tracking-[0.15em] text-cream/65 md:flex">
          <a href="#senales" className="py-2 transition-colors hover:text-cream">
            El viaje
          </a>
          <a href="#orbita" className="py-2 transition-colors hover:text-cream">
            Órbita
          </a>
          <a href="#emblema" className="py-2 transition-colors hover:text-cream">
            El emblema
          </a>
        </div>
        <a
          href="#beta"
          className="shrink-0 whitespace-nowrap rounded-full border border-pink-soft/60 px-5 py-3 text-[13px] font-medium tracking-wide text-cream transition-all duration-300 hover:bg-pink-soft/10 hover:shadow-[0_0_24px_rgba(233,30,99,0.35)] sm:px-6 sm:py-2.5 sm:text-sm"
        >
          Únete a la beta
        </a>
      </nav>
    </motion.header>
  );
}
