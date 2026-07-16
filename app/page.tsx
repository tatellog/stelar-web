import dynamic from "next/dynamic";
import Starfield from "@/components/Starfield";
import Opening from "@/components/Opening";
import StarCursor from "@/components/StarCursor";
import Handoff from "@/components/Handoff";
import { JourneyProvider } from "@/components/JourneyContext";
import { AskFocus, AskMomento } from "@/components/interludes";
import AutoPilot from "@/components/AutoPilot";
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
        <JourneyProvider>
        {/* la ceremonia de entrada y el cursor-estrella (solo desktop) */}
        <Opening />
        <StarCursor />
        {/* el viaje puede llevarte solo; cualquier gesto devuelve el control */}
        <AutoPilot />
        <Nav />
        <Hero />
        {/* el observatorio pregunta: la respuesta tiñe el viaje */}
        <AskFocus />
        <SignalField />
        <ConstellationBirth />
        {/* handoffs: el hilo de luz cose los capítulos entre sí */}
        <Handoff />
        <PatternEngine />
        <Understands />
        <Handoff />
        <ScanIA />
        <Ecosystem />
        <Handoff />
        <OrbitaAction />
        <AskMomento />
        <PatternExamples />
        <DataNoise />
        <Emblem />
        <Handoff />
        {/* después del clímax emocional, las secciones racionales de
            conversión: producto, roadmap, planes y preguntas */}
        <ProductOverview />
        <Roadmap />
        <Plans />
        <FAQ />
        <FinalCTA />
        <Footer />
        </JourneyProvider>
      </SignProvider>
    </main>
  );
}
