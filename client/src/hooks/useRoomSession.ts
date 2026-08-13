import { useCallback, useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

const ROOM_SESSION_KEY = "guess-who:room-seat";

export type RoomSession = {
  roomCode: string;
  seatNumber: 1 | 2;
  seatToken: string;
  tabId: string;
};

function normaliseCode(roomCode: string) {
  return roomCode.trim().toUpperCase();
}

function readRoomSession(roomCode: string): RoomSession | null {
  try {
    const raw = sessionStorage.getItem(ROOM_SESSION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as RoomSession;
    if (value.roomCode !== normaliseCode(roomCode) || !value.seatToken || !value.tabId) return null;
    return value;
  } catch {
    return null;
  }
}

export function getRoomTabId() {
  const key = "guess-who:room-tab";
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(key, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function useRoomSession(roomCode: string) {
  const [session, setSession] = useState<RoomSession | null>(() => readRoomSession(roomCode));

  useEffect(() => {
    setSession(readRoomSession(roomCode));
  }, [roomCode]);

  const saveSession = useCallback((next: Omit<RoomSession, "roomCode"> & { roomCode?: string }) => {
    const complete: RoomSession = { ...next, roomCode: normaliseCode(next.roomCode ?? roomCode) };
    try {
      sessionStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(complete));
    } catch {
      // The active in-memory session still lets the player continue this visit.
    }
    setSession(complete);
  }, [roomCode]);

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem(ROOM_SESSION_KEY);
    } catch {
      // No persistent session was available to remove.
    }
    setSession(null);
  }, []);

  return { session, saveSession, clearSession };
}

export function roomRequest(roomCode: string, session: RoomSession | null) {
  return {
    roomCode: normaliseCode(roomCode),
    seatToken: session?.seatToken ?? "room-session-not-yet-available",
    tabId: session?.tabId ?? "room-session-tab-not-yet-available",
  };
}

export function useRoomSnapshot(roomCode: string) {
  const { session, clearSession } = useRoomSession(roomCode);
  const request = useMemo(() => roomRequest(roomCode, session), [roomCode, session]);
  const snapshotQuery = trpc.room.getSnapshot.useQuery(request, {
    enabled: Boolean(session),
    refetchInterval: 1500,
    retry: false,
  });
  const reconnect = trpc.room.reconnect.useMutation();
  const [reconnectAttempted, setReconnectAttempted] = useState(false);

  useEffect(() => {
    setReconnectAttempted(false);
  }, [session?.roomCode, session?.seatToken]);

  useEffect(() => {
    if (!session || reconnectAttempted || reconnect.isPending) return;
    setReconnectAttempted(true);
    reconnect.mutate(request, { onSuccess: () => snapshotQuery.refetch() });
  }, [reconnect, reconnectAttempted, request, session, snapshotQuery]);

  return { session, clearSession, request, snapshotQuery, reconnect, reconnectAttempted };
}
