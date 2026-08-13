import { useEffect, useState } from "react";
import { ArrowLeft, Check, Flag, LoaderCircle, LockKeyhole, RefreshCw, X } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { AppFrame } from "@/components/game/AppFrame";
import { BoardPanel } from "@/components/game/BoardPanel";
import { GameCard } from "@/components/game/GameCard";
import { RoomConnectionBanner } from "@/components/game/RoomConnectionBanner";
import { problemFromMessage, RoomProblem } from "@/components/game/RoomProblem";
import { GAME_ITEMS, type GameItem } from "@/data/gameItems";
import { useRoomSnapshot } from "@/hooks/useRoomSession";
import { getRoomConnectionState } from "@/lib/roomConnection";
import { useRoomAction } from "@/lib/supabaseRoom";

function BackAction() { const [, navigate] = useLocation(); return <button className="icon-button" type="button" onClick={() => navigate("/room")} aria-label="Back to Room mode"><ArrowLeft size={18} /></button>; }
function RoomLoading({ isOffline = false }: { isOffline?: boolean }) { return <AppFrame eyebrow="Room mode" title="Connecting"><RoomConnectionBanner state={isOffline ? "offline" : "online"} /><section className="room-loading"><LoaderCircle className="room-spinner" size={25} /><p>{isOffline ? "Waiting for an internet connection…" : "Restoring your private board…"}</p></section></AppFrame>; }
function deckFor(snapshot: { deckIds: number[] }) { return snapshot.deckIds.map(id => GAME_ITEMS.find(item => item.id === id)).filter((item): item is GameItem => Boolean(item)); }

export function RoomSecret() {
  const [, params] = useRoute("/room/:code/secret");
  const roomCode = (params?.code ?? "").toUpperCase();
  const [, navigate] = useLocation();
  const { session, data: snapshot, isLoading, error, isError, refetch, isOnline } = useRoomSnapshot(roomCode);
  const selectSecret = useRoomAction();
  const [choice, setChoice] = useState<number | null>(null);
  useEffect(() => { if (!snapshot) return; if (snapshot.status === "waiting" || snapshot.status === "setup") navigate(`/room/${roomCode}/waiting`); if (snapshot.status === "playing" || snapshot.status === "finished") navigate(`/room/${roomCode}/game`); }, [navigate, roomCode, snapshot?.status]);
  if (!session) return <RoomProblem roomCode={roomCode} kind="missing" />;
  if (isLoading || (!snapshot && !isOnline)) return <RoomLoading isOffline={!isOnline} />;
  if (!snapshot) return <RoomProblem roomCode={roomCode} kind={problemFromMessage(error?.message)} message={error?.message} />;
  if (snapshot.status === "expired") return <RoomProblem roomCode={roomCode} kind="expired" />;
  const deck = deckFor(snapshot);
  const lockedId = snapshot.you.secretCardId;
  const selectedId = lockedId ?? choice;
  const lockSecret = async () => { if (!selectedId || selectSecret.isPending || lockedId || !isOnline) return; try { await selectSecret.run("room_select_secret", { p_room_id: snapshot.roomId, p_card_id: selectedId, p_expected_revision: snapshot.revision }); await refetch(); } catch { void refetch(); } };
  return <AppFrame eyebrow="Room mode · private pick" title="Choose your secret" action={<BackAction />}><RoomConnectionBanner state={getRoomConnectionState({ isOnline, hasSyncIssue: isError || Boolean(selectSecret.error) })} /><section className="secret-page room-secret-page"><div className="secret-heading"><div><span className="ink-tab">Private card</span><h1>{lockedId ? "Secret locked." : "Choose your face."}</h1><p>{lockedId ? "Your choice is safe on this device. We are waiting for the other player to lock theirs." : "Tap one card, then lock it in. The other device cannot see your secret."}</p></div><div className="private-badge"><LockKeyhole size={16} /> Private pick</div></div><div className="secret-grid">{deck.map(item => <div key={item.id} className={`room-secret-choice ${selectedId === item.id ? "is-selected" : ""}`}><GameCard item={item} eliminated={selectedId !== null && selectedId !== item.id} selectable={!lockedId && isOnline} onClick={() => setChoice(item.id)} /></div>)}</div><div className="secret-actions room-secret-actions">{lockedId ? <span className="room-wait-note"><LoaderCircle className="room-spinner" size={16} /> Waiting for the other private pick…</span> : <button className="primary-button" type="button" disabled={!selectedId || selectSecret.isPending || !isOnline} onClick={lockSecret}>{selectSecret.isPending ? <><LoaderCircle className="room-spinner" size={17} /> Locking in</> : <>Lock in this face <Check size={18} /></>}</button>}{selectSecret.error && <span className="helper-error">{selectSecret.error.message}</span>}</div></section></AppFrame>;
}

