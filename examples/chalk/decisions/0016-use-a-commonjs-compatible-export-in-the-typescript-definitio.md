---
id: "0016"
title: "Use a CommonJS-compatible export in the TypeScript definition, with types under a chalk namespace"
date: 2019-04-28
status: active
confidence: medium
signals: ["dependency", "refactor", "config"]
areas: ["root", "dependencies", "ci"]
files: ["package.json", ".travis.yml", "index.d.ts", "index.js", "index.test-d.ts"]
written_by: claude-fable-5-2
---

# 0016. Use a CommonJS-compatible export in the TypeScript definition, with types under a chalk namespace

- **Date:** 2019-04-28
- **Status:** active
- **Confidence:** medium. The commit subject states the intent and the diff shows the restructuring, but PR #344 only links to an external discussion (sindresorhus/meta issue 9) whose content is not in the evidence.

## Context

Before 98628d9, index.d.ts was written as an ES module: `Level`, `Options`, `Instance`, `ColorSupport` and `Chalk` were each top-level `export` declarations. The commit subject says the aim was a CommonJS-compatible export in the type definition. PR #344 gives no reasoning of its own and only points to a comment on sindresorhus/meta issue 9, so the history here does not say why in detail.

## Decision

98628d9 rewrote index.d.ts so the public types live inside `declare namespace chalk` instead of being top-level ES exports. The level enum became a top-level `declare const enum LevelEnum`, re-exposed as `type Level = LevelEnum` inside the namespace. The same commit swapped the type-test dependency from tsd-check to tsd, updated index.test-d.ts to match, removed one line from index.js and added Node 12 to the Travis matrix.

## Alternatives tried

- Top-level ES-module `export` declarations in index.d.ts were the previous shape and were removed by 98628d9.

## Consequences

- New public types belong inside `declare namespace chalk`, not as top-level `export` declarations, or the CommonJS-compatible shape is lost.
- `LevelEnum` sitting outside the namespace with a `Level` alias inside it is part of this restructuring; the excerpt does not show why it was split this way.
- Type-definition tests in index.test-d.ts run with tsd, not tsd-check.
- index.js lost one line in this commit and the patch excerpt is cut before showing it or the final export statement of index.d.ts, so check the full commit before changing how the module or its types are exported.

## Evidence

- Commit [`98628d9`](https://github.com/chalk/chalk/commit/98628d9f087a5c1771651fa7b867dcd2356c2123) (2019-04-28): Use CommonJS-compatible export in TypeScript definition (#344) (Dimitri Benin)
- PR [#344](https://github.com/chalk/chalk/pull/344): Use CommonJS-compatible export in TypeScript definition
