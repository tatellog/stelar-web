"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ZodiacSign } from "@/lib/zodiac/types";

/** The visitor's chosen sign — picked in the Constellation chapter and
 *  carried through the Emblem climax and the closing sky. */
const SignContext = createContext<{
  sign: ZodiacSign;
  setSign: (s: ZodiacSign) => void;
}>({ sign: "leo", setSign: () => {} });

export function SignProvider({ children }: { children: ReactNode }) {
  const [sign, setSign] = useState<ZodiacSign>("leo");
  return (
    <SignContext.Provider value={{ sign, setSign }}>
      {children}
    </SignContext.Provider>
  );
}

export function useSign() {
  return useContext(SignContext);
}