export function RoomGame() {
  const [, params] = useRoute("/room/:code/game");
  const roomCode = (params?.code ?? "").toUpperCase();
  const [, navigate] = useLocation();
  const { session, data: snapshot, isLoading, error, isError, refetch, isOnline } = useRoomSnapshot(roomCode);
  const toggleElimination = useRoomAction();
  const endTurn = useRoomAction();
  const submitGuess = useRoomAction();
  const startRematch = useRoomAction();
  const [guessMode, setGuessMode] = useState(false);
  const [guessId, setGuessId] = useState<number | null>(null);
  const [peekVisible, setPeekVisible] = useState(false);
  useEffect(() => { if (!snapshot) return; if (snapshot.status === "waiting" || snapshot.status === "setup") navigate(`/room/${roomCode}/waiting`); if (snapshot.status === "secret_selection") navigate(`/room/${roomCode}/secret`); }, [navigate, roomCode, snapshot?.status]);
  useEffect(() => { if (!snapshot || snapshot.activeSeat !== snapshot.you.seatNumber) { setGuessMode(false); setGuessId(null); } }, [snapshot?.activeSeat, snapshot?.revision, snapshot?.you.seatNumber]);
  if (!session) return <RoomProblem roomCode={roomCode} kind="missing" />;
  if (isLoading || (!snapshot && !isOnline)) return <RoomLoading isOffline={!isOnline} />;
  if (!snapshot) return <RoomProblem roomCode={roomCode} kind={problemFromMessage(error?.message)} message={error?.message} />;
  if (snapshot.status === "expired") return <RoomProblem roomCode={roomCode} kind="expired" />;
  const deck = deckFor(snapshot);
  const secret = deck.find(item => item.id === snapshot.you.secretCardId);
  const guessedItem = deck.find(item => item.id === guessId);
  const canPlay = snapshot.status === "playing" && snapshot.activeSeat === snapshot.you.seatNumber;
  const mutationBusy = toggleElimination.isPending || endTurn.isPending || submitGuess.isPending || startRematch.isPending;
  const commandError = toggleElimination.error ?? endTurn.error ?? submitGuess.error ?? startRematch.error;
  const connectionState = getRoomConnectionState({ isOnline, hasSyncIssue: isError || Boolean(commandError) });
  const rpcArgs = { p_room_id: snapshot.roomId, p_expected_revision: snapshot.revision };
  const run = async (action: () => Promise<unknown>) => { try { await action(); await refetch(); } catch { void refetch(); } };
  if (snapshot.status === "finished") return <AppFrame eyebrow="Room mode · round complete" title="The table has a winner" action={<BackAction />}><RoomConnectionBanner state={connectionState} /><section className="room-finish"><span className="ink-tab">Round complete</span><h1>{snapshot.winnerSeat === snapshot.you.seatNumber ? <>You <em>won.</em></> : <>Round <em>complete.</em></>}</h1><p>{snapshot.feedback ?? (snapshot.winReason === "hearts" ? "A player ran out of hearts." : "A secret was guessed.")}</p><div className="room-scoreline"><span><small>Player 1</small><strong>{snapshot.scores[1]}</strong></span><i>:</i><span><small>Player 2</small><strong>{snapshot.scores[2]}</strong></span></div><p className="room-finish-note">Your private secret stays on this device, even after the round ends.</p>{snapshot.you.seatNumber === 1 ? <button className="primary-button" type="button" disabled={startRematch.isPending || !isOnline} onClick={() => void run(() => startRematch.run("room_start_rematch", rpcArgs))}>{startRematch.isPending ? <><LoaderCircle className="room-spinner" size={17} /> Shuffling</> : <>Play another round <RefreshCw size={17} /></>}</button> : <span className="room-wait-note"><LoaderCircle className="room-spinner" size={16} /> Waiting for the host to deal again…</span>}{startRematch.error && <span className="helper-error">{startRematch.error.message}</span>}</section></AppFrame>;
  const toggleCard = (cardId: number) => { if (!canPlay || mutationBusy || guessMode || !isOnline) return; void run(() => toggleElimination.run("room_toggle_elimination", { ...rpcArgs, p_card_id: cardId })); };
  const passTurn = () => { if (canPlay && !mutationBusy && isOnline) void run(() => endTurn.run("room_end_turn", rpcArgs)); };
  const confirmGuess = () => { if (!guessId || !canPlay || mutationBusy || !isOnline) return; void run(async () => { await submitGuess.run("room_submit_guess", { ...rpcArgs, p_card_id: guessId }); setGuessMode(false); setGuessId(null); }); };
  const turnLabel = canPlay ? "Your turn" : `${snapshot.opponent.playerName ?? "The other player"} is taking a turn`;
  return <AppFrame eyebrow="Room mode · private board" title={`P1 ${snapshot.scores[1]}  ·  ${snapshot.scores[2]} P2`} action={<button className="icon-button" type="button" onClick={() => navigate("/")} aria-label="Exit Room"><X size={18} /></button>}><RoomConnectionBanner state={connectionState} /><section className="gameplay-page room-gameplay"><div className="turn-rail"><span className={canPlay ? "live-dot" : "room-wait-dot"} /><span><strong>{turnLabel}</strong><small>{canPlay ? "Ask, eliminate, then pass or make a final guess." : "Your private board is read-only until the turn changes."}</small></span><span className="turn-rail-rule" /><span className="turn-tip">Room {roomCode}</span></div><BoardPanel player={snapshot.you.seatNumber} playerName={snapshot.you.playerName} deck={deck} eliminatedIds={snapshot.you.eliminatedIds} hearts={snapshot.you.hearts} secret={secret} guessMode={guessMode} peekVisible={peekVisible} disabled={!canPlay || mutationBusy || !isOnline} onToggle={toggleCard} onGuess={() => canPlay && !mutationBusy && isOnline && setGuessMode(value => !value)} onCardGuess={id => canPlay && !mutationBusy && isOnline && setGuessId(id)} onPeekStart={() => setPeekVisible(true)} onPeekEnd={() => setPeekVisible(false)} onEndTurn={passTurn} showEndTurn /><div className="room-presence"><span className={snapshot.opponent.isConnected ? "is-online" : ""} />{snapshot.opponent.isConnected ? `${snapshot.opponent.playerName ?? "Player two"} is connected` : "Waiting for the other device to reconnect"}</div>{snapshot.feedback && <div className="game-feedback" role="status">{snapshot.feedback}</div>}{commandError && <p className="helper-error room-command-error">{commandError.message}</p>}{guessedItem && <GuessDialog item={guessedItem} onCancel={() => setGuessId(null)} onConfirm={confirmGuess} isPending={submitGuess.isPending} />}</section></AppFrame>;
}

function GuessDialog({ item, onCancel, onConfirm, isPending }: { item: GameItem; onCancel: () => void; onConfirm: () => void; isPending: boolean }) { return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="room-guess-title"><div className="guess-dialog"><span className="eyebrow">Final answer?</span><h2 id="room-guess-title">Are you sure it’s<br /><em>{item.name}</em>?</h2><p>A missed guess uses one of your own hearts, then passes the turn.</p><div className="dialog-card"><GameCard item={item} eliminated={false} selectable={false} onClick={() => undefined} /></div><div className="dialog-actions"><button className="secondary-button" type="button" disabled={isPending} onClick={onCancel}>Not yet</button><button className="primary-button" type="button" disabled={isPending} onClick={onConfirm}>{isPending ? <><LoaderCircle className="room-spinner" size={17} /> Checking</> : <>Make the guess <Flag size={17} /></>}</button></div></div></div>; }
