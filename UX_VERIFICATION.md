# Room UX verification

The 2026-08-13 automated browser check verified the new delayed-submit feedback on desktop creation and mobile joining, plus offline and reconnecting states after a Room reaches its private game board.

| Scenario | Viewport | Observed result |
| --- | --- | --- |
| Join submission | 390 × 844 | The entered name and code remain readable, both fields and the main action are visually locked, and the spinner/status message appear beneath the action. |
| Offline gameplay | 1280 × 900 | Card art is loaded, the dark bottom connection banner is readable and centered without obscuring the board header, the remaining-card count is visible, and the automated check confirms the board receives its disabled state. |
| Reconnecting gameplay | 1280 × 900 | A teal reconnecting banner is visually distinct from the offline state and explains that the latest private game state is being checked. It clears when the next poll succeeds. |

The browser check now waits for a real Room card image to load before it captures the gameplay states. The Room asset pipeline remains outside the scope of this UX change.
