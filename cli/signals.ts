import { git, showFile, tryGit } from "./git.js";
import type { Commit, Signal } from "./types.js";

/** Files whose churn says nothing about intent. */
const NOISE = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|npm-shrinkwrap\.json|Cargo\.lock|poetry\.lock|Gemfile\.lock|go\.sum|composer\.lock)$|(^|\/)(dist|build|vendor|node_modules|__snapshots__)\/|\.min\.(js|css)$|\.(snap|map|svg|png|jpg|jpeg|gif|ico|woff2?)$/;

const MANIFEST = /(^|\/)(package\.json|requirements[^/]*\.txt|pyproject\.toml|go\.mod|Cargo\.toml|Gemfile|pom\.xml|build\.gradle(\.kts)?|composer\.json)$/;

const CONFIG = /(^|\/)(\.github\/workflows\/[^/]+|\.travis\.yml|\.circleci\/config\.yml|appveyor\.yml|\.gitlab-ci\.yml|Dockerfile[^/]*|docker-compose[^/]*\.ya?ml|tsconfig[^/]*\.json|jsconfig\.json|\.eslintrc[^/]*|eslint\.config\.[cm]?[jt]s|\.prettierrc[^/]*|\.babelrc[^/]*|babel\.config\.[cm]?js|(webpack|rollup|vite|vitest|jest|esbuild|tsup|next|nuxt|svelte|astro|tailwind|postcss)\.config\.[cm]?[jt]s|\.npmrc|\.nvmrc|\.node-version|\.tool-versions|\.editorconfig|\.gitattributes|Makefile|tox\.ini|setup\.cfg|\.env\.example)$/;

const CI = /(^|\/)(\.github\/workflows\/|\.travis\.yml|\.circleci\/|appveyor\.yml|\.gitlab-ci\.yml)/;

const REFACTOR_WORDS = /\b(refactor\w*|rewrit\w+|rewrote|migrat\w+|restructur\w+|switch(?:ed|ing)? to|mov(?:e|ed|ing) to|replac\w+|convert\w*|port(?:ed)? to|drop(?:ped|s)?|remov(?:e|ed|es|ing)|deprecat\w+|vendor\w*|require node|overhaul\w*|simplif\w+|extract\w*|inline[ds]?)\b/i;

const RATIONALE_WORDS = /\b(because|workaround|work around|hack|instead of|so that|in order to|due to|temporar(?:y|ily)|for now|turns out|regression|breaking change|backwards?[- ]compat\w*|perf(?:ormance)?|faster|slower)\b/i;

