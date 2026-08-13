import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist", "github-pages");
const repositoryBase = "/Guess-Who-Digital-Edition";
const port = Number(process.env.GITHUB_PAGES_PORT || 4174);
const contentTypes = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    if (requestUrl.pathname !== repositoryBase && !requestUrl.pathname.startsWith(`${repositoryBase}/`)) {
      response.writeHead(404).end("Not found");
      return;
    }
    const relativePath = requestUrl.pathname.slice(repositoryBase.length) || "/";
    const requestedFile = path.resolve(outputRoot, `.${decodeURIComponent(relativePath)}`);
    if (!requestedFile.startsWith(`${outputRoot}${path.sep}`) && requestedFile !== outputRoot) {
      response.writeHead(400).end("Invalid path");
      return;
    }
    const filePath = (await stat(requestedFile).catch(() => null))?.isDirectory() ? path.join(requestedFile, "index.html") : requestedFile;
    await access(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream", "Cache-Control": "no-store" });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

server.listen(port, "0.0.0.0", () => console.log(`GitHub Pages preview: http://localhost:${port}${repositoryBase}/`));
