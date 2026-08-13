export type RoomConnectionState = "online" | "offline" | "reconnecting";

export function getRoomConnectionState({ isOnline, hasSyncIssue = false }: { isOnline: boolean; hasSyncIssue?: boolean }): RoomConnectionState {
  if (!isOnline) return "offline";
  return hasSyncIssue ? "reconnecting" : "online";
}
