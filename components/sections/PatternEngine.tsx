import Reveal from "../Reveal";

/**
 * Capítulo V — IA Pattern Engine.
 * Palabras solas sobre el cielo abierto (la red de nodos se retiró a
 * pedido de la usuaria). Dos beats de copy en flujo normal — nada de
 * pin ni capas absolutas: no pueden encimarse jamás.
 */
export default function PatternEngine() {
  return (
    <section className="relative">
      <div className="flex min-h-screen items-center justify-center px-6">
        <Reveal className="max-w-2xl text-center">
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
      </div>

      <div className="flex min-h-[70vh] items-center justify-center px-6 pb-28">
        <Reveal className="max-w-xl text-center">
          <p className="text-[13px] uppercase tracking-[0.35em] text-gold">
            IA Pattern Engine
          </p>
          <p className="mt-4 text-lg leading-relaxed text-cream/70">
            Encuentra relaciones entre tus registros para mostrarte{" "}
            <span className="font-serif italic text-gold">
              patrones que normalmente no verías.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