const COMMENT_WORDS = "(because|workaround|work around|hack|temporar|for now|do not remove|don't remove|do not change|on purpose|intentional|must stay|see #[0-9]+|see https?://|TODO: remove|FIXME|XXX)";
const COMMENT_LEAD = /(\/\/|\/\*|^\s*\*|#|--|<!--|;;|%)/;

const meaningful = (c: Commit) => c.files.filter((f) => !NOISE.test(f.path));
const churn = (c: Commit) => meaningful(c).reduce((n, f) => n + f.added + f.deleted, 0);
const isRelease = (c: Commit) => /^v?\d+\.\d+\.\d+(\S*)$/.test(c.subject);

function revertSignal(c: Commit): Signal | undefined {
  const quoted = c.subject.match(/^Revert\s+"(.+)"\s*$/i);
  const looksLike = quoted || /^revert\b/i.test(c.subject) || /\bThis reverts commit\b/i.test(c.body);
  if (!looksLike) return undefined;
  const related = c.body.match(/This reverts commit ([0-9a-f]{7,40})/i)?.[1];
  return {
    kind: "revert",
    commit: c.hash,
    weight: 5,
    summary: quoted ? `Reverted "${quoted[1]}"` : `Revert: ${c.subject}`,
    files: c.files.map((f) => f.path),
    relatedCommit: related,
  };
}

type DepMap = Record<string, string>;
const DEP_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

function parseJson(text: string | undefined): Record<string, unknown> | undefined {
  if (!text) return undefined;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" ? (v as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}

function collectDeps(pkg: Record<string, unknown> | undefined): { all: DepMap; runtime: Set<string> } {
  const all: DepMap = {};
  const runtime = new Set<string>();
  for (const field of DEP_FIELDS) {
    const map = pkg?.[field];
    if (!map || typeof map !== "object") continue;
    for (const [name, range] of Object.entries(map as DepMap)) {
      all[name] = String(range);
      if (field !== "devDependencies") runtime.add(name);
    }
  }
  return { all, runtime };
}

const flat = (v: unknown) => (v === undefined ? "unset" : typeof v === "string" ? v : JSON.stringify(v));

/** Dependency and package-level config changes from one package.json revision pair. */
function packageJsonSignals(repo: string, c: Commit, path: string): Signal[] {
  const parent = c.parents[0];
  const after = parseJson(showFile(repo, c.hash, path));
  const before = parent ? parseJson(showFile(repo, parent, path)) : undefined;
  if (!after || !before) return [];
  const a = collectDeps(after);
  const b = collectDeps(before);
  const added = Object.keys(a.all).filter((n) => !(n in b.all));
  const removed = Object.keys(b.all).filter((n) => !(n in a.all));
  const out: Signal[] = [];
  if (added.length || removed.length) {
    const runtime = added.some((n) => a.runtime.has(n)) || removed.some((n) => b.runtime.has(n));
    const swap = added.length > 0 && removed.length > 0;
    const parts = [
      removed.length ? `removed ${removed.join(", ")}` : "",
      added.length ? `added ${added.join(", ")}` : "",
    ].filter(Boolean);
    out.push({
      kind: "dependency",
      commit: c.hash,
      weight: (swap ? 4 : removed.length ? 3 : 2) + (runtime ? 1.5 : 0),
      summary: `${swap ? "Dependency swap" : "Dependency change"} in ${path}: ${parts.join("; ")}`,
      files: [path],
      added,
      removed,
    });
  }
  const changed: string[] = [];
  for (const field of ["engines", "type", "exports", "main", "module", "browser", "sideEffects"]) {
    const x = flat(before[field]);
    const y = flat(after[field]);
    if (x !== y) changed.push(`${field}: ${x.slice(0, 120)} -> ${y.slice(0, 120)}`);
  }
  if (changed.length) {
    out.push({
      kind: "config",
      commit: c.hash,
      weight: 3.5,
      summary: `Package contract changed in ${path}: ${changed.join("; ")}`,
      files: [path],
    });
  }
  return out;
}

/** Best-effort names from +/- lines in manifests we do not parse structurally. */
function genericManifestSignal(repo: string, c: Commit, path: string): Signal | undefined {
  const patch = tryGit(repo, ["show", "--format=", "-U0", "--no-color", c.hash, "--", path]);
  if (!patch) return undefined;
  const name = (line: string) => line.slice(1).trim().match(/^["']?([A-Za-z0-9_.@/:-]{2,})/)?.[1];
  const plus = new Set<string>();
  const minus = new Set<string>();
  for (const line of patch.split("\n")) {
    if (/^(\+\+\+|---|@@)/.test(line)) continue;
    const n = name(line);
    if (!n || /^(name|version|description|\[|#)/.test(n)) continue;
    if (line.startsWith("+")) plus.add(n);
    else if (line.startsWith("-")) minus.add(n);
  }
  const added = [...plus].filter((n) => !minus.has(n));
  const removed = [...minus].filter((n) => !plus.has(n));
  if (!added.length && !removed.length) return undefined;
  const swap = added.length > 0 && removed.length > 0;
  return {
    kind: "dependency",
    commit: c.hash,
    weight: swap ? 4 : 2.5,
    summary: `Manifest change in ${path}: ${[removed.length ? `removed ${removed.slice(0, 8).join(", ")}` : "", added.length ? `added ${added.slice(0, 8).join(", ")}` : ""].filter(Boolean).join("; ")}`,
    files: [path],
    added,
    removed,
  };
}

function refactorSignal(c: Commit): Signal | undefined {
  const files = meaningful(c);
  const size = churn(c);
  const worded = REFACTOR_WORDS.test(c.subject);
  const big = files.length >= 15 || size >= 400;
  if (!(big || (worded && size >= 30))) return undefined;
  if (c.parents.length > 1) return undefined;
  const weight = 2 + (big ? 1.5 : 0) + (worded ? 1 : 0) + Math.min(1.5, size / 1000);
  return {
    kind: "refactor",
    commit: c.hash,
    weight,
    summary: `${big ? "Large change" : "Structural change"}: ${files.length} files, ${size} lines touched ("${c.subject}")`,
    files: files.map((f) => f.path),
  };
}

function configSignal(c: Commit): Signal | undefined {
  const hits = c.files.filter((f) => CONFIG.test(f.path)).map((f) => f.path);
  if (!hits.length) return undefined;
  const onlyCi = hits.every((p) => CI.test(p));
  return {
    kind: "config",
    commit: c.hash,
    weight: onlyCi ? 1 : 2,
    summary: `Config change: ${hits.slice(0, 6).join(", ")}`,
    files: hits,
  };
}

function messageSignal(c: Commit): Signal | undefined {
  const text = `${c.subject}\n${c.body}`;
  const m = text.match(RATIONALE_WORDS);
  if (!m) return undefined;
  return {
    kind: "message",
    commit: c.hash,
    weight: c.body.length > 200 ? 2.5 : 1.5,
    summary: `Commit message gives a reason ("${m[0]}")`,
    files: meaningful(c).map((f) => f.path),
  };
}

/** Comments at HEAD that explain themselves, traced to the commit that wrote the line. */
export function commentSignals(repo: string, limit = 120): Signal[] {
  const out = tryGit(repo, [
    "grep", "-n", "-I", "-i", "-E", COMMENT_WORDS, "HEAD", "--",
    ".", ":(exclude)*.md", ":(exclude)*.lock", ":(exclude)*lock.json", ":(exclude)*.min.*", ":(exclude)*.snap",
    ":(exclude)*.json", ":(exclude)*.svg", ":(exclude)*.txt", ":(exclude)*license*",
  ]);
  if (!out) return [];
  const word = new RegExp(COMMENT_WORDS, "i");
  const signals: Signal[] = [];
  for (const row of out.split("\n")) {
    const m = row.match(/^HEAD:(.+?):(\d+):(.*)$/);
    if (!m) continue;
    const [, file, lineNo, text] = m as unknown as [string, string, string, string];
    if (NOISE.test(file) || text.length > 400) continue;
    const at = text.search(word);
    const lead = text.slice(0, at).search(COMMENT_LEAD);
    if (lead < 0) continue;
    const blame = tryGit(repo, ["blame", "-L", `${lineNo},${lineNo}`, "--porcelain", "HEAD", "--", file]);
    const hash = blame?.match(/^([0-9a-f]{40}) /)?.[1];
    if (!hash) continue;
    signals.push({
      kind: "comment",
      commit: hash,
      weight: 3,
      summary: `Comment at ${file}:${lineNo}: ${text.trim().slice(0, 200)}`,
      files: [file],
      location: { file, line: Number(lineNo), text: text.trim().slice(0, 300) },
    });
    if (signals.length >= limit) break;
  }
  return signals;
}

/** All signals found in history plus self-explaining comments in the current tree. */
export function detectSignals(repo: string, commits: Commit[]): Signal[] {
  const signals: Signal[] = [];
  for (const c of commits) {
    const revert = revertSignal(c);
    if (revert) signals.push(revert);
    for (const f of c.files) {
      if (!MANIFEST.test(f.path) || /node_modules\//.test(f.path)) continue;
      if (f.path.endsWith("package.json")) signals.push(...packageJsonSignals(repo, c, f.path));
      else {
        const s = genericManifestSignal(repo, c, f.path);
        if (s) signals.push(s);
      }
    }
    if (isRelease(c)) continue;
    for (const s of [refactorSignal(c), configSignal(c), messageSignal(c)]) if (s) signals.push(s);
  }
  signals.push(...commentSignals(repo));
  return signals;
}

export const __test = { revertSignal, refactorSignal, messageSignal, configSignal };
export { git as _git };
