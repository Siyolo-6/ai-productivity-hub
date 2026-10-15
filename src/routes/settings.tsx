import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Save, Trash2, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Field } from "@/components/ResultPanel";
import { defaultConfig, loadConfig, saveConfig, type AIConfig } from "@/lib/ai";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "AI Settings — Workplace AI" },
    { name: "description", content: "Configure an OpenAI-compatible AI API for live responses in this demo." },
    { property: "og:title", content: "AI Settings — Workplace AI" },
    { property: "og:description", content: "Connect a configurable AI API for live results." },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [c, setC] = useState<AIConfig>(defaultConfig);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => setC(loadConfig()), []);

  const save = () => {
    try { new URL(c.endpoint); } catch { return setErr("Enter a valid endpoint URL."); }
    if (!c.model.trim()) return setErr("Model name is required.");
    setErr(""); saveConfig(c); setMsg("Saved for this browser session. Reload to update the status badge.");
  };
  const clear = () => { const d = { ...defaultConfig }; setC(d); saveConfig(d); setMsg("Key cleared — using demo mode."); };

  return (
    <AppShell title="AI Settings" subtitle="Optional: connect an OpenAI-compatible chat API for live responses.">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card-surface space-y-4 p-5">
          <Field label="Endpoint URL" hint="Any OpenAI-compatible /chat/completions endpoint.">
            <input className="field" value={c.endpoint} onChange={(e) => setC({ ...c, endpoint: e.target.value })} />
          </Field>
          <Field label="Model"><input className="field" value={c.model} onChange={(e) => setC({ ...c, model: e.target.value })} /></Field>
          <Field label="API key" hint="Stored in session storage only — cleared when you close the tab.">
            <input type="password" autoComplete="off" className="field" placeholder="sk-…" value={c.apiKey} onChange={(e) => setC({ ...c, apiKey: e.target.value })} />
          </Field>
          {err && <p className="text-sm text-destructive">{err}</p>}
          {msg && <p className="text-sm text-success">{msg}</p>}
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={save}><Save className="h-4 w-4" /> Save</button>
            <button className="btn btn-ghost" onClick={clear}><Trash2 className="h-4 w-4" /> Clear key</button>
          </div>
        </section>
        <aside className="card-surface space-y-3 p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold text-warning"><TriangleAlert className="h-4 w-4" /> Demo-only setup</p>
          <p className="text-muted-foreground">Calling an AI API directly from the browser exposes your key to anyone using this device. That's fine for a personal demo, but <strong className="text-foreground">production apps need a secure backend</strong> that holds the key and forwards requests.</p>
          <p className="flex items-center gap-2 font-semibold"><KeyRound className="h-4 w-4 text-primary" /> No key? No problem</p>
          <p className="text-muted-foreground">Without a key, every tool uses a built-in local generator that works from your inputs, so you can try the full workflow offline.</p>
          <p className="text-muted-foreground">Some providers block browser requests (CORS); if a request fails, try a provider that allows them.</p>
        </aside>
      </div>
    </AppShell>
  );
}
