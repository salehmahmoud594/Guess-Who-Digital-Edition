import { useEffect, useState } from "react";
import { clearRoomSession, useSupabaseRoomSnapshot } from "@/lib/supabaseRoom";

function browserIsOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(browserIsOnline);

  useEffect(() => {
    const updateStatus = () => setIsOnline(browserIsOnline());
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  return { isOnline };
}

export type { RoomSession } from "@/lib/supabaseRoom";

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

export function useRoomSnapshot(roomCode: string) {
  const { isOnline } = useNetworkStatus();
  const snapshot = useSupabaseRoomSnapshot(roomCode);
  const { refetch } = snapshot;
  useEffect(() => { if (isOnline) void refetch(); }, [isOnline, refetch]);
  return { ...snapshot, isOnline, clearSession: clearRoomSession };
}
