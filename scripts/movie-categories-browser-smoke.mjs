import { chromium } from "playwright";

const baseURL = "http://localhost:3000";
const cases = [
  { label: "Egyptian Movies", className: "category-egyptian_movies", viewport: { width: 390, height: 844 } },
  { label: "Cartoon Movies", className: "category-cartoon_movies", viewport: { width: 1280, height: 900 } },
];

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

try {
  for (const testCase of cases) {
    const context = await browser.newContext({ viewport: testCase.viewport });
    const page = await context.newPage();
    await page.goto(`${baseURL}/setup`);
    await page.getByLabel("Player 1").fill("Poster One");
    await page.getByLabel("Player 2").fill("Poster Two");
    await page.getByRole("button", { name: new RegExp(testCase.label) }).click();
    await page.getByRole("button", { name: /Deal the cards/ }).click();
    await page.waitForFunction(() => window.location.pathname.endsWith("/secret"), undefined, { timeout: 7000 });

    const cards = page.locator(`.secret-grid .game-card.${testCase.className}`);
    if (await cards.count() !== 24) throw new Error(`${testCase.label} did not deal 24 poster cards.`);
    await page.waitForFunction((selector) => Array.from(document.querySelectorAll(selector)).every((image) => image.complete), `.secret-grid .game-card.${testCase.className} .card-art img`, { timeout: 15000 });
    const imageReport = await cards.locator(".card-art img").evaluateAll((images) => images.map((image) => {
      const style = window.getComputedStyle(image);
      return { src: image.currentSrc, complete: image.complete, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, objectFit: style.objectFit };
    }));
    const failing = imageReport.filter((image) => !image.complete || image.naturalWidth < 1 || image.naturalHeight < 1 || image.objectFit !== "contain");
    if (failing.length) {
      throw new Error(`${testCase.label} includes an unavailable or cropped poster: ${JSON.stringify(failing)}`);
    }
    await context.close();
  }
  console.log(JSON.stringify({ status: "passed", verified: ["egyptian-movies-24-posters", "cartoon-movies-24-posters", "full-poster-contain-framing"] }));
} finally {
  await browser.close();
}
