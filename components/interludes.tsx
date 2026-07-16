"use client";

import Interlude from "./Interlude";
import { useJourney, type Focus, type Momento } from "./JourneyContext";

/** Pregunta I — antes de entrar a las señales: qué quiere hacer visible. */
export function AskFocus() {
  const { focus, setFocus } = useJourney();
  return (
    <Interlude<Focus>
      question="¿Qué quieres hacer visible primero?"
      options={[
        { value: "peso", label: "Mi peso" },
        { value: "energia", label: "Mi energía" },
        { value: "sueno", label: "Mi sueño" },
        { value: "patrones", label: "Mis patrones" },
      ]}
      value={focus}
      onSelect={setFocus}
      ack={{
        peso: "Entonces empezaremos donde la báscula no alcanza a ver.",
        energia: "Entonces miraremos donde tu energía se decide: los días completos.",
        sueno: "Entonces el cielo nocturno será tu primera constelación.",
        patrones: "Entonces vamos directo a lo invisible.",
      }}
    />
  );
}

/** Pregunta II — antes de los patrones reales: cuándo se desordena el día. */
export function AskMomento() {
  const { momento, setMomento } = useJourney();
  return (
    <Interlude<Momento>
      question="¿En qué momento se te desordena el día?"
      options={[
        { value: "mananas", label: "En las mañanas" },
        { value: "tardes", label: "En las tardes" },
        { value: "noches", label: "En las noches" },
      ]}
      value={momento}
      onSelect={setMomento}
      ack={{
        mananas: "Las mañanas dejan huellas. Vamos a mirarlas de cerca.",
        tardes: "Las tardes tienen su propio patrón — ya lo verás.",
        noches: "Las noches… ahí es donde más se esconde. Perfecto.",
      }}
    />
  );
}
