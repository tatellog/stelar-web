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

/** The figure normalized to its own bounding box and fitted into `rect`
 *  with padding — so the constellation FILLS the canvas instead of
 *  floating small in a corner of the 0..1 space. */
export function figureFit(sign: ZodiacSign, rect: Rect, pad = 0.08) {
  const def = FIGURES[sign];
  const xs = def.stars.map((s) => s.x);
  const ys = def.stars.map((s) => s.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  return {
    label: def.label,
    pts: def.stars.map((s) => ({
      x: rect.x + (pad + ((s.x - minX) / spanX) * (1 - 2 * pad)) * rect.w,
      y: rect.y + (pad + ((s.y - minY) / spanY) * (1 - 2 * pad)) * rect.h,
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
