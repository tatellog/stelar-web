import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative border-t hairline py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-xs tracking-widest text-cream/35 sm:flex-row">
        <Image
          src="/art/stelar-wordmark.png"
          alt="Stelar"
          width={72}
          height={18}
          className="h-[14px] w-auto opacity-60"
        />
        <p>Haz visible lo invisible.</p>
        <p>© 2026 Stelar</p>
      </div>
    </footer>
  );
}
