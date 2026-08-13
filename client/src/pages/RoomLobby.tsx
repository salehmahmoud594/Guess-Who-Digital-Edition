import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, Link2, LoaderCircle, MonitorSmartphone, UsersRound } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { AppFrame } from "@/components/game/AppFrame";
import { problemFromMessage, RoomProblem } from "@/components/game/RoomProblem";
import { CATEGORY_META, type Category } from "@/data/categories";
import type { HeartOption } from "@/lib/gameEngine";
import { trpc } from "@/lib/trpc";
import { getRoomTabId, useRoomSnapshot } from "@/hooks/useRoomSession";

const ROOM_CATEGORIES: Category[] = ["animals", "fictional_characters", "cartoon_characters", "egyptian_movies", "cartoon_movies", "emojis"];
function BackAction() {
  const [, navigate] = useLocation();
  return <button className="icon-button" type="button" onClick={() => navigate("/")} aria-label="Back to home"><ArrowLeft size={18} /></button>;
}

export function RoomEntry() {
  const [, navigate] = useLocation();
  return <AppFrame eyebrow="Two devices · one table" title="Play in a Room" action={<BackAction />}>
    <section className="room-entry">
      <div className="room-entry-copy"><span className="ink-tab">Room mode</span><h1>Bring a friend<br /><em>to the table.</em></h1><p>Use a six-character code to play from two different devices. Each player gets a private board, secret card, hearts, and turn.</p></div>
      <div className="room-entry-actions">
        <button className="room-option room-option-host" type="button" onClick={() => navigate("/room/create")}><span className="room-option-icon"><MonitorSmartphone size={25} /></span><span><strong>Create a Room</strong><small>Choose the cards and invite player two.</small></span><ArrowRight size={20} /></button>
        <button className="room-option" type="button" onClick={() => navigate("/room/join")}><span className="room-option-icon"><Link2 size={25} /></span><span><strong>Join with a code</strong><small>Enter your friend’s code and take seat two.</small></span><ArrowRight size={20} /></button>
        <p className="room-entry-note"><UsersRound size={16} /> No account, chat, or microphone required.</p>
      </div>
    </section>
  </AppFrame>;
}

export function RoomCreate() {
  const [, navigate] = useLocation();
  const [playerName, setPlayerName] = useState("");
  const [category, setCategory] = useState<Category>("animals");
  const [heartOption, setHeartOption] = useState<HeartOption>(3);
  const createRoom = trpc.room.createRoom.useMutation();
  const valid = playerName.trim().length > 0;

  const create = () => {
    if (!valid || createRoom.isPending) return;
    createRoom.mutate({ playerName: playerName.trim(), category, heartOption, tabId: getRoomTabId() }, {
      onSuccess: result => {
        try { sessionStorage.setItem("guess-who:room-seat", JSON.stringify({ roomCode: result.roomCode, seatNumber: result.seatNumber, seatToken: result.seatToken, tabId: getRoomTabId() })); } catch { /* session recovery remains optional when storage is blocked */ }
        navigate(`/room/${result.roomCode}/waiting`);
      },
    });
  };

  return <AppFrame eyebrow="Room mode · host" title="Set the table" action={<BackAction />}>
    <section className="room-setup-layout">
      <div className="room-setup-intro"><span className="ink-tab">01 / Host</span><h1>Deal your<br /><em>own table.</em></h1><p>You set the category and heart rule. Your friend will join using the code you receive next.</p></div>
      <div className="setup-form room-form">
        <div className="form-block"><div className="section-heading"><span className="eyebrow">Your name</span><span className="form-count">Seat one</span></div><div className="name-grid room-name-grid"><label><span>What should player two call you?</span><input autoFocus value={playerName} maxLength={32} placeholder="e.g. Ahmed" onChange={event => setPlayerName(event.target.value)} /></label></div></div>
        <div className="form-block"><div className="section-heading"><span className="eyebrow">Choose a world</span><span className="form-count">24 cards per round</span></div><div className="category-grid">{ROOM_CATEGORIES.map(option => { const meta = CATEGORY_META[option]; return <button key={option} type="button" className={`choice-tile ${category === option ? "is-selected" : ""}`} style={{ "--choice-color": meta.color, "--choice-soft": meta.soft } as React.CSSProperties} onClick={() => setCategory(option)}><span className="choice-icon">{option === "animals" ? "🐾" : option === "fictional_characters" ? "◉" : option === "cartoon_characters" ? "✦" : option === "emojis" ? "😀" : "▦"}</span><span><strong>{meta.label}</strong><small>{meta.eyebrow}</small></span>{category === option && <Check size={16} />}</button>; })}</div></div>
        <div className="form-block compact-block"><div className="section-heading"><span className="eyebrow">Wrong guesses</span><span className="form-count">Each player keeps their own hearts</span></div><div className="segmented">{([1, 3, 5, "unlimited"] as HeartOption[]).map(option => <button key={String(option)} type="button" className={heartOption === option ? "is-selected" : ""} onClick={() => setHeartOption(option)}>{option === "unlimited" ? "∞" : option}<small>{option === "unlimited" ? "free" : "hearts"}</small></button>)}</div></div>
        <div className="setup-submit"><button className="primary-button" type="button" disabled={!valid || createRoom.isPending} onClick={create}>{createRoom.isPending ? <><LoaderCircle className="room-spinner" size={17} /> Opening room</> : <>Open the Room <ArrowRight size={18} /></>}</button>{createRoom.error && <span className="helper-error">{createRoom.error.message}</span>}</div>
      </div>
    </section>
  </AppFrame>;
}

