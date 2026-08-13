// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — privacy, player separation, and tactile flow are the non-negotiable rules under the skin.
import { createContext, useContext, useMemo, useReducer } from "react";
import { GAME_ITEMS, type GameItem } from "@/data/gameItems";
import { makeDeck, otherPlayer, heartCount, type GameMode, type HeartOption, type PlayerId } from "@/lib/gameEngine";
import type { Category } from "@/data/categories";
import { recordWin } from "@/lib/leaderboard";

export type Screen = "home" | "setup" | "secret" | "gameplay" | "result";
type State = {
  screen: Screen; player1Name: string; player2Name: string; category: Category; mode: GameMode; heartOption: HeartOption;
  deck: GameItem[]; player1SecretId: number | null; player2SecretId: number | null; player1EliminatedIds: number[]; player2EliminatedIds: number[];
  player1Hearts: number | null; player2Hearts: number | null; sessionScore: { 1: number; 2: number }; activePlayer: PlayerId; secretPlayer: PlayerId;
  handoff: { visible: boolean; nextPlayer: PlayerId; reason: "secret" | "turn" } | null; guessMode: boolean; pendingGuessId: number | null; winner: PlayerId | null; winReason: "guess" | "hearts" | null; feedback: string | null; peekPlayer: PlayerId | null;
};
type Action =
  | { type: "SETUP"; payload: Partial<Pick<State, "player1Name" | "player2Name" | "category" | "mode" | "heartOption">> }
  | { type: "START" } | { type: "CHOOSE_SECRET"; player: PlayerId; itemId: number } | { type: "CONFIRM_SECRET" }
  | { type: "SHOW_HANDOFF"; nextPlayer: PlayerId; reason: "secret" | "turn" } | { type: "CLOSE_HANDOFF" }
  | { type: "TOGGLE_ELIMINATED"; player: PlayerId; itemId: number } | { type: "SET_GUESS_MODE"; player: PlayerId; enabled: boolean } | { type: "SET_PENDING_GUESS"; itemId: number | null }
  | { type: "RESOLVE_GUESS" } | { type: "START_AGAIN" } | { type: "MAIN_MENU" } | { type: "SET_PEEK"; player: PlayerId | null } | { type: "CLEAR_FEEDBACK" };

