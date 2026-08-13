// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — gameplay is a live clue board with a sticky action dock and a hard privacy boundary.
import { useEffect, useState } from "react";
import { Flag, X } from "lucide-react";
import { useLocation } from "wouter";
import { AppFrame } from "@/components/game/AppFrame";
import { BoardPanel } from "@/components/game/BoardPanel";
import { HandoffOverlay } from "@/components/game/HandoffOverlay";
import { GameCard } from "@/components/game/GameCard";
import { useGame } from "@/contexts/GameContext";
import { otherPlayer, type PlayerId } from "@/lib/gameEngine";

export default function Gameplay() {
  const [, navigate] = useLocation();
  const { state, dispatch } = useGame();
  const [dialogPlayer, setDialogPlayer] = useState<PlayerId | null>(null);
  const [peekPlayer, setPeekPlayer] = useState<PlayerId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [guessId, setGuessId] = useState<number | null>(null);

  useEffect(() => {
    if (!state.feedback) return;
    setFeedback(state.feedback);
    const timeout = window.setTimeout(() => { setFeedback(null); dispatch({ type: "CLEAR_FEEDBACK" }); }, 2400);
    return () => window.clearTimeout(timeout);
  }, [state.feedback, dispatch]);

  useEffect(() => {
    if (state.screen === "result") navigate("/result");
  }, [state.screen, navigate]);

  const getItem = (id: number | null) => state.deck.find((item) => item.id === id);
  const startGuess = (player: PlayerId, id?: number) => {
    if (id === undefined) {
      if (state.guessMode && state.activePlayer === player) {
        dispatch({ type: "SET_GUESS_MODE", player, enabled: false });
        setDialogPlayer(null);
        return;
      }
      dispatch({ type: "SET_GUESS_MODE", player, enabled: true });
      return;
    }
    setGuessId(id);
    setDialogPlayer(player);
    dispatch({ type: "SET_PENDING_GUESS", itemId: id });
  };
  const confirmGuess = () => {
    if (!dialogPlayer) return;
    dispatch({ type: "RESOLVE_GUESS" });
    setDialogPlayer(null);
    setGuessId(null);
  };
  const endTurn = () => dispatch({ type: "SHOW_HANDOFF", nextPlayer: otherPlayer(state.activePlayer), reason: "turn" });
  const playerData = (player: PlayerId) => ({
    playerName: player === 1 ? state.player1Name : state.player2Name,
    deck: state.deck,
    eliminatedIds: player === 1 ? state.player1EliminatedIds : state.player2EliminatedIds,
    hearts: player === 1 ? state.player1Hearts : state.player2Hearts,
    secret: getItem(player === 1 ? state.player1SecretId : state.player2SecretId),
  });
  const dialogItem = getItem(guessId);
  const isSplit = state.mode === "split-screen";
  const current = playerData(state.activePlayer);
  const boardProps = (player: PlayerId) => {
    const data = playerData(player);
    return {
      player,
      playerName: data.playerName,
      deck: data.deck,
      eliminatedIds: data.eliminatedIds,
      hearts: data.hearts,
      secret: data.secret,
      guessMode: state.guessMode && state.activePlayer === player,
      peekVisible: peekPlayer === player,
      onToggle: (id: number) => dispatch({ type: "TOGGLE_ELIMINATED", player, itemId: id }),
      onGuess: () => startGuess(player),
      onCardGuess: (id: number) => startGuess(player, id),
      onPeekStart: () => setPeekPlayer(player),
      onPeekEnd: () => setPeekPlayer(null),
    };
  };

  return <AppFrame eyebrow={isSplit ? "Split Screen table" : "Pass & Play table"} title={`${state.player1Name} ${state.sessionScore[1]}  ·  ${state.sessionScore[2]} ${state.player2Name}`} action={<button className="icon-button" type="button" onClick={() => navigate("/")} aria-label="Exit game"><X size={18} /></button>}>
    <div className={`gameplay-page ${isSplit ? "is-split" : "is-pass-play"}`}>
      {!isSplit ? <>
        <div className="turn-rail"><span className="live-dot" /><span><strong>{current.playerName}'s turn</strong><small>Only your board is visible</small></span><span className="turn-rail-rule" /><span className="turn-tip">Tap to eliminate · Guess when ready</span></div>
        <BoardPanel {...boardProps(state.activePlayer)} onEndTurn={endTurn} showEndTurn={!state.guessMode} />
      </> : <div className="split-game">
        <BoardPanel {...boardProps(1)} />
        <div className="split-center-label"><span>GUESS</span><small>WHO?</small></div>
        <BoardPanel {...boardProps(2)} />
      </div>}
      {feedback && <div className="game-feedback" role="status">{feedback}</div>}
      {dialogItem && dialogPlayer && <GuessDialog item={dialogItem} playerName={dialogPlayer === 1 ? state.player1Name : state.player2Name} onCancel={() => { setDialogPlayer(null); setGuessId(null); dispatch({ type: "SET_PENDING_GUESS", itemId: null }); }} onConfirm={confirmGuess} />}
    </div>
    {state.handoff && <HandoffOverlay nextPlayerName={state.handoff.nextPlayer === 1 ? state.player1Name : state.player2Name} reason={state.handoff.reason} onContinue={() => dispatch({ type: "CLOSE_HANDOFF" })} />}
  </AppFrame>;
}

function GuessDialog({ item, playerName, onCancel, onConfirm }: { item: NonNullable<ReturnType<typeof useGame>["state"]["deck"][number]>; playerName: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="guess-title"><div className="guess-dialog"><span className="eyebrow">Final answer?</span><h2 id="guess-title">Are you sure it’s<br /><em>{item.name}</em>?</h2><p>{playerName}, this guess will use one heart if it misses.</p><div className="dialog-card"><GameCard item={item} eliminated={false} selectable={false} onClick={() => undefined} /></div><div className="dialog-actions"><button className="secondary-button" type="button" onClick={onCancel}>Not yet</button><button className="primary-button" type="button" onClick={onConfirm}>Make the guess <Flag size={17} /></button></div></div></div>;
}
