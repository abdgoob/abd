import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const temporaryDirectory = path.join(root, ".next", "vortex-capture");
const outputDirectory = path.join(root, "public", "media", "vortex");

await mkdir(temporaryDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

await page.goto("https://gym-vortex.vercel.app/", {
  waitUntil: "domcontentloaded",
  timeout: 60_000,
});
await page.locator('[data-animate="dumbbell-parallax"] canvas').waitFor({
  state: "visible",
  timeout: 30_000,
});
await page.evaluate(async () => {
  await document.fonts.ready;
  window.scrollTo({ top: 0, behavior: "instant" });
});
await page.addStyleTag({
  content: "body > div.fixed.pointer-events-none { display: none !important; }",
});
await page.waitForTimeout(4_000);

const pngPath = path.join(temporaryDirectory, "vortex-hero.png");
const outputPath = path.join(outputDirectory, "vortex-hero.webp");

await page.screenshot({ path: pngPath });
await sharp(pngPath)
  .resize(1600, 1000, { fit: "cover" })
  .webp({ quality: 84, effort: 5 })
  .toFile(outputPath);

console.log(
  JSON.stringify(
    {
      file: path.relative(root, outputPath),
      source: page.url(),
      canvas: await page
        .locator('[data-animate="dumbbell-parallax"] canvas')
        .evaluate((element) => ({
          width: element.width,
          height: element.height,
        })),
    },
    null,
    2,
  ),
);

await browser.close();
