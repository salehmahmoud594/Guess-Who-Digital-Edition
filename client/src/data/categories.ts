// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — warm paper surface, ink tabs, tactile cards, and disciplined playful color.
export type Category = "animals" | "fictional_characters" | "cartoon_characters" | "egyptian_movies" | "cartoon_movies" | "emojis";

export const CATEGORY_META: Record<Category, { label: string; eyebrow: string; color: string; soft: string; description: string }> = {
  animals: { label: "Animals", eyebrow: "Wild guesses", color: "#B96B4B", soft: "#F5D6C8", description: "Familiar faces with a few surprising details." },
  fictional_characters: { label: "Fictional characters", eyebrow: "Made-up people", color: "#4A6FA5", soft: "#DDE7F6", description: "Original portraits with clues hiding in plain sight." },
  cartoon_characters: { label: "Cartoon characters", eyebrow: "Big personalities", color: "#2F8A7F", soft: "#D5F0EB", description: "Whimsical silhouettes built for yes-or-no questions." },
  egyptian_movies: { label: "Egyptian Movies", eyebrow: "Silver-screen suspects", color: "#9A4E3C", soft: "#F4D8CF", description: "Spot iconic titles, actors, colors, and poster layouts." },
  cartoon_movies: { label: "Cartoon Movies", eyebrow: "Animated adventures", color: "#6E63B6", soft: "#E5E0F7", description: "Find familiar worlds, heroes, creatures, and cinematic clues." },
  emojis: { label: "Emojis", eyebrow: "Tiny symbols, big clues", color: "#D78234", soft: "#FBE6B8", description: "Read colors, expressions, objects, and little visual details." },
};

export const CATEGORY_ORDER: Category[] = ["animals", "fictional_characters", "cartoon_characters", "egyptian_movies", "cartoon_movies", "emojis"];
