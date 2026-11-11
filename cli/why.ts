import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tryGit } from "./git.js";
import type { Decision, DecisionIndex } from "./types.js";

export function loadIndex(dir: string): DecisionIndex {
  const file = join(dir, "index.json");
  try {
    return JSON.parse(readFileSync(file, "utf8")) as DecisionIndex;
  } catch {
    throw new Error(`No decision log at ${file}. Run "backstory scan <repo>" first, or pass --decisions <dir>.`);
  }
}

export interface Match {
  decision: Decision;
  score: number;
  reason: string;
}

const norm = (p: string) => p.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/$/, "");

function fileScore(d: Decision, target: string): { score: number; reason: string } | undefined {
  let best: { score: number; reason: string } | undefined;
  const consider = (score: number, reason: string) => {
    if (!best || score > best.score) best = { score, reason };
  };
  for (const f of d.files) {
    if (f === target) consider(10, `touches ${f}`);
    else if (f.endsWith(`/${target}`) || target.endsWith(`/${f}`)) consider(8, `touches ${f}`);
    else if (f.startsWith(`${target}/`)) consider(6, `touches ${f} under ${target}/`);
    else if (/.[A-Za-z0-9]+$/.test(target) && target.includes("/") && f.split("/").slice(0, -1).join("/") === target.split("/").slice(0, -1).join("/")) consider(2, `touches the same folder (${f})`);
  }
  for (const e of d.evidence) {
    if (e.type === "comment" && e.ref.split(":")[0] === target) consider(11, `explains a comment at ${e.ref}`);
  }
  return best;
}

function textScore(d: Decision, symbol: string): { score: number; reason: string } | undefined {
  const word = new RegExp(`(^|[^A-Za-z0-9_])${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Za-z0-9_]|$)`, "i");
  if (word.test(d.title)) return { score: 9, reason: `"${symbol}" is in the title` };
  if (word.test(d.decision) || word.test(d.context)) return { score: 7, reason: `"${symbol}" is discussed in the record` };
  if (d.consequences.some((c) => word.test(c)) || d.alternatives.some((c) => word.test(c))) return { score: 6, reason: `"${symbol}" appears in the consequences or alternatives` };
  if (d.evidence.some((e) => word.test(e.title))) return { score: 4, reason: `"${symbol}" appears in the evidence` };
  return undefined;
}

/**
 * Find the decisions behind a file path or a symbol name.
 *
 * A path matches records that touch that file or folder. A symbol matches
 * records that discuss it, and, when `repo` is a git checkout, records that
 * touch the files where the symbol occurs.
 */
export function why(index: DecisionIndex, rawTarget: string, repo?: string, limit = 5): Match[] {
  const target = norm(rawTarget.trim());
  const found = new Map<string, Match>();
  const add = (decision: Decision, score: number, reason: string) => {
    const prev = found.get(decision.id);
    if (!prev || score > prev.score) found.set(decision.id, { decision, score, reason });
  };
  for (const d of index.decisions) {
    const f = fileScore(d, target);
    if (f) add(d, f.score, f.reason);
    if (!/[\\/]/.test(target)) {
      const t = textScore(d, target);
      if (t) add(d, t.score, t.reason);
    }
  }
  if (repo && /^[A-Za-z_$][\w$.]*$/.test(target)) {
    const files = tryGit(repo, ["grep", "-l", "-w", "-F", target, "HEAD", "--"])?.split("\n").filter(Boolean).map((l) => l.replace(/^HEAD:/, "")) ?? [];
    for (const file of files.slice(0, 25)) {
      for (const d of index.decisions) {
        if (d.files.includes(file)) add(d, 5, `"${target}" occurs in ${file}, which this decision touches`);
      }
    }
  }
  return [...found.values()]
    .sort((a, b) => b.score - a.score || b.decision.date.localeCompare(a.decision.date))
    .slice(0, limit);
}

/** Plain-text answer for a terminal or an agent. */
export function formatAnswer(target: string, matches: Match[]): string {
  if (!matches.length) {
    return `No recorded decision covers "${target}".\n\nThat means the scan found no signal for it, not that it is safe to change. Check \`git log --follow -- <path>\` before a risky edit.`;
  }
  const blocks = matches.map(({ decision: d, reason }) => {
    const lines = [
      `ADR ${d.id}: ${d.title}`,
      `${d.date} · status ${d.status} · confidence ${d.confidence} · match: ${reason}`,
      "",
      `Context: ${d.context}`,
      "",
      `Decision: ${d.decision}`,
    ];
    if (d.alternatives.length) lines.push("", "Alternatives tried:", ...d.alternatives.map((a) => `- ${a}`));
    if (d.consequences.length) lines.push("", "Consequences:", ...d.consequences.map((c) => `- ${c}`));
    lines.push("", "Evidence:", ...d.evidence.slice(0, 8).map((e) => `- ${e.type} ${e.ref}: ${e.title}${e.url ? ` <${e.url}>` : ""}`));
    lines.push("", `Record: ${d.slug}.md`);
    return lines.join("\n");
  });
  return `${matches.length} decision${matches.length === 1 ? "" : "s"} behind "${target}":\n\n${blocks.join("\n\n---\n\n")}`;
}
