import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import { SignProvider } from "@/components/SignContext";
import Hero from "@/components/sections/Hero";

import SignalField from "@/components/sections/SignalField";
import ConstellationBirth from "@/components/sections/ConstellationBirth";
import Evidence from "@/components/sections/Evidence";
import Emblem from "@/components/sections/Emblem";
import Comparison from "@/components/sections/Comparison";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/Footer";

/*
 * El viaje — capítulos del brief:
 * I Oscuridad · II Señales · III Conexiones · IV Tu constelación ·
 * V Tu Órbita (aparece el teléfono) ·
 * VI El emblema (clímax) · VII Comparación · Final.
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
        <Emblem />
        <Comparison />
        <FinalCTA />
        <Footer />
      </SignProvider>
    </main>
  );
}