const initial: State = { screen: "home", player1Name: "", player2Name: "", category: "animals", mode: "pass-play", heartOption: 3, deck: [], player1SecretId: null, player2SecretId: null, player1EliminatedIds: [], player2EliminatedIds: [], player1Hearts: 3, player2Hearts: 3, sessionScore: { 1: 0, 2: 0 }, activePlayer: 1, secretPlayer: 1, handoff: null, guessMode: false, pendingGuessId: null, winner: null, winReason: null, feedback: null, peekPlayer: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SETUP": return { ...state, ...action.payload };
    case "START": { const deck = makeDeck(GAME_ITEMS, state.category); const hearts = heartCount(state.heartOption); return { ...state, screen: "secret", deck, player1SecretId: null, player2SecretId: null, player1EliminatedIds: [], player2EliminatedIds: [], player1Hearts: hearts, player2Hearts: hearts, activePlayer: 1, secretPlayer: 1, handoff: null, guessMode: false, pendingGuessId: null, winner: null, winReason: null, feedback: null }; }
    case "CHOOSE_SECRET": return action.player === 1 ? { ...state, player1SecretId: action.itemId } : { ...state, player2SecretId: action.itemId };
    case "CONFIRM_SECRET": {
      if (state.secretPlayer === 1) {
        return { ...state, secretPlayer: 2, handoff: { visible: true, nextPlayer: 2, reason: "secret" } };
      }
      if (state.secretPlayer === 2) {
        if (state.mode === "split-screen") {
          return { ...state, screen: "gameplay", activePlayer: 1, handoff: null };
        }
        return { ...state, screen: "gameplay", activePlayer: 1, handoff: { visible: true, nextPlayer: 1, reason: "turn" } };
      }
      return state;
    }
    case "SHOW_HANDOFF": return { ...state, handoff: { visible: true, nextPlayer: action.nextPlayer, reason: action.reason }, guessMode: false, pendingGuessId: null };
    case "CLOSE_HANDOFF": return { ...state, handoff: null, activePlayer: state.handoff?.nextPlayer ?? state.activePlayer, secretPlayer: state.handoff?.nextPlayer ?? state.secretPlayer };
    case "TOGGLE_ELIMINATED": { const key = action.player === 1 ? "player1EliminatedIds" : "player2EliminatedIds"; const ids = state[key].includes(action.itemId) ? state[key].filter((id) => id !== action.itemId) : [...state[key], action.itemId]; return { ...state, [key]: ids } as State; }
    case "SET_GUESS_MODE": return { ...state, activePlayer: action.player, guessMode: action.enabled, pendingGuessId: null };
    case "SET_PENDING_GUESS": return { ...state, pendingGuessId: action.itemId };
    case "RESOLVE_GUESS": { const player = state.activePlayer; const selected = state.pendingGuessId; const target = player === 1 ? state.player2SecretId : state.player1SecretId; if (!selected) return state; if (selected === target) { recordWin(player === 1 ? state.player1Name : state.player2Name); return { ...state, screen: "result", winner: player, winReason: "guess", sessionScore: { ...state.sessionScore, [player]: state.sessionScore[player] + 1 }, guessMode: false, pendingGuessId: null }; }
      if (state.heartOption === "unlimited") return { ...state, feedback: "Not quite — unlimited guesses means you can keep asking.", guessMode: false, pendingGuessId: null, handoff: state.mode === "pass-play" ? { visible: true, nextPlayer: otherPlayer(player), reason: "turn" } : null, activePlayer: otherPlayer(player) };
      const key = player === 1 ? "player1Hearts" : "player2Hearts"; const current = state[key] as number; const nextHearts = Math.max(0, current - 1); const next = { ...state, [key]: nextHearts, feedback: `No match. ${player === 1 ? state.player1Name : state.player2Name} lost one heart.`, guessMode: false, pendingGuessId: null } as State;
      if (nextHearts === 0) { recordWin(otherPlayer(player) === 1 ? state.player1Name : state.player2Name); return { ...next, screen: "result", winner: otherPlayer(player), winReason: "hearts" }; }
      return { ...next, handoff: state.mode === "pass-play" ? { visible: true, nextPlayer: otherPlayer(player), reason: "turn" } : null, activePlayer: otherPlayer(player) };
    }
    case "START_AGAIN": { const deck = makeDeck(GAME_ITEMS, state.category); const hearts = heartCount(state.heartOption); return { ...state, screen: "secret", deck, player1SecretId: null, player2SecretId: null, player1EliminatedIds: [], player2EliminatedIds: [], player1Hearts: hearts, player2Hearts: hearts, activePlayer: 1, secretPlayer: 1, handoff: null, guessMode: false, pendingGuessId: null, winner: null, winReason: null, feedback: null }; }
    case "MAIN_MENU": return { ...initial, player1Name: "", player2Name: "" };
    case "SET_PEEK": return { ...state, peekPlayer: action.player };
    case "CLEAR_FEEDBACK": return { ...state, feedback: null };
    default: return state;
  }
}

const GameContext = createContext<null | { state: State; dispatch: React.Dispatch<Action> }>(null);
export function GameProvider({ children }: { children: React.ReactNode }) { const [state, dispatch] = useReducer(reducer, initial); const value = useMemo(() => ({ state, dispatch }), [state]); return <GameContext.Provider value={value}>{children}</GameContext.Provider>; }
export function useGame() { const context = useContext(GameContext); if (!context) throw new Error("useGame must be used inside GameProvider"); return context; }
