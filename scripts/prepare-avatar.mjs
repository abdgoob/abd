import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const EXPECTED_SOURCE_SHA256 =
  "CE4060ABA244D93BA45B109D911E7CACB44E3044131C361AC68C40CE4C456DEF";
const EXPECTED_SOURCE_SIZE = { width: 938, height: 1677 };
const EXPECTED_OUTPUT_SIZE = { width: 636, height: 1604 };
const BACKGROUND_DISTANCE_THRESHOLD = 25;
const SAFETY_PADDING = 24;

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, "..");
const sourceArgument = process.argv[2];
if (!sourceArgument) {
  throw new Error("Usage: node scripts/prepare-avatar.mjs <source-image>");
}
const sourcePath = resolve(sourceArgument);
const outputPath = resolve(
  projectRoot,
  "public/media/hero/abdullah-avatar.webp",
);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function median(values) {
  values.sort((left, right) => left - right);
  const middle = Math.floor(values.length / 2);

  if (values.length % 2 === 1) {
    return values[middle];
  }

  return Math.round((values[middle - 1] + values[middle]) / 2);
}

function calculateBorderMedian(pixels, width, height, channels) {
  const red = [];
  const green = [];
  const blue = [];

  const collect = (x, y) => {
    const offset = (y * width + x) * channels;
    red.push(pixels[offset]);
    green.push(pixels[offset + 1]);
    blue.push(pixels[offset + 2]);
  };

  for (let x = 0; x < width; x += 1) {
    collect(x, 0);
    collect(x, height - 1);
  }

  for (let y = 1; y < height - 1; y += 1) {
    collect(0, y);
    collect(width - 1, y);
  }

  return [median(red), median(green), median(blue)];
}

function createEdgeConnectedBackgroundMask(
  pixels,
  width,
  height,
  channels,
  background,
) {
  const pixelCount = width * height;
  const state = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const thresholdSquared = BACKGROUND_DISTANCE_THRESHOLD ** 2;
  let queueHead = 0;
  let queueTail = 0;

  const visit = (index) => {
    if (state[index] !== 0) {
      return;
    }

    const offset = index * channels;
    const redDifference = pixels[offset] - background[0];
    const greenDifference = pixels[offset + 1] - background[1];
    const blueDifference = pixels[offset + 2] - background[2];
    const distanceSquared =
      redDifference ** 2 + greenDifference ** 2 + blueDifference ** 2;

    if (distanceSquared <= thresholdSquared) {
      state[index] = 1;
      queue[queueTail] = index;
      queueTail += 1;
    } else {
      state[index] = 2;
    }
  };

  for (let x = 0; x < width; x += 1) {
    visit(x);
    visit((height - 1) * width + x);
  }

  for (let y = 1; y < height - 1; y += 1) {
    visit(y * width);
    visit(y * width + width - 1);
  }

  while (queueHead < queueTail) {
    const index = queue[queueHead];
    queueHead += 1;
    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) visit(index - 1);
    if (x + 1 < width) visit(index + 1);
    if (y > 0) visit(index - width);
    if (y + 1 < height) visit(index + width);
  }

  const mask = new Uint8Array(pixelCount);
  let backgroundPixelCount = 0;

  for (let index = 0; index < pixelCount; index += 1) {
    if (state[index] === 1) {
      mask[index] = 1;
      backgroundPixelCount += 1;
    }
  }

  return { mask, backgroundPixelCount };
}

function findOpaqueBounds(alpha, width, height) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (alpha[y * width + x] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  assert(right >= left && bottom >= top, "The flood fill removed every pixel.");
  return { left, top, right, bottom };
}

function countOpaqueNearWhitePixels(
  sourcePixels,
  alpha,
  width,
  channels,
  region,
) {
  let count = 0;

  for (let y = region.top; y <= region.bottom; y += 1) {
    for (let x = region.left; x <= region.right; x += 1) {
      const index = y * width + x;
      const offset = index * channels;
      const red = sourcePixels[offset];
      const green = sourcePixels[offset + 1];
      const blue = sourcePixels[offset + 2];
      const spread = Math.max(red, green, blue) - Math.min(red, green, blue);

      if (
        alpha[index] === 255 &&
        red >= 185 &&
        green >= 185 &&
        blue >= 185 &&
        spread <= 45
      ) {
        count += 1;
      }
    }
  }

  return count;
}

