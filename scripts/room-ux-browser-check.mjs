import { chromium } from "playwright";

const baseURL = process.env.ROOM_BASE_URL ?? "http://localhost:3000";
const accessPassword = process.env.GAME_ACCESS_PASSWORD;

if (!accessPassword) throw new Error("GAME_ACCESS_PASSWORD is required for the password-protected Room UX check.");

const pause = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

async function unlockGame(page, readyFieldLabel) {
  const passwordField = page.getByLabel("Game password");
  const readyField = page.getByLabel(readyFieldLabel);
  const needsUnlock = await Promise.race([
    passwordField.waitFor({ state: "visible", timeout: 10000 }).then(() => true),
    readyField.waitFor({ state: "visible", timeout: 10000 }).then(() => false),
  ]);
  if (!needsUnlock) return;
  await passwordField.fill(accessPassword);
  await page.getByRole("button", { name: "Enter the game" }).click();
  await readyField.waitFor({ state: "visible", timeout: 10000 });
}

async function delayEndpoint(page, endpoint, afterVisible) {
  await page.route(`**/api/trpc/${endpoint}*`, async route => {
    await afterVisible();
    await pause(700);
    await route.continue();
  }, { times: 1 });
}

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
const hostContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const host = await hostContext.newPage();
const guest = await guestContext.newPage();

try {
  await host.goto(`${baseURL}/room/create`);
  await unlockGame(host, "What should player two call you?");
  await host.getByLabel("What should player two call you?").fill("UX Host");
  let createLoadingSeen = false;
  await delayEndpoint(host, "room.createRoom", async () => {
    await host.getByText("Reserving your private seat…", { exact: true }).waitFor({ state: "visible" });
    await host.screenshot({ path: "test-artifacts/room-ux-create-loading-desktop.png", fullPage: true });
    createLoadingSeen = true;
  });
  await host.getByRole("button", { name: /Open the Room/ }).click();
  await host.waitForURL(/\/room\/[A-Z0-9]{6}\/waiting/);
  if (!createLoadingSeen) throw new Error("Create Room loading feedback was not shown.");
  const roomCode = (await host.locator(".room-code-card strong").textContent())?.trim();
  if (!roomCode) throw new Error("Host did not receive a room code.");

  await guest.goto(`${baseURL}/room/join`);
  await unlockGame(guest, "Your name");
  await guest.getByLabel("Your name").fill("UX Guest");
  await guest.getByLabel("Room code").fill(roomCode);
  let joinLoadingSeen = false;
  await delayEndpoint(guest, "room.joinRoom", async () => {
    await guest.getByText("Checking the room code…", { exact: true }).waitFor({ state: "visible" });
    await guest.screenshot({ path: "test-artifacts/room-ux-join-loading-mobile.png", fullPage: true });
    joinLoadingSeen = true;
  });
  await guest.getByRole("button", { name: /Join the Room/ }).click();
  await guest.waitForURL(new RegExp(`/room/${roomCode}/waiting`));
  if (!joinLoadingSeen) throw new Error("Join Room loading feedback was not shown.");

  await host.getByRole("button", { name: /I.m ready/ }).click();
  await guest.getByRole("button", { name: /I.m ready/ }).click();
  await Promise.all([
    host.waitForURL(new RegExp(`/room/${roomCode}/secret`)),
    guest.waitForURL(new RegExp(`/room/${roomCode}/secret`)),
  ]);
  await host.locator(".room-secret-choice .game-card").first().click();
  await host.getByRole("button", { name: /Lock in this face/ }).click();
  await guest.locator(".room-secret-choice .game-card").nth(1).click();
  await guest.getByRole("button", { name: /Lock in this face/ }).click();
  await Promise.all([
    host.waitForURL(new RegExp(`/room/${roomCode}/game`)),
    guest.waitForURL(new RegExp(`/room/${roomCode}/game`)),
  ]);

  const firstCardImageLoaded = await host.locator(".board-grid .game-card img").first().evaluate(image => {
    if (image.complete) return image.naturalWidth > 0;
    return new Promise(resolve => {
      image.addEventListener("load", () => resolve(image.naturalWidth > 0), { once: true });
      image.addEventListener("error", () => resolve(false), { once: true });
    });
  });
  if (!firstCardImageLoaded) throw new Error("Room card art did not load before the UX capture.");

  await hostContext.setOffline(true);
  await host.getByText("You’re offline.", { exact: true }).waitFor({ state: "visible" });
  const boardDisabledOffline = await host.locator(".board-panel").evaluate(element => element.classList.contains("is-board-disabled"));
  if (!boardDisabledOffline) throw new Error("Room board remained interactive while offline.");
  await host.screenshot({ path: "test-artifacts/room-ux-offline-desktop.png", fullPage: true });

  await hostContext.setOffline(false);
  await host.getByText("You’re offline.", { exact: true }).waitFor({ state: "hidden", timeout: 10000 });
  await host.route("**/api/trpc/room.getSnapshot*", route => route.abort(), { times: 1 });
  await host.getByText("Reconnecting to the table…", { exact: true }).waitFor({ state: "visible", timeout: 10000 });
  await host.screenshot({ path: "test-artifacts/room-ux-reconnecting-desktop.png", fullPage: true });
  await host.getByText("Reconnecting to the table…", { exact: true }).waitFor({ state: "hidden", timeout: 10000 });

  console.log(JSON.stringify({ status: "passed", roomCode, verified: ["create-loading-desktop", "join-loading-mobile", "offline-banner-and-board-lock", "reconnecting-banner-and-recovery"] }));
} finally {
  await hostContext.close();
  await guestContext.close();
  await browser.close();
}
