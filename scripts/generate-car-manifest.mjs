// Scans public/cars/<model-id>/ for photo files and writes
// src/lib/car-photos.generated.json, grouping filenames by angle so the
// quiz can randomly pick among multiple photos of the same angle.
//
// Naming convention (see public/cars/README.md):
//   <angle>.<ext>        first photo for that angle
//   <angle>-2.<ext>       second photo for that angle
//   <angle>-3.<ext>       third, and so on
// angle is one of: front, three-quarter, side, rear
// ext is one of: jpg, jpeg, png
//
// Runs automatically before `npm run dev` and `npm run build` (see
// package.json's predev/prebuild scripts). Run it manually with
// `npm run generate:cars` any time after adding photos without restarting.

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const carsDir = join(__dirname, "..", "public", "cars");
const outFile = join(__dirname, "..", "src", "lib", "car-photos.generated.json");

const ANGLES = ["front", "three-quarter", "side", "rear"];
const PHOTO_PATTERN = /^(front|three-quarter|side|rear)(?:-(\d+))?\.(jpe?g|png)$/i;

const manifest = {};

for (const modelId of readdirSync(carsDir)) {
  const modelDir = join(carsDir, modelId);
  if (!statSync(modelDir).isDirectory()) continue;

  const byAngle = { front: [], "three-quarter": [], side: [], rear: [] };

  for (const file of readdirSync(modelDir)) {
    const match = file.match(PHOTO_PATTERN);
    if (!match) continue;
    const angle = match[1].toLowerCase();
    byAngle[angle].push(file);
  }

  for (const angle of ANGLES) {
    byAngle[angle].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  manifest[modelId] = byAngle;
}

const sortedManifest = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
);

writeFileSync(outFile, JSON.stringify(sortedManifest, null, 2) + "\n");

const totalPhotos = Object.values(sortedManifest).reduce(
  (sum, angles) => sum + Object.values(angles).reduce((s, files) => s + files.length, 0),
  0,
);
console.log(
  `car-photos.generated.json: ${Object.keys(sortedManifest).length} models, ${totalPhotos} photos`,
);
