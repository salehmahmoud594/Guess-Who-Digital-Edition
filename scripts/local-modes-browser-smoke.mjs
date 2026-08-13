import { chromium } from "playwright";

const baseURL = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const usesHashRouting = process.env.SMOKE_HASH_ROUTING === "true";
const route = (pathname) => usesHashRouting ? `${baseURL}/#${pathname}` : `${baseURL}${pathname}`;
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });

async function setUp(page, playerOne, playerTwo, mode = "pass-play") {
  await page.goto(route("/setup"));
  await page.getByLabel("Player 1").fill(playerOne);
  await page.getByLabel("Player 2").fill(playerTwo);
  if (mode === "split-screen") await page.getByRole("button", { name: /Split Screen/ }).click();
  await page.getByRole("button", { name: /Deal the cards/ }).click();
  await page.waitForFunction((usesHash) => (usesHash ? window.location.hash : window.location.pathname).endsWith("/secret"), usesHashRouting, { timeout: 7000 });
}

try {
  const passContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pass = await passContext.newPage();
  const rootStorageRequests = [];
  pass.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/manus-storage/")) rootStorageRequests.push(url.toString());
  });
  await setUp(pass, "Local One", "Local Two");
  await pass.locator(".secret-grid .game-card").first().click();
  await pass.getByRole("button", { name: /Lock in this face/ }).click();
  await pass.getByRole("button", { name: /I have the device/ }).click();
  await pass.getByText("Local Two, choose wisely.", { exact: true }).waitFor({ timeout: 5000 });
  await pass.locator(".secret-grid .game-card").nth(1).click();
  await pass.getByRole("button", { name: /Lock in this face/ }).click();
  await pass.getByRole("button", { name: /I have the device/ }).click();
  await pass.waitForFunction((usesHash) => (usesHash ? window.location.hash : window.location.pathname).endsWith("/game"), usesHashRouting, { timeout: 7000 });
  if (await pass.locator(".board-panel").count() !== 1) throw new Error("Pass & Play did not render one private board.");
  const peekButton = pass.getByRole("button", { name: /Hold to peek at Local One's secret/ });
  await peekButton.dispatchEvent("pointerdown");
  const peekImage = pass.locator(".secret-popover img");
  await peekImage.waitFor({ timeout: 5000 });
  const peekImageUrl = await peekImage.getAttribute("src");
  if (usesHashRouting && !peekImageUrl?.startsWith("/Guess-Who-Digital-Edition/manus-storage/")) throw new Error(`Secret peek image did not use the repository-relative asset path: ${peekImageUrl}`);
  await peekButton.dispatchEvent("pointerup");
  await pass.getByRole("button", { name: /Guess!/ }).click();
  await pass.locator(".board-grid .game-card").nth(1).click();
  await pass.getByRole("button", { name: /Make the guess/ }).click();
  await pass.waitForFunction((usesHash) => (usesHash ? window.location.hash : window.location.pathname).endsWith("/result"), usesHashRouting, { timeout: 7000 });
  const revealImageUrl = await pass.locator(".reveal-board .game-card img").first().getAttribute("src");
  if (usesHashRouting && !revealImageUrl?.startsWith("/Guess-Who-Digital-Edition/manus-storage/")) throw new Error(`Result reveal image did not use the repository-relative asset path: ${revealImageUrl}`);
  if (usesHashRouting && rootStorageRequests.length > 0) throw new Error(`GitHub Pages made root storage requests: ${rootStorageRequests.join(", ")}`);
  await pass.screenshot({ path: "test-artifacts/local-pass-play.png", fullPage: true });
  await passContext.close();

  const splitContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const split = await splitContext.newPage();
  await setUp(split, "Split One", "Split Two", "split-screen");
  await split.locator(".secret-half-1 .game-card").first().click();
  await split.locator(".secret-half-2 .game-card").nth(1).click();
  await split.getByRole("button", { name: /Start the face-off/ }).click();
  await split.waitForFunction((usesHash) => (usesHash ? window.location.hash : window.location.pathname).endsWith("/game"), usesHashRouting, { timeout: 7000 });
  if (await split.locator(".board-panel").count() !== 2) throw new Error("Split Screen did not render two independent boards.");
  await split.screenshot({ path: "test-artifacts/local-split-screen.png", fullPage: true });
  await splitContext.close();

  console.log(JSON.stringify({ status: "passed", verified: ["pass-play-private-handoffs", "pass-play-board", "secret-peek-repository-asset", "result-reveal-repository-asset", "split-screen-dual-secret-selection", "split-screen-two-boards"] }));
} finally {
  await browser.close();
}
