import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import { SignProvider } from "@/components/SignContext";
import Hero from "@/components/sections/Hero";

import SignalField from "@/components/sections/SignalField";
import Constellation from "@/components/sections/Constellation";
import Evidence from "@/components/sections/Evidence";
import Orbita from "@/components/sections/Orbita";
import Emblem from "@/components/sections/Emblem";
import Comparison from "@/components/sections/Comparison";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/Footer";

/*
 * El viaje — capítulos del brief:
 * I Oscuridad · II Señales · III Conexiones · IV Tu constelación ·
 * V Haz visible lo invisible (aparece el teléfono) · VI Órbita ·
 * VII El emblema (clímax) · VIII Comparación · Final.
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
        <Constellation />
        <Evidence />
        <Orbita />
        <Emblem />
        <Comparison />
        <FinalCTA />
        <Footer />
      </SignProvider>
    </main>
  );
}
