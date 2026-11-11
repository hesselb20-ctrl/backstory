---
id: "0005"
title: "Remove chalk.hasColor and chalk.stripColor along with the has-ansi and strip-ansi dependencies"
date: 2015-12-12
status: active
confidence: low
signals: ["dependency"]
areas: ["dependencies"]
files: ["package.json"]
written_by: claude-fable-5-2
---

# 0005. Remove chalk.hasColor and chalk.stripColor along with the has-ansi and strip-ansi dependencies

- **Date:** 2015-12-12
- **Status:** active
- **Confidence:** low. The commit message only says what was removed and there is no PR, issue or comment giving the reasoning.

## Context

Chalk exposed two helpers on its export, `chalk.hasColor` and `chalk.stripColor`, which were direct re-exports of the `has-ansi` and `strip-ansi` packages. Both were documented in the readme and covered by tests. The history does not say why they were removed.

## Decision

Commit 04cae22 drops `has-ansi` and `strip-ansi` from package.json and removes the `hasColor` and `stripColor` exports from index.js, together with their readme sections and tests. Chalk's runtime dependencies are left as `ansi-styles`, `escape-string-regexp` and `supports-color`, and the export still exposes `styles` and `supportsColor`.

## Alternatives tried

None recorded in the history.

## Consequences

- `chalk.hasColor` and `chalk.stripColor` no longer exist, so callers that used them will break; this is a removal of public API.
- The removed helpers were thin re-exports, so the same behaviour is available by depending on `has-ansi` and `strip-ansi` directly.
- The readme no longer documents the pattern of stripping colour from externally styled text when `supportsColor` is false, and chalk itself provides no helper for it.
- Re-adding ANSI detection or stripping to chalk would mean reintroducing dependencies that were deliberately taken out in 04cae22.

## Evidence

- Commit [`04cae22`](https://github.com/chalk/chalk/commit/04cae226cc0fc11fd7898f3fa91fdc4a3b3e496b) (2015-12-12): remove has-ansi and strip-ansi dependencies (vdemedes)
