import { execFileSync } from "node:child_process";
import type { Commit, FileChange } from "./types.js";

const MAX_BUFFER = 512 * 1024 * 1024;

/** Run git in a repository and return stdout. Throws on a non-zero exit. */
export function git(repo: string, args: string[]): string {
  return execFileSync("git", ["-C", repo, "-c", "core.quotepath=off", ...args], {
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

/** Like git(), but returns undefined instead of throwing. */
export function tryGit(repo: string, args: string[]): string | undefined {
  try {
    return git(repo, args);
  } catch {
    return undefined;
  }
}

/** Resolve "a/{old => new}/c.ts" and "old => new" rename notations to the new path. */
export function renameTarget(path: string): string {
  const brace = path.match(/^(.*)\{(.*) => (.*)\}(.*)$/);
  if (brace) return `${brace[1]}${brace[3]}${brace[4]}`.replace(/\/\//g, "/");
  const plain = path.match(/^(.*) => (.*)$/);
  return plain ? plain[2]! : path;
}

export interface LogOptions {
  since?: string;
  maxCommits?: number;
}

const RS = "\x1e";
const US = "\x1f";

/** Read history, oldest first, with per-file line counts. */
export function readLog(repo: string, opts: LogOptions = {}): Commit[] {
  const args = ["log", "--numstat", "-M", `--format=${RS}%H${US}%P${US}%an${US}%aI${US}%s${US}%b${US}`];
  if (opts.since) args.push(`--since=${opts.since}`);
  if (opts.maxCommits) args.push(`-n`, String(opts.maxCommits));
  const out = git(repo, args);
  const commits: Commit[] = [];
  for (const record of out.split(RS)) {
    if (!record.trim()) continue;
    const parts = record.split(US);
    if (parts.length < 7) continue;
    const [hash, parents, author, date, subject, body, stat] = parts as [string, string, string, string, string, string, string];
    const files: FileChange[] = [];
    for (const line of stat.split("\n")) {
      const m = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
      if (!m) continue;
      files.push({
        path: renameTarget(m[3]!),
        added: m[1] === "-" ? 0 : Number(m[1]),
        deleted: m[2] === "-" ? 0 : Number(m[2]),
      });
    }
    commits.push({
      hash,
      short: hash.slice(0, 7),
      parents: parents.split(" ").filter(Boolean),
      author,
      date,
      subject: subject.trim(),
      body: body.trim(),
      files,
    });
  }
  return commits.reverse();
}

/** File content at a revision, or undefined when the file does not exist there. */
export function showFile(repo: string, rev: string, path: string): string | undefined {
  return tryGit(repo, ["show", `${rev}:${path}`]);
}

/** A patch for one commit, cut to a character budget. */
export function patchExcerpt(repo: string, hash: string, budget: number): string {
  const patch = tryGit(repo, [
    "show", "--format=", "--unified=2", "--no-color", hash, "--",
    ".", ":(exclude)*lock*", ":(exclude)*.min.*", ":(exclude)*.snap", ":(exclude)*.svg", ":(exclude)*.map",
  ]);
  if (!patch) return "";
  return patch.length > budget ? `${patch.slice(0, budget)}\n… (patch cut at ${budget} characters)` : patch;
}

export interface RepoInfo {
  name: string;
  head: string;
  remote?: string;
  /** "owner/name" when the origin remote is on GitHub. */
  slug?: string;
}

export function repoInfo(repo: string): RepoInfo {
  const top = git(repo, ["rev-parse", "--show-toplevel"]).trim();
  const head = git(repo, ["rev-parse", "HEAD"]).trim();
  const remote = tryGit(repo, ["remote", "get-url", "origin"])?.trim();
  const m = remote?.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?\/?$/);
  const slug = m ? `${m[1]}/${m[2]}` : undefined;
  return { name: slug ?? top.split(/[\\/]/).pop() ?? "repo", head, remote, slug };
}
