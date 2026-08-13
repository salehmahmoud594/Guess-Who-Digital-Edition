# Room verification record

This record captures the local verification pass completed after the Room MVP implementation.

| Area | Verification performed | Result |
| --- | --- | --- |
| Database and routing | Room schema migration applied through the registered Drizzle migration; room endpoints exercised against the local server. | Passed |
| Two seats | A host created a six-character Room code and a guest joined it using the code. | Passed |
| Readiness and secrets | Both seats marked ready, privately selected a deck card, and the room transitioned to `playing`. | Passed |
| Privacy projection | The guest snapshot exposed only the guest secret (`secretCardId`) and the opponent's boolean `secretChosen`; the host snapshot exposed only the host secret. | Passed |
| Independent hearts | After the host passed, the guest made an incorrect guess. Guest hearts changed from 3 to 2 while host hearts remained 3; the turn returned to the host. | Passed |
| Refresh recovery | The host seat token and same-tab identifier successfully restored the active Room via `room.reconnect`. | Passed |
| Duplicate-tab protection | A snapshot request carrying a valid seat token but a different tab identifier was rejected, preserving the private seat for the original tab. The client renders a dedicated recovery state with a route back to Room entry. | Passed |
| Expired Room | An isolated verification Room was moved past its expiry timestamp. An authorized snapshot then returned `status: "expired"`; the client maps this to a dedicated expired-Room guidance screen. | Passed |
| Client build | `pnpm check` and `pnpm build` both completed successfully. | Passed |
| Automated tests | `pnpm test` completed with both the existing auth test and Room privacy-projection test passing. | Passed |
| Responsive entry and recovery UI | Desktop and 375-pixel mobile captures confirmed the Room entry, host setup, join, local setup, and missing-seat recovery views remain readable and actionable. | Passed |
| Two-browser Room flow | Independent desktop-host and mobile-guest Chromium contexts created, joined, readied, selected separate secrets, entered play, eliminated a card, passed a turn, recovered after a same-tab refresh, and rejected a copied seat in a different tab. | Passed |
| Expired Room UI | A valid seat for an intentionally expired isolated Room loaded the dedicated mobile guidance state, including the route back to Room entry. | Passed |
| Local-mode regression | A separate Chromium smoke test completed private Pass & Play handoffs through the single-board view and completed Split Screen secret selection through the two-board view. | Passed |

> The test captures intentionally show the recovery state for direct URL access without a stored seat token. A regular host or guest flow saves this short-lived token in `sessionStorage`, then loads the private secret and board views.

> Two-seat verification was run in independent Chromium browser contexts at desktop and mobile sizes. This proves the browser flow and the server-authoritative protocol in development; the deployed product should still be smoke-tested by two people on separate physical devices after publishing.

## MVP boundaries

Room mode is code-only and uses polling at 1.5-second intervals. It deliberately includes no account requirement, audio, chat, spectator access, or shared Room leaderboard. The existing Pass & Play and Split Screen modes remain separate from Room state and continue using the local game reducer.
