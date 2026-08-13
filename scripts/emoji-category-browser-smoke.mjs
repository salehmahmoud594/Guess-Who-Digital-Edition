import { chromium } from "playwright";

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/setup");
  await page.getByLabel("Player 1").fill("Emoji One");
  await page.getByLabel("Player 2").fill("Emoji Two");
  await page.getByRole("button", { name: /Emojis/ }).click();
  await page.getByRole("button", { name: /Deal the cards/ }).click();
  await page.waitForFunction(() => window.location.pathname.endsWith("/secret"), undefined, { timeout: 7000 });

  const cards = page.locator(".secret-grid .game-card.category-emojis");
  if (await cards.count() !== 24) throw new Error("Emojis did not deal exactly 24 cards.");

  const report = await cards.locator(".emoji-art").evaluateAll((nodes) => nodes.map((node) => {
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return { glyph: node.textContent?.trim(), fontSize: Number.parseFloat(style.fontSize), width: rect.width, height: rect.height };
  }));
  if (report.some((item) => !item.glyph || item.fontSize < 40 || item.width < 20 || item.height < 20)) {
    throw new Error(`Emoji card display is incomplete: ${JSON.stringify(report)}`);
  }
  if (new Set(report.map((item) => item.glyph)).size < 16) throw new Error("Emoji deal lacks sufficient visual variety.");

  await context.close();
  console.log(JSON.stringify({ status: "passed", verified: ["emojis-24-cards", "native-glyph-visibility", "mobile-card-sizing"] }));
} finally {
  await browser.close();
}
