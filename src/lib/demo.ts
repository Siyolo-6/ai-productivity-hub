// Local, input-driven demo generators (used when no AI API is configured).
export type Tone = "Formal" | "Friendly" | "Persuasive";

export function demoEmail(i: {
  recipient: string; sender: string; purpose: string; details: string; tone: Tone;
}) {
  const name = i.recipient.trim() || "there";
  const points = i.details.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
  const greet = { Formal: `Dear ${name},`, Friendly: `Hi ${name},`, Persuasive: `Hi ${name},` }[i.tone];
  const open = {
    Formal: `I am writing regarding ${i.purpose.trim()}.`,
    Friendly: `Hope your week is going well! I wanted to reach out about ${i.purpose.trim()}.`,
    Persuasive: `I'd like to share an opportunity around ${i.purpose.trim()} that I believe will make a real difference for you.`,
  }[i.tone];
  const body = points.length
    ? (i.tone === "Persuasive" ? "Here's why this matters:\n" : "A few key points:\n") +
      points.map((p) => `• ${p}`).join("\n")
    : "";
  const close = {
    Formal: "Please let me know if you require any further information. I look forward to your response.",
    Friendly: "Let me know what you think — happy to chat anytime!",
    Persuasive: "Could we set up 15 minutes this week to move this forward? I'm confident it'll be worth your time.",
  }[i.tone];
  const sign = { Formal: "Kind regards,", Friendly: "Cheers,", Persuasive: "Best regards," }[i.tone];
  const subject = `Subject: ${i.purpose.trim().replace(/^./, (c) => c.toUpperCase())}`;
  return [subject, "", greet, "", open, body && `\n${body}`, "", close, "", sign, i.sender.trim() || "[Your name]"]
    .filter((x) => x !== false)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

const DATE_RE =
  /\b(by|due|before|on|until)\s+((?:mon|tue|wed|thu|fri|sat|sun)[a-z]*|tomorrow|today|next week|end of (?:week|month|day)|eod|eow|\d{1,2}[\/\-.]\d{1,2}(?:[\/\-.]\d{2,4})?|\d{1,2}\s+[a-z]{3,9}|[a-z]{3,9}\s+\d{1,2})/i;

export function demoSummary(notes: string) {
  const lines = notes.split(/\n|(?<=\.)\s+/).map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim()).filter((l) => l.length > 3);
  const decisions = lines.filter((l) => /\b(decid|agreed|approv|confirm|chose|will go with|final)/i.test(l));
  const actions = lines.filter((l) => /\b(will|to do|todo|action|follow up|needs? to|assign|owner|@)/i.test(l) && !decisions.includes(l));
  const key = lines.filter((l) => !decisions.includes(l) && !actions.includes(l)).slice(0, 5);
  const owner = (l: string) => l.match(/@(\w+)/)?.[1] || l.match(/^([A-Z][a-z]+)\s+(will|to|needs)/)?.[1] || "Unassigned";
  const due = (l: string) => l.match(DATE_RE)?.[2] || "No deadline stated";
  const list = (a: string[]) => (a.length ? a.map((x) => `• ${x}`).join("\n") : "• None identified");
  return [
    "## Summary",
    `Meeting covered ${lines.length} discussion points with ${decisions.length} decision(s) and ${actions.length} action item(s).`,
    "", "## Key Points", list(key),
    "", "## Decisions", list(decisions),
    "", "## Action Items",
    actions.length
      ? actions.map((a) => `• ${a}\n  Owner: ${owner(a)} | Deadline: ${due(a)}`).join("\n")
      : "• None identified",
  ].join("\n");
}

export type PlanTask = { name: string; deadline: string; hours: number; priority: "High" | "Medium" | "Low" };

export function parseTasks(raw: string): PlanTask[] {
  return raw.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, deadline = "", hours = "1", priority = "Medium"] = l.split("|").map((s) => s.trim());
    const p = (/^h/i.test(priority) ? "High" : /^l/i.test(priority) ? "Low" : "Medium") as PlanTask["priority"];
    return { name, deadline, hours: Math.max(0.25, parseFloat(hours) || 1), priority: p };
  });
}

/** Sort by priority then earliest deadline, and fill days up to available hours. */
export function buildPlan(tasks: PlanTask[], hoursPerDay: number, mode: "Daily" | "Weekly") {
  const rank = { High: 0, Medium: 1, Low: 2 };
  const sorted = [...tasks].sort((a, b) => rank[a.priority] - rank[b.priority] || (a.deadline || "~").localeCompare(b.deadline || "~"));
  const days = mode === "Daily" ? ["Today"] : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const plan = days.map((d) => ({ day: d, items: [] as { name: string; hours: number; priority: string }[], used: 0 }));
  const overflow: string[] = [];
  for (const t of sorted) {
    let left = t.hours;
    for (const d of plan) {
      if (left <= 0) break;
      const free = hoursPerDay - d.used;
      if (free <= 0) continue;
      const take = Math.min(free, left);
      d.items.push({ name: t.name, hours: take, priority: t.priority });
      d.used += take; left -= take;
    }
    if (left > 0) overflow.push(`${t.name} (${left}h unscheduled)`);
  }
  return { plan, overflow };
}

export function demoPlan(tasks: PlanTask[], hoursPerDay: number, mode: "Daily" | "Weekly") {
  const { plan, overflow } = buildPlan(tasks, hoursPerDay, mode);
  const fmt = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
  const out = [`## ${mode} Plan (${hoursPerDay}h available per day)`];
  for (const d of plan) {
    if (!d.items.length) continue;
    out.push("", `### ${d.day} — ${d.used}h`);
    let t = 9;
    for (const it of d.items) {
      out.push(`• ${fmt(t)}–${fmt(t + it.hours)}  ${it.name} [${it.priority}]`);
      t += it.hours;
    }
  }
  if (overflow.length) out.push("", "## Needs attention", ...overflow.map((o) => `• ${o} — consider delegating or extending deadline`));
  out.push("", "Tip: tackle High priority work in your first focus block.");
  return out.join("\n");
}
