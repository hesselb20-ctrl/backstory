import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { formatAnswer, loadIndex, why } from "../cli/why.js";

/**
 * MCP server over stdio with one tool, why(target).
 *
 * The decision log is read on every call, so a fresh `backstory scan` is picked
 * up without restarting the server.
 */
export async function serve(argv: string[]): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: { decisions: { type: "string" }, repo: { type: "string" } },
  });
  const decisions = resolve(values.decisions ?? process.env.BACKSTORY_DECISIONS ?? "decisions");
  const repo = resolve(values.repo ?? process.env.BACKSTORY_REPO ?? ".");

  const server = new McpServer({ name: "backstory", version: "0.1.0" });

  server.registerTool(
    "why",
    {
      title: "Why is this code the way it is?",
      description:
        "Look up the recorded decisions behind a file, folder or symbol before changing it. " +
        "Returns ADR-style records rebuilt from git history, PRs, issues and code comments: the context, " +
        "the decision, alternatives that were tried and rolled back, consequences, and links to the commits " +
        "and PRs behind each one. Call this before refactoring, removing a workaround, swapping a dependency " +
        "or changing config. An empty result means no decision was recorded, not that the change is safe.",
      inputSchema: {
        target: z.string().min(1).describe('A repository-relative file or folder path ("src/retry.ts"), or a symbol name ("retryWithBackoff").'),
        limit: z.number().int().min(1).max(20).optional().describe("Most records to return. Default 5."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ target, limit }) => {
      try {
        const index = loadIndex(decisions);
        const matches = why(index, target, repo, limit ?? 5);
        return { content: [{ type: "text", text: formatAnswer(target, matches) }] };
      } catch (err) {
        return { content: [{ type: "text", text: (err as Error).message }], isError: true };
      }
    },
  );

  await server.connect(new StdioServerTransport());
}
