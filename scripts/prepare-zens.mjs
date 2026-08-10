import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const sources = process.argv.slice(2);
const names = ["zens-hero", "zens-menu", "zens-assembly", "zens-reservation"];

if (sources.length !== names.length) {
  throw new Error("Expected four generated image paths.");
}

const outputDirectory = path.join(process.cwd(), "public", "media", "zens-den");
await mkdir(outputDirectory, { recursive: true });

for (const [index, source] of sources.entries()) {
  await sharp(source)
    .resize(1536, 1024, { fit: "cover" })
    .webp({ quality: 85, effort: 5 })
    .toFile(path.join(outputDirectory, `${names[index]}.webp`));
}

console.log(names.map((name) => `${name}.webp`).join("\n"));
