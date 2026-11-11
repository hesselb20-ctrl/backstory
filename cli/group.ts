import type { Candidate, Commit, Signal } from "./types.js";

const MAX_GROUP = 6;
const ROLLBACK_WINDOW_DAYS = 120;
const daysBetween = (a: string, b: string) => Math.abs(Date.parse(b) - Date.parse(a)) / 86_400_000;

/** PR number a commit was merged through, read from the usual subject shapes. */
export function prNumber(c: Commit): number | undefined {
  const m = c.subject.match(/\(#(\d+)\)\s*$/) ?? c.subject.match(/^Merge pull request #(\d+)/);
  return m ? Number(m[1]) : undefined;
}

/** Issue and PR numbers mentioned anywhere in a commit message. */
export function threadRefs(c: Commit): number[] {
  const refs = new Set<number>();
  for (const m of `${c.subject}\n${c.body}`.matchAll(/(?:^|[\s(])#(\d{1,6})\b/g)) refs.add(Number(m[1]));
  return [...refs];
}

/** A coarse area for a path: its top-level folder, or a bucket for root files. */
export function areaOf(path: string): string {
  const parts = path.split("/");
  if (parts[0] === ".github" || /^\.(travis|circleci|gitlab)/.test(parts[0]!)) return "ci";
  if (parts.length > 1) return parts[0]!;
  if (/^(package\.json|requirements.*\.txt|pyproject\.toml|go\.mod|Cargo\.toml|Gemfile|pom\.xml|composer\.json)$/.test(path)) return "dependencies";
  if (/^(readme|changelog|contributing|license)/i.test(path)) return "docs";
  if (/^\.|config|rc$|\.ya?ml$|\.toml$|^tsconfig|^Makefile$|^Dockerfile/.test(path)) return "config";
  return "root";
}

class Groups {
  private parent = new Map<string, string>();
  private size = new Map<string, number>();

  find(x: string): string {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.size.set(x, 1);
    }
    let root = x;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    this.parent.set(x, root);
    return root;
  }

  /** Join two commits unless the group would grow past the cap. */
  union(a: string, b: string): void {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return;
    const total = this.size.get(ra)! + this.size.get(rb)!;
    if (total > MAX_GROUP) return;
    this.parent.set(rb, ra);
    this.size.set(ra, total);
  }
}

/**
 * Turn raw signals into decision candidates.
 *
 * Signals on one commit belong together. Commits are then joined when history
 * links them: a revert and the commit it undoes, commits merged through one PR,
 * and a dependency that one commit adds and another removes.
 */
export function groupCandidates(commits: Commit[], signals: Signal[], max: number): Candidate[] {
  const byHash = new Map(commits.map((c) => [c.hash, c]));
  const bySubject = new Map(commits.map((c) => [c.subject, c]));
  const groups = new Groups();
  const resolve = (prefix: string) =>
    byHash.get(prefix)?.hash ?? commits.find((c) => c.hash.startsWith(prefix))?.hash;

  const live = signals.filter((s) => byHash.has(s.commit));
  for (const s of live) groups.find(s.commit);

  for (const s of live) {
    if (s.kind !== "revert") continue;
    const quoted = s.summary.match(/^Reverted "(.+)"$/)?.[1];
    const target = (s.relatedCommit && resolve(s.relatedCommit)) ?? (quoted ? bySubject.get(quoted)?.hash : undefined);
    if (target && target !== s.commit) {
      s.relatedCommit = target;
      groups.union(s.commit, target);
    }
  }

  const byPr = new Map<number, string>();
  for (const s of live) {
    const pr = prNumber(byHash.get(s.commit)!);
    if (pr === undefined) continue;
    const first = byPr.get(pr);
    if (first) groups.union(first, s.commit);
    else byPr.set(pr, s.commit);
  }

  // "Tried and rolled back": the same package added by one commit, removed by a later one.
  // Only within a window: a removal years later is a separate decision.
  const addedBy = new Map<string, string>();
  for (const s of live) {
    if (s.kind !== "dependency") continue;
    for (const name of s.removed ?? []) {
      const adder = addedBy.get(name);
      if (adder && daysBetween(byHash.get(adder)!.date, byHash.get(s.commit)!.date) <= ROLLBACK_WINDOW_DAYS) groups.union(adder, s.commit);
    }
    for (const name of s.added ?? []) addedBy.set(name, s.commit);
  }

  const buckets = new Map<string, { hashes: Set<string>; signals: Signal[] }>();
  for (const s of live) {
    const root = groups.find(s.commit);
    const bucket = buckets.get(root) ?? { hashes: new Set(), signals: [] };
    bucket.hashes.add(s.commit);
    if (s.relatedCommit && groups.find(s.relatedCommit) === root) bucket.hashes.add(s.relatedCommit);
    bucket.signals.push(s);
    buckets.set(root, bucket);
  }

  const candidates: Candidate[] = [];
  for (const { hashes, signals: sigs } of buckets.values()) {
    const kinds = new Set(sigs.map((s) => s.kind));
    const strongest = new Map<string, number>();
    for (const s of sigs) strongest.set(`${s.kind}:${s.commit}`, Math.max(strongest.get(`${s.kind}:${s.commit}`) ?? 0, s.weight));
    let score = [...strongest.values()].reduce((a, b) => a + b, 0) + (kinds.size - 1) * 1.5;
    if (hashes.size > 1) score += 2;
    // A PR means there is probably a written reason to recover.
    if ([...hashes].some((h) => prNumber(byHash.get(h)!) !== undefined)) score += 1;
    // A reason in a message or a CI tweak alone is not a decision worth a record.
    if (kinds.size === 1 && (kinds.has("message") || (kinds.has("config") && score < 2))) continue;
    if (score < 4) continue;
    const cs = [...hashes].map((h) => byHash.get(h)!).sort((a, b) => a.date.localeCompare(b.date));
    const fileCount = new Map<string, number>();
    for (const s of sigs) for (const f of s.files) fileCount.set(f, (fileCount.get(f) ?? 0) + 1);
    const files = [...fileCount.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f).slice(0, 40);
    const areaCount = new Map<string, number>();
    for (const f of files) areaCount.set(areaOf(f), (areaCount.get(areaOf(f)) ?? 0) + 1);
    const areas = [...areaCount.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a).slice(0, 3);
    candidates.push({ commits: cs, signals: sigs, files, areas, score, date: cs[0]!.date, threads: [] });
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .sort((a, b) => a.date.localeCompare(b.date));
}
