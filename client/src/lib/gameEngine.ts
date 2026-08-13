// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — game rules stay crisp and deterministic behind the playful surface.
import type { Category } from "@/data/categories";
import type { GameItem } from "@/data/gameItems";

export type HeartOption = 1 | 3 | 5 | "unlimited";
export type PlayerId = 1 | 2;
export type GameMode = "pass-play" | "split-screen";

export const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
};

export const makeDeck = (items: GameItem[], category: Category) => shuffle(items.filter((item) => item.category === category)).slice(0, 24);
export const otherPlayer = (player: PlayerId): PlayerId => (player === 1 ? 2 : 1);
export const heartCount = (option: HeartOption) => option === "unlimited" ? null : option;
