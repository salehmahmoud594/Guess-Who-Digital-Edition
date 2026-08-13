import fs from "node:fs";
import path from "node:path";
import type { Express } from "express";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // 1. Check local file system fallback
    const localPublicPath = path.join(process.cwd(), "client", "public", "manus-storage", key);
    if (fs.existsSync(localPublicPath)) {
      res.sendFile(localPublicPath);
      return;
    }

    // 2. Try Forge Cloud storage if configured
    if (ENV.forgeApiUrl && ENV.forgeApiKey) {
      try {
        const forgeUrl = new URL(
          "v1/storage/presign/get",
          ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
        );
        forgeUrl.searchParams.set("path", key);

        const forgeResp = await fetch(forgeUrl, {
          headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
        });

        if (forgeResp.ok) {
          const { url } = (await forgeResp.json()) as { url: string };
          if (url) {
            res.set("Cache-Control", "no-store");
            res.redirect(307, url);
            return;
          }
        }
      } catch (err) {
        console.error("[StorageProxy] failed:", err);
      }
    }

    // 3. Fallback placeholder images to prevent 500 server errors in local dev
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Type", "image/svg+xml");

    if (key.includes("logo")) {
      res.status(200).send(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" rx="24" fill="#143b4a"/>
        <circle cx="36" cy="40" r="5" fill="#f3a272"/>
        <circle cx="64" cy="40" r="5" fill="#f3a272"/>
        <text x="50" y="78" font-family="Bree Serif, sans-serif" font-weight="bold" font-size="38" fill="#f3a272" text-anchor="middle">?</text>
      </svg>`);
      return;
    }

    res.status(200).send(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" width="200" height="250">
      <rect width="200" height="250" rx="16" fill="#143b4a"/>
      <circle cx="100" cy="105" r="45" fill="#16777a"/>
      <text x="100" y="120" font-family="sans-serif" font-weight="bold" font-size="44" fill="#fff9ec" text-anchor="middle">?</text>
    </svg>`);
  });
}
