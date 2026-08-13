// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — secret selection is quiet, private, and framed like choosing one card from a box.
import { ArrowLeft, Check, LockKeyhole } from "lucide-react";
import { useLocation } from "wouter";
import { AppFrame } from "@/components/game/AppFrame";
import { GameCard } from "@/components/game/GameCard";
import { HandoffOverlay } from "@/components/game/HandoffOverlay";
import { useGame } from "@/contexts/GameContext";

export default function SecretSelection() {
  const [, navigate] = useLocation();
  const { state, dispatch } = useGame();
  const activeSecretPlayer = state.secretPlayer;
  const name = activeSecretPlayer === 1 ? state.player1Name : state.player2Name;
  const otherName = activeSecretPlayer === 1 ? state.player2Name : state.player1Name;
  const selected = activeSecretPlayer === 1 ? state.player1SecretId : state.player2SecretId;

  const choose = (id: number) => {
    dispatch({ type: "CHOOSE_SECRET", player: activeSecretPlayer, itemId: id });
  };

  const confirm = () => {
    if (!selected) return;
    if (state.secretPlayer === 2 && state.mode === "split-screen") {
      dispatch({ type: "CONFIRM_SECRET" });
      navigate("/game");
    } else {
      dispatch({ type: "CONFIRM_SECRET" });
    }
  };

  return (
    <AppFrame
      eyebrow={`Secret selection · Player ${activeSecretPlayer}`}
      title="Choose your secret"
      action={
        <button
          className="icon-button"
          type="button"
          onClick={() => navigate("/setup")}
          aria-label="Back to setup"
        >
          <ArrowLeft size={18} />
        </button>
      }
    >
      <div className="secret-page">
        <div className="secret-heading">
          <div>
            <span className="ink-tab">Player {activeSecretPlayer} · Secret card</span>
            <h1>{name}, choose secretly.</h1>
            <p>
              Tap one card to make it your secret. Keep your choice hidden from {otherName}.
            </p>
          </div>
          <div className="private-badge">
            <LockKeyhole size={16} /> Private pick
          </div>
        </div>

        <div className="secret-grid">
          {state.deck.map((item) => (
            <GameCard
              key={item.id}
              item={item}
              eliminated={selected !== null && selected !== item.id}
              onClick={() => choose(item.id)}
            />
          ))}
        </div>

        <div className="secret-actions">
          <button
            className="primary-button"
            type="button"
            disabled={!selected}
            onClick={confirm}
          >
            Lock in this face <Check size={18} />
          </button>
        </div>
      </div>

      {state.handoff && (
        <HandoffOverlay
          nextPlayerName={state.handoff.nextPlayer === 1 ? state.player1Name : state.player2Name}
          reason={state.handoff.reason}
          onContinue={() => {
            dispatch({ type: "CLOSE_HANDOFF" });
            if (state.handoff?.reason === "turn") navigate("/game");
          }}
        />
      )}
    </AppFrame>
  );
}
