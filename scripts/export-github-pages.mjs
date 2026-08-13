import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteOutput = path.join(projectRoot, "dist", "public");
const pagesOutput = path.join(projectRoot, "dist", "github-pages");
const assetSource = (process.env.GITHUB_PAGES_ASSET_SOURCE || "http://localhost:3000").replace(/\/$/, "");
const registries = [
  "client/src/data/animalAssets.ts",
  "client/src/data/cartoonAssets.ts",
];

const assetNames = new Set(["guess_who_logo_444e9112.png"]);
for (const relativePath of registries) {
  const source = await readFile(path.join(projectRoot, relativePath), "utf8");
  for (const match of source.matchAll(/\/manus-storage\/([^"']+)/g)) {
    if (!match[1].includes("${")) assetNames.add(match[1]);
  }
}

const characterRegistry = await readFile(path.join(projectRoot, "client/src/data/replacementCharacterAssets.ts"), "utf8");
const characterNames = characterRegistry.match(/const characterNames = "([^"]+)"/)?.[1]?.split(" ") ?? [];
const characterHashes = characterRegistry.match(/const uploadSuffixes = "([^"]+)"/)?.[1]?.split(" ") ?? [];
if (characterNames.length !== characterHashes.length || characterNames.length !== 150) throw new Error("Unexpected fictional character registry");
for (const [index, name] of characterNames.entries()) assetNames.add(`${name}_${characterHashes[index]}.png`);

const egyptianRegistry = await readFile(path.join(projectRoot, "client/src/data/egyptianMovieAssets.ts"), "utf8");
const egyptianHashBlock = egyptianRegistry.match(/const EGYPTIAN_MOVIE_UPLOAD_HASHES = `([\s\S]*?)`/)?.[1] ?? "";
const egyptianHashes = egyptianHashBlock.trim().split(/\s+/).filter(Boolean);
if (egyptianHashes.length !== 150) throw new Error("Unexpected Egyptian movie registry");
for (const [index, hash] of egyptianHashes.entries()) assetNames.add(`egyptian_movie_${String(index + 1).padStart(3, "0")}_${hash}.webp`);

const cartoonMovieRegistry = await readFile(path.join(projectRoot, "client/src/data/cartoonMovieAssets.ts"), "utf8");
const cartoonMovieBlock = cartoonMovieRegistry.match(/const CARTOON_MOVIE_RAW = String\.raw`([\s\S]*?)`/)?.[1] ?? "";
const cartoonMovieHashes = cartoonMovieBlock.trim().split("\n").map(line => line.split("\t")[1]).filter(Boolean);
if (cartoonMovieHashes.length !== 100) throw new Error("Unexpected cartoon movie registry");
for (const [index, hash] of cartoonMovieHashes.entries()) assetNames.add(`cartoon_movie_${String(index + 1).padStart(3, "0")}_${hash}.webp`);

await rm(pagesOutput, { recursive: true, force: true });
await cp(viteOutput, pagesOutput, { recursive: true });
const targetDirectory = path.join(pagesOutput, "manus-storage");
await mkdir(targetDirectory, { recursive: true });

const assetEntries = [...assetNames];
if (assetEntries.length !== 612) throw new Error(`Expected 612 exported images, found ${assetEntries.length}`);
for (let start = 0; start < assetEntries.length; start += 12) {
  const batch = assetEntries.slice(start, start + 12);
  await Promise.all(batch.map(async (assetName) => {
    const response = await fetch(`${assetSource}/manus-storage/${encodeURIComponent(assetName)}`);
    if (!response.ok) throw new Error(`Unable to export ${assetName}: HTTP ${response.status}`);
    await writeFile(path.join(targetDirectory, assetName), Buffer.from(await response.arrayBuffer()));
  }));
  process.stdout.write(`Exported ${Math.min(start + batch.length, assetEntries.length)}/${assetEntries.length} assets\n`);
}

await writeFile(path.join(pagesOutput, ".nojekyll"), "");
console.log(`GitHub Pages output ready: ${pagesOutput}`);
