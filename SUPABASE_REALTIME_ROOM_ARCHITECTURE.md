# Supabase Realtime Room Architecture

## Scope

The two-device Room mode will use Supabase as its authoritative backend. The existing local Pass & Play and Split Screen modes remain client-side. The application will continue to show the password screen before any game-mode selector or direct game route.

## Trust boundaries

The browser will use a Supabase publishable key only. Every device will obtain an anonymous Supabase Auth identity before it can enter Room mode. The shared game password will be verified only by a Supabase Edge Function that holds `GAME_ACCESS_PASSWORD` as a server-side secret. Successful verification will create a time-limited private access grant for the authenticated device; RLS policies will require that grant for all Room reads and commands.

| Data class | Storage | Browser visibility |
|---|---|---|
| Shared match state | `game_rooms` | Both members of the room |
| Room membership and assigned seat | `room_memberships` | Owning player only |
| Player name, ready state, and secret-picked indicator | `room_public_seats` | Both members of the room |
| Secret card, eliminated cards, hearts, connection lease | `room_private_states` | Owning player only |
| Permitted card identifiers by category | `room_card_catalog` | Used by trusted database commands only |
| Password access grants | `game_access_grants` | RLS helper only; never directly readable by clients |
| Password and service credentials | Edge Function secrets only | Never exposed |

## Authorization model

`game_rooms` and `room_players` will have RLS enabled. A security-definer membership helper will determine whether `auth.uid()` occupies a seat in a room. Members can read the shared room row, while each player can read only their own private player row. Direct client writes will be denied. All game mutations will use security-definer RPC functions that validate membership, active seat, expected state, allowed cards, and revision before making an atomic update.

The public and private player fields must never share a table: Postgres RLS protects rows, not selected columns. `room_public_seats` therefore holds only opponent-safe fields, while `room_private_states` delivers a row only to its owner. This preserves instant Realtime updates without leaking an opponent's secret card, eliminations, or remaining hearts.

## Commands

The RPC surface will cover room creation, join, readiness, secret selection, elimination, end turn, final guess, rematch, session recovery, and activity touch. Every accepted command updates `last_activity_at`, advances the `revision`, and emits database changes for the subscribed clients.

| RPC | Authorization and atomic checks |
|---|---|
| `room_create` | Requires a current access grant; allocates a unique code, host seat, and a random 24-card deck from the category catalog. |
| `room_join` | Requires a current access grant; locks the room, permits only the second seat, and moves the room to setup. |
| `room_set_ready` | Requires the caller's seat and an eligible waiting/setup room; transitions to secret selection only when both seats are ready. |
| `room_select_secret` | Requires the caller's seat and a card in the room deck; writes only the caller's private state and starts play only once both players have chosen. |
| `room_toggle_elimination` | Requires the active seat and changes only that player's private elimination board. |
| `room_end_turn` | Requires the active seat and moves the turn atomically to the opponent. |
| `room_submit_guess` | Requires the active seat; reads the opponent's secret inside the trusted function and updates hearts, score, winner, and turn in one transaction. |
| `room_start_rematch` | Requires the host seat after a finished round; resets both private states and creates the next deck. |
| `room_recover` | Requires room membership; safely expires a stale room or returns the caller's recoverable membership information. |

## Realtime

Clients will subscribe to PostgreSQL changes for their permitted `game_rooms` row and their own `room_players` row. This sends the shared state immediately to both players while RLS prevents an opponent's private row from being delivered. Presence may be used for connection indicators, but it will not authorize commands or enforce game rules.

The required tables must be added to the `supabase_realtime` publication. If private presence or broadcast channels are enabled, their topics must be private and authorized through `realtime.messages` RLS policies; neither channel nor presence data will contain game secrets.

## Lifecycle

Rooms in `waiting`, `setup`, `secret_selection`, or `playing` expire silently after 60 minutes without a successful Room command. A Supabase-side scheduled cleanup function will atomically change only records that remain stale at execution time. Finished and already expired rooms are retained.

## Static deployment

The GitHub Pages bundle will contain the Supabase project URL and publishable key only. The Room feature continues to require an internet connection to Supabase, but it no longer needs the Node/Express game server for Room synchronization.

The password verification Edge Function uses the platform-managed backend secret key only inside its runtime and reads `GAME_ACCESS_PASSWORD` from its own environment. The browser sends its current Auth token to this function; the function creates or refreshes the caller's short-lived access grant and never returns the shared password.

## Verification note

On 2026-08-13, the development preview was checked at both `/` and `/room`. Before any game-mode interface rendered, it displayed the password-entry screen with no mode selector or Room content exposed. The gate copy correctly states that access is browser-specific and time-limited.

An intentionally incorrect password was submitted to the deployed verification function. The page remained locked, restored the submit control, and showed the expected mismatch message without revealing the configured password.

The direct `/room/create` URL was also loaded in a fresh browser state and showed the same password gate instead of the Room-creation interface.

## References

- [Supabase Realtime Authorization](https://supabase.com/docs/guides/realtime/authorization)
- [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Supabase Edge Function environment variables](https://supabase.com/docs/guides/functions/secrets)
- [Supabase publishable and secret API keys](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
