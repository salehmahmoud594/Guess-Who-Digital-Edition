# Character Card Framing Findings

The supplied PNGs are tall source portraits with a pale outer matte and a blue illustrated panel. Representative files are 512–513 × 1292 pixels. The subject itself is readable and well illustrated, but displaying the entire source canvas inside a shorter 4:5 card-art slot with `object-fit: contain` shrinks the character and exposes large cream/blue margins. That is the visual failure shown in the latest screenshot.

The approved composition is a tighter portrait fill: preserve the face, hair, shoulders, and defining accessory while letting the card-art viewport crop unused source margin. The card should prioritize the character silhouette and use the pale category background as the surrounding field, rather than showing the entire tall source canvas as a miniature poster.

The revised stylesheet now uses a 4:5 art viewport with `object-fit: cover`, a slightly high focal position, and a restrained hover scale. Desktop and phone route captures passed without horizontal overflow; the game’s uninitialized secret route has no grid until a match is started, which is expected behavior.
