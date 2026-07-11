import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative border-t hairline py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-[13px] tracking-widest text-cream/35 sm:flex-row">
        <Image
          src="/art/stelar-wordmark-trim.png"
          alt="Stelar"
          width={100}
          height={14}
          className="h-[14px] w-auto opacity-60"
        />
        <p>Haz visible lo invisible.</p>
        <p>© 2026 Stelar</p>
      </div>
    </footer>
  );
}
