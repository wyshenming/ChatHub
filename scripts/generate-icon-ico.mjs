import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { imagesToIco } from "png-to-ico";
import { readPNG, resize } from "png-to-ico/lib/png.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(projectRoot, "build", "icon.png");
const targetPath = resolve(projectRoot, "build", "icon.ico");
const iconSizes = [16, 20, 24, 28, 32, 40, 48, 56, 64, 128, 256];

const source = await readPNG(sourcePath);
if (source.width !== source.height) {
  throw new Error("Icon source must be square: " + source.width + "x" + source.height);
}

const images = iconSizes.map((size) => resize(source, size, size, "bicubicInterpolation"));
await writeFile(targetPath, imagesToIco(images));

console.log("Generated " + targetPath + " with sizes: " + iconSizes.join(", "));
