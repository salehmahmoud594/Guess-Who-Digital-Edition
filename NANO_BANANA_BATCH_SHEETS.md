# برومبت Nano Banana — Batch Sheets لشخصيات Guess Who

## الفكرة الأساسية

بدل توليد 30 صورة منفصلة، اطلب من Nano Banana إنتاج **5 صور مصدرية منفصلة**. كل صورة تحتوي على صف واحد فيه **6 خلايا رأسية متساوية**؛ كل خلية تحتوي على شخصية واحدة فقط. بعد رفع الصور هنا، سأقص الخلايا إلى 30 ملفًا مستقلًا وأربط كل ملف بالـID الصحيح في اللعبة.

هذا الأسلوب أسرع، لكنه ينجح فقط إذا التزم Nano Banana بالترتيب، والمسافات، وعدم تداخل الشخصيات. لذلك لا تجعل الأداة تكتب أسماء داخل الصور؛ الاسم يتم ربطه بالترتيب: Sheet A / Column 1، ثم Sheet A / Column 2، وهكذا.

> **ملاحظة مهمة:** 6 شخصيات في صف واحد يجعل الصورة عريضة جدًا. استخدم أوسع aspect ratio متاح، وأعلى resolution، واطلب من الأداة ألا تضغط الشخصيات أو تقص الشعر والكتفين. إذا كانت Nano Banana لا تحافظ على الخلايا الست بوضوح، استخدم نفس البرومبت بخمس عمليات منفصلة، واحدة لكل Sheet.

---

## Master Prompt — انسخه كما هو

