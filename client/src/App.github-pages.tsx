import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import Gameplay from "./pages/Gameplay";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Result from "./pages/Result";
import SecretSelection from "./pages/SecretSelection";
import Setup from "./pages/Setup";

function LocalRouteTree() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/setup" component={Setup} />
    <Route path="/secret" component={SecretSelection} />
    <Route path="/game" component={Gameplay} />
    <Route path="/result" component={Result} />
    <Route path="/leaderboard" component={Leaderboard} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function GithubPagesApp() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><GameProvider><Router hook={useHashLocation}><LocalRouteTree /></Router></GameProvider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
