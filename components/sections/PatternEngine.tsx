import Reveal from "../Reveal";

/**
 * Capítulo V — IA Pattern Engine.
 * Palabras solas sobre el cielo abierto (la red de nodos se retiró a
 * pedido de la usuaria). Un solo bloque centrado: título, promesa y
 * el nombre del motor, respirando juntos.
 */
export default function PatternEngine() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 py-28">
      <div className="max-w-2xl text-center">
        <Reveal>
          <p className="mb-4 text-[13px] uppercase tracking-[0.35em] text-gold">
            Capítulo V · IA Pattern Engine
          </p>
          <h2 className="font-sans text-3xl font-black leading-[1.08] tracking-tight text-cream sm:text-5xl">
            Tus registros empiezan a{" "}
            <span className="font-serif italic font-medium text-pink text-glow-pink">
              hablar entre ellos.
            </span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-cream/60 sm:text-lg">
            Cada dato parece pequeño. Juntos cuentan una historia.
          </p>
        </Reveal>

        <Reveal delay={0.35} className="mx-auto mt-14 max-w-xl">
          <span aria-hidden className="mb-6 inline-block h-px w-16 bg-gold/30" />
          <p className="text-lg leading-relaxed text-cream/70">
            El{" "}
            <span className="font-semibold text-cream/90">IA Pattern Engine</span>{" "}
            encuentra relaciones entre tus registros para mostrarte{" "}
            <span className="font-serif italic text-gold">
              patrones que normalmente no verías.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
