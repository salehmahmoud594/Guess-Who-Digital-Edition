# Guess Who: Digital Edition — Structure

The app is a static React experience with Wouter routes and a reducer-backed `GameContext`. The reducer is the source of truth for setup, secret selection, handoffs, elimination sets, hearts, guesses, session score, and result state. React renders the picture frame around the game rather than coupling game rules to individual visual components.

| Area | Responsibility |
| --- | --- |
| `client/src/contexts/GameContext.tsx` | Deterministic local game state and action reducer |
| `client/src/data/` | Category metadata and typed 120-item card catalog |
| `client/src/lib/gameEngine.ts` | Deck creation, shuffle, player helpers, heart options |
| `client/src/lib/leaderboard.ts` | Browser-only scorecard persistence |
| `client/src/components/game/` | Brand, frame, cards, board, handoff, hearts, peek controls |
| `client/src/pages/` | Home, setup, secret pick, gameplay, result, leaderboard, fallback |
| `client/src/index.css` + `game.css` | Warm editorial visual system and responsive behavior |

Pass & Play uses the current player’s board only. Split Screen renders two independent mirrored panels; it does not use private handoff overlays during gameplay because each half has its own surface.
