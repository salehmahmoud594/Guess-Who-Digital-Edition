# Guess Who: Digital Edition — Replacement Character Reference

## Current source of truth

The previous fictional-character image set has been removed from the local webdev asset directory and from the runtime registry. The current source of truth is the user-supplied `cropped_characters.zip`: **150 individually cropped PNGs**, each named after the stable character name that the game displays beneath the image.

| Property | Current value |
| --- | --- |
| Category | Fictional Characters |
| Images | 150 |
| Naming rule | `<CharacterName>.png` |
| Runtime IDs | 31–180 |
| Match selection | 24 random fictional characters per match |
| Hosted status | 150/150 uploaded successfully |
| Legacy fictional PNGs | Removed from local source and runtime registry |

## Stable-name rule

The filename is the stable character identity. For example, `Abigail.png` maps to the game item `{ name: "Abigail", category: "fictional_characters" }`, and the corresponding image URL is stored in `replacementCharacterAssets.ts`. The name is rendered as the label beneath the image; it is not burned into the artwork.

## Animals

The user-supplied `cropped_anials.zip` is now the source of truth for the Animals category. It contains **88 individually cropped PNGs**; each filename without the `.png` extension is used verbatim as the stable animal name displayed below the card image.

| Property | Current value |
| --- | --- |
| Category | Animals |
| Images | 88 |
| Naming rule | Filename stem, including any source suffixes |
| Runtime IDs | 1–88 |
| Match selection | 24 random animals per match |
| Hosted status | 88/88 uploaded successfully |
| Framing | Clean 4:5 exports with the source sheet matte removed |

The hosted URL registry is maintained in `client/src/data/animalAssets.ts` and is consumed by `client/src/data/gameItems.ts`. Animal cards use the same full-image 4:5 treatment validated for the supplied artwork, with an animal-only focal override; the Fictional Characters artwork and presentation remain in their existing files unchanged.

## Cartoon Characters

The user-supplied `cartoon4x5_images.zip` is now the source of truth for the Cartoon Characters category. It contains **123 individually named WebP images**, all measured at **1024 × 1280 pixels** in RGB mode. Each filename stem is used verbatim as the stable cartoon-character name displayed below the image.

| Property | Current value |
| --- | --- |
| Category | Cartoon Characters |
| Images | 123 |
| Naming rule | Filename stem, including source spaces and punctuation |
| Runtime IDs | 239–361 |
| Match selection | 24 random cartoon characters per match |
| Hosted status | 123/123 uploaded successfully |
| Framing | Source-preserving 4:5 presentation; no aggressive mask or re-crop |

The hosted URL registry is maintained in `client/src/data/cartoonAssets.ts`. Because the supplied files already match the game’s 4:5 artwork slot, Cartoon cards preserve the original composition and use a category-specific no-zoom treatment. Long names are allowed to wrap to two lines in compact layouts.

## Registered filename set

The complete 150-name registry is maintained in `client/src/data/replacementCharacterAssets.ts` and used directly by `client/src/data/gameItems.ts`. The ordered set begins with `Abigail`, `Adam`, `Adham`, `Ahmed`, `Alaa`, `Alice`, `Amira`, `Anna`, `Anthony`, and `Aria`; continues through the uploaded alphabetized filenames; and ends with `Yahya`, `Yasmin`, `Yassin`, `Youmna`, `Zayd`, `Zayn`, `Ziad`, `Zoe`, and `Zoey`. The registry contains exactly 150 unique names and 150 hosted URLs.

## Movie categories

| Property | Egyptian Movies | Cartoon Movies |
| --- | --- | --- |
| Source archive | `egyptian_movies.zip` | `CartoonMovies.zip` |
| Images | 150 | 100 |
| Naming rule | Filename stem | Filename stem |
| Runtime IDs | 362–511 | 512–611 |
| Match selection | 24 random posters per match | 24 random posters per match |
| Hosted status | 150/150 uploaded successfully | 100/100 uploaded successfully |
| Framing | Full poster, `object-fit: contain` | Full poster, `object-fit: contain` |

The registries are maintained in `client/src/data/egyptianMovieAssets.ts` and `client/src/data/cartoonMovieAssets.ts`. All titles remain derived from the supplied filenames. The 4:5 artwork area uses `object-fit: contain`, preserving each complete poster without an aggressive crop or mask. The placeholder Food category has been removed from the client, Room settings, and game catalog.

## Runtime behavior

The category pools are intentionally larger than the visible board. At match start, the existing engine filters the selected category, shuffles all registered items, and samples 24 cards. This keeps the board readable on phones while making every uploaded named item eligible across matches. Fictional Characters use 150 assets, Animals use 88 assets, Cartoon Characters use 123 assets, Egyptian Movies use 150 assets, and Cartoon Movies use 100 assets.

## Verification record

The fictional files were extracted, staged under `/home/ubuntu/webdev-static-assets/fictional_crops/`, uploaded through the webdev asset pipeline with a reported result of 150 successes and 0 failures, and wired from the generated upload registry. The animal files were extracted from `cropped_anials.zip`, tightly reframed to clean 4:5 card art under `/home/ubuntu/webdev-static-assets/animals_crops/`, uploaded with a reported result of 88 successes and 0 failures, and wired from `animalAssets.ts`. The Cartoon files were extracted from `cartoon4x5_images.zip`, staged under `/home/ubuntu/webdev-static-assets/cartoon_crops/`, uploaded with a reported result of 123 successes and 0 failures, and wired from `cartoonAssets.ts`. The Egyptian Movies and Cartoon Movies files were staged under `/home/ubuntu/webdev-static-assets/movie-category-source/normalized/`, uploaded through the same persistent asset pipeline, and verified with browser smoke tests to deal 24 complete poster cards at mobile and desktop sizes. The old generated source files `fictional_characters_001.png`, `fictional_characters_002.png`, and `fictional_characters_003.png` were removed. The application must not reintroduce those legacy paths.
