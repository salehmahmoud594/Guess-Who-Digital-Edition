# Animal Category Asset Pass

- [x] Extract `cropped_anials.zip` and inventory filenames, dimensions, and image framing.
- [x] Confirm each filename becomes the stable animal name.
- [x] Stage and upload only the animal assets; do not modify Fictional Characters.
- [x] Wire the animal names and hosted URLs into the animal catalog.
- [x] Tune animal-specific card framing without changing the fictional-character presentation.
- [x] Verify animal cards on desktop and mobile, including full image visibility and labels.
- [x] Run build/network checks and save the animal-category checkpoint.

## Animal card correction pass

- [x] Compare the supplied animal sheet crops with the currently hosted card exports and identify cases containing sheet fragments, blank tiles, or unsafe subject bounds.
- [x] Replace the current animal framing strategy with a deterministic presentation that keeps the full animal readable inside the card artwork slot.
- [x] Prevent labels from being truncated in the compact 6-column Split Screen layout without changing Fictional Characters.
- [x] Re-test Animals in Pass & Play and Split Screen at desktop and mobile breakpoints.
- [x] Run the final build and save a corrective checkpoint only after the screenshots match the intended card presentation.

## Cartoon Characters asset pass

- [x] Extract `cartoon4x5_images.zip` and inventory filenames, dimensions, and image framing.
- [x] Confirm each filename becomes the stable cartoon-character name.
- [x] Stage and upload only the Cartoon assets; do not modify Animals or Fictional Characters.
- [x] Wire the Cartoon names and hosted URLs into the cartoon catalog.
- [x] Tune Cartoon card framing for clear full-art display without changing existing category presentation.
- [x] Verify Cartoon cards in Pass & Play and Split Screen on desktop and mobile.
- [x] Run build/network checks and save the Cartoon-category checkpoint.

## Cross-device Room planning — no implementation yet

- [x] Confirm two independent modes: preserve single-device Pass & Play/Split Screen and add a separate two-device Room mode.
- [x] Confirm MVP supports one host plus one guest only, with no spectators, audio, or chat.
- [x] Confirm Room entry uses a code only, with no account required.
- [x] Confirm the host alone chooses the category and game settings.
- [x] Confirm refresh recovery uses a short-lived private seat token.
- [x] Confirm 1–2 second synchronization is acceptable for the first release.
- [x] Define the Room join flow: create room, short code, player assignment, and ready state.
- [x] Define the private state boundary so each device receives only its own secret character and hidden information.
- [x] Compare realtime backend options and identify the required project upgrade from static client-only hosting.
- [x] Specify synchronization events, turn authority, disconnect/reconnect behavior, expiry, and duplicate-tab handling.
- [x] Write the approved product and technical plan before changing the game code or adding backend services.

## Cross-device Room implementation

- [x] Upgrade the static project to full-stack and inspect the generated backend/database scaffold.
- [x] Add Room, seat, token, and authoritative game-state data structures.
- [x] Add privacy-safe server procedures for create, join, ready, secret selection, elimination, guessing, rematch, and reconnect.
- [x] Add the two-mode home flow and Create/Join/Waiting screens without changing single-device routes.
- [x] Add remote gameplay polling, short-lived seat-token recovery, reconnect overlays, expiry, and duplicate-tab handling.
- [x] Add and verify a dedicated expired-Room state with clear player guidance.
- [x] Add and verify duplicate-tab protection for a private Room seat, including a clear recovery path.
- [x] Use and verify the explicit reconnect command for same-tab refresh recovery.
- [x] Regression-test the existing Pass & Play and Split Screen modes.
- [x] Verify two clients, privacy boundaries, refresh recovery, expiry, responsive layouts, TypeScript, and production build.
- [x] Save the stable Room implementation checkpoint and document any remaining limitations.
- [x] Resolve the Room recovery-component import error reported by the development server and re-run validation.
- [x] Record a repeatable duplicate-tab rejection test and a two-client browser smoke test before checkpointing.

## Movie categories asset pass

- [x] Inventory the supplied Egyptian Movies and Cartoon Movies archives, preserving each filename stem as its stable title.
- [x] Remove the unavailable Food category from the game and Room category definitions.
- [x] Create, upload, and register clear card-art exports for Egyptian Movies and Cartoon Movies.
- [x] Add category-specific labels and framing without changing Animals, Fictional Characters, or Cartoon Characters.
- [x] Test the new movie cards in local play and Room on desktop and mobile, including full artwork visibility.
- [x] Run final checks and save a checkpoint for the movie-category update.
- [x] Update the Room creation input contract so the backend accepts the two movie categories and no Food value.
- [x] Diagnose and resolve the Egyptian Movies browser-smoke asset failure, then rerun the full-poster visibility test.
- [x] Diagnose and resolve the Room movie-category smoke timeout at the secret-selection-to-game transition.
- [x] Save a new checkpoint for the verified Egyptian Movies and Cartoon Movies category update.

