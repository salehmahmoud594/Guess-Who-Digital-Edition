import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viteOutput = path.join(projectRoot, "dist", "public");
const docsOutput = path.join(projectRoot, "docs");

// Copy built static assets from dist/public to docs, preserving manus-storage
const targetAssets = path.join(docsOutput, "assets");
await rm(targetAssets, { recursive: true, force: true });
await cp(path.join(viteOutput, "assets"), targetAssets, { recursive: true });
await cp(path.join(viteOutput, "index.html"), path.join(docsOutput, "index.html"));
await cp(path.join(viteOutput, "index.html"), path.join(docsOutput, "404.html"));
await writeFile(path.join(docsOutput, ".nojekyll"), "");

console.log(`GitHub Pages output updated successfully at: ${docsOutput}`);
