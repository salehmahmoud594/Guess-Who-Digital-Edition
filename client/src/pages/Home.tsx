// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — a tabletop invitation with offset composition and one unmistakable first move.
import { ArrowUpRight, BarChart3, Link2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { BrandMark } from "@/components/game/BrandMark";
const isGithubPagesBuild = import.meta.env.MODE === "github-pages";

export default function Home() {
  const [, navigate] = useLocation();
  const editionLabel = isGithubPagesBuild ? "Digital edition • local play" : "Digital edition • two ways to play";
  const lede = isGithubPagesBuild
    ? "A beautifully illustrated guessing game for two people sharing one screen."
    : "A beautifully illustrated guessing game for two people, whether you share one screen or play privately from two devices.";
  const playNote = isGithubPagesBuild ? "Pass & Play · Split Screen" : "Pass & Play · Split Screen · Room codes for two devices";

  return <div className="home-page"><div className="home-noise" aria-hidden="true" /><header className="home-header"><BrandMark /><span className="home-edition">{editionLabel}</span></header><main className="home-hero"><section className="hero-copy"><span className="eyebrow eyebrow-light">A two-player face-off</span><h1>Pick a face.<br /><em>Keep your poker face.</em></h1><p className="hero-lede">{lede}</p><div className="hero-actions"><button className="primary-button hero-play" type="button" onClick={() => navigate("/setup")}>Play on one device <ArrowUpRight size={19} /></button>{!isGithubPagesBuild && <button className="secondary-button hero-room-button" type="button" onClick={() => navigate("/room")}><Link2 size={17} /> Create or join a Room</button>}<button className="text-button text-button-light" type="button" onClick={() => navigate("/leaderboard")}><BarChart3 size={17} /> Local leaderboard</button></div><div className="hero-note"><Sparkles size={15} /><span>{playNote}</span></div></section><section className="hero-board" aria-label="Guess Who card preview"><div className="board-pin board-pin-a" /><div className="board-pin board-pin-b" /><div className="hero-card hero-card-back"><span className="hero-card-kicker">WHO IS IT?</span><span className="hero-card-question">?</span><span className="hero-card-foot">24 suspects · 1 secret</span></div><div className="hero-card hero-card-front"><div className="hero-avatar avatar-sage">✦</div><span className="eyebrow">Your clue board</span><strong>Could it be<br />the one with<br />round glasses?</strong><span className="hero-mini-line"><i /> <i /> <i /> <i /></span></div><div className="hero-sticker">No peeking<br /><small>unless you hold</small></div></section></main><footer className="home-footer"><span>© Guess Who: Digital Edition</span><span>Made for the same table</span></footer></div>;
}
