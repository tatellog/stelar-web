import Starfield from "@/components/Starfield";
import Nav from "@/components/Nav";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import RevealScene from "@/components/sections/RevealScene";
import Features from "@/components/sections/Features";
import Orbita from "@/components/sections/Orbita";
import Constellation from "@/components/sections/Constellation";
import AlmaCeleste from "@/components/sections/AlmaCeleste";
import Comparison from "@/components/sections/Comparison";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="cosmic-gradient relative">
      <Starfield />
      <Nav />
      <Hero />
      <Problem />
      <RevealScene />
      <Features />
      <Orbita />
      <Constellation />
      <AlmaCeleste />
      <Comparison />
      <FinalCTA />
      <Footer />
    </main>
  );
}
