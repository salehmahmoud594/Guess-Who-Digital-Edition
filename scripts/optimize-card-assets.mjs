import { mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDirectory = process.env.CARD_ASSET_SOURCE;
const outputDirectory = process.env.CARD_ASSET_OUTPUT;

if (!sourceDirectory || !outputDirectory) {
  throw new Error("Set CARD_ASSET_SOURCE and CARD_ASSET_OUTPUT before optimizing card images.");
}

const supportedExtensions = /\.(png|jpe?g|webp)$/i;
const outputWidths = [240, 480];
const entries = (await readdir(sourceDirectory)).filter((entry) => supportedExtensions.test(entry));

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

let sourceBytes = 0;
let outputBytes = 0;
for (let start = 0; start < entries.length; start += 8) {
  const batch = entries.slice(start, start + 8);
  await Promise.all(batch.map(async (entry) => {
    const sourcePath = path.join(sourceDirectory, entry);
    const assetName = entry.replace(supportedExtensions, "");
    const [sourceInfo, outputInfos] = await Promise.all([
      stat(sourcePath),
      Promise.all(outputWidths.map(async (width) => {
        const outputPath = path.join(outputDirectory, `${assetName}-${width}.webp`);
        await sharp(sourcePath)
          .rotate()
          .resize({ width, height: width * 2, fit: "inside", withoutEnlargement: true })
          .webp({ quality: width === 240 ? 76 : 80, effort: 4, smartSubsample: true })
          .toFile(outputPath);
        return stat(outputPath);
      })),
    ]);
    sourceBytes += sourceInfo.size;
    outputBytes += outputInfos.reduce((sum, outputInfo) => sum + outputInfo.size, 0);
  }));
  process.stdout.write(`Optimized ${Math.min(start + batch.length, entries.length)}/${entries.length} card images\n`);
}

const savedPercent = sourceBytes ? Math.round((1 - outputBytes / sourceBytes) * 100) : 0;
console.log(`Card image optimization complete: ${entries.length} source files and ${entries.length * outputWidths.length} responsive derivatives, ${(sourceBytes / 1024 / 1024).toFixed(1)} MB → ${(outputBytes / 1024 / 1024).toFixed(1)} MB (${savedPercent}% smaller).`);
