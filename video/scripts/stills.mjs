import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const [outDir, ...rest] = process.argv.slice(2);
const id = rest[0] && isNaN(Number(rest[0])) ? rest.shift() : "Showreel";
const frames = rest;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id });
for (const f of frames) {
  await renderStill({ serveUrl, composition, frame: Number(f), output: path.join(outDir, `f${String(f).padStart(3, "0")}.png`), scale: 0.5 });
  process.stdout.write(`${f} `);
}
console.log("done");
