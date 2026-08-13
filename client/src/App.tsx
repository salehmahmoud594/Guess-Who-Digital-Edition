import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import Home from "./pages/Home";
import Setup from "./pages/Setup";
import SecretSelection from "./pages/SecretSelection";
import Gameplay from "./pages/Gameplay";
import Result from "./pages/Result";
import Leaderboard from "./pages/Leaderboard";
const RoomEntry = lazy(async () => ({ default: (await import("./pages/RoomLobby")).RoomEntry }));
const RoomCreate = lazy(async () => ({ default: (await import("./pages/RoomLobby")).RoomCreate }));
const RoomJoin = lazy(async () => ({ default: (await import("./pages/RoomLobby")).RoomJoin }));
const RoomWaiting = lazy(async () => ({ default: (await import("./pages/RoomLobby")).RoomWaiting }));
const RoomSecret = lazy(async () => ({ default: (await import("./pages/RoomGame")).RoomSecret }));
const RoomGame = lazy(async () => ({ default: (await import("./pages/RoomGame")).RoomGame }));

function LocalRoutes() {
  return <>
    <Route path={"/"} component={Home} />
    <Route path={"/setup"} component={Setup} />
    <Route path={"/secret"} component={SecretSelection} />
    <Route path={"/game"} component={Gameplay} />
    <Route path={"/result"} component={Result} />
    <Route path={"/leaderboard"} component={Leaderboard} />
  </>;
}

function RoomRoutes() {
  return <Suspense fallback={null}>
    <Route path={"/room"} component={RoomEntry} />
    <Route path={"/room/create"} component={RoomCreate} />
    <Route path={"/room/join"} component={RoomJoin} />
    <Route path={"/room/:code/waiting"} component={RoomWaiting} />
    <Route path={"/room/:code/secret"} component={RoomSecret} />
    <Route path={"/room/:code/game"} component={RoomGame} />
  </Suspense>;
}

function RouteTree() {
  return (
    <Switch>
      <LocalRoutes />
      <RoomRoutes />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppRouter() {
  return <RouteTree />;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider><Toaster /><GameProvider><AppRouter /></GameProvider></TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
