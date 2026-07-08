/** Shared Canvas 2D drawing language for the journey's scenes.
 *  Every light is a single radial falloff — never a hard circle. */

/* The falloff is rasterized ONCE per (color, core) into a small sprite
 * and stamped with drawImage + globalAlpha. Same pixels as the old
 * per-call createRadialGradient, but zero allocations per frame — the
 * scenes stamp thousands of these every frame. */
const SPRITE_R = 64;
const spriteCache = new Map<string, HTMLCanvasElement>();

function dotSprite(color: string, core: number): HTMLCanvasElement {
  const key = `${color}|${core.toFixed(2)}`;
  let s = spriteCache.get(key);
  if (!s) {
    s = document.createElement("canvas");
    s.width = s.height = SPRITE_R * 2;
    const c = s.getContext("2d")!;
    const g = c.createRadialGradient(SPRITE_R, SPRITE_R, 0, SPRITE_R, SPRITE_R, SPRITE_R);
    g.addColorStop(0, colorA(color, 1));
    g.addColorStop(core, colorA(color, 0.45));
    g.addColorStop(1, colorA(color, 0));
    c.fillStyle = g;
    c.fillRect(0, 0, SPRITE_R * 2, SPRITE_R * 2);
    spriteCache.set(key, s);
  }
  return s;
}

export function softDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
  core = 0.35,
) {
  if (alpha <= 0 || r <= 0) return;
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * Math.min(1, alpha);
  ctx.drawImage(dotSprite(color, core), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = prev;
}

/** softDot for scenes that keep colors as [r,g,b] tuples. mid <= 0 skips
 *  the middle stop (a thinner falloff), matching the legacy local copies. */
export function softDotRGB(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  c: readonly [number, number, number],
  alpha: number,
  mid = 0.35,
) {
  if (alpha <= 0 || r <= 0) return;
  const key = `${c[0]},${c[1]},${c[2]}|${mid.toFixed(2)}`;
  let s = spriteCache.get(key);
  if (!s) {
    s = document.createElement("canvas");
    s.width = s.height = SPRITE_R * 2;
    const sc = s.getContext("2d")!;
    const g = sc.createRadialGradient(SPRITE_R, SPRITE_R, 0, SPRITE_R, SPRITE_R, SPRITE_R);
    g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`);
    if (mid > 0) g.addColorStop(mid, `rgba(${c[0]},${c[1]},${c[2]},0.45)`);
    g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    sc.fillStyle = g;
    sc.fillRect(0, 0, SPRITE_R * 2, SPRITE_R * 2);
    spriteCache.set(key, s);
  }
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * Math.min(1, alpha);
  ctx.drawImage(s, x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = prev;
}

export function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) {
  if (alpha <= 0 || r <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = colorA(color, alpha);
  ctx.beginPath();
  const w = r * 0.22;
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(w, -w, r, 0);
  ctx.quadraticCurveTo(w, w, 0, r);
  ctx.quadraticCurveTo(-w, w, -r, 0);
  ctx.quadraticCurveTo(-w, -w, 0, -r);
  ctx.fill();
  ctx.restore();
}

/** hex (#RRGGBB) or rgba() → rgba with the given alpha */
export function colorA(color: string, a: number): string {
  const cl = Math.max(0, Math.min(1, a));
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${cl})`;
  }
  return color.replace(/[\d.]+\)$/, `${cl})`);
}

/** deterministic pseudo-random, stable across renders */
export function prand(seed: number): number {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/** smooth 0..1 ramp of p between a and b */
export function ramp(p: number, a: number, b: number): number {
  const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Sizes a canvas to its parent at devicePixelRatio; returns cleanup. */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  onResize?: (w: number, h: number) => void,
): () => void {
  const apply = () => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    onResize?.(w, h);
  };
  apply();
  window.addEventListener("resize", apply);
  return () => window.removeEventListener("resize", apply);
}
