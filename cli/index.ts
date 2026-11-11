#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { renderMarkdown, toDecision } from "./adr.js";
import { readLog, repoInfo } from "./git.js";
import { enrich } from "./github.js";
import { groupCandidates } from "./group.js";
import { detectSignals } from "./signals.js";
import type { Candidate, Decision, DecisionIndex } from "./types.js";
import { renderViewer } from "./viewer.js";
import { formatAnswer, loadIndex, why } from "./why.js";
import { DEFAULT_MODEL, pickProvider, writeDraft } from "./writer.js";

const VERSION = "0.1.0";

const HELP = `backstory ${VERSION}
Recover the why behind a codebase.

Usage
  backstory scan <repo-path> [options]   Mine history and write a decision log
  backstory why <file|symbol> [options]  Ask the log why something is the way it is
  backstory mcp [options]                Start the MCP server (stdio) exposing why()

Scan options
  --out <dir>          Where to write the log (default: <repo>/decisions)
  --max <n>            Most decision candidates to write up (default: 25)
  --since <date>       Only look at history after this date
  --max-commits <n>    Only look at the newest n commits
  --no-github          Skip PR and issue text (fetched with gh api, or the REST
                       API with GITHUB_TOKEN when gh is not installed)
  --github-budget <n>  Most GitHub requests to make (default: 60)
  --provider <name>    api | claude-cli | none (default: api when ANTHROPIC_API_KEY
                       is set, else a signed-in Claude Code, else none)
  --model <id>         Model that writes the records (default: ${DEFAULT_MODEL})
  --concurrency <n>    Records written in parallel (default: 3)
  --dry-run            List candidates and stop before calling a model

Why and mcp options
  --decisions <dir>    Decision log to read (default: ./decisions)
  --repo <dir>         Checkout used to resolve symbols (default: .)
`;

function fail(message: string): never {
  console.error(`backstory: ${message}`);
  process.exit(1);
}

async function pool<T>(items: T[], size: number, fn: (item: T, i: number) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      await fn(items[i]!, i);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(size, items.length)) }, worker));
}

function describe(c: Candidate): string {
  const kinds = [...new Set(c.signals.map((s) => s.kind))].join("+");
  const lead = c.commits[0]!;
  return `${c.date.slice(0, 10)}  ${kinds.padEnd(28)} ${String(c.commits.length).padStart(2)} commit(s)  ${lead.short} ${lead.subject.slice(0, 60)}`;
}

async function scan(argv: string[]): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      out: { type: "string" },
      max: { type: "string", default: "25" },
      since: { type: "string" },
      "max-commits": { type: "string" },
      "no-github": { type: "boolean", default: false },
      "github-budget": { type: "string", default: "60" },
      provider: { type: "string" },
      model: { type: "string", default: DEFAULT_MODEL },
      concurrency: { type: "string", default: "3" },
      "dry-run": { type: "boolean", default: false },
    },
  });
  const repo = resolve(positionals[0] ?? ".");
  if (!existsSync(repo)) fail(`${repo} does not exist`);
  let info;
  try {
    info = repoInfo(repo);
  } catch {
    fail(`${repo} is not a git repository`);
  }
  const out = resolve(values.out ?? join(repo, "decisions"));
  const log = (msg: string) => console.error(msg);

  log(`Reading history of ${info.name}`);
  const commits = readLog(repo, {
    since: values.since,
    maxCommits: values["max-commits"] ? Number(values["max-commits"]) : undefined,
  });
  if (!commits.length) fail("no commits found");
  const signals = detectSignals(repo, commits);
  const tally = new Map<string, number>();
  for (const s of signals) tally.set(s.kind, (tally.get(s.kind) ?? 0) + 1);
  log(`  ${commits.length} commits, ${signals.length} signals (${[...tally].map(([k, n]) => `${n} ${k}`).join(", ")})`);

  const candidates = groupCandidates(commits, signals, Number(values.max));
  log(`  ${candidates.length} decision candidates`);

  if (!values["no-github"] && info.slug) {
    const { fetched, via, rateLimited } = await enrich(candidates, info.slug, Number(values["github-budget"]));
    const got = candidates.reduce((n, c) => n + c.threads.length, 0);
    log(`  ${got} PR and issue threads attached (${fetched} requests via ${via})`);
    if (rateLimited) log("  GitHub rate limit reached: install gh or set GITHUB_TOKEN to fetch the rest.");
  }

  if (values["dry-run"]) {
    for (const c of candidates) console.log(describe(c));
    return;
  }

  const provider = pickProvider(values.provider);
  const model = values.model!;
  const writtenBy = provider === "none" ? "heuristic" : model;
  if (provider === "none") {
    log("  No model available: writing evidence-only records. Set ANTHROPIC_API_KEY or sign in to Claude Code for written ADRs.");
  } else {
    log(`Writing records with ${model} (${provider === "api" ? "Claude API" : "Claude Code CLI"})`);
  }

  const drafts = new Array<Awaited<ReturnType<typeof writeDraft>> | undefined>(candidates.length);
  await pool(candidates, Number(values.concurrency), async (cand, i) => {
    try {
      drafts[i] = await writeDraft(provider, model, repo, cand);
      const d = drafts[i]!;
      log(`  ${String(i + 1).padStart(2)}/${candidates.length} ${d.skip ? `skipped: ${d.skip_reason}` : d.title}`);
    } catch (err) {
      log(`  ${String(i + 1).padStart(2)}/${candidates.length} failed: ${(err as Error).message}`);
    }
  });

  const decisions: Decision[] = [];
  candidates.forEach((cand, i) => {
    const draft = drafts[i];
    if (!draft || draft.skip || !draft.title) return;
    decisions.push(toDecision(decisions.length + 1, cand, draft, info, writtenBy));
  });
  if (!decisions.length) fail("no records were written");

  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(out)) if (/^\d{4}-.*\.md$/.test(f)) rmSync(join(out, f));
  for (const d of decisions) writeFileSync(join(out, `${d.slug}.md`), renderMarkdown(d));
  const index: DecisionIndex = {
    tool: "backstory",
    version: VERSION,
    repo: { name: info.name, url: info.slug ? `https://github.com/${info.slug}` : undefined, head: info.head },
    generatedAt: new Date().toISOString(),
    decisions,
  };
  writeFileSync(join(out, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  writeFileSync(join(out, "index.html"), renderViewer(index));
  log(`\n${decisions.length} decisions written to ${out}`);
  log(`Open ${join(out, "index.html")} to browse the timeline.`);
}

function whyCommand(argv: string[]): void {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: { decisions: { type: "string", default: "decisions" }, repo: { type: "string", default: "." }, limit: { type: "string", default: "5" } },
  });
  const target = positionals[0];
  if (!target) fail("usage: backstory why <file|symbol>");
  try {
    const index = loadIndex(resolve(values.decisions!));
    console.log(formatAnswer(target, why(index, target, resolve(values.repo!), Number(values.limit))));
  } catch (err) {
    fail((err as Error).message);
  }
}

const [command, ...rest] = process.argv.slice(2);
switch (command) {
  case "scan":
    await scan(rest);
    break;
  case "why":
    whyCommand(rest);
    break;
  case "mcp": {
    const { serve } = await import("../mcp/server.js");
    await serve(rest);
    break;
  }
  case "--version":
  case "-v":
    console.log(VERSION);
    break;
  default:
    console.log(HELP);
    if (command && command !== "help" && command !== "--help" && command !== "-h") process.exit(1);
}
