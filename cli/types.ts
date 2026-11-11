export interface FileChange {
  path: string;
  added: number;
  deleted: number;
}

export interface Commit {
  hash: string;
  short: string;
  parents: string[];
  author: string;
  date: string; // ISO 8601
  subject: string;
  body: string;
  files: FileChange[];
}

export type SignalKind = "revert" | "dependency" | "refactor" | "config" | "comment" | "message";

export interface Signal {
  kind: SignalKind;
  /** Commit the signal is attached to. */
  commit: string;
  weight: number;
  summary: string;
  files: string[];
  /** Another commit this signal points at (the reverted commit, for example). */
  relatedCommit?: string;
  /** Package names touched, for dependency signals. */
  added?: string[];
  removed?: string[];
  /** Source location, for comment signals. */
  location?: { file: string; line: number; text: string };
}

export interface Thread {
  number: number;
  kind: "pr" | "issue";
  title: string;
  body: string;
  url: string;
  state: string;
}

export interface Candidate {
  commits: Commit[];
  signals: Signal[];
  files: string[];
  areas: string[];
  score: number;
  /** Date of the earliest commit. */
  date: string;
  threads: Thread[];
}

export type EvidenceType = "commit" | "pr" | "issue" | "comment";

export interface Evidence {
  type: EvidenceType;
  ref: string;
  title: string;
  url?: string;
  date?: string;
}

export type Confidence = "high" | "medium" | "low";
export type Status = "active" | "reverted" | "superseded";

export interface Decision {
  id: string;
  slug: string;
  title: string;
  date: string;
  status: Status;
  confidence: Confidence;
  confidenceReason: string;
  signals: SignalKind[];
  areas: string[];
  files: string[];
  context: string;
  decision: string;
  alternatives: string[];
  consequences: string[];
  evidence: Evidence[];
  /** What wrote the prose: a model id, or "heuristic". */
  writtenBy: string;
}

export interface DecisionIndex {
  tool: "backstory";
  version: string;
  repo: { name: string; url?: string; head: string };
  generatedAt: string;
  decisions: Decision[];
}