## Emoji category and GitHub Pages delivery

- [x] Define and register a clear 24-plus-card Emoji category with stable labels and full-card visibility.
- [x] Integrate Emojis into local play and Room category settings without altering existing categories.
- [x] Add and run coverage for the Emoji category in local play and Room.
- [x] Prepare a static GitHub Pages build path for single-device play and document that Room requires a server and database.
- [x] Sync the updated project to `salehmahmoud594/Guess-Who-Digital-Edition` on `main`, including the portable `docs/` artifact, and verify the pushed commit.
- [x] Save a new checkpoint covering the GitHub Pages split build, portable `docs/` artifact, asset URL fixes, local static smoke validation, and the push to `salehmahmoud594/Guess-Who-Digital-Edition` on `main`; record its version ID in the handoff.
- [x] Complete the requested Emojis-only update before revisiting the deferred GitHub Pages tasks.
- [x] Save a checkpoint for the verified Emojis-only update before discussing GitHub.
- [x] Save the verified Emojis-only update and record its checkpoint version for the handoff.
- [x] Gate Room routes and server-client plumbing from the GitHub Pages build while preserving all local game routes.
- [x] Export every currently referenced card and logo asset to a portable GitHub Pages output so no `/manus-storage/` request targets the Pages origin.
- [x] Use hash navigation and repository-relative base paths in the GitHub Pages build.
- [x] Verify the static output locally before mirroring it to the selected public repository; Pass & Play and Split Screen smoke checks passed.

## Supabase connection

- [x] Confirm the post-execution Supabase Room schema from the SQL Editor result; no pre-migration schema snapshot was captured in the interrupted session.
- [x] Create the required Supabase Room schema with privacy-preserving RLS rules through Supabase SQL Editor.
- [x] Connect the game server to Supabase REST and verify Room create, join, private snapshot, turn pass, refresh recovery, and duplicate-tab recovery flows.
- [x] Document the Supabase environment requirements and how GitHub Pages relates to the server-backed Room mode.
- [x] Save a checkpoint for the verified Supabase integration.
- [x] Verify reachability and authorization requirements for the supplied Supabase project URL before accessing its schema.
- [x] Confirm direct PostgreSQL is unreachable from this environment because the supplied host is IPv6-only, then remove that unused path.
- [x] Provide and execute an idempotent Supabase SQL Editor schema for Room, then validate it through the REST API because direct PostgreSQL is IPv6-only in the current environment.
- [x] Verify in Supabase SQL Editor that `anon` and `authenticated` retain no table grants on Room data before checkpointing; the query returned zero rows.

## Password-protected game access

- [x] Restore development Vite configuration resolution so the server serves `client/src/main.tsx` instead of the HTML fallback after introducing the mode-based GitHub Pages build.
- [x] Store one shared game-access password as a server-only project secret.
- [x] Add a server-verified signed access session that expires safely and never returns the password to the browser.
- [x] Add a responsive password gate before the home screen and block direct local-game and Room links until access is granted.
- [x] Require a valid game-access session for all Room procedures, including create, join, snapshot, reconnect, and gameplay commands.
- [x] Keep the GitHub Pages local-only build explicitly unauthenticated and document that the password-protected Room build is served by WebDev Publish.
- [x] Add tests for rejected requests, wrong passwords, granted sessions, and protected Room commands; type-check, 8 Vitest tests, production build, static isolation check, and desktop/mobile direct-URL gate verification all passed.
- [x] Save a checkpoint for the verified password gate.

## Room availability investigation

- [x] Diagnose and fix the white screen at `/room/create` after a successful game-access session on the server-backed preview; nested Wouter route groups were incorrectly matching as the first Switch branch.
- [x] Identify the reported Room failure as occurring on the server-backed preview, then capture its post-password page state and Room flow.
- [x] Separate browser-extension console noise from the actual issue; the reported `runtime.lastError` is unrelated to the game and no Room API exception caused the blank screen.
- [x] Reproduce the failing create/join flow, correct the Wouter route tree, and verify a two-device Room session after password access; full browser smoke test passed.
- [x] Save a checkpoint for the verified Room availability fix.

## Room and local-play experience improvements

