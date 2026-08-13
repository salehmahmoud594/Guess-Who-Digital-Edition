import { BrandMark } from "@/components/game/BrandMark";
import { gameAccessGranted, verifyGameAccess } from "@/lib/supabase";
import { KeyRound, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useState } from "react";

export function GameAccessGate({ children }: { children: ReactNode }) {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(true);
  const [granted, setGranted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    void gameAccessGranted().then(setGranted).catch(() => setGranted(false)).finally(() => setChecking(false));
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password || unlocking) return;
    setMessage("");
    setUnlocking(true);
    void verifyGameAccess(password).then(() => { setPassword(""); setGranted(true); }).catch(() => setMessage("That password doesn’t match. Please try again.")).finally(() => setUnlocking(false));
  };

  if (checking) {
    return <main className="min-h-screen bg-[#143b4a] grid place-items-center p-6 text-[#fff9ec]"><LoaderCircle className="size-7 animate-spin" aria-label="Checking game access" /></main>;
  }

  if (granted) return <>{children}</>;

  return <main className="home-page min-h-screen"><div className="home-noise" aria-hidden="true" /><header className="home-header"><BrandMark /><span className="home-edition">Private game access</span></header><section className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-5xl items-center px-5 py-10"><div className="grid w-full overflow-hidden rounded-[2rem] border border-white/25 bg-[#fff9ec] shadow-[14px_16px_0_rgba(10,28,38,0.25)] md:grid-cols-[1.15fr_0.85fr]"><div className="bg-[#f3a272] p-7 text-[#143b4a] sm:p-10"><span className="eyebrow">Before we play</span><h1 className="mt-4 font-['Bree_Serif'] text-4xl leading-[1.04] sm:text-5xl">The table is<br /><em>reserved.</em></h1><p className="mt-5 max-w-md text-base leading-7 text-[#143b4a]/80">Enter the shared game password to unlock local play and private Room matches. Your access stays in this browser for a limited time.</p><div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#143b4a]/15 bg-[#fff9ec]/55 p-4"><ShieldCheck className="mt-0.5 size-5 shrink-0" /><p className="text-sm leading-6">Room secrets remain private: each player still receives only their own card, hearts, and elimination board.</p></div></div><div className="flex flex-col justify-center p-7 sm:p-10"><div className="mb-6 flex size-11 items-center justify-center rounded-2xl bg-[#16777a] text-white shadow-[4px_4px_0_#143b4a]"><LockKeyhole className="size-5" /></div><h2 className="font-['Bree_Serif'] text-3xl text-[#143b4a]">Unlock the game</h2><p className="mt-2 text-sm leading-6 text-[#143b4a]/70">Ask the host for the shared password.</p><form className="mt-7 space-y-4" onSubmit={submit}><label className="block text-sm font-bold text-[#143b4a]" htmlFor="game-access-password">Game password</label><div className="relative"><KeyRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#16777a]" /><input id="game-access-password" value={password} onChange={event => setPassword(event.target.value)} type="password" autoComplete="current-password" required disabled={unlocking} className="w-full rounded-xl border-2 border-[#143b4a]/20 bg-white py-3 pl-11 pr-4 text-[#143b4a] outline-none transition focus:border-[#16777a] focus:ring-4 focus:ring-[#16777a]/15 disabled:opacity-70" placeholder="Enter password" /></div>{message && <p className="text-sm font-medium text-[#a53a31]" role="alert">{message}</p>}<button className="primary-button w-full justify-center" type="submit" disabled={unlocking}>{unlocking ? <><LoaderCircle className="size-4 animate-spin" /> Unlocking…</> : "Enter the game"}</button></form><p className="mt-6 text-center text-xs leading-5 text-[#143b4a]/60">This browser receives a secure, time-limited access session. The password is not stored in the page.</p></div></div></section></main>;
}
