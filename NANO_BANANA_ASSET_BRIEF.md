# Guess Who: Digital Edition — Nano Banana Card-Art Brief

## How to use this brief

Generate **one standalone image per card**, never a contact sheet. Use the same visual reference for the entire deck if one is available: the Guess Who visual target or a screenshot of the approved tabletop-editorial interface. The reference is for **style, palette, and material language only**. Do not copy a reference character’s face, pose, hairstyle, or clothing into another card.

Start with the five Fictional Characters prompts in the approval batch below. Generate those five first and send them back for style approval. Do not generate the remaining 115 cards until the first batch is accepted, because the batch establishes the final interpretation of line weight, shading, crop, and facial variety.

## Fixed technical specification

| Requirement | Exact instruction |
| --- | --- |
| Output | One final image per card, PNG preferred; JPG acceptable if PNG is unavailable |
| Canvas | Portrait 4:5, ideally 1024 × 1280 or 2048 × 2560 pixels |
| Subject crop | Head-and-shoulders or upper-body portrait, subject fills roughly 72–82% of the height, never cut off at the forehead, ears, hat, paws, or food silhouette |
| Background | A single clean, flat category color with very subtle paper grain only; no scenery, room, landscape, gradients, frame, card border, or text |
| Lighting | Soft studio/editorial lighting from upper left, gentle shadow modeling, readable eyes and silhouette, no dramatic black shadow across the face |
| Palette | Ink navy `#18253A`, warm cream `#FFF8ED`, peach/apricot accent `#F4AE92`, muted teal `#79B8AE`, plus the category background below |
| Composition | Centered, front-facing or slight three-quarter view; calm readable pose designed for a small 6 × 5 game grid |
| Text | No words, letters, numbers, labels, logos, signatures, watermarks, speech bubbles, or UI elements inside the image |
| Continuity | Every card must be individually authored; do not use a parameter-swapped avatar template or a repeated face base |

## Category art direction and fixed backgrounds

The four categories must share the same editorial tabletop world but have visibly different illustration grammar.

| Category | Background | Required art direction |
| --- | --- | --- |
| Animals | `#F5D6C8` warm peach | Semi-stylized painted animal portraits with real species anatomy, tactile fur/feather/scale texture, playful accessories where named, and a few bold ink contours. Avoid generic mascot heads. |
| Fictional Characters | `#DDE7F6` pale mist blue | Semi-stylized digital-painting portraits with natural human proportions, soft layered skin and hair shading, nuanced facial planes, expressive eyes, and selective bold ink outlines. This is the approval batch below. |
| Cartoon Characters | `#D5F0EB` pale mint | Bold-outline, cel-shaded, exaggerated toon characters with unusual silhouettes, expressive poses, graphic shape language, and clear color blocking. Avoid the same round head and cap-like hair on every card. |
| Food | `#F8E4BF` warm custard | Illustrated food characters with convincing ingredient shapes and surface texture, bold ink contours, cel-shaded volume, expressive but simple faces, and distinct silhouettes. Do not turn every item into the same circular mascot. |

## Global prompt suffix

Append this exact constraint block to every card prompt after the subject description:

> Standalone Guess Who: Digital Edition game-card illustration, portrait 4:5 composition, fixed flat [CATEGORY HEX] background, centered readable silhouette, soft upper-left editorial lighting, subtle paper grain, clean edges, original hand-authored illustration, no text, no letters, no numbers, no logos, no watermark, no border, no card frame, no scenery, no UI, no contact sheet, no duplicate character, no generic avatar-generator look, no DiceBear/Boring-Avatars style, no plastic 3D render, no flat icon, no same-face template. Make the subject’s age, face shape, hairstyle, outfit, accessory, expression, and silhouette clearly distinct from every other card in this category.

## Approval batch: Fictional Characters 001–005

Use these five prompts exactly as the first style-review batch. Keep the filenames exactly as shown.

### `fictional_characters_001.png` — Copper Quinn

> Create one standalone illustrated game-card portrait for the Fictional Characters category. Copper Quinn is a calm young adult detective with warm brown skin, short copper curls, round amber glasses, a moss-green overshirt, and a small brass magnifying pin. Give Copper a narrow oval face, observant eyes, a relaxed mouth, and a slight three-quarter turn. Use semi-stylized digital painting with soft dimensional skin shading, visible but controlled brush texture in the curls and overshirt, natural human proportions, and a few bold ink contour accents around the silhouette. Background: pale mist blue `#DDE7F6`. [Append the Global prompt suffix, replacing CATEGORY HEX with `#DDE7F6`.]

### `fictional_characters_002.png` — Mister Vale

> Create one standalone illustrated game-card portrait for the Fictional Characters category. Mister Vale is a dignified older man with deep olive skin, a broad rectangular face, swept-back silver hair, a burgundy waistcoat, a cream shirt collar, and a small pocket watch chain. Give him kind hooded eyes, a neat gray moustache, and a reserved half-smile. Use semi-stylized digital painting with soft layered shading, natural anatomy, tactile fabric, nuanced wrinkles, and selective bold ink outlines. He must look substantially older and structurally different from the other cards. Background: pale mist blue `#DDE7F6`. [Append the Global prompt suffix, replacing CATEGORY HEX with `#DDE7F6`.]

### `fictional_characters_003.png` — Luma Finch