- [x] Add an immediate, accessible offline banner inside Room that reacts to browser connectivity changes and explains that sync resumes automatically upon reconnection.
- [x] Add a visible reconnecting state when Room polling or an important command fails while the browser remains online.
- [x] Add clear disabled/loading feedback to Create Room and Join Room submissions, preventing duplicate room commands while requests are pending.
- [x] Review Room and single-device play for high-value usability improvements that preserve existing rules, private secrets, and responsive behavior.
- [x] Add targeted tests and responsive browser checks for connection-loss UI, loading states, and any approved usability improvements.
- [x] Save a checkpoint for the verified Room and local-play experience improvements.

## Room timeout, cleanup, and full-version delivery

- [x] Confirm whether the requested timer limits each turn or the full Room session, then define the visible player experience and server-enforced rule. The approved choice is silent cleanup only, with no visible timer or rule change.
- [ ] Define a safe expiry policy for stale `playing` rooms and a deterministic periodic cleanup that cannot affect active matches.
- [ ] Implement the agreed timer/expiry behavior while preserving per-seat privacy and current Room rules.
- [ ] Verify the Room timeout, Supabase status updates, and cleanup idempotency with targeted tests and browser checks.
- [ ] Save a checkpoint for the verified timeout and cleanup update.
- [x] Document the required GitHub repository contents, secrets, and hosting path for a complete server-backed Room deployment.

### Confirmed direction

- [ ] Apply silent inactivity expiry: a Room in `playing` becomes `expired` only after 60 minutes without a successful Room activity.
- [ ] Add an idempotent scheduled cleanup that updates only stale `waiting`, `secret_selection`, or `playing` rooms and retains rows for safe audit/debugging.
- [x] Explain that GitHub Pages can host only the local static mode; document the no-cost current hosted option and the requirements of external server hosting for Room.

### Required activation and verification

- [ ] Register and verify the scheduled job for `/api/scheduled/room-cleanup` so stale rooms are closed without any manual browser or server action.
- [ ] Add focused coverage for the cleanup service and cron-only route, including idempotency and status scope.
- [ ] Confirm in Supabase that stale `playing` records become `expired` after the scheduled path runs.

## Supabase Realtime and RLS Room rebuild

- [x] Audit the current Room code, Supabase project access, and existing schema before the replacement.
- [x] Design a clean Room schema with separate public match state and private per-player data for RLS enforcement.
- [x] Enable anonymous player identity and create RLS policies that protect opponent secrets and enforce seat ownership.
- [x] Implement atomic Supabase RPC commands for room creation, joining, readiness, secret choice, card elimination, turn changes, guessing, rematch, and recovery.
- [x] Enable Realtime subscriptions for the minimum required public and private Room data.
- [x] Replace the Room client polling and server-mediated commands with authenticated Supabase Realtime and RPC flows.
- [x] Retain the password gate as the first screen before any game-mode selection or direct game route.
- [x] Implement silent 60-minute inactivity expiry and an idempotent Supabase-side scheduled cleanup.
- [x] Produce a GitHub Pages-compatible build that uses only public Supabase client configuration.
- [ ] Add and run tests for RLS boundaries, command authorization, realtime room flow, reconnect recovery, inactivity cleanup, and password-first access.
- [ ] Verify the two-device Room flow and the GitHub Pages build, then save a final checkpoint.
- [x] Restore local development-server startup where the copied project directory name prevents package-script binary resolution.
- [x] Inspect the applied Supabase cleanup definition to confirm the 60-minute threshold and repeat-safe conditional update.
- [ ] Verify cleanup behavior for stale active rooms, recent active rooms, and terminal rooms without inserting production test data.
- [x] Guard the GitHub Pages workflow so it stops safely until the required public Supabase build configuration is added by a repository administrator.
- [x] Resolve the GitHub Pages workflow package-manager version conflict before re-running deployment.

## Card image loading performance

- [x] Measure current card-image formats, sizes, request count, and loading behavior across the game boards.
- [x] Create optimized responsive card-image derivatives without changing the represented game content.
- [x] Update card rendering to prioritize visible images and defer off-screen image work safely.
- [x] Validate faster initial board rendering, image integrity, TypeScript, tests, and the GitHub Pages build.
- [ ] Measure the actual initial-board image request count and eager-versus-lazy behavior in a browser session.
- [ ] Generate true multi-size card-image derivatives and add `srcset`/`sizes` so each device downloads an appropriate resolution.
- [ ] Verify optimized card rendering and initial visible-card loading in-browser, then record the performance evidence.
