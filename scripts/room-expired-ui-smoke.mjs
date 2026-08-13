import { chromium } from "playwright";

const roomCode = process.env.ROOM_CODE;
const seatToken = process.env.SEAT_TOKEN;
const tabId = process.env.TAB_ID;
if (!roomCode || !seatToken || !tabId) throw new Error("ROOM_CODE, SEAT_TOKEN, and TAB_ID are required.");

const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.addInitScript(({ code, token, currentTabId }) => {
  sessionStorage.setItem("guess-who:room-seat", JSON.stringify({ roomCode: code, seatNumber: 1, seatToken: token, tabId: currentTabId }));
  sessionStorage.setItem("guess-who:room-tab", currentTabId);
}, { code: roomCode, token: seatToken, currentTabId: tabId });
const page = await context.newPage();

try {
  await page.goto(`http://localhost:3000/room/${roomCode}/waiting`);
  await page.getByText("That Room", { exact: false }).waitFor({ timeout: 7000 });
  await page.getByText("has closed.", { exact: false }).waitFor({ timeout: 7000 });
  await page.screenshot({ path: "test-artifacts/room-expired.png", fullPage: true });
  console.log(JSON.stringify({ status: "passed", roomCode, verified: ["expired-room-guidance", "mobile-recovery-ui"] }));
} finally {
  await context.close();
  await browser.close();
}
