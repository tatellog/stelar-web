"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Las respuestas del viaje — lo que la visitante le cuenta al
 * observatorio. Tiñen copys más adelante (patrones reales, cierre).
 * Persisten en sessionStorage; sin respuesta, todo cae a lo genérico.
 */

export type Focus = "peso" | "energia" | "sueno" | "patrones";
export type Momento = "mananas" | "tardes" | "noches";

export const FOCUS_TXT: Record<Focus, string> = {
  peso: "tu peso",
  energia: "tu energía",
  sueno: "tu sueño",
  patrones: "tus patrones",
};
export const MOMENTO_TXT: Record<Momento, string> = {
  mananas: "tus mañanas",
  tardes: "tus tardes",
  noches: "tus noches",
};

type Journey = {
  focus: Focus | null;
  momento: Momento | null;
  setFocus: (f: Focus) => void;
  setMomento: (m: Momento) => void;
};

const Ctx = createContext<Journey>({
  focus: null,
  momento: null,
  setFocus: () => {},
  setMomento: () => {},
});

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [focus, setFocusState] = useState<Focus | null>(null);
  const [momento, setMomentoState] = useState<Momento | null>(null);

  useEffect(() => {
    try {
      const f = sessionStorage.getItem("stelar:focus") as Focus | null;
      const m = sessionStorage.getItem("stelar:momento") as Momento | null;
      if (f) setFocusState(f);
      if (m) setMomentoState(m);
    } catch {
      // storage bloqueado: el viaje sigue, solo sin memoria
    }
  }, []);

  const setFocus = (f: Focus) => {
    setFocusState(f);
    try {
      sessionStorage.setItem("stelar:focus", f);
    } catch {}
  };
  const setMomento = (m: Momento) => {
    setMomentoState(m);
    try {
      sessionStorage.setItem("stelar:momento", m);
    } catch {}
  };

  return (
    <Ctx.Provider value={{ focus, momento, setFocus, setMomento }}>
      {children}
    </Ctx.Provider>
  );
}

export const useJourney = () => useContext(Ctx);
