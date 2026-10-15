import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Field, ResultPanel } from "@/components/ResultPanel";
import { useTool } from "@/hooks/use-tool";
import { demoEmail, type Tone } from "@/lib/demo";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [
    { title: "Smart Email Generator — Workplace AI" },
    { name: "description", content: "Generate context-aware professional emails in formal, friendly or persuasive tones." },
    { property: "og:title", content: "Smart Email Generator — Workplace AI" },
    { property: "og:description", content: "Generate context-aware professional emails in seconds." },
  ] }),
  component: EmailPage,
});

const tones: Tone[] = ["Formal", "Friendly", "Persuasive"];

function EmailPage() {
  const t = useTool("awpa.email", { recipient: "", sender: "", relationship: "Colleague", purpose: "", details: "", tone: "Formal" as Tone });
  const [errs, setErrs] = useState<{ purpose?: string; details?: string }>({});
  const f = t.form;

  const submit = () => {
    const e: { purpose?: string; details?: string } = {};
    if (f.purpose.trim().length < 5) e.purpose = "Describe the purpose (at least 5 characters).";
    if (f.details.trim().length < 10) e.details = "Add some context or key points (at least 10 characters).";
    setErrs(e);
    if (Object.keys(e).length) return;
    const system = `You are an expert workplace communications writer. Write one complete professional email.
Rules: tone must be ${f.tone}${f.tone === "Persuasive" ? " (lead with benefits, address objections, end with a clear call to action)" : f.tone === "Friendly" ? " (warm, conversational, still professional)" : " (polished, concise, respectful)"}.
Use ONLY the facts provided; never invent names, numbers or dates — use [placeholders] where info is missing.
Format: first line "Subject: ...", blank line, greeting, short paragraphs, closing, sign-off. Under 220 words. Plain text only.`;
    const user = `Recipient: ${f.recipient || "unspecified"} (relationship: ${f.relationship})
Sender: ${f.sender || "unspecified"}
Purpose: ${f.purpose}
Context / key points:
${f.details}`;
    t.run(system, user, () => demoEmail(f));
  };

  return (
    <AppShell title="Smart Email Generator" subtitle="Turn a few notes into a polished, on-tone email.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-surface space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient"><input className="field" placeholder="e.g. Sarah Chen" value={f.recipient} onChange={(e) => t.update("recipient", e.target.value)} /></Field>
            <Field label="Your name"><input className="field" placeholder="e.g. Alex" value={f.sender} onChange={(e) => t.update("sender", e.target.value)} /></Field>
          </div>
          <Field label="Relationship">
            <select className="field" value={f.relationship} onChange={(e) => t.update("relationship", e.target.value)}>
              {["Colleague", "Manager", "Client", "Prospect", "Vendor", "Team"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Purpose *" error={errs.purpose}>
            <input className="field" placeholder="e.g. requesting a project deadline extension" value={f.purpose} onChange={(e) => t.update("purpose", e.target.value)} />
          </Field>
          <Field label="Context & key points *" error={errs.details} hint="One point per line works best.">
            <textarea className="field min-h-32" placeholder={"Vendor delivery delayed 1 week\nNew target: 28 Oct\nQA still on track"} value={f.details} onChange={(e) => t.update("details", e.target.value)} />
          </Field>
          <div>
            <span className="text-sm font-medium">Tone</span>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {tones.map((tn) => (
                <button key={tn} type="button" onClick={() => t.update("tone", tn)}
                  className={`btn ${f.tone === tn ? "btn-primary" : "btn-ghost"}`}>{tn}</button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary w-full" onClick={submit} disabled={t.loading}><Wand2 className="h-4 w-4" /> Generate email</button>
        </section>
        <ResultPanel value={t.result} onChange={t.setResult} loading={t.loading} error={t.error} live={t.live}
          onRegenerate={submit} onClear={t.clear} emptyTitle="No email yet" emptyHint="Fill in the purpose and key points, pick a tone, and generate." />
      </div>
    </AppShell>
  );
}
