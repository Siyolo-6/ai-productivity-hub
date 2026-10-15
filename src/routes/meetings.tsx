import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Field, ResultPanel } from "@/components/ResultPanel";
import { useTool } from "@/hooks/use-tool";
import { demoSummary } from "@/lib/demo";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [
    { title: "Meeting Notes Summarizer — Workplace AI" },
    { name: "description", content: "Summarize meeting notes into key points, decisions, action items, owners and deadlines." },
    { property: "og:title", content: "Meeting Notes Summarizer — Workplace AI" },
    { property: "og:description", content: "Extract decisions and action items from raw meeting notes." },
  ] }),
  component: MeetingsPage,
});

const sample = `Weekly product sync - 14 Oct
Attendees: Priya, Tom, Lerato
Discussed onboarding drop-off at step 3, up 12% this month.
We decided to simplify the signup form to 3 fields.
Tom will draft the new form design by Friday.
@Lerato to run user interviews before 24 Oct.
Agreed to postpone the pricing page redesign to Q1.
Priya needs to update the roadmap doc by next week.`;

function MeetingsPage() {
  const t = useTool("awpa.meetings", { title: "", notes: "" });
  const [err, setErr] = useState("");
  const f = t.form;
  const words = f.notes.trim() ? f.notes.trim().split(/\s+/).length : 0;

  const submit = () => {
    if (words < 15) return setErr("Paste at least 15 words of notes so there's enough to summarize.");
    if (f.notes.length > 20000) return setErr("Notes are too long — keep it under 20,000 characters.");
    setErr("");
    const system = `You are a precise meeting analyst. Extract information ONLY from the notes provided; never invent facts.
Output plain text with these exact sections:
## Summary (2-3 sentences)
## Key Points (bullets)
## Decisions (bullets, or "• None identified")
## Action Items — each as "• <task>\\n  Owner: <name or Unassigned> | Deadline: <date or No deadline stated>"
## Open Questions (bullets, only if any)`;
    t.run(system, `Meeting: ${f.title || "Untitled"}\n\nNotes:\n${f.notes}`, () => demoSummary(f.notes));
  };

  return (
    <AppShell title="Meeting Notes Summarizer" subtitle="Paste raw notes — get decisions, owners and deadlines.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-4 p-5">
          <Field label="Meeting title"><input className="field" placeholder="e.g. Weekly product sync" value={f.title} onChange={(e) => t.update("title", e.target.value)} /></Field>
          <Field label="Meeting notes *" error={err} hint={`${words} words`}>
            <textarea className="field min-h-72" placeholder="Paste notes or a transcript here…" value={f.notes} onChange={(e) => t.update("notes", e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={() => t.update("notes", sample)}>Try sample</button>
            <button className="btn btn-primary flex-1" onClick={submit} disabled={t.loading}><ListChecks className="h-4 w-4" /> Summarize</button>
          </div>
        </section>
        <ResultPanel value={t.result} onChange={t.setResult} loading={t.loading} error={t.error} live={t.live}
          onRegenerate={submit} onClear={t.clear} emptyTitle="Nothing summarized yet" emptyHint="Paste your notes (or try the sample) to extract key points and action items." />
      </div>
    </AppShell>
  );
}
