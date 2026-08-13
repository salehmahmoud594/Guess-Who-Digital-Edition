// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — every uploaded filename is a stable suspect identity.
import type { Category } from "./categories";
import { REPLACEMENT_CHARACTER_ASSETS, REPLACEMENT_CHARACTER_NAMES } from "./replacementCharacterAssets";
import { ANIMAL_ASSETS, ANIMAL_NAMES } from "./animalAssets";
import { CARTOON_ASSETS, CARTOON_NAMES } from "./cartoonAssets";
import { EGYPTIAN_MOVIE_ASSETS, EGYPTIAN_MOVIE_NAMES } from "./egyptianMovieAssets";
import { CARTOON_MOVIE_ASSETS, CARTOON_MOVIE_NAMES } from "./cartoonMovieAssets";
import { EMOJI_BY_NAME, EMOJI_NAMES } from "./emojiAssets";

export type GameItem = { id: number; name: string; category: Category; imageUrl: string; emoji?: string; artStatus: "generated" | "pending" };

const names: Record<Category, string[]> = {
  animals: ANIMAL_NAMES,
  fictional_characters: REPLACEMENT_CHARACTER_NAMES,
  cartoon_characters: CARTOON_NAMES,
  egyptian_movies: EGYPTIAN_MOVIE_NAMES,
  cartoon_movies: CARTOON_MOVIE_NAMES,
  emojis: EMOJI_NAMES,
};

// The fiction pool now contains all 150 uploaded reference characters. Each
// match still samples 24 cards, so the board stays readable on mobile.
const categoryOffset: Record<Category, number> = {
  animals: 0,
  fictional_characters: ANIMAL_NAMES.length,
  cartoon_characters: ANIMAL_NAMES.length + REPLACEMENT_CHARACTER_NAMES.length,
  egyptian_movies: ANIMAL_NAMES.length + REPLACEMENT_CHARACTER_NAMES.length + CARTOON_NAMES.length,
  cartoon_movies: ANIMAL_NAMES.length + REPLACEMENT_CHARACTER_NAMES.length + CARTOON_NAMES.length + EGYPTIAN_MOVIE_NAMES.length,
  emojis: ANIMAL_NAMES.length + REPLACEMENT_CHARACTER_NAMES.length + CARTOON_NAMES.length + EGYPTIAN_MOVIE_NAMES.length + CARTOON_MOVIE_NAMES.length,
};

export const CATEGORY_POOL_SIZE: Record<Category, number> = {
  animals: ANIMAL_NAMES.length,
  fictional_characters: REPLACEMENT_CHARACTER_NAMES.length,
  cartoon_characters: CARTOON_NAMES.length,
  egyptian_movies: EGYPTIAN_MOVIE_NAMES.length,
  cartoon_movies: CARTOON_MOVIE_NAMES.length,
  emojis: EMOJI_NAMES.length,
};

export const GAME_ITEMS: GameItem[] = (Object.keys(names) as Category[]).flatMap((category) => names[category].map((name, index) => {
  const id = categoryOffset[category] + index + 1;
  const imageUrl = category === "animals" ? ANIMAL_ASSETS[name] : category === "fictional_characters" ? REPLACEMENT_CHARACTER_ASSETS[name] : category === "cartoon_characters" ? CARTOON_ASSETS[name as keyof typeof CARTOON_ASSETS] : category === "egyptian_movies" ? EGYPTIAN_MOVIE_ASSETS[name] : category === "cartoon_movies" ? CARTOON_MOVIE_ASSETS[name] : "";
  const emoji = category === "emojis" ? EMOJI_BY_NAME[name] : undefined;
  const artStatus = "generated" as const;
  return { id, name, category, imageUrl, emoji, artStatus };
}));

export const generatedAssetCount = GAME_ITEMS.filter((item) => item.artStatus === "generated").length;
export const totalAssetCount = GAME_ITEMS.length;
