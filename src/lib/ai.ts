// Frontend demo AI client. In production, API keys must live behind a secure backend.
export type AIConfig = { endpoint: string; model: string; apiKey: string };
const KEY = "awpa.ai-config";

export const defaultConfig: AIConfig = {
  endpoint: "https://api.openai.com/v1/chat/completions",
  model: "gpt-4o-mini",
  apiKey: "",
};

export function loadConfig(): AIConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    return { ...defaultConfig, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") };
  } catch {
    return defaultConfig;
  }
}
export function saveConfig(c: AIConfig) {
  sessionStorage.setItem(KEY, JSON.stringify(c));
}
export const isLive = (c: AIConfig) => Boolean(c.apiKey.trim() && c.endpoint.trim());

export async function callAI(system: string, user: string): Promise<string> {
  const c = loadConfig();
  const res = await fetch(c.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${c.apiKey}` },
    body: JSON.stringify({
      model: c.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}). ${t.slice(0, 160)}`);
  }
  const j = await res.json();
  const out = j?.choices?.[0]?.message?.content;
  if (!out) throw new Error("The AI returned an empty response.");
  return String(out).trim();
}

/** Uses the live API when configured, otherwise the local demo generator. */
export async function generate(system: string, user: string, demo: () => string) {
  if (isLive(loadConfig())) return { text: await callAI(system, user), live: true };
  await new Promise((r) => setTimeout(r, 650));
  return { text: demo(), live: false };
}

export function usePersisted<T>(key: string, initial: T) {
  // tiny helper used by tools for draft persistence
  return {
    load: (): T => {
      if (typeof window === "undefined") return initial;
      try {
        const v = localStorage.getItem(key);
        return v ? { ...initial, ...JSON.parse(v) } : initial;
      } catch {
        return initial;
      }
    },
    save: (v: T) => localStorage.setItem(key, JSON.stringify(v)),
    clear: () => localStorage.removeItem(key),
  };
}
