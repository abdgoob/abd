import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const temporaryDirectory = path.join(root, ".next", "crav-capture");
const outputDirectory = path.join(root, "public", "media", "crav");

await mkdir(temporaryDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 1,
  colorScheme: "light",
});

await page.goto("https://www.cravburgers.shop/", {
  waitUntil: "domcontentloaded",
  timeout: 60_000,
});
await page.waitForTimeout(4_000);
await page.evaluate(async () => {
  await document.fonts.ready;
});

const desktopFrames = [
  ["crav-hero", 0],
  ["crav-editorial", 0.2],
  ["crav-menu", 0.42],
  ["crav-ordering", 0.64],
  ["crav-ingredients", 0.84],
];

for (const [name, ratio] of desktopFrames) {
  await page.evaluate((position) => {
    const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: maximum * position, behavior: "instant" });
  }, ratio);
  await page.waitForTimeout(1_100);

  const pngPath = path.join(temporaryDirectory, `${name}.png`);
  await page.screenshot({ path: pngPath });
  await sharp(pngPath)
    .resize(1600, 1000, { fit: "cover" })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(outputDirectory, `${name}.webp`));
}

const mobile = await browser.newPage({
  viewport: { width: 450, height: 700 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  colorScheme: "light",
});

await mobile.goto("https://www.cravburgers.shop/", {
  waitUntil: "domcontentloaded",
  timeout: 60_000,
});
await mobile.waitForTimeout(4_000);
await mobile.evaluate(async () => {
  await document.fonts.ready;
  const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  window.scrollTo({ top: maximum * 0.32, behavior: "instant" });
});
await mobile.waitForTimeout(1_100);

const mobilePng = path.join(temporaryDirectory, "crav-mobile.png");
await mobile.screenshot({ path: mobilePng });
await sharp(mobilePng)
  .resize(900, 1400, { fit: "cover" })
  .webp({ quality: 84, effort: 5 })
  .toFile(path.join(outputDirectory, "crav-mobile.webp"));

console.log(
  JSON.stringify(
    {
      scrollHeight: await page.evaluate(() => document.documentElement.scrollHeight),
      files: [...desktopFrames.map(([name]) => `${name}.webp`), "crav-mobile.webp"],
    },
    null,
    2,
  ),
);

await browser.close();
