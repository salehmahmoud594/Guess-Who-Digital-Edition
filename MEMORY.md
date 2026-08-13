# Guess Who: Digital Edition — Memory

The requested visual direction is Whimsical Tabletop Editorial: light oat surface, Ink Navy `#18253A`, apricot, butter, teal, DM Sans body text, and Bree Serif display text. The design intentionally avoids a generic centered dashboard, purple gradients, all-Inter typography, and uniform floating cards.

The user explicitly required independent hearts. The reducer therefore keeps `player1Hearts` and `player2Hearts` separate; a wrong guess only decrements the active guesser’s field. Elimination sets are also independent. Match recovery through `sessionStorage` is intentionally not implemented so an unsafe refresh cannot expose a private secret during Pass & Play.

The game is local-only. The leaderboard uses browser `localStorage`, while the current match stays in React state. The app has no backend, account system, or remote game session.

The generated image quota was reached after the first 20 requested outputs. Continue generation from the pending manifest rather than creating visual substitutes that would violate the user’s requirement for unique generated card art.
