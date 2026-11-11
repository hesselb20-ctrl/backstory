---
id: "0027"
title: "Require Node.js 22 and replace tsd type tests with a plain tsc check"
date: 2026-07-25
status: active
confidence: medium
signals: ["dependency", "config", "refactor"]
areas: ["test", "source", "examples"]
files: ["package.json", ".github/workflows/main.yml", "examples/rainbow.js", "examples/screenshot.js", "source/index.js", "source/index.test-d.ts", "source/utilities.js", "test/chalk.js", "test/instance.js", "test/no-color-support.js", "test/visible.js"]
written_by: claude-fable-5-2
---

# 0027. Require Node.js 22 and replace tsd type tests with a plain tsc check

- **Date:** 2026-07-25
- **Status:** active
- **Confidence:** medium. The commit subject states the Node.js 22 requirement and the diff shows each change clearly, but no message, PR or comment explains the reasons.

## Context

Before 8a94e0e the package declared support for Node.js `^12.17.0 || ^14.13 || >=16.0.0`, CI tested on Node 14 and 26, and type definitions were verified with tsd against `source/index.test-d.ts`. The package exposed its entry point through `main`, a string `exports` and a top-level `types` field. The history does not say why the Node.js floor was raised or why tsd was dropped.

## Decision

Commit 8a94e0e raises `engines.node` to `>=22` and changes the CI matrix to Node 22 and 26. It removes `main` and the top-level `types` field in favour of a conditional `exports` map with `types` and `default` entries. The tsd dev dependency and the 179-line `source/index.test-d.ts` are deleted, and the test script now runs `tsc --noEmit --types node source/index.d.ts` using a new `typescript` dev dependency. The same commit upgrades the dev toolchain (xo 4, ava 8, c8 12, execa 10 and others), converts the xo config to an array, and adjusts source and examples to the new lint rules.

## Alternatives tried

- tsd with expectation-style type tests in `source/index.test-d.ts` was the previous approach and was removed in 8a94e0e; the history does not say why.

## Consequences

- Node.js versions below 22 are no longer supported or tested, so code may use syntax that requires it, such as the regex `v` flag now used in the examples.
- Type checking now only confirms that `source/index.d.ts` compiles; the removed `expectType`/`expectError`/`expectDeprecated` assertions about the public types have no replacement visible in the evidence.
- The package entry point is resolved only through the `exports` map, since `main` and top-level `types` are gone; tooling that ignores `exports` will not find the entry or its types.
- The `eslint-disable-next-line` comments in `source/index.js` for `unicorn/no-top-level-side-effects` and `unicorn/no-computed-property-existence-check` are deliberate: prototype setup and style getter installation must run at module load, and the `IS_EMPTY` read is a boolean value read.

## Evidence

- Commit [`8a94e0e`](https://github.com/chalk/chalk/commit/8a94e0ebfc495dda27f7090fb1a012790b15a76d) (2026-07-25): Require Node.js 22 (Sindre Sorhus)
