// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — the brand mark is a printed ink tab, not a generic app icon.
import { Link } from "wouter";
import { gameAssetUrl } from "@/lib/gameAssetUrl";
const logoUrl = gameAssetUrl("/manus-storage/guess_who_logo_444e9112.png");
export function BrandMark({ compact = false }: { compact?: boolean }) { return <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Guess Who home"><span className="brand-mark"><img src={logoUrl} alt="" /><span className="brand-eyes" aria-hidden="true"><i></i><i></i></span><b className="brand-question" aria-hidden="true">?</b></span>{!compact && <span className="brand-wordmark"><span>GUESS</span><span>WHO</span></span>}</Link>; }