```text
Create exactly five separate high-resolution source-sheet images for a premium local two-player Guess Who: Digital Edition card game. Return five separate outputs, not one contact sheet containing all five sheets. Name them conceptually Sheet A, Sheet B, Sheet C, Sheet D, and Sheet E in the output order.

Each source sheet must contain exactly one horizontal row of six equal portrait tiles: six columns, one character per tile, in strict left-to-right order. Use the widest panoramic aspect ratio available and the highest available resolution. The six tiles must be separated by wide, perfectly straight cream gutters, with a clear outer margin around the row. Do not overlap subjects across gutters. Do not place any character in the gutter. Do not merge two characters into one tile. Do not swap the requested order.

Each tile is a source crop for one final individual game-card image. Within each tile, show one complete head-and-shoulders or upper-torso character, centered, with the full hair, hat, ears, face, neck, shoulders, and named accessory visible. Leave clean breathing room on every side so the tile can be cropped safely. Keep the subject inside its own tile. Do not put any text, names, numbers, labels, logos, signatures, watermarks, speech bubbles, card borders, frames, scenery, or UI inside the tiles. The gutters may remain plain cream and must not contain useful artwork.

GLOBAL VISUAL STYLE FOR ALL 30 TILES:
Semi-stylized editorial digital painting for a premium tabletop board game. Natural human proportions, individually authored faces, soft layered painterly shading, visible but controlled brush texture, nuanced facial planes, readable eyes, tactile hair and fabric, restrained warm highlights, and selective bold ink contour lines around important silhouette edges. The work must look like real illustrated character art, never like a vector avatar, DiceBear, Boring Avatars, emoji, flat icon, generic profile picture, plastic 3D render, chibi mascot, or parameter-swapped face template. Every character must have a different face shape, age, hairstyle, silhouette, expression, outfit, and accessory.

FIXED FICTIONAL-CHARACTERS BACKGROUND:
Every tile must use the exact same flat pale mist-blue background color #DDE7F6 behind the character, with only extremely subtle paper grain. No gradient, no room, no landscape, no decorative pattern, no cast shadow outside the character, and no background objects. Keep the background clean and consistent across all five sheets.

LIGHTING AND COLOR:
Use soft editorial studio lighting from the upper left. Model the face, hair, and clothes with gentle dimensional shading; do not use a flat single fill. Use the Guess Who palette where appropriate: ink navy #18253A, warm cream #FFF8ED, peach accent #F4AE92, muted teal #79B8AE, plus natural skin, hair, and clothing colors. Keep contrast strong enough for a small mobile game card while preserving the pale mist-blue background.

QUALITY GATE:
Reject and regenerate any sheet where a character is clipped, crosses a gutter, has a duplicated face, has a generic avatar head, has unreadable eyes, has a missing named accessory, has extra people, contains text, or is not in the exact requested column order. Do not improvise a different character if a name or specification is difficult. Preserve the exact six-column order for every sheet.

SHEET A — columns 1 through 6, left to right:
1. Copper Quinn: calm young adult detective, warm brown skin, narrow oval face, short copper curls, round amber glasses, observant eyes, moss-green overshirt, small brass magnifying pin, relaxed mouth, slight three-quarter turn.
2. Mister Vale: dignified older man, deep olive skin, broad rectangular face, swept-back silver hair, kind hooded eyes, neat gray moustache, burgundy waistcoat, cream shirt collar, small pocket watch chain, reserved half-smile.
3. Luma Finch: thoughtful older woman astronomer, deep brown skin, high cheekbones, expressive dark eyes, silver locs gathered into a loose side bun, navy turtleneck, one tiny star-shaped earring, gentle asymmetrical half-smile.
4. Nia North: confident middle-aged mountain guide, freckled light-brown skin, strong square jaw, tightly braided dark hair, red-orange knit cap pushed back, weathered denim jacket collar, direct gaze, determined brow, broad friendly smile.
5. Orin Glow: lanky young man, olive skin, long angular face, tousled black hair with one white streak, asymmetric eyebrows, mustard scarf, curious sideways glance, slightly crooked smile.
6. Sable Reed: mischievous young adult, dark skin, rounded face, shaved geometric haircut with one long violet braid, oversized yellow raincoat collar, amused raised eyebrow, playful half-smile, high-contrast silhouette.

SHEET B — columns 1 through 6, left to right:
1. Tessa Moon: young woman with pale freckles, heart-shaped face, long wavy midnight-blue hair, round silver earrings, plum cardigan, dreamy but alert eyes, small crescent hair clip.
2. Bram Kestrel: broad-shouldered middle-aged man, warm tan skin, square face, close-cropped black hair with gray at the temples, rust work jacket, thick eyebrows, small enamel bird pin, patient expression.
3. Yara Sun: young woman with golden-brown skin, high cheekbones, shaved side haircut with a long honey braid, bright orange scarf, turquoise hoop earring, confident chin, open joyful smile.
4. Milo March: slim young man with very light skin, long narrow face, curly auburn hair, round green spectacles, teal knit sweater, tiny notebook tucked into the collar, worried but kind expression.
5. Ari Lantern: androgynous young adult, medium brown skin, soft round face, short silver-blond hair, amber lantern-shaped earring, dark navy jacket, calm observant eyes, subtle closed-mouth smile.
6. Cleo Quill: older woman writer, warm beige skin, angular cheekbones, short white bob with a black streak, plum blazer, feather-shaped brooch, arched eyebrow, knowing expression.

SHEET C — columns 1 through 6, left to right:
1. Juno Tide: athletic young woman, deep brown skin, oval face, thick sea-green braids, coral windbreaker collar, shell-shaped hair clip, focused eyes, confident half-smile.
2. Pax Wilder: cheerful middle-aged man, copper-brown skin, wide face, messy dark curls, yellow rain jacket, blue enamel compass pin, bright eyes, slightly crooked grin.
3. Mara Bloom: young woman with warm olive skin, soft diamond-shaped face, shoulder-length pink-tinted curls, sage blouse, pressed flower tucked behind one ear, gentle smile, expressive eyebrows.
4. Ivo Flint: serious older man, dark skin, long rectangular face, shaved head with one silver eyebrow piercing, charcoal high-collar coat, red scarf knot, steady direct gaze.
5. Zara Moss: young adult woman, tan skin, rounded square face, thick moss-green curls, oversized cream sweater, tiny mushroom pendant, mischievous smile, one eyebrow lifted.
6. Theo Kite: lanky young man, medium-brown skin, prominent nose, tousled dark hair, pale blue windbreaker, tiny paper-kite patch, curious wide eyes, slightly tilted head.

SHEET D — columns 1 through 6, left to right:
1. Nell Orbit: petite older woman, dark brown skin, round face, close silver curls, coral cardigan, oversized round glasses, tiny planet earring, warm amused smile.
2. Owen Prism: young man with fair skin and a long oval face, split-color hair black and platinum, violet hoodie collar, triangular prism pendant, thoughtful side glance, soft neutral mouth.
3. Rhea Pocket: middle-aged woman, golden-brown skin, broad cheekbones, short curly black hair, mustard utility vest, round pocket watch badge, raised eyebrow, practical confident look.
4. Sol Harbor: young adult man, light brown skin, strong jaw, shoulder-length wavy dark hair, sea-blue knit sweater, tiny anchor earring, calm eyes, relaxed smile.
5. Mina Dusk: young woman with deep olive skin, narrow face, long black braid with violet ribbon, charcoal turtleneck, tiny moonstone necklace, quiet intense gaze, slightly pursed lips.
6. Ezra Lark: older man, warm brown skin, soft rectangular face, white hair swept to one side, green waistcoat, small bird-shaped tie pin, kind eyes, gentle smile.

SHEET E — columns 1 through 6, left to right:
1. Vera Comet: young woman with pale brown skin, triangular face, short flame-red hair, cream jumpsuit collar, comet-shaped gold earring, bright alert eyes, confident smile.
2. Kian Paper: slim young man, medium tan skin, high cheekbones, straight black hair cut in a geometric fringe, ivory shirt, folded-paper brooch, shy smile, observant eyes.
3. Lina Fern: middle-aged woman, warm dark skin, round face, shoulder-length natural curls with one fern-green streak, rust blouse, leaf pendant, open friendly smile.
4. Noah Ember: young man with very light skin, broad face, thick dark eyebrows, short curly hair with amber tips, brick-red hoodie collar, tiny flame pin, playful grin.
5. Aya Rook: young adult woman, brown skin, long angular face, asymmetrical black bob, deep teal coat, rook-shaped silver earring, sharp intelligent eyes, composed expression.
6. Finn Meadow: gentle older man, freckled fair skin, soft square face, long gray braid, moss cardigan, small sunflower badge, warm eyes, peaceful half-smile.

FINAL CHECK:
Return five separate wide source sheets in the exact order Sheet A, Sheet B, Sheet C, Sheet D, Sheet E. Each sheet must have one row and exactly six equal portrait tiles. Keep the six-character order exactly as written. The final files will be cropped by column position, so never move a character, overlap a gutter, add a seventh subject, or place text inside a tile.
```

