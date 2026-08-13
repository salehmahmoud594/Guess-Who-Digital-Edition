// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — persistent scores read like a tidy scorecard, never like an admin table.
const STORAGE_KEY = "guess-who-digital-edition:leaderboard:v1";
export type LeaderboardEntry = { name: string; wins: number };

const normalize = (name: string) => name.trim().replace(/\s+/g, " ").slice(0, 32);
export const readLeaderboard = (): LeaderboardEntry[] => {
  try { const raw = localStorage.getItem(STORAGE_KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.name === "string" && typeof item.wins === "number") : []; } catch { return []; }
};
export const recordWin = (name: string) => {
  const normalized = normalize(name); if (!normalized) return readLeaderboard();
  const entries = readLeaderboard(); const found = entries.find((entry) => entry.name.toLowerCase() === normalized.toLowerCase());
  const next = found ? entries.map((entry) => entry === found ? { ...entry, wins: entry.wins + 1 } : entry) : [...entries, { name: normalized, wins: 1 }];
  next.sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name)); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); return next;
};
export const clearLeaderboard = () => localStorage.removeItem(STORAGE_KEY);
