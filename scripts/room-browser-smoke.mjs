import { chromium } from "playwright";

const baseURL = process.env.ROOM_BASE_URL ?? "http://localhost:3000";
const category = process.env.ROOM_CATEGORY;
const saveScreenshots = process.env.ROOM_SAVE_SCREENSHOTS !== "0";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
});

const hostContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const host = await hostContext.newPage();
const guest = await guestContext.newPage();

try {
  await host.goto(`${baseURL}/room/create`);
  await host.getByLabel("What should player two call you?").fill("Browser Host");
  if (category) await host.getByRole("button", { name: new RegExp(category) }).click();
  await host.getByRole("button", { name: /Open the Room/ }).click();
  await host.waitForURL(/\/room\/[A-Z0-9]{6}\/waiting/);
  const roomCode = (await host.locator(".room-code-card strong").textContent())?.trim();
  if (!roomCode) throw new Error("Host did not receive a room code.");

  await guest.goto(`${baseURL}/room/join`);
  await guest.getByLabel("Your name").fill("Browser Guest");
  await guest.getByLabel("Room code").fill(roomCode);
  await guest.getByRole("button", { name: /Join the Room/ }).click();
  await guest.waitForURL(new RegExp(`/room/${roomCode}/waiting`));

  await host.getByRole("button", { name: /I.m ready/ }).click();
  await guest.getByRole("button", { name: /I.m ready/ }).click();
  await Promise.all([
    host.waitForURL(new RegExp(`/room/${roomCode}/secret`)),
    guest.waitForURL(new RegExp(`/room/${roomCode}/secret`)),
  ]);

  await host.locator(".room-secret-choice .game-card").first().click();
  await host.getByRole("button", { name: /Lock in this face/ }).click();
  await guest.waitForTimeout(1800);
  await guest.locator(".room-secret-choice .game-card").nth(1).click();
  await guest.getByRole("button", { name: /Lock in this face/ }).click();
  await Promise.all([
    host.waitForFunction(() => window.location.pathname.endsWith("/game"), undefined, { timeout: 20000 }),
    guest.waitForFunction(() => window.location.pathname.endsWith("/game"), undefined, { timeout: 20000 }),
  ]);

  const activePage = await Promise.race([
    host.getByText("Your turn", { exact: true }).waitFor({ state: "visible", timeout: 7000 }).then(() => host),
    guest.getByText("Your turn", { exact: true }).waitFor({ state: "visible", timeout: 7000 }).then(() => guest),
  ]);
  const otherPage = activePage === host ? guest : host;
  await activePage.locator(".board-grid .game-card").nth(3).click();
  await activePage.waitForFunction(() => Boolean(document.querySelector('.board-grid .game-card[aria-pressed="true"]')), undefined, { timeout: 7000 });
  await activePage.getByRole("button", { name: "End turn / pass device" }).click();
  await otherPage.getByText("Your turn", { exact: true }).waitFor({ timeout: 10000 });

  await otherPage.reload();
  await otherPage.getByText("Your turn", { exact: true }).waitFor({ timeout: 7000 });

  const guestSeat = await guest.evaluate(() => sessionStorage.getItem("guess-who:room-seat"));
  if (!guestSeat) throw new Error("Guest seat session was not available for the duplicate-tab check.");
  const duplicateContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await duplicateContext.addInitScript((seat) => {
    const copied = JSON.parse(seat);
    copied.tabId = "duplicate-browser-tab";
    sessionStorage.setItem("guess-who:room-seat", JSON.stringify(copied));
    sessionStorage.setItem("guess-who:room-tab", "duplicate-browser-tab");
  }, guestSeat);
  const duplicate = await duplicateContext.newPage();
  await duplicate.goto(`${baseURL}/room/${roomCode}/game`);
  await duplicate.getByText("This seat is open", { exact: false }).waitFor({ timeout: 7000 });
  if (saveScreenshots) await duplicate.screenshot({ path: "test-artifacts/room-duplicate-tab.png", fullPage: true });
  await duplicateContext.close();

  if (saveScreenshots) {
    await host.screenshot({ path: "test-artifacts/room-host-game.png", fullPage: true });
    await guest.screenshot({ path: "test-artifacts/room-guest-game.png", fullPage: true });
  }
  console.log(JSON.stringify({ status: "passed", roomCode, hostViewport: "desktop", guestViewport: "mobile", verified: ["create", "join", "ready", "private-secret-selection", "turn-pass", "same-tab-refresh", "duplicate-tab-recovery"] }));
} finally {
  await hostContext.close();
  await guestContext.close();
  await browser.close();
}
