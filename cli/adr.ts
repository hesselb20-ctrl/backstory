import type { Draft } from "./writer.js";
import type { RepoInfo } from "./git.js";
import { prNumber } from "./group.js";
import type { Candidate, Decision, Evidence, SignalKind } from "./types.js";

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "") || "decision";
}

/** Links for everything a record rests on. */
export function evidenceFor(cand: Candidate, info: RepoInfo): Evidence[] {
  const base = info.slug ? `https://github.com/${info.slug}` : undefined;
  const out: Evidence[] = [];
  for (const c of cand.commits) {
    out.push({
      type: "commit",
      ref: c.short,
      title: `${c.subject} (${c.author})`,
      url: base ? `${base}/commit/${c.hash}` : undefined,
      date: c.date.slice(0, 10),
    });
  }
  for (const t of cand.threads) {
    out.push({ type: t.kind, ref: `#${t.number}`, title: t.title, url: t.url });
  }
  // A PR named in a commit subject is still worth a link when its text was not fetched.
  for (const c of cand.commits) {
    const pr = prNumber(c);
    if (pr === undefined || !base || out.some((e) => e.ref === `#${pr}`)) continue;
    out.push({ type: "pr", ref: `#${pr}`, title: c.subject.replace(/\s*\(#\d+\)\s*$/, ""), url: `${base}/pull/${pr}` });
  }
  for (const s of cand.signals) {
    if (!s.location) continue;
    const { file, line, text } = s.location;
    out.push({
      type: "comment",
      ref: `${file}:${line}`,
      title: text,
      url: base ? `${base}/blob/${info.head}/${file}#L${line}` : undefined,
    });
  }
  return out;
}

export function toDecision(n: number, cand: Candidate, draft: Draft, info: RepoInfo, writtenBy: string): Decision {
  const id = String(n).padStart(4, "0");
  const kinds = [...new Set(cand.signals.map((s) => s.kind))] as SignalKind[];
  return {
    id,
    slug: `${id}-${slugify(draft.title)}`,
    title: draft.title,
    date: cand.date.slice(0, 10),
    status: draft.status,
    confidence: draft.confidence,
    confidenceReason: draft.confidence_reason,
    signals: kinds,
    areas: cand.areas,
    files: cand.files,
    context: draft.context,
    decision: draft.decision,
    alternatives: draft.alternatives,
    consequences: draft.consequences,
    evidence: evidenceFor(cand, info),
    writtenBy,
  };
}

const yamlList = (items: string[]) => `[${items.map((i) => JSON.stringify(i)).join(", ")}]`;
const bullets = (items: string[], empty: string) => (items.length ? items.map((i) => `- ${i}`).join("\n") : empty);

const LABEL = { commit: "Commit", pr: "PR", issue: "Issue", comment: "Comment" } as const;

export function renderMarkdown(d: Decision): string {
  const evidence = d.evidence
    .map((e) => {
      const ref = e.type === "commit" || e.type === "comment" ? `\`${e.ref}\`` : e.ref;
      const link = e.url ? `[${ref}](${e.url})` : ref;
      return `- ${LABEL[e.type]} ${link}${e.date ? ` (${e.date})` : ""}: ${e.title}`;
    })
    .join("\n");
  return `---
id: "${d.id}"
title: ${JSON.stringify(d.title)}
date: ${d.date}
status: ${d.status}
confidence: ${d.confidence}
signals: ${yamlList(d.signals)}
areas: ${yamlList(d.areas)}
files: ${yamlList(d.files.slice(0, 20))}
written_by: ${d.writtenBy}
---

# ${d.id}. ${d.title}

- **Date:** ${d.date}
- **Status:** ${d.status}
- **Confidence:** ${d.confidence}. ${d.confidenceReason}

## Context

${d.context}

## Decision

${d.decision}

## Alternatives tried

${bullets(d.alternatives, "None recorded in the history.")}

## Consequences

${bullets(d.consequences, "None recorded in the history.")}

## Evidence

${evidence}
`;
}
