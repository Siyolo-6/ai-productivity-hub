import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Field, ResultPanel } from "@/components/ResultPanel";
import { useTool } from "@/hooks/use-tool";
import { demoPlan, parseTasks } from "@/lib/demo";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [
    { title: "AI Task Planner — Workplace AI" },
    { name: "description", content: "Build prioritized daily or weekly schedules from your tasks, deadlines and available hours." },
    { property: "og:title", content: "AI Task Planner — Workplace AI" },
    { property: "og:description", content: "Prioritized schedules from tasks, deadlines and hours." },
  ] }),
  component: PlannerPage,
});

const sample = `Finish Q3 report | Fri | 4 | High
Client call prep | Wed | 1.5 | High
Review pull requests | Thu | 2 | Medium
Update team wiki | | 1 | Low
Plan sprint retro | Fri | 1 | Medium`;

function PlannerPage() {
  const t = useTool("awpa.planner", { tasks: "", hours: 6, mode: "Weekly" as "Daily" | "Weekly", notes: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const f = t.form;

  const submit = () => {
    const e: Record<string, string> = {};
    const tasks = parseTasks(f.tasks);
    if (!tasks.length) e.tasks = "Add at least one task.";
    else if (tasks.some((x) => !x.name)) e.tasks = "Every line needs a task name before the first |.";
    if (!(f.hours >= 1 && f.hours <= 16)) e.hours = "Available hours must be between 1 and 16.";
    setErr(e);
    if (Object.keys(e).length) return;
    const system = `You are a productivity coach who builds realistic schedules.
Create a ${f.mode.toLowerCase()} plan (${f.mode === "Weekly" ? "Mon–Fri" : "today only"}) with at most ${f.hours} working hours per day, starting 09:00.
Prioritize by priority then deadline urgency. Split large tasks across days, add short breaks after 2h focus blocks, never exceed capacity.
Use ONLY the tasks given. Output plain text: "## Plan", then "### <Day> — <hours>h" with bullets "• HH:MM–HH:MM Task [Priority]".
Finish with "## Needs attention" listing anything that doesn't fit or risks its deadline, and 2 short focus tips.`;
    const user = `Tasks (name | deadline | est. hours | priority):\n${f.tasks}\n\nExtra constraints: ${f.notes || "none"}`;
    t.run(system, user, () => demoPlan(tasks, f.hours, f.mode));
  };

  return (
    <AppShell title="AI Task Planner" subtitle="Prioritized schedules that fit the hours you actually have.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-4 p-5">
          <div>
            <span className="text-sm font-medium">Plan type</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(["Daily", "Weekly"] as const).map((m) => (
                <button key={m} className={`btn ${f.mode === m ? "btn-primary" : "btn-ghost"}`} onClick={() => t.update("mode", m)}>{m}</button>
              ))}
            </div>
          </div>
          <Field label="Tasks *" error={err.tasks} hint="One per line: Task | Deadline | Hours | Priority (High/Medium/Low)">
            <textarea className="field min-h-48 font-mono !text-[13px]" placeholder={sample} value={f.tasks} onChange={(e) => t.update("tasks", e.target.value)} />
          </Field>
          <Field label="Available hours per day *" error={err.hours}>
            <input type="number" min={1} max={16} step={0.5} className="field" value={f.hours} onChange={(e) => t.update("hours", parseFloat(e.target.value))} />
          </Field>
          <Field label="Constraints (optional)">
            <input className="field" placeholder="e.g. meetings 14:00–15:00 on Tuesday" value={f.notes} onChange={(e) => t.update("notes", e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => t.update("tasks", sample)}>Try sample</button>
            <button className="btn btn-primary flex-1" onClick={submit} disabled={t.loading}><CalendarCheck className="h-4 w-4" /> Build plan</button>
          </div>
        </section>
        <ResultPanel value={t.result} onChange={t.setResult} loading={t.loading} error={t.error} live={t.live}
          onRegenerate={submit} onClear={t.clear} emptyTitle="No plan yet" emptyHint="List your tasks with deadlines and estimates, then build a schedule." />
      </div>
    </AppShell>
  );
}
