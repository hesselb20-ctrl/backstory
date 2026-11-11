---
id: "0028"
title: "Replace ava and matcha with Node's built-in test and bench runners"
date: 2026-09-25
status: active
confidence: low
signals: ["dependency", "refactor", "config"]
areas: ["test", "dependencies", "ci"]
files: ["package.json", ".github/workflows/main.yml", "benchmark.js", "source/index.js", "test/chalk.js", "test/force-color.js", "test/instance.js", "test/level.js", "test/no-color-support.js", "test/visible.js"]
written_by: claude-fable-5-2
---

# 0028. Replace ava and matcha with Node's built-in test and bench runners

- **Date:** 2026-09-25
- **Status:** active
- **Confidence:** low. The commit message is only "Meta tweaks" with no PR or issue text, so the change is clear from the diff but the motive is not stated beyond two code comments on specific details.

## Context

Tests ran under ava and benchmarks under matcha, both listed as devDependencies, with benchmark.js relying on matcha's global `suite` and `bench`. Commit 7211001 removed both packages and rewrote the tests and the benchmark. The history does not say why the switch was made; the commit message is just "Meta tweaks".

## Decision

In 7211001 the test script became `c8 node --test 'test/[!_]*.js'`, with test files importing `test` from `node:test` and asserting through `node:assert/strict` instead of ava's `t` object. The bench script became `node --experimental-bench --bench benchmark.js`, with `suite` and `bench` imported from `node:bench` and wrapped in a local `benchmark` helper that runs 10,000 operations per case. The same commit also bumped several devDependencies (xo 5, ansi-styles 7, setup-node v7) and made small edits in source/index.js.

## Alternatives tried

- ava as the test runner and matcha as the benchmark runner were what was in place before and were removed in 7211001; the history does not record why.

## Consequences

- New tests should use `node:test` and `node:assert/strict` (for example `assert.equal`) rather than ava's `t.is` style, and the test glob `test/[!_]*.js` does not run files in test/ whose names start with an underscore.
- benchmark.js sets `chalk.level = 3` deliberately: a code comment explains that the bench runner pipes stdout, so chalk would otherwise disable colors and only the plain passthrough would be measured.
- The `benchmark` helper sums output lengths and throws on empty output, so every benchmark case must return the styled string it produces.
- The bench script depends on Node's `--experimental-bench` flag, so it is tied to a Node version that provides that flag.
- The `eslint-disable-next-line unicorn/prefer-ternary` in the builder in source/index.js is deliberate: its comment says a ternary would need nesting for the two- and three-argument cases, which `unicorn/no-nested-ternary` rejects.

## Evidence

- Commit [`7211001`](https://github.com/chalk/chalk/commit/72110019e147683f60e13fa0ff5c14a0c27cd9fe) (2026-09-25): Meta tweaks (Sindre Sorhus)
