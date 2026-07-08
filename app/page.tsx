import dynamic from "next/dynamic";
import Starfield from "@/components/Starfield";
import ConstellationThread from "@/components/ConstellationThread";
import Nav from "@/components/Nav";
import { SignProvider } from "@/components/SignContext";
import Hero from "@/components/sections/Hero";
import Footer from "@/components/Footer";

/* everything below the fold ships in its own chunk: the hero hydrates
   with a fraction of the JS and the rest streams in behind it */
const SignalField = dynamic(() => import("@/components/sections/SignalField"));
const ConstellationBirth = dynamic(() => import("@/components/sections/ConstellationBirth"));
const PatternEngine = dynamic(() => import("@/components/sections/PatternEngine"));
const Understands = dynamic(() => import("@/components/sections/Understands"));
const ScanIA = dynamic(() => import("@/components/sections/ScanIA"));
const Ecosystem = dynamic(() => import("@/components/sections/Ecosystem"));
const OrbitaAction = dynamic(() => import("@/components/sections/OrbitaAction"));
const PatternExamples = dynamic(() => import("@/components/sections/PatternExamples"));
const DataNoise = dynamic(() => import("@/components/sections/DataNoise"));
const Emblem = dynamic(() => import("@/components/sections/Emblem"));
const ProductOverview = dynamic(() => import("@/components/sections/ProductOverview"));
const Roadmap = dynamic(() => import("@/components/sections/Roadmap"));
const Plans = dynamic(() => import("@/components/sections/Plans"));
const FAQ = dynamic(() => import("@/components/sections/FAQ"));
const FinalCTA = dynamic(() => import("@/components/sections/FinalCTA"));

/*
 * El viaje — capítulos del brief V2:
 * I Oscuridad · II Señales · III Conexiones · IV Tu constelación ·
 * V IA Pattern Engine · VI Tu universo (todo lo que Stelar entiende) ·
 * VII Scan IA (flujo completo: foto/texto → ajuste → guardar) ·
 * VIII Wearables (Apple Health, Garmin, Oura, Samsung → una historia) ·
 * IX Órbita en acción · X Patrones reales (ejemplos) ·
 * XI La evidencia · XII El emblema (clímax) · Final.
 * Primera mitad = emoción; segunda mitad = entender el producto.
 */
export default function Home() {
  return (
    <main className="cosmic-gradient relative">
      <Starfield />
      <SignProvider>
        {/* el hilo: la constelación protagonista que nunca se resetea —
            cada capítulo enciende una estrella más */}
        <ConstellationThread />
        <Nav />
        <Hero />
  
        <SignalField />
        <ConstellationBirth />
        <PatternEngine />
        <Understands />
        <ScanIA />
        <Ecosystem />
        <OrbitaAction />
        <PatternExamples />
        <DataNoise />
        <Emblem />
        {/* después del clímax emocional, las secciones racionales de
            conversión: producto, roadmap, planes y preguntas */}
        <ProductOverview />
        <Roadmap />
        <Plans />
        <FAQ />
        <FinalCTA />
        <Footer />
      </SignProvider>
    </main>
  );
}
