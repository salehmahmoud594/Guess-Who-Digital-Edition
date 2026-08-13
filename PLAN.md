# Guess Who: Digital Edition — Build Plan

## Product goal

Ship a responsive, client-only local two-player board game that works on phone browsers in portrait orientation and supports a mirrored Split Screen table on tablets and desktops.

## Risk slices and verification criteria

| Risk slice | Implementation | Verification |
| --- | --- | --- |
| Pass & Play privacy | Opaque handoff overlay, one visible board at a time, hold-to-peek secret | Screenshot overlay and confirm no opponent board is present in the DOM view |
| Independent game state | `player1EliminatedIds`, `player2EliminatedIds`, `player1Hearts`, and `player2Hearts` are separate reducer fields | Toggle/guess as one player and confirm only that player changes |
| Guess resolution | Exact secret-card match wins; wrong finite guess decrements only the active player; unlimited does not decrement | Exercise correct, wrong, zero-heart, and unlimited flows |
| Split Screen | Two rotated facing boards with independent elimination state and private secrets | Desktop screenshot plus interactions on both halves |
| Responsive board | 8-column desktop card field, 4-column mobile card field, sticky mobile action dock | Capture 1280px and 375px screenshots |
| Local leaderboard | Browser-only persistence after correct guess, no account or network storage | Play a win, reload leaderboard, verify score remains |
| Art integrity | Generated visual target, generated logo, and generated card art wired through `/manus-storage/...`; no committed media | Confirm image URLs and manifest; do not silently replace pending art with invented art |

## Status

The visual target, logo, and 15 distinct animal/fictional card illustrations have been generated and wired. The free image-generation allowance was exhausted during the first art pass; the remaining 105 card slots are explicitly marked pending in `client/src/data/gameItems.ts` and `ASSETS.md` for the next generation window.
