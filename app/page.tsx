import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import { SignProvider } from "@/components/SignContext";
import Hero from "@/components/sections/Hero";

import SignalField from "@/components/sections/SignalField";
import ConstellationBirth from "@/components/sections/ConstellationBirth";
import PatternEngine from "@/components/sections/PatternEngine";
import ScanIA from "@/components/sections/ScanIA";
import Ecosystem from "@/components/sections/Ecosystem";
import OrbitaAction from "@/components/sections/OrbitaAction";
import DataNoise from "@/components/sections/DataNoise";
import Emblem from "@/components/sections/Emblem";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/Footer";

/*
 * El viaje — capítulos del brief:
 * I Oscuridad · II Señales · III Conexiones · IV Tu constelación ·
 * V IA Pattern Engine · VI Scan IA (aparece el teléfono) ·
 * VII Ecosistema · VIII Órbita en acción ·
 * IX No más datos sueltos · X El emblema (clímax) · Final.
 * El producto no existe hasta pasada la mitad: la protagonista es ella.
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
        <ScanIA />
        <Ecosystem />
        <OrbitaAction />
        <DataNoise />
        <Emblem />
        <FinalCTA />
        <Footer />
      </SignProvider>
    </main>
  );
}
