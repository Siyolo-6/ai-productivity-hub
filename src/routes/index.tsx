import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Mail, NotebookPen } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "AI Workplace Productivity Assistant" },
    { name: "description", content: "Write emails, summarize meetings and plan your week with one AI workplace assistant." },
    { property: "og:title", content: "AI Workplace Productivity Assistant" },
    { property: "og:description", content: "Emails, meeting summaries and task plans in one dashboard." },
  ] }),
  component: Index,
});

const tools = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Context-specific emails in Formal, Friendly or Persuasive tone." },
  { to: "/meetings", icon: NotebookPen, title: "Meeting Notes Summarizer", desc: "Key points, decisions, action items, owners and deadlines." },
  { to: "/planner", icon: CalendarCheck, title: "AI Task Planner", desc: "Prioritized daily or weekly schedules that fit your hours." },
] as const;

function Index() {
  return (
    <AppShell title="Good to see you 👋" subtitle="Pick a tool to get through your workday faster.">
      <section className="card-surface relative mb-6 overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-primary opacity-25 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">AI Workplace Assistant</p>
        <h2 className="mt-2 max-w-xl text-2xl font-semibold sm:text-3xl">Less admin. More meaningful work.</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">Every result is editable and saved in your browser. Works instantly in demo mode, or connect your own AI API in Settings.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map(({ to, icon: Icon, title, desc }) => (
          <Link key={to} to={to} className="card-surface group p-5 transition hover:border-primary/50 hover:shadow-glow">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
