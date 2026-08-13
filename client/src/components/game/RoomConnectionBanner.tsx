import { RefreshCw, WifiOff } from "lucide-react";
import type { RoomConnectionState } from "@/lib/roomConnection";
import "./RoomConnectionBanner.css";

export function RoomConnectionBanner({ state }: { state: RoomConnectionState }) {
  if (state === "online") return null;

  if (state === "offline") {
    return <div className="room-connection-banner" role="alert"><WifiOff size={17} /><span><strong>You’re offline.</strong> Your private board is safe; sync resumes automatically when you reconnect.</span></div>;
  }

  return <div className="room-connection-banner is-reconnecting" role="status" aria-live="polite"><RefreshCw className="room-spinner" size={17} /><span><strong>Reconnecting to the table…</strong> Checking the latest private game state.</span></div>;
}
