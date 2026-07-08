/** Shared Canvas 2D drawing language for the journey's scenes.
 *  Every light is a single radial falloff — never a hard circle. */

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
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, colorA(color, alpha));
  g.addColorStop(core, colorA(color, alpha * 0.45));
  g.addColorStop(1, colorA(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
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
