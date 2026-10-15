import { useEffect, useState } from "react";
import { generate } from "@/lib/ai";

/** Shared state for a tool: form persisted in localStorage, result, loading, error. */
export function useTool<T extends object>(key: string, initial: T) {
  const [form, setForm] = useState<T>(initial);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(key) || "null");
      if (s) { setForm({ ...initial, ...s.form }); setResult(s.result || ""); }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ form, result }));
  }, [key, form, result]);

  const run = async (system: string, user: string, demo: () => string) => {
    setLoading(true); setError("");
    try {
      const r = await generate(system, user, demo);
      setResult(r.text); setLive(r.live);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const update = <K extends keyof T>(k: K, v: T[K]) => setForm((f) => ({ ...f, [k]: v }));
  return { form, update, setForm, result, setResult, loading, error, live, run, clear: () => { setResult(""); setError(""); } };
}
