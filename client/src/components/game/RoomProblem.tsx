import { Clipboard, RefreshCw, ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";
import { AppFrame } from "@/components/game/AppFrame";
import { clearRoomSession } from "@/lib/supabaseRoom";

export type RoomProblemKind = "missing" | "expired" | "duplicate" | "unavailable";

export function problemFromMessage(message?: string): RoomProblemKind {
  const normalized = message?.toLowerCase() ?? "";
  if (normalized.includes("active in another tab")) return "duplicate";
  if (normalized.includes("expired")) return "expired";
  return "unavailable";
}

export function RoomProblem({ roomCode, kind, message }: { roomCode: string; kind: RoomProblemKind; message?: string }) {
  const [, navigate] = useLocation();
  const details = {
    missing: {
      eyebrow: "Room recovery",
      title: <>Your private<br /><em>seat is needed.</em></>,
      body: "This Room keeps its private seat token in the tab where you created or joined it. Return to that tab to continue.",
      icon: Clipboard,
      button: "Back to Room mode",
    },
    expired: {
      eyebrow: "Room expired",
      title: <>That Room<br /><em>has closed.</em></>,
      body: "This invitation expired after inactivity. Create a fresh Room or ask the host for a new code.",
      icon: RefreshCw,
      button: "Create or join a Room",
    },
    duplicate: {
      eyebrow: "Private seat protected",
      title: <>This seat is open<br /><em>somewhere else.</em></>,
      body: "For privacy, one Room seat can be active in one tab. Return to the original tab where you joined the Room.",
      icon: ShieldAlert,
      button: "Back to Room mode",
    },
    unavailable: {
      eyebrow: "Room recovery",
      title: <>That Room<br /><em>is unavailable.</em></>,
      body: message ?? "We could not reconnect to this Room. Try the original tab or begin a new Room.",
      icon: RefreshCw,
      button: "Back to Room mode",
    },
  }[kind];
  const Icon = details.icon;

  return <AppFrame eyebrow={details.eyebrow} title="Connection problem"><section className="room-recovery"><Icon size={28} /><h1>{details.title}</h1><p>{details.body}</p><button className="secondary-button" type="button" onClick={() => { clearRoomSession(); navigate("/room"); }}>{details.button}</button></section></AppFrame>;
}
