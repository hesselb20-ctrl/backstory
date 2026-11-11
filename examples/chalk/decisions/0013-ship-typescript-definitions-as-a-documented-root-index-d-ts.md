---
id: "0013"
title: "Ship TypeScript definitions as a documented root index.d.ts tested with tsd-check"
date: 2018-12-26
status: active
confidence: medium
signals: ["dependency", "refactor", "config"]
areas: ["root", "types", "dependencies"]
files: ["package.json", "tsconfig.json", "index.d.ts", "index.js", "index.test-d.ts", "readme.md", "templates.js", "types/index.d.ts", "types/test.ts"]
written_by: claude-fable-5-2
---

# 0013. Ship TypeScript definitions as a documented root index.d.ts tested with tsd-check

- **Date:** 2018-12-26
- **Status:** active
- **Confidence:** medium. PR #299 lists what was done as a checklist and links issue #293, but neither the commit nor the PR text explains the motivation, and the issue text is not in the evidence.

## Context

Chalk's TypeScript definitions lived in types/index.d.ts (97 lines) with a hand-written types/test.ts (56 lines) alongside them. PR #299 was opened to fix #293, with a checklist covering doc comments, type renames and definition tests. The history does not say why these changes were wanted; the text of #293 is not part of the evidence.

## Decision

Commit 90c7a92 deletes types/index.d.ts and types/test.ts and adds a 282-line index.d.ts at the repository root with tsdoc-style comments on the options, levels, colour-model methods and modifiers. Type tests move to index.test-d.ts and use expectType from the newly added tsd-check dependency. Per the PR checklist, ChalkOptions and ChalkConstructor are renamed to Options and Constructor, with aliases under the old names for backwards compatibility.

## Alternatives tried

None recorded in the history.

## Consequences

- The type definitions are hand-maintained separately from index.js, so any change to the public API has to be mirrored in index.d.ts and covered in index.test-d.ts.
- Per the PR #299 checklist, the old names ChalkOptions and ChalkConstructor are kept as aliases of Options and Constructor for backwards compatibility; the aliases are not visible in the truncated patch excerpt, so check index.d.ts before relying on or removing them.
- Type tests are written as expectType assertions from tsd-check in index.test-d.ts, not as a plain compiled file under types/.
- package.json and tsconfig.json were touched in the same commit (tsconfig.json with no line changes, which suggests a move), but the excerpt does not show their contents, so check them before assuming how the definitions are wired up and tested.

## Evidence

- Commit [`90c7a92`](https://github.com/chalk/chalk/commit/90c7a92ff126233a6e0350fdc163b5045935b09c) (2018-12-26): Add docs comments and tests for TypeScript definitions (#299) (George Gkasdrogkas)
- PR [#299](https://github.com/chalk/chalk/pull/299): Add docs comments and tests for TypeScript definitions
