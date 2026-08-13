import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import { GameAccessGate } from "./components/game/GameAccessGate";
import Gameplay from "./pages/Gameplay";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Result from "./pages/Result";
import SecretSelection from "./pages/SecretSelection";
import Setup from "./pages/Setup";

const RoomEntry = lazy(async () => ({ default: (await import("./pages/RoomLobby")).RoomEntry }));
const RoomCreate = lazy(async () => ({ default: (await import("./pages/RoomLobby")).RoomCreate }));
const RoomJoin = lazy(async () => ({ default: (await import("./pages/RoomLobby")).RoomJoin }));
const RoomWaiting = lazy(async () => ({ default: (await import("./pages/RoomLobby")).RoomWaiting }));
const RoomSecret = lazy(async () => ({ default: (await import("./pages/RoomGame")).RoomSecret }));
const RoomGame = lazy(async () => ({ default: (await import("./pages/RoomGame")).RoomGame }));

function LocalRouteTree() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/setup" component={Setup} />
        <Route path="/secret" component={SecretSelection} />
        <Route path="/game" component={Gameplay} />
        <Route path="/result" component={Result} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/room" component={RoomEntry} />
        <Route path="/room/create" component={RoomCreate} />
        <Route path="/room/join" component={RoomJoin} />
        <Route path="/room/:code/waiting" component={RoomWaiting} />
        <Route path="/room/:code/secret" component={RoomSecret} />
        <Route path="/room/:code/game" component={RoomGame} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function GithubPagesApp() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <GameAccessGate>
            <GameProvider>
              <Router hook={useHashLocation}>
                <LocalRouteTree />
              </Router>
            </GameProvider>
          </GameAccessGate>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