> Create one standalone illustrated game-card portrait for the Fictional Characters category. Luma Finch is a thoughtful older woman astronomer with deep brown skin, silver locs gathered into a loose side bun, a navy turtleneck, and one tiny star-shaped earring. Give Luma high cheekbones, expressive dark eyes, and a gentle asymmetrical half-smile. Use semi-stylized digital painting with soft skin and hair shading, visible loc texture, subtle cool highlights, natural proportions, and a few confident ink contour accents. Background: pale mist blue `#DDE7F6`. [Append the Global prompt suffix, replacing CATEGORY HEX with `#DDE7F6`.]

### `fictional_characters_004.png` — Nia North

> Create one standalone illustrated game-card portrait for the Fictional Characters category. Nia North is a confident middle-aged mountain guide with freckled light-brown skin, a strong square jaw, tightly braided dark hair, a red-orange knit cap pushed back, and a weathered denim jacket collar. Give Nia a direct gaze, a determined brow, and a broad friendly smile. Use semi-stylized digital painting with natural human proportions, tactile braid and denim details, warm cheek shading, and selective bold ink contours that clarify the silhouette. Background: pale mist blue `#DDE7F6`. [Append the Global prompt suffix, replacing CATEGORY HEX with `#DDE7F6`.]

### `fictional_characters_005.png` — Orin Glow

> Create one standalone illustrated game-card portrait for the Fictional Characters category. Orin Glow is a lanky young man with olive skin, a long angular face, tousled black hair with one white streak, a mustard scarf, and a curious sideways glance. Give Orin asymmetric eyebrows, a slightly crooked smile, and a noticeably different silhouette from Copper, Mister Vale, Luma, and Nia. Use semi-stylized digital painting with visible elegant brushwork, soft jaw and cheek shading, expressive eyes, selective bold ink contours, and restrained warm/cool contrast. Background: pale mist blue `#DDE7F6`. [Append the Global prompt suffix, replacing CATEGORY HEX with `#DDE7F6`.]

## Full deck roster and exact filenames

The numeric IDs are fixed by the app: Animals 001–030 are IDs 1–30, Fictional Characters 001–030 are IDs 31–60, Cartoon Characters 001–030 are IDs 61–90, and Food 001–030 are IDs 91–120.

| ID range | Filename range | Character names in order |
| --- | --- | --- |
| 001–030 | `animals_001.png` … `animals_030.png` | Ruby Panda; Tumble Elephant; Professor Owl; Pip Frog; Mochi Alpaca; Captain Penguin; Sunny Lion; Pixel Chameleon; Scout Collie; Flora Flamingo; Marmalade Cat; Bluebell Whale; Rio Macaw; Bunny Hop; Moss Bear; Clover Crocodile; Maple Giraffe; Pepper Goat; Doodle Octopus; Button Mouse; Nori Fox; Puddle Seal; Cocoa Koala; Bramble Hedgehog; Sage Turtle; Biscuit Dog; Mango Parrot; Cloud Sheep; Waffle Llama; Juniper Deer |
| 031–060 | `fictional_characters_001.png` … `fictional_characters_030.png` | Copper Quinn; Mister Vale; Luma Finch; Nia North; Orin Glow; Sable Reed; Tessa Moon; Bram Kestrel; Yara Sun; Milo March; Ari Lantern; Cleo Quill; Juno Tide; Pax Wilder; Mara Bloom; Ivo Flint; Zara Moss; Theo Kite; Nell Orbit; Owen Prism; Rhea Pocket; Sol Harbor; Mina Dusk; Ezra Lark; Vera Comet; Kian Paper; Lina Fern; Noah Ember; Aya Rook; Finn Meadow |
| 061–090 | `cartoon_characters_001.png` … `cartoon_characters_030.png` | Bloop; Moxie; Captain Wobble; Ziggy Pop; Noodle; Pogo; Sprocket; Bibi; Taffy; Gizmo; Wink; Dandy; Cricket; Momo; Flapjack; Pipkin; Rollo; Tizzy; Boop; Kiki; Waffle; Bramble; Zuzu; Quibble; Misty; Tango; Puffin; Doodlebug; Fizzy; Mallow |
| 091–120 | `food_001.png` … `food_030.png` | Sunny Toast; Berry Tart; Noodle Bowl; Taco Star; Melon Slice; Dumpling; Pancake Stack; Pretzel Pal; Sushi Roll; Cupcake; Avocado; Corn Cob; Popcorn; Cheese Wheel; Apple Pie; Lemon; Cookie; Bento Box; Pita Pocket; Mushroom; Pasta Bow; Donut; Watermelon; Soup Bowl; Waffle; Carrot; Ice Cream; Chili Pepper; Bagel; Pineapple |

## Upload and manifest rules

Put the files in one folder with the exact lowercase filenames above. Do not rename them with spaces, Arabic text, version suffixes, or category aliases. Upload the first five Fictional Characters files first for approval. When uploading the full deck, preserve the filenames so the app can map them deterministically.

For each file, the final manifest must record the numeric ID, exact filename, category, character name, generation prompt, hosted project-storage URL, and verification status. A card is not complete until its image opens successfully from the hosted URL and the app renders it without a 4xx/5xx request. The manifest must contain **120 real rows**, not ranges such as “001–030” and not claims based on local files alone.

## What to send back

First send the five files `fictional_characters_001.png` through `fictional_characters_005.png`. I will inspect the style against the gate: painterly shading, natural proportions, distinct faces, consistent pale mist-blue background, and no avatar-template repetition. After approval, send the remaining 115 files using the exact roster and filenames above. Then I will ingest, host, wire, validate, and update the manifest.
