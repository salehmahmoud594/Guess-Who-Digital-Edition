# Movie category asset record

## Egyptian Movies

- **Source:** `egyptian_movies.zip` supplied by the user.
- **Inventory:** 150 named WebP poster exports; each filename stem is retained as the stable in-game title.
- **Framing decision:** `object-fit: contain` within the established 4:5 card-art area, so the complete poster is visible rather than cropped.
- **Verification:** representative persistent storage URLs returned HTTP 200; the browser smoke test dealt 24 complete posters on a 390-pixel mobile viewport.

## Cartoon Movies

- **Source:** `CartoonMovies.zip` supplied by the user.
- **Inventory:** 100 named WebP poster exports; each filename stem is retained as the stable in-game title.
- **Framing decision:** the same full-poster `contain` treatment used for Egyptian Movies.
- **Verification:** the browser smoke test dealt 24 complete posters on a 1280-pixel desktop viewport.

## Visual review

The setup selector was captured at both 390×844 and 1280×900. Both movie categories are readable, reachable, and visually aligned with the existing category cards. The asset treatment does not alter Animals, Fictional Characters, or Cartoon Characters.
