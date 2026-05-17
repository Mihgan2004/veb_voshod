/**
 * Трассировка растрового логотипа в SVG (imagetracerjs) + экспорт path в TS для Next.
 * Использование: node scripts/trace-rassvet-logo.mjs <вход.jpg|png> [выход.svg]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ImageTracer = require("imagetracerjs/imagetracer_v1.2.6.js");

const inFile = process.argv[2];
const outFile = process.argv[3] ?? path.join(__dirname, "../public/branding/rassvet-logo-traced.svg");
const pathsOut = path.join(__dirname, "../components/home/EarthScrollSection/rassvetTracedPaths.ts");

if (!inFile) {
  console.error("Usage: node scripts/trace-rassvet-logo.mjs <input> [output.svg]");
  process.exit(1);
}

const DEBUG_MASK = process.env.RASSVET_TRACE_DEBUG === "1";

const { data, info } = await sharp(inFile)
  .resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const wOrig = info.width;
const hOrig = info.height;
const stride = info.channels;
const rgba = new Uint8ClampedArray(wOrig * hOrig * 4);
for (let pix = 0, j = 0; pix < wOrig * hOrig; pix++, j += stride) {
  const r = data[j];
  const g = data[j + 1];
  const b = data[j + 2];
  const isYellow = r > 85 && g > 70 && b < 200 && r - b > 35;
  const v = isYellow ? 255 : 0;
  const o = pix * 4;
  rgba[o] = v;
  rgba[o + 1] = v;
  rgba[o + 2] = v;
  rgba[o + 3] = 255;
}

let minX = wOrig;
let minY = hOrig;
let maxX = 0;
let maxY = 0;
for (let y = 0; y < hOrig; y++) {
  for (let x = 0; x < wOrig; x++) {
    const i = (y * wOrig + x) * 4;
    if (rgba[i] > 128) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}
const pad = 6;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(wOrig - 1, maxX + pad);
maxY = Math.min(hOrig - 1, maxY + pad);
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;
const cropped = new Uint8ClampedArray(cw * ch * 4);
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = ((y + minY) * wOrig + (x + minX)) * 4;
    const di = (y * cw + x) * 4;
    cropped[di] = rgba[si];
    cropped[di + 1] = rgba[si + 1];
    cropped[di + 2] = rgba[si + 2];
    cropped[di + 3] = rgba[si + 3];
  }
}

const myImageData = { width: cw, height: ch, data: cropped };

if (DEBUG_MASK) {
  await sharp(Buffer.from(cropped), { raw: { width: cw, height: ch, channels: 4 } })
    .png()
    .toFile(path.join(__dirname, "../public/branding/rassvet-logo-mask-debug.png"));
}

const options = {
  ltres: 0.5,
  qtres: 0.5,
  pathomit: 2,
  rightangleenhance: true,
  numberofcolors: 2,
  colorquantcycles: 1,
  colorsampling: 2,
  scale: 1,
  roundcoords: 1,
  viewbox: true,
  desc: false,
  linefilter: false,
  strokewidth: 0,
  layering: 0,
  pal: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
};

const svg = ImageTracer.imagedataToSVG(myImageData, options);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, svg);

/** d="..." из всех path, только белые заливки (силуэт логотипа) */
const pathTagRe = /<path[^>]*\bfill="rgb\((\d+),(\d+),(\d+)\)"[^>]*\bd="([^"]*)"[^>]*\/?>/g;
const tracedPaths = [];
let m;
while ((m = pathTagRe.exec(svg)) !== null) {
  const r = Number(m[1]);
  const g = Number(m[2]);
  const b = Number(m[3]);
  const d = m[4];
  if (r > 200 && g > 200 && b > 200) {
    tracedPaths.push(d);
  }
}

const ts = `/* Автогенерация: node scripts/trace-rassvet-logo.mjs — не править руками */\nexport const RASSVET_TRACED_VIEWBOX = "0 0 ${cw} ${ch}" as const;\nexport const RASSVET_TRACED_PATHS = ${JSON.stringify(tracedPaths, null, 2)} as const;\n`;
fs.writeFileSync(pathsOut, ts);

console.log("Wrote", outFile, `crop ${cw}x${ch}`, "paths", tracedPaths.length, "->", pathsOut);
