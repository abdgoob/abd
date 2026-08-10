import sharp from "sharp";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";

const sources = process.argv.slice(2);
const projects = ["north-co", "nova-ai", "archform", "forma-studio", "northstar"];

if (sources.length !== projects.length) {
  throw new Error(`Expected ${projects.length} generated image paths.`);
}

const results = [];

for (const [index, source] of sources.entries()) {
  const project = projects[index];
  const outputDirectory = path.join(process.cwd(), "public", "media", project);
  const destination = path.join(outputDirectory, `${project}-hero.webp`);
  await mkdir(outputDirectory, { recursive: true });
  await sharp(source)
    .resize(1536, 1024, { fit: "cover" })
    .webp({ quality: 84, effort: 5 })
    .toFile(destination);

  results.push({
    file: path.relative(process.cwd(), destination),
    bytes: (await stat(destination)).size,
  });
}

console.log(JSON.stringify(results, null, 2));
