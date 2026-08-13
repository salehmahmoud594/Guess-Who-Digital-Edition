import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteOutput = path.join(projectRoot, "dist", "public");
const pagesOutput = path.join(projectRoot, "dist", "github-pages");
const assetSource = (process.env.GITHUB_PAGES_ASSET_SOURCE || "http://localhost:3000").replace(/\/$/, "");
const assetDirectory = process.env.GITHUB_PAGES_ASSET_DIRECTORY
  ? path.resolve(projectRoot, process.env.GITHUB_PAGES_ASSET_DIRECTORY)
  : null;
const githubPagesBase = "/Guess-Who-Digital-Edition/";
const toOptimizedAssetName = (assetName, width) => assetName.replace(/\.(png|jpe?g|webp)$/i, `-${width}.webp`);
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

const assetEntries = [...assetNames].flatMap((assetName) => [240, 480].map((width) => toOptimizedAssetName(assetName, width)));
if (assetEntries.length !== 1224) throw new Error(`Expected 1224 exported images, found ${assetEntries.length}`);
if (!assetDirectory) throw new Error("Set GITHUB_PAGES_ASSET_DIRECTORY to the optimized card-image directory.");
for (let start = 0; start < assetEntries.length; start += 12) {
  const batch = assetEntries.slice(start, start + 12);
  await Promise.all(batch.map(async (assetName) => {
    const targetPath = path.join(targetDirectory, assetName);
    await cp(path.join(assetDirectory, assetName), targetPath);
  }));
  process.stdout.write(`Exported ${Math.min(start + batch.length, assetEntries.length)}/${assetEntries.length} assets\n`);
}

await writeFile(path.join(pagesOutput, ".nojekyll"), "");
await cp(path.join(pagesOutput, "index.html"), path.join(pagesOutput, "404.html"));
console.log(`GitHub Pages output ready: ${pagesOutput}`);
