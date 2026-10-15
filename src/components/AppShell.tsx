import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LayoutDashboard, Mail, NotebookPen, CalendarCheck, Settings, Menu, X, ShieldAlert } from "lucide-react";
import { isLive, loadConfig } from "@/lib/ai";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Notes Summarizer", icon: NotebookPen },
  { to: "/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/settings", label: "AI Settings", icon: Settings },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState(false);
  useEffect(() => setLive(isLive(loadConfig())), []);

  return (
    <div className="min-h-screen lg:flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-surface p-5 transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-8 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary font-display font-bold text-primary-foreground shadow-glow">W</div>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">Workplace AI</p>
            <p className="text-xs text-muted-foreground">Productivity Assistant</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-accent !text-accent-foreground" }}
              activeOptions={{ exact: true }}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 rounded-lg border bg-card p-3 text-xs">
          <p className="flex items-center gap-2 font-semibold">
            <span className={`h-2 w-2 rounded-full ${live ? "bg-success" : "bg-warning"}`} />
            {live ? "Live AI connected" : "Demo mode"}
          </p>
          <p className="mt-1 text-muted-foreground">{live ? "Requests go to your configured API." : "Smart local generator. Add an API key in Settings."}</p>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="flex-1 px-4 py-6 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 flex items-start gap-3">
            <button className="btn btn-ghost !p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </header>
          {children}
          <footer className="mt-12 flex gap-2 rounded-lg border bg-surface p-4 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4 shrink-0 text-primary" />
            <p><strong className="text-foreground">Responsible AI:</strong> AI output can be inaccurate or incomplete. Review, edit and verify everything before sending or acting on it. Avoid pasting confidential or personal data.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
