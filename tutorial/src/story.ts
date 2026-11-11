import type { Kind } from "./theme";

// The made-up repository the video tells its story about.

export const CODE = [
  "export async function retry<T>(fn: () => Promise<T>, tries = 3) {",
  "  for (let i = 0; i < tries; i++) {",
  "    try {",
  "      return await fn();",
  "    } catch (err) {",
  "      if (i === tries - 1) throw err;",
  "      await sleep(250); // do not remove",
  "    }",
  "  }",
  "}",
];
export const FIRST_LINE = 38;
export const ODD_LINE = 6; // index into CODE
export const ODD_TEXT = "await sleep(250); // do not remove";
export const FILE = "src/sync/retry.ts";

export interface Chapter {
  number: string;
  title: string;
  date: string;
  kind: Kind;
  ref: string;
  quote: string;
  text: string;
}

export const CHAPTERS: Chapter[] = [
  {
    number: "Chapter one",
    title: "The swap",
    date: "March 2022",
    kind: "dependency",
    ref: "a41c9e2",
    quote: "replace node-fetch with undici",
    text: "A faster HTTP client goes in. Failed calls now retry instantly.",
  },
  {
    number: "Chapter two",
    title: "The revert",
    date: "April 2022",
    kind: "revert",
    ref: "PR #212",
    quote: 'Revert "retry immediately on 429"',
    text: "Instant retries trip the upstream rate limiter. Rolled back within a day.",
  },
  {
    number: "Chapter three",
    title: "The workaround",
    date: "April 2022",
    kind: "comment",
    ref: "retry.ts:44",
    quote: "// do not remove",
    text: "A 250 ms pause keeps the limiter calm. The reason stays in a PR nobody reads.",
  },
];

export const ADR = {
  id: "ADR 0007",
  date: "2022-04-11",
  title: "Wait 250 ms between retries",
  context: "Instant retries after the undici swap tripped the upstream rate limiter, which banned the service for 10 minutes (#212).",
  decision: "retry() pauses 250 ms between attempts.",
  alternative: "Retry immediately on 429. Reverted after one day (c9d01f7).",
  evidence: ["a41c9e2", "c9d01f7", "#212", "retry.ts:44"],
};

export const TIMELINE: { id: string; date: string; title: string; kind: Kind; area: string }[] = [
  { id: "0009", date: "2023-01-18", title: "Move secrets out of config.yml", kind: "config", area: "config" },
  { id: "0008", date: "2022-09-02", title: "Pin undici to v5 for now", kind: "dependency", area: "api" },
  { id: "0007", date: "2022-04-11", title: "Wait 250 ms between retries", kind: "revert", area: "sync" },
  { id: "0006", date: "2022-03-02", title: "Replace node-fetch with undici", kind: "dependency", area: "sync" },
  { id: "0005", date: "2021-11-20", title: "Split the sync worker out of the API", kind: "refactor", area: "api" },
];

export const INSTALL = "npx github:hesselb20-ctrl/backstory scan .";
export const REPO_URL = "github.com/hesselb20-ctrl/backstory";
