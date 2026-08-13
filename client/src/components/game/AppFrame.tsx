// DESIGN PHILOSOPHY: Whimsical Tabletop Editorial — preserve a light oat tabletop with offset editorial panels and clear escape routes.
import type { ReactNode } from "react";
import { BrandMark } from "./BrandMark";
export function AppFrame({ children, eyebrow, title, action }: { children: ReactNode; eyebrow?: string; title?: string; action?: ReactNode }) { return <div className="app-surface"><header className="topbar"><BrandMark compact /><div className="topbar-copy">{eyebrow && <span className="eyebrow">{eyebrow}</span>}{title && <strong>{title}</strong>}</div>{action}</header><main className="app-main">{children}</main><div className="print-corner print-corner-one" aria-hidden="true" /><div className="print-corner print-corner-two" aria-hidden="true" /></div>; }
