import { useState } from "react";
import { Copy, RefreshCw, Trash2, Check, Loader2, Sparkle } from "lucide-react";

export function ResultPanel({
  value, onChange, loading, error, onRegenerate, onClear, emptyTitle, emptyHint, live,
}: {
  value: string; onChange: (v: string) => void; loading: boolean; error: string;
  onRegenerate: () => void; onClear: () => void; emptyTitle: string; emptyHint: string; live: boolean | null;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="card-surface flex min-h-[420px] flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Result</h2>
        {live !== null && value && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">{live ? "Live AI" : "Demo output"}</span>
        )}
        <div className="ml-auto flex gap-2">
          <button className="btn btn-ghost !px-3 !py-1.5" onClick={copy} disabled={!value || loading}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
          </button>
          <button className="btn btn-ghost !px-3 !py-1.5" onClick={onRegenerate} disabled={!value || loading}>
            <RefreshCw className="h-4 w-4" /> Regenerate
          </button>
          <button className="btn btn-ghost !px-3 !py-1.5" onClick={onClear} disabled={!value || loading}>
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>
      </div>
      {error && <p className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Generating…</p>
        </div>
      ) : value ? (
        <textarea className="field flex-1 resize-none font-mono !text-[13px] leading-relaxed" value={value}
          onChange={(e) => onChange(e.target.value)} aria-label="Editable result" />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <Sparkle className="mb-3 h-8 w-8 text-primary" />
          <p className="font-medium">{emptyTitle}</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
        </div>
      )}
    </section>
  );
}

export function Field({ label, error, children, hint }: { label: string; error?: string | undefined; hint?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}