---

## إعدادات مقترحة داخل Nano Banana

استخدم **أعلى جودة وأعلى resolution** متاحة، واختر أوسع aspect ratio أفقي. إذا ظهر اختيار “generate multiple images”، اجعله **5 outputs**، وليس صورة واحدة تحتوي على اللوحات الخمس. يجب أن تكون كل نتيجة Sheet مستقلة.

لا تستخدم “transparent background” هنا؛ الخلفية المطلوبة جزء من كل خلية وهي `#DDE7F6`. لا تطلب من الأداة إضافة أسماء أو أرقام داخل الخلايا؛ ترتيب الأعمدة هو الذي سيحدد الاسم.

إذا كانت النتيجة تضغط الوجوه أو تجعل كل شخصية صغيرة، لا تقبلها. أعد التوليد بنفس البرومبت واطلب تحديدًا: “larger subjects, wider gutters, full head-and-shoulders visible, no overlap.” جودة القص أهم من تقليل عدد مرات التوليد.

---

## خريطة القص بعد رفع الصور

كل Sheet تُقص إلى ستة ملفات. الترتيب يكون من اليسار إلى اليمين، ومن Sheet A إلى Sheet E:

| المصدر | الأعمدة | الملفات الناتجة |
| --- | --- | --- |
| Sheet A | 1–6 | `fictional_characters_001.png` إلى `fictional_characters_006.png` |
| Sheet B | 1–6 | `fictional_characters_007.png` إلى `fictional_characters_012.png` |
| Sheet C | 1–6 | `fictional_characters_013.png` إلى `fictional_characters_018.png` |
| Sheet D | 1–6 | `fictional_characters_019.png` إلى `fictional_characters_024.png` |
| Sheet E | 1–6 | `fictional_characters_025.png` إلى `fictional_characters_030.png` |

لا تقص الخلايا يدويًا بطريقة تغيّر النسبة بين الملفات. بعد الرفع، سأستخدم حدود الخلايا والجوتّر كمرجع، وأصدر كل ملف بنسبة نهائية 4:5 مع الحفاظ على الخلفية `#DDE7F6` وعدم قص الشعر أو الكتفين.

## فحص سريع قبل الرفع

قبل إرسال الصور، افتح كل Sheet وتأكد من وجود ست شخصيات فقط، بالترتيب الصحيح، ومن وجود فاصل واضح بين كل شخصية والتي تليها. إذا ظهر اسم أو رقم داخل الخلية، أو شخصية مقصوصة، أو وجه متكرر، أو تداخل بين عمودين، أعد توليد الـSheet نفسها بدل محاولة إصلاحها بالقص.

أرسل أولًا **Sheet A فقط** للمراجعة السريعة إذا كنت تريد تقليل المخاطرة. وإذا كانت النتيجة جيدة، أرسل Sheets B–E، ثم أرسلهم هنا بأسمائهم الواضحة. بعد استلام الخمس صور سأقصها، أفحصها، وأجهز manifest يربط كل crop بالاسم والـID واسم الـSheet ورقم العمود.
