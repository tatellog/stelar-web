import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import { SignProvider } from "@/components/SignContext";
import Hero from "@/components/sections/Hero";

import SignalField from "@/components/sections/SignalField";
import ConstellationBirth from "@/components/sections/ConstellationBirth";
import Evidence from "@/components/sections/Evidence";
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
 * V Tu Órbita (aparece el teléfono) · VI IA Pattern Engine ·
 * VII Scan IA · VIII Ecosistema · IX Órbita en acción ·
 * X No más datos sueltos · XI El emblema (clímax) · XII Final.
 * El producto no existe hasta el capítulo V: la protagonista es ella.
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
        <Evidence />
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