function assertTransparentPadding(pixels, width, height, channels) {
  const alphaAt = (x, y) => pixels[(y * width + x) * channels + 3];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const isSafetyBand =
        x < SAFETY_PADDING ||
        x >= width - SAFETY_PADDING ||
        y < SAFETY_PADDING ||
        y >= height - SAFETY_PADDING;

      if (isSafetyBand) {
        assert(
          alphaAt(x, y) === 0,
          `Safety padding is not transparent at (${x}, ${y}).`,
        );
      }
    }
  }

  const decodedBounds = findOpaqueBounds(
    Uint8Array.from(
      { length: width * height },
      (_, index) => pixels[index * channels + 3],
    ),
    width,
    height,
  );

  assert(
    decodedBounds.left === SAFETY_PADDING &&
      decodedBounds.top === SAFETY_PADDING &&
      decodedBounds.right === width - SAFETY_PADDING - 1 &&
      decodedBounds.bottom === height - SAFETY_PADDING - 1,
    `Decoded opaque bounds do not preserve exactly ${SAFETY_PADDING}px of padding: ${JSON.stringify(decodedBounds)}`,
  );

  return decodedBounds;
}

async function main() {
  const sourceBuffer = await readFile(sourcePath);
  const sourceHash = sha256(sourceBuffer);
  assert(
    sourceHash === EXPECTED_SOURCE_SHA256,
    `Source SHA-256 mismatch. Expected ${EXPECTED_SOURCE_SHA256}, received ${sourceHash}.`,
  );

  const sourceImage = sharp(sourceBuffer, { failOn: "error" });
  const metadata = await sourceImage.metadata();
  assert(
    metadata.width === EXPECTED_SOURCE_SIZE.width &&
      metadata.height === EXPECTED_SOURCE_SIZE.height,
    `Source dimensions mismatch. Expected ${EXPECTED_SOURCE_SIZE.width}x${EXPECTED_SOURCE_SIZE.height}, received ${metadata.width}x${metadata.height}.`,
  );

  const { data: sourcePixels, info: sourceInfo } = await sharp(sourceBuffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = sourceInfo;
  assert(channels === 3, `Expected three source channels, received ${channels}.`);

  const borderMedian = calculateBorderMedian(
    sourcePixels,
    width,
    height,
    channels,
  );
  const { mask, backgroundPixelCount } = createEdgeConnectedBackgroundMask(
    sourcePixels,
    width,
    height,
    channels,
    borderMedian,
  );

  const alpha = new Uint8Array(width * height);
  const rgba = Buffer.alloc(width * height * 4);

  for (let index = 0; index < width * height; index += 1) {
    const sourceOffset = index * channels;
    const outputOffset = index * 4;
    const outputAlpha = mask[index] === 1 ? 0 : 255;
    alpha[index] = outputAlpha;
    rgba[outputOffset] = sourcePixels[sourceOffset];
    rgba[outputOffset + 1] = sourcePixels[sourceOffset + 1];
    rgba[outputOffset + 2] = sourcePixels[sourceOffset + 2];
    rgba[outputOffset + 3] = outputAlpha;
  }

  const contentBounds = findOpaqueBounds(alpha, width, height);
  const crop = {
    left: contentBounds.left - SAFETY_PADDING,
    top: contentBounds.top - SAFETY_PADDING,
    width: contentBounds.right - contentBounds.left + 1 + SAFETY_PADDING * 2,
    height: contentBounds.bottom - contentBounds.top + 1 + SAFETY_PADDING * 2,
  };
  assert(
    crop.left >= 0 &&
      crop.top >= 0 &&
      crop.left + crop.width <= width &&
      crop.top + crop.height <= height,
    `The source does not contain ${SAFETY_PADDING}px of transparent safety area around the extracted content.`,
  );
  assert(
    crop.width === EXPECTED_OUTPUT_SIZE.width &&
      crop.height === EXPECTED_OUTPUT_SIZE.height,
    `Output geometry drifted. Expected ${EXPECTED_OUTPUT_SIZE.width}x${EXPECTED_OUTPUT_SIZE.height}, calculated ${crop.width}x${crop.height}.`,
  );

  const avatarBuffer = await sharp(rgba, {
    raw: { width, height, channels: 4 },
  })
    .extract(crop)
    .webp({ lossless: true, alphaQuality: 100, effort: 6 })
    .toBuffer();

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, avatarBuffer);

  const { data: decodedPixels, info: decodedInfo } = await sharp(avatarBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert(
    decodedInfo.width === EXPECTED_OUTPUT_SIZE.width &&
      decodedInfo.height === EXPECTED_OUTPUT_SIZE.height &&
      decodedInfo.channels === 4,
    `Decoded WebP geometry/channel validation failed: ${JSON.stringify(decodedInfo)}.`,
  );

  const decodedBounds = assertTransparentPadding(
    decodedPixels,
    decodedInfo.width,
    decodedInfo.height,
    decodedInfo.channels,
  );

  let opaqueOutputPixels = 0;
  let foregroundRgbMismatches = 0;

  for (let y = 0; y < decodedInfo.height; y += 1) {
    for (let x = 0; x < decodedInfo.width; x += 1) {
      const outputOffset = (y * decodedInfo.width + x) * 4;
      if (decodedPixels[outputOffset + 3] === 0) continue;
      opaqueOutputPixels += 1;

      const sourceX = crop.left + x;
      const sourceY = crop.top + y;
      const sourceOffset = (sourceY * width + sourceX) * channels;

      if (
        decodedPixels[outputOffset] !== sourcePixels[sourceOffset] ||
        decodedPixels[outputOffset + 1] !== sourcePixels[sourceOffset + 1] ||
        decodedPixels[outputOffset + 2] !== sourcePixels[sourceOffset + 2]
      ) {
        foregroundRgbMismatches += 1;
      }
    }
  }

  assert(
    foregroundRgbMismatches === 0,
    `Lossless output changed RGB values for ${foregroundRgbMismatches} opaque foreground pixels.`,
  );

  const whiteRegionChecks = {
    stylus: countOpaqueNearWhitePixels(sourcePixels, alpha, width, channels, {
      left: 220,
      top: 270,
      right: 325,
      bottom: 405,
    }),
    shorts: countOpaqueNearWhitePixels(sourcePixels, alpha, width, channels, {
      left: 280,
      top: 790,
      right: 625,
      bottom: 1100,
    }),
    shoes: countOpaqueNearWhitePixels(sourcePixels, alpha, width, channels, {
      left: 300,
      top: 1330,
      right: 725,
      bottom: 1635,
    }),
  };

  assert(
    whiteRegionChecks.stylus >= 200,
    `Stylus preservation check failed (${whiteRegionChecks.stylus} light foreground pixels).`,
  );
  assert(
    whiteRegionChecks.shorts >= 20_000,
    `Shorts preservation check failed (${whiteRegionChecks.shorts} light foreground pixels).`,
  );
  assert(
    whiteRegionChecks.shoes >= 12_000,
    `Shoes preservation check failed (${whiteRegionChecks.shoes} light foreground pixels).`,
  );

  const totalSourcePixels = width * height;
  const outputPixelCount = decodedInfo.width * decodedInfo.height;
  const report = {
    source: {
      path: sourcePath,
      sha256: sourceHash,
      dimensions: `${width}x${height}`,
      borderMedian,
    },
    extraction: {
      threshold: BACKGROUND_DISTANCE_THRESHOLD,
      connectivity: 4,
      backgroundPixels: backgroundPixelCount,
      backgroundCoverage: Number(
        (backgroundPixelCount / totalSourcePixels).toFixed(6),
      ),
      contentBounds,
      crop,
    },
    output: {
      path: outputPath,
      sha256: sha256(avatarBuffer),
      dimensions: `${decodedInfo.width}x${decodedInfo.height}`,
      bytes: avatarBuffer.length,
      opaquePixels: opaqueOutputPixels,
      opaqueCoverage: Number((opaqueOutputPixels / outputPixelCount).toFixed(6)),
      transparentPixels: outputPixelCount - opaqueOutputPixels,
      transparentCorners: true,
      safetyPadding: SAFETY_PADDING,
      decodedOpaqueBounds: decodedBounds,
      foregroundRgbMismatches,
      whiteRegionChecks,
    },
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(`[prepare-avatar] ${error.message}`);
  process.exitCode = 1;
});
