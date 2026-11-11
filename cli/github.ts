import { execFile, execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { prNumber, threadRefs } from "./group.js";
import type { Candidate, Thread } from "./types.js";

const run = promisify(execFile);
const BODY_LIMIT = 4000;
const PER_CANDIDATE = 4;
let rateLimited = false;

export function hasGh(): boolean {
  try {
    execFileSync("gh", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

interface IssuePayload {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  state: string;
  pull_request?: unknown;
}

/**
 * Fetch one issue or PR. GitHub's issues endpoint answers for both, so one call
 * covers a number whose kind we do not know yet.
 */
async function fetchThread(slug: string, n: number, useGh: boolean): Promise<Thread | undefined> {
  const dir = join(tmpdir(), "backstory-cache", slug.replace("/", "__"));
  const file = join(dir, `${n}.json`);
  let payload: IssuePayload | undefined;
  try {
    payload = JSON.parse(readFileSync(file, "utf8")) as IssuePayload;
  } catch {
    // not cached yet
  }
  if (!payload) {
    const path = `repos/${slug}/issues/${n}`;
    try {
      if (useGh) {
        const { stdout } = await run("gh", ["api", path], { maxBuffer: 16 * 1024 * 1024 });
        payload = JSON.parse(stdout) as IssuePayload;
      } else {
        // Public repositories answer without a token, at 60 requests an hour per address.
        const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
        const res = await fetch(`https://api.github.com/${path}`, {
          headers: {
            accept: "application/vnd.github+json",
            "user-agent": "backstory-cli",
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.status === 403 || res.status === 429) rateLimited = true;
        if (!res.ok) return undefined;
        payload = (await res.json()) as IssuePayload;
      }
      mkdirSync(dir, { recursive: true });
      writeFileSync(file, JSON.stringify(payload));
    } catch {
      return undefined;
    }
  }
  if (!payload?.html_url) return undefined;
  const body = payload.body ?? "";
  return {
    number: payload.number,
    kind: payload.pull_request ? "pr" : "issue",
    title: payload.title,
    body: body.length > BODY_LIMIT ? `${body.slice(0, BODY_LIMIT)}\n… (cut)` : body,
    url: payload.html_url,
    state: payload.state,
  };
}

/**
 * Attach PR and issue text to candidates. `budget` caps the number of requests;
 * the strongest candidates are served first.
 */
export async function enrich(candidates: Candidate[], slug: string, budget: number): Promise<{ fetched: number; via: string; rateLimited: boolean }> {
  const useGh = hasGh();
  let fetched = 0;
  const ranked = [...candidates].sort((a, b) => b.score - a.score);
  for (const cand of ranked) {
    const numbers: number[] = [];
    for (const c of cand.commits) {
      const pr = prNumber(c);
      if (pr !== undefined) numbers.push(pr);
      numbers.push(...threadRefs(c));
    }
    for (const n of [...new Set(numbers)].slice(0, PER_CANDIDATE)) {
      if (fetched >= budget || rateLimited) return { fetched, via: useGh ? "gh api" : "REST API", rateLimited };
      const thread = await fetchThread(slug, n, useGh);
      fetched++;
      if (thread) cand.threads.push(thread);
    }
  }
  return { fetched, via: useGh ? "gh api" : "REST API", rateLimited };
}
