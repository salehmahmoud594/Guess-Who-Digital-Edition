import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const ROOM_SESSION_KEY = "guess-who:supabase-room-seat";
type RoomStatus = "waiting" | "setup" | "secret_selection" | "playing" | "finished" | "expired";

export type RoomSession = { roomId: string; roomCode: string; seatNumber: 1 | 2 };
export type RoomSnapshot = {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  category: string;
  heartLimit: number | null;
  deckIds: number[];
  revision: number;
  activeSeat: 1 | 2 | null;
  winnerSeat: 1 | 2 | null;
  winReason: "guess" | "hearts" | null;
  feedback: string | null;
  scores: Record<1 | 2, number>;
  you: { seatNumber: 1 | 2; playerName: string; ready: boolean; secretSelected: boolean; secretCardId: number | null; eliminatedIds: number[]; hearts: number | null };
  opponent: { seatNumber: 1 | 2 | null; playerName: string | null; ready: boolean; secretSelected: boolean; isConnected: boolean };
};

function normaliseCode(roomCode: string) { return roomCode.trim().toUpperCase(); }
function readSession(roomCode: string): RoomSession | null {
  try {
    const raw = localStorage.getItem(ROOM_SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as RoomSession;
    return value.roomCode === normaliseCode(roomCode) && value.roomId ? value : null;
  } catch { return null; }
}
export function saveRoomSession(session: RoomSession) { localStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(session)); }
export function clearRoomSession() { localStorage.removeItem(ROOM_SESSION_KEY); }

function message(error: unknown) { return error instanceof Error ? error.message : "Unable to update the Room."; }
export function useRoomAction() {
  const [isPending, setPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const run = useCallback(async <T,>(functionName: string, args: Record<string, unknown>) => {
    setPending(true); setError(null);
    const { data, error: rpcError } = await supabase.rpc(functionName as never, args as never);
    if (rpcError) { const next = new Error(rpcError.message); setError(next); setPending(false); throw next; }
    setPending(false); return data as T;
  }, []);
  return { run, isPending, error };
}

async function fetchSnapshot(session: RoomSession, onlineSeats: Set<number>): Promise<RoomSnapshot> {
  const [roomResult, seatsResult, privateResult] = await Promise.all([
    supabase.from("game_rooms").select("*").eq("id", session.roomId).single(),
    supabase.from("room_public_seats").select("*").eq("room_id", session.roomId),
    supabase.from("room_private_states").select("*").eq("room_id", session.roomId).single(),
  ]);
  if (roomResult.error) throw roomResult.error;
  if (seatsResult.error) throw seatsResult.error;
  if (privateResult.error) throw privateResult.error;
  const room = roomResult.data;
  const yourSeat = seatsResult.data.find(seat => seat.seat_number === session.seatNumber);
  const opponentSeat = seatsResult.data.find(seat => seat.seat_number !== session.seatNumber);
  if (!yourSeat) throw new Error("Your Room seat is no longer available.");
  return {
    roomId: room.id, roomCode: room.room_code, status: room.status as RoomStatus, category: room.category,
    heartLimit: room.heart_limit, deckIds: room.deck_ids, revision: room.revision, activeSeat: room.active_seat as 1 | 2 | null,
    winnerSeat: room.winner_seat as 1 | 2 | null, winReason: room.win_reason, feedback: room.feedback,
    scores: { 1: room.player_1_score, 2: room.player_2_score },
    you: { seatNumber: session.seatNumber, playerName: yourSeat.player_name, ready: yourSeat.ready, secretSelected: yourSeat.secret_selected, secretCardId: privateResult.data.secret_card_id, eliminatedIds: privateResult.data.eliminated_ids, hearts: privateResult.data.hearts },
    opponent: { seatNumber: opponentSeat?.seat_number as 1 | 2 | undefined ?? null, playerName: opponentSeat?.player_name ?? null, ready: opponentSeat?.ready ?? false, secretSelected: opponentSeat?.secret_selected ?? false, isConnected: onlineSeats.has(opponentSeat?.seat_number ?? 0) },
  };
}

export function useSupabaseRoomSnapshot(roomCode: string) {
  const normalizedCode = normaliseCode(roomCode);
  const [session, setSession] = useState<RoomSession | null>(() => readSession(normalizedCode));
  const [data, setData] = useState<RoomSnapshot | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [onlineSeats, setOnlineSeats] = useState<Set<number>>(new Set());

  const onlineSeatsRef = useRef(onlineSeats);
  onlineSeatsRef.current = onlineSeats;

  useEffect(() => {
    setSession(readSession(normalizedCode));
  }, [normalizedCode]);

  const refetch = useCallback(async () => {
    const currentSession = readSession(normalizedCode);
    if (!currentSession) {
      setData(null);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const snapshot = await fetchSnapshot(currentSession, onlineSeatsRef.current);
      setData(snapshot);
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error(message(reason)));
    } finally {
      setLoading(false);
    }
  }, [normalizedCode]);

  // Initial fetch on mount or when roomCode changes
  useEffect(() => {
    setLoading(true);
    void refetch();
  }, [refetch]);

  // Update presence status in snapshot when onlineSeats changes without full refetch
  useEffect(() => {
    setData(prev => {
      if (!prev) return null;
      const opponentSeatNumber = prev.opponent.seatNumber;
      const isConnected = opponentSeatNumber ? onlineSeats.has(opponentSeatNumber) : false;
      if (prev.opponent.isConnected === isConnected) return prev;
      return {
        ...prev,
        opponent: {
          ...prev.opponent,
          isConnected,
        },
      };
    });
  }, [onlineSeats]);

  // Stable realtime subscription — ONLY depends on roomId and seatNumber
  const roomId = session?.roomId;
  const seatNumber = session?.seatNumber;

  useEffect(() => {
    if (!roomId || !seatNumber) return;

    const channel = supabase.channel(`room:${roomId}`, { config: { presence: { key: String(seatNumber) } } })
      .on("postgres_changes", { event: "*", schema: "public", table: "game_rooms", filter: `id=eq.${roomId}` }, () => void refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "room_public_seats", filter: `room_id=eq.${roomId}` }, () => void refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "room_private_states", filter: `room_id=eq.${roomId}` }, () => void refetch())
      .on("presence", { event: "sync" }, () => {
        const current = channel.presenceState();
        setOnlineSeats(new Set(Object.keys(current).map(Number)));
      })
      .subscribe(status => {
        if (status === "SUBSCRIBED") {
          void channel.track({ seat: seatNumber });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [roomId, seatNumber, refetch]);

  const clearSession = useCallback(() => {
    clearRoomSession();
    setSession(null);
    setData(null);
  }, []);

  return { session, data, isLoading, error, isError: Boolean(error), refetch, clearSession };
}
