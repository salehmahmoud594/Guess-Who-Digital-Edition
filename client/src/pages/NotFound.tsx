// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — a wrong route should still feel like a gentle nudge back to the table.
import { Link } from "wouter";
export default function NotFound() { return <div className="empty-route"><span className="eyebrow">Wrong turn</span><h1>That page went<br /><em>missing.</em></h1><Link className="primary-button" href="/">Back to the table</Link></div>; }
