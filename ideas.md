# Guess Who: Digital Edition — Design Ideas

## Three stylistic approaches

### Theme Name: Whimsical Tabletop Editorial
**Very Brief Intro:** A warm, tactile board-game identity that feels like a beautifully illustrated tabletop box opened on a kitchen table. Chunky controls, paper-like surfaces, and a confident ink-and-candy palette make every action feel physical and friendly.
**Probability:** 0.073

### Theme Name: Storybook Parade
**Very Brief Intro:** A soft storybook world with hand-painted edges, gentle character framing, and a chapter-like flow between setup, secret selection, and play. The experience is calm, inviting, and slightly magical without becoming childish.
**Probability:** 0.041

### Theme Name: Midnight Arcade Club
**Very Brief Intro:** A dark, high-energy game-night direction with warm electric accents, chunky score panels, and dramatic reveals. The palette is theatrical and competitive, but reserved for a single dark option rather than the default visual reflex.
**Probability:** 0.086

## Chosen direction: Whimsical Tabletop Editorial

### Design Movement

Contemporary editorial game packaging with mid-century board-game illustration influences: bold printed shapes, tactile paper surfaces, oversized type, and a controlled mix of flat color and soft depth.

### Core Principles

1. **The table is the interface.** Layouts should feel placed on a shared game table rather than stacked into generic centered cards. Use offset panels, side rails, and anchored controls.
2. **Every card is a character.** The artwork is the visual center of gravity; names, traits, and elimination states must remain legible and distinct at a glance.
3. **Playful, not noisy.** Use warm color and expressive shapes while keeping the information hierarchy disciplined and the main action obvious.
4. **Privacy feels physical.** Pass & Play handoffs should feel like closing a game box: complete opaque cover, one clear instruction, no accidental peek.

### Color Philosophy

The signature palette combines a deep ink navy for rules and contrast, a sun-baked apricot for energy, a mellow butter yellow for highlights, and a cool teal for category/play-state information. The warm colors create the feeling of a real tabletop object while the navy keeps small text and controls crisp. Backgrounds use a light oat tone with faint grain rather than white, giving the board a physical surface without reducing contrast.

### Layout Paradigm

Use a **tabletop composition** instead of a single centered stack. Home uses an offset hero board with a small side rail for the leaderboard entry. Setup uses a split editorial panel: player details on one side and category/mode controls on the other. Gameplay uses a compact top rail, a flexible card field, and a sticky bottom action dock on phones. Split Screen becomes two facing table halves with a shared center seam.

### Signature Elements

1. **Ink tabs:** small navy label tabs with offset apricot shadow used for section headings, player identity, and category labels.
2. **Printed corner marks:** tiny four-point star and registration-mark details around primary panels to suggest a printed game board.
3. **Tactile card lift:** cards rise slightly on hover/press with a restrained paper-shadow and a visible strike stamp on elimination.

### Interaction Philosophy

Interactions should feel deliberate and reversible. Card selection has an immediate lift and border response. Elimination is a toggle, never a destructive action, and the crossed-out state remains visually obvious. Guess Mode is a distinct mode with a framed board and a cancel action. Hand-off overlays remove ambiguity and always require a clear continue gesture. Hold-to-peek uses a slow fill indicator and releases immediately when the pointer or key is released.

### Animation

Use 140–220ms ease-out transitions for buttons, cards, and selection states. Use a 240–320ms opacity/translate transition for route-level changes, beginning around 0.97 scale rather than zero. Card elimination should cross-fade the art treatment and stamp the strike without rearranging the grid. Dialogs should fade and lift from 0.98 scale. Victory confetti is reserved for a correct guess and is disabled or simplified under `prefers-reduced-motion`. Handoff overlay entry must be fast and fully opaque before the next private view is rendered.

### Typography System

Use **DM Sans** for interface text and **Bree Serif** for display titles and category labels. Display type is used for the logo, page title, result winner, and high-salience game prompts. DM Sans handles player names, card names, helper copy, controls, and table data. Headings should use a tight line-height; body text should stay at a comfortable 1.45–1.6 rhythm. Avoid all-caps except for tiny eyebrow labels and button microcopy where it improves scanning.

### Brand Essence

**A face-guessing tabletop game for two people sharing one screen, made more private, tactile, and visually expressive than a standard board.**

Personality adjectives: **cheeky, warm, observant**.

### Brand Voice

Headlines and CTAs should sound like a confident game host: short, specific, and lightly mischievous. Microcopy should reassure players about privacy and make rules easy to understand without sounding instructional or corporate.

Example lines:

> “Pick a face. Keep your poker face.”

> “Make the guess count.”

### Wordmark & Logo

The mark is a chunky ink-navy **question-mark speech bubble** with two offset eye dots, paired with a custom stacked wordmark where “GUESS” sits slightly above “WHO” like two facing name plates. The symbol must work alone as a favicon and app badge; the wordmark should be rendered as designed SVG/HTML lettering rather than relying on a default font treatment.

### Signature Brand Color

**Ink Navy — `#18253A`**. It is the ownable anchor color: dark enough for reliable contrast, soft enough to feel printed rather than corporate, and strong enough to unify every category color and handoff state.

## Style Decisions

- Use the Whimsical Tabletop Editorial direction consistently across the app.
- Keep the primary visual surface light oat rather than pure white; use Ink Navy for all critical text and privacy overlays.
- Do not use generic purple gradients, an all-Inter system, uniform floating cards, or excessive centered layouts.
- Generated character art must carry the visual distinction; UI decoration should support it rather than compete with it.
- Keep Pass & Play handoff screens fully opaque and visually spare, even when other screens use texture and ornament.
- Treat the dark homepage as an Ink Navy printed game-board surface framed by the oat tabletop, never as a separate tech landing universe.
- The brand mark visibly includes the question/speech-bubble character and offset eye dots, while the stacked GUESS/WHO plate remains a designed identity treatment.
- Setup and leaderboard panels borrow physical scorecard artifacts—offset paper shadows, registration marks, printed rules, and tab labels—before generic dashboard-card behavior.
