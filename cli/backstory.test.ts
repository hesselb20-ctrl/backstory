import assert from "node:assert/strict";
import { test } from "node:test";
import { renderMarkdown, slugify } from "./adr.js";
import { renameTarget } from "./git.js";
import { areaOf, groupCandidates, prNumber, threadRefs } from "./group.js";
import { __test } from "./signals.js";
import type { Commit, Decision, DecisionIndex, Signal } from "./types.js";
import { renderViewer } from "./viewer.js";
import { formatAnswer, why } from "./why.js";

const commit = (over: Partial<Commit>): Commit => ({
  hash: "a".repeat(40),
  short: "aaaaaaa",
  parents: ["0".repeat(40)],
  author: "Ada",
  date: "2024-01-01T00:00:00Z",
  subject: "change",
  body: "",
  files: [],
  ...over,
});

const decision = (over: Partial<Decision>): Decision => ({
  id: "0001",
  slug: "0001-wait-between-retries",
  title: "Wait between retries",
  date: "2024-01-02",
  status: "active",
  confidence: "high",
  confidenceReason: "The PR states the reason.",
  signals: ["revert"],
  areas: ["src"],
  files: ["src/sync/retry.ts"],
  context: "Instant retries tripped the rate limiter.",
  decision: "retryWithBackoff pauses 250 ms.",
  alternatives: [],
  consequences: [],
  evidence: [{ type: "commit", ref: "abc1234", title: "add pause", url: "https://example.com/c/abc1234" }],
  writtenBy: "test",
  ...over,
});

test("rename notations resolve to the new path", () => {
  assert.equal(renameTarget("src/{old => new}/a.ts"), "src/new/a.ts");
  assert.equal(renameTarget("index.js => source/index.js"), "source/index.js");
  assert.equal(renameTarget("plain.ts"), "plain.ts");
});

test("a revert is detected and points at the commit it undoes", () => {
  const s = __test.revertSignal(commit({ subject: 'Revert "Fix linting"', body: "This reverts commit 1234567890abcdef." }));
  assert.equal(s?.kind, "revert");
  assert.equal(s?.relatedCommit, "1234567890abcdef");
  assert.equal(__test.revertSignal(commit({ subject: "Fix linting" })), undefined);
});

test("large and worded changes count as refactors, small ones do not", () => {
  const files = Array.from({ length: 20 }, (_, i) => ({ path: `src/f${i}.ts`, added: 10, deleted: 5 }));
  assert.equal(__test.refactorSignal(commit({ subject: "tidy", files }))?.kind, "refactor");
  assert.equal(__test.refactorSignal(commit({ subject: "Migrate to ESM", files: files.slice(0, 3) }))?.kind, "refactor");
  assert.equal(__test.refactorSignal(commit({ subject: "typo", files: files.slice(0, 1) })), undefined);
  const lock = [{ path: "package-lock.json", added: 9000, deleted: 9000 }];
  assert.equal(__test.refactorSignal(commit({ subject: "bump", files: lock })), undefined);
});

test("PR and issue references are read from commit messages", () => {
  assert.equal(prNumber(commit({ subject: "Add types (#207)" })), 207);
  assert.equal(prNumber(commit({ subject: "Merge pull request #12 from x/y" })), 12);
  assert.deepEqual(threadRefs(commit({ subject: "Fix it", body: "Fixes #60, see #61" })), [60, 61]);
});

test("paths map to areas", () => {
  assert.equal(areaOf("src/a/b.ts"), "src");
  assert.equal(areaOf(".github/workflows/ci.yml"), "ci");
  assert.equal(areaOf("package.json"), "dependencies");
  assert.equal(areaOf("tsconfig.json"), "config");
});

test("a revert is grouped with the commit it undoes", () => {
  const a = commit({ hash: "a".repeat(40), subject: "retry immediately", date: "2024-01-01T00:00:00Z" });
  const b = commit({ hash: "b".repeat(40), subject: 'Revert "retry immediately"', date: "2024-01-02T00:00:00Z" });
  const signals: Signal[] = [{ kind: "revert", commit: b.hash, weight: 5, summary: 'Reverted "retry immediately"', files: ["src/retry.ts"] }];
  const [cand] = groupCandidates([a, b], signals, 10);
  assert.equal(cand?.commits.length, 2);
  assert.equal(cand?.date, a.date);
});

test("slugs are short and filesystem-safe", () => {
  assert.equal(slugify("Require Node.js 12 & move to ESM!"), "require-node-js-12-move-to-esm");
  assert.ok(slugify("x".repeat(200)).length <= 60);
});

test("why() matches files, folders and symbols, and says when it has nothing", () => {
  const index: DecisionIndex = { tool: "backstory", version: "0", repo: { name: "t", head: "h" }, generatedAt: "", decisions: [decision({})] };
  assert.equal(why(index, "src/sync/retry.ts")[0]?.decision.id, "0001");
  assert.equal(why(index, "./src/sync/")[0]?.decision.id, "0001");
  assert.equal(why(index, "retryWithBackoff")[0]?.decision.id, "0001");
  assert.equal(why(index, "docs/readme.md").length, 0);
  assert.match(formatAnswer("docs/readme.md", []), /No recorded decision/);
});

test("markdown and viewer output carry the record and its evidence", () => {
  const d = decision({});
  const md = renderMarkdown(d);
  assert.match(md, /^---\nid: "0001"/);
  assert.match(md, /\[`abc1234`\]\(https:\/\/example\.com\/c\/abc1234\)/);
  const html = renderViewer({ tool: "backstory", version: "0", repo: { name: "t</script>", head: "h" }, generatedAt: "", decisions: [d] });
  assert.ok(!html.includes("t</script>"), "data cannot close the script tag");
});
