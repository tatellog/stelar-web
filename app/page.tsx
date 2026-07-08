import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import { SignProvider } from "@/components/SignContext";
import Hero from "@/components/sections/Hero";

import SignalField from "@/components/sections/SignalField";
import ConstellationBirth from "@/components/sections/ConstellationBirth";
import PatternEngine from "@/components/sections/PatternEngine";
import Understands from "@/components/sections/Understands";
import ScanIA from "@/components/sections/ScanIA";
import Ecosystem from "@/components/sections/Ecosystem";
import OrbitaAction from "@/components/sections/OrbitaAction";
import PatternExamples from "@/components/sections/PatternExamples";
import DataNoise from "@/components/sections/DataNoise";
import Emblem from "@/components/sections/Emblem";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/Footer";

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
        <FinalCTA />
        <Footer />
      </SignProvider>
    </main>
  );
}
