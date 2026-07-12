/** El emblema descargable — the artifact you take with you.
 *  When someone joins the beta, their chosen constellation becomes a
 *  1080×1350 image (IG-friendly): the emblem, the real traced figure,
 *  and the brand promise. Observatory language only — no readings. */

import { FIGURES } from "@/lib/zodiac/figures";
import type { ZodiacSign } from "@/lib/zodiac/types";

const W = 1080;
const H = 1350;

function prand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** next/font renames families — read the real names from the CSS vars */
function fontFamilies() {
  const css = getComputedStyle(document.documentElement);
  const sans = css.getPropertyValue("--font-hanken").trim() || "system-ui";
  const serif = css.getPropertyValue("--font-cormorant").trim() || "Georgia";
  return { sans, serif };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const d = r * 0.26;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + d, y - d, x + r, y);
  ctx.quadraticCurveTo(x + d, y + d, x, y + r);
  ctx.quadraticCurveTo(x - d, y + d, x - r, y);
  ctx.quadraticCurveTo(x - d, y - d, x, y - r);
  ctx.closePath();
  ctx.fill();
}

async function render(sign: ZodiacSign): Promise<string> {
  const def = FIGURES[sign];
  await document.fonts.ready;
  const { sans, serif } = fontFamilies();

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  /* ── the night ── */
  ctx.fillStyle = "#0A0608";
  ctx.fillRect(0, 0, W, H);
  let g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, H * 0.62);
  g.addColorStop(0, "rgba(43,13,36,0.85)");
  g.addColorStop(1, "rgba(43,13,36,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W * 0.82, H * 0.12, 0, W * 0.82, H * 0.12, 560);
  g.addColorStop(0, "rgba(233,30,99,0.10)");
  g.addColorStop(1, "rgba(233,30,99,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W * 0.14, H * 0.86, 0, W * 0.14, H * 0.86, 620);
  g.addColorStop(0, "rgba(217,174,111,0.08)");
  g.addColorStop(1, "rgba(217,174,111,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  /* quiet dust, deterministic */
  for (let i = 0; i < 150; i++) {
    const x = prand(i * 3.1) * W;
    const y = prand(i * 5.7) * H;
    const r = 0.7 + prand(i * 7.3) * 1.8;
    const gold = prand(i * 13.7) > 0.88;
    ctx.fillStyle = gold
      ? `rgba(232,184,114,${0.25 + prand(i * 11.9) * 0.5})`
      : `rgba(244,236,222,${0.1 + prand(i * 11.9) * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── wordmark ── */
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const ls = "letterSpacing" in ctx;
  if (ls) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "16px";
  ctx.font = `600 40px ${sans}`;
  ctx.fillStyle = "rgba(244,236,222,0.92)";
  ctx.fillText("STELAR", W / 2 + 8, 128);
  if (ls) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

  /* ── the emblem and its constellation, sharing one art box ── */
  const BOX = 620;
  const cx = W / 2;
  const cy = 600;
  const bx = cx - BOX / 2;
  const by = cy - BOX / 2;

  g = ctx.createRadialGradient(cx, cy, 0, cx, cy, BOX * 0.72);
  g.addColorStop(0, "rgba(255,246,229,0.11)");
  g.addColorStop(0.45, "rgba(217,174,111,0.07)");
  g.addColorStop(1, "rgba(217,174,111,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const emblem = await loadImage(`/emblems/${sign}/f10.webp`);
  const ar = emblem.naturalWidth / emblem.naturalHeight;
  const ew = ar >= 1 ? BOX : BOX * ar;
  const eh = ar >= 1 ? BOX / ar : BOX;
  ctx.globalAlpha = 0.92;
  ctx.drawImage(emblem, cx - ew / 2, cy - eh / 2, ew, eh);
  ctx.globalAlpha = 1;

  /* the traced figure — same coordinates the whole journey used */
  for (const [a, b] of def.lines) {
    const A = def.stars[a];
    const B = def.stars[b];
    ctx.strokeStyle = "rgba(217,174,111,0.5)";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(bx + A.x * BOX, by + A.y * BOX);
    ctx.lineTo(bx + B.x * BOX, by + B.y * BOX);
    ctx.stroke();
  }
  for (const st of def.stars) {
    const hero = st.mag <= 2.3;
    const x = bx + st.x * BOX;
    const y = by + st.y * BOX;
    const halo = ctx.createRadialGradient(x, y, 0, x, y, hero ? 40 : 24);
    halo.addColorStop(0, hero ? "rgba(251,215,227,0.55)" : "rgba(255,233,194,0.4)");
    halo.addColorStop(1, "rgba(233,30,99,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, hero ? 40 : 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = hero ? "#FFF6E5" : "rgba(244,236,222,0.9)";
    sparkle(ctx, x, y, hero ? 15 : 9.5);
  }

  /* ── the words ── */
  const nice = def.label.charAt(0) + def.label.slice(1).toLowerCase();
  ctx.font = `italic 500 78px ${serif}`;
  ctx.fillStyle = "#D9AE6F";
  ctx.fillText(nice, cx, 985);

  if (ls) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "8px";
  ctx.font = `600 26px ${sans}`;
  ctx.fillStyle = "rgba(244,236,222,0.55)";
  ctx.fillText("YA ESTOY EN LA BETA", cx + 4, 1052);
  if (ls) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";

  // headline: sans black + serif italic pink, centered as one line
  const part1 = "Haz visible ";
  const part2 = "lo invisible.";
  ctx.font = `900 64px ${sans}`;
  const w1 = ctx.measureText(part1).width;
  ctx.font = `italic 500 72px ${serif}`;
  const w2 = ctx.measureText(part2).width;
  const x0 = cx - (w1 + w2) / 2;
  ctx.textAlign = "left";
  ctx.font = `900 64px ${sans}`;
  ctx.fillStyle = "#F4ECDE";
  ctx.fillText(part1, x0, 1160);
  ctx.font = `italic 500 72px ${serif}`;
  ctx.fillStyle = "#FF4886";
  ctx.shadowColor = "rgba(233,30,99,0.55)";
  ctx.shadowBlur = 34;
  ctx.fillText(part2, x0 + w1, 1160);
  ctx.shadowBlur = 0;

  ctx.textAlign = "center";
  ctx.font = `500 30px ${sans}`;
  ctx.fillStyle = "rgba(244,236,222,0.45)";
  ctx.fillText("stelar-app.com", cx, 1262);

  // toBlob's callback can starve inside a React event handler in some
  // browsers — the synchronous path is dependable and just as good here
  return canvas.toDataURL("image/png");
}

/** Render + hand off: native share sheet on mobile, download elsewhere. */
export async function saveEmblemCard(sign: ZodiacSign): Promise<boolean> {
  try {
    const dataUrl = await render(sign);
    // the native sheet only on touch devices — on desktop Chrome canShare
    // says yes but the flow is clumsy (and hangs in headless); download there
    const touch = matchMedia("(pointer: coarse)").matches;
    const nav = navigator as Navigator & {
      canShare?: (d: { files: File[] }) => boolean;
    };
    if (touch && typeof nav.canShare === "function") {
      // only the share path needs a File — decode via the fetch data-URL
      // shortcut instead of a hand-rolled atob loop
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `stelar-${sign}.png`, { type: "image/png" });
      if (nav.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Stelar",
            text: "Haz visible lo invisible ✦ stelar-app.com",
          });
          return true;
        } catch {
          // user closed the sheet — fall through to download
        }
      }
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `stelar-${sign}.png`;
    a.click();
    return true;
  } catch {
    return false;
  }
}