export function RoomJoin() {
  const [, navigate] = useLocation();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const joinRoom = trpc.room.joinRoom.useMutation();
  const valid = playerName.trim().length > 0 && roomCode.length === 6;

  const join = () => {
    if (!valid || joinRoom.isPending) return;
    const tabId = getRoomTabId();
    joinRoom.mutate({ playerName: playerName.trim(), roomCode, tabId }, {
      onSuccess: result => {
        try { sessionStorage.setItem("guess-who:room-seat", JSON.stringify({ roomCode: result.roomCode, seatNumber: result.seatNumber, seatToken: result.seatToken, tabId })); } catch { /* session recovery remains optional when storage is blocked */ }
        navigate(`/room/${result.roomCode}/waiting`);
      },
    });
  };

  return <AppFrame eyebrow="Room mode · player two" title="Join the table" action={<BackAction />}>
    <section className="room-join"><div className="room-join-paper"><span className="ink-tab">Join a room</span><h1>Bring the<br /><em>six-letter code.</em></h1><p>Your board and secret remain private on this device.</p><div className="room-join-fields"><label><span>Your name</span><input autoFocus value={playerName} maxLength={32} placeholder="e.g. Salma" onChange={event => setPlayerName(event.target.value)} /></label><label><span>Room code</span><input className="room-code-input" value={roomCode} inputMode="text" maxLength={6} placeholder="ABC123" onChange={event => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))} /></label></div><button className="primary-button" type="button" disabled={!valid || joinRoom.isPending} onClick={join}>{joinRoom.isPending ? <><LoaderCircle className="room-spinner" size={17} /> Taking a seat</> : <>Join the Room <ArrowRight size={18} /></>}</button>{joinRoom.error && <p className="helper-error">{joinRoom.error.message}</p>}</div></section>
  </AppFrame>;
}

export function RoomWaiting() {
  const [, params] = useRoute("/room/:code/waiting");
  const roomCode = (params?.code ?? "").toUpperCase();
  const [, navigate] = useLocation();
  const { session, request, snapshotQuery, reconnect } = useRoomSnapshot(roomCode);
  const setReady = trpc.room.setReady.useMutation();
  const [copied, setCopied] = useState(false);
  const snapshot = snapshotQuery.data;

  useEffect(() => {
    if (snapshot?.status === "secret_selection") navigate(`/room/${roomCode}/secret`);
    if (snapshot?.status === "playing") navigate(`/room/${roomCode}/game`);
  }, [navigate, roomCode, snapshot?.status]);

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(roomCode); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  };

  if (!session) return <RoomProblem roomCode={roomCode} kind="missing" />;
  if (snapshotQuery.isLoading || reconnect.isPending) return <AppFrame eyebrow="Room mode" title="Connecting"><section className="room-loading"><LoaderCircle className="room-spinner" size={25} /><p>Restoring your private seat…</p></section></AppFrame>;
  if (snapshotQuery.error || !snapshot) return <RoomProblem roomCode={roomCode} kind={problemFromMessage(snapshotQuery.error?.message)} message={snapshotQuery.error?.message} />;
  if (snapshot.status === "expired") return <RoomProblem roomCode={roomCode} kind="expired" />;

  const hasOpponent = snapshot.opponent.seatNumber !== null;
  const canReady = hasOpponent && (snapshot.status === "waiting" || snapshot.status === "setup");
  const action = () => setReady.mutate({ ...request, ready: !snapshot.you.ready, expectedRevision: snapshot.revision }, { onSuccess: () => snapshotQuery.refetch() });
  return <AppFrame eyebrow="Room mode · private seat" title="Waiting at the table" action={<BackAction />}>
    <section className="room-waiting"><div className="room-code-card"><span className="eyebrow">Your invite code</span><strong>{roomCode}</strong><button className="room-copy-button" type="button" onClick={copyCode}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy code</>}</button><small>Send this to player two. The code expires after a short inactive period.</small></div><div className="room-waiting-status"><div className="room-seat-list"><div className="room-seat"><span className="room-seat-marker">1</span><span><strong>{snapshot.you.seatNumber === 1 ? snapshot.you.playerName : snapshot.opponent.playerName ?? "Host"}</strong><small>{snapshot.you.seatNumber === 1 ? "You · host" : "Host"}</small></span><i className={snapshot.you.seatNumber === 1 ? "is-online" : snapshot.opponent.isConnected ? "is-online" : ""} /></div><div className="room-seat"><span className="room-seat-marker room-seat-two">2</span><span><strong>{snapshot.you.seatNumber === 2 ? snapshot.you.playerName : snapshot.opponent.playerName ?? "Waiting for player two"}</strong><small>{snapshot.you.seatNumber === 2 ? "You" : snapshot.opponent.playerName ? "Joined the Room" : "Share the code above"}</small></span><i className={snapshot.you.seatNumber === 2 ? "is-online" : snapshot.opponent.isConnected ? "is-online" : ""} /></div></div><div className="room-ready-panel"><span className="eyebrow">Ready check</span><h1>{hasOpponent ? "Both players, ready?" : "Waiting for a friend."}</h1><p>{hasOpponent ? "When both seats are ready, each device privately chooses a secret card." : "They can join from any device by entering your six-character code."}</p><button className="primary-button" type="button" disabled={!canReady || setReady.isPending} onClick={action}>{snapshot.you.ready ? <><Check size={18} /> Ready — tap to undo</> : <>I’m ready <ArrowRight size={18} /></>}</button>{setReady.error && <span className="helper-error">{setReady.error.message}</span>}</div></div></section>
  </AppFrame>;
}
