import { FIGURES } from "./figures";
import type { ZodiacSign } from "./types";

export type Rect = { x: number; y: number; w: number; h: number };

/** The app's real sign figure mapped into an arbitrary rectangle, so every
 *  constellation drawn on the landing is a true Stelar figure. */
export function figureInRect(sign: ZodiacSign, rect: Rect) {
  const def = FIGURES[sign];
  return {
    label: def.label,
    pts: def.stars.map((s) => ({
      x: rect.x + s.x * rect.w,
      y: rect.y + s.y * rect.h,
      mag: s.mag,
      name: s.name,
    })),
    lines: def.lines as readonly (readonly [number, number])[],
  };
}

/** First `count` stars of a figure (and only the lines between them) —
 *  for small canvases where the full figure would be too dense. */
export function figureSubset(sign: ZodiacSign, rect: Rect, count: number) {
  const def = FIGURES[sign];
  return {
    label: def.label,
    pts: def.stars.slice(0, count).map((s) => ({
      x: rect.x + s.x * rect.w,
      y: rect.y + s.y * rect.h,
      mag: s.mag,
      name: s.name,
    })),
    lines: def.lines.filter(([a, b]) => a < count && b < count) as readonly (readonly [
      number,
      number,
    ])[],
  };
}
