---
id: "0014"
title: "Replace `chalk.constructor()` with `new chalk.Instance()` for creating isolated Chalk instances"
date: 2019-03-12
status: active
confidence: medium
signals: ["refactor"]
areas: ["test", "root", "docs"]
files: ["index.d.ts", "index.js", "index.js.flow", "index.test-d.ts", "readme.md", "test/_flow.js", "test/chalk.js", "test/constructor.js", "test/instance.js", "test/template-literal.js", "test/visible.js"]
written_by: claude-fable-5-2
---

# 0014. Replace `chalk.constructor()` with `new chalk.Instance()` for creating isolated Chalk instances

- **Date:** 2019-03-12
- **Status:** active
- **Confidence:** medium. The commit subject and diff clearly show the change and a removed code comment shows the workaround the old approach needed, but no PR or issue text stating the motivation is included in the evidence.

## Context

Before de2f4cd (#322), a separate Chalk instance with its own `level`/`enabled` options was created through `chalk.constructor(options)`. The `Chalk` function had to cope with being called both with and without `new`, and a removed comment notes it checked `this.template` because "calling `chalk.constructor()` by itself will have a `this` of a previously constructed chalk object". The history does not say why the API was renamed beyond what the commit subject states.

## Decision

de2f4cd introduces `chalk.Instance`, a class (`ChalkClass`) whose constructor returns the result of a new `chalkFactory(options)` function, and makes `Chalk(options)` delegate to the same factory. `chalk.constructor` is replaced on every instance with a function that throws "`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead." The TypeScript definitions, Flow definitions, readme and tests were updated to the new name, with the `Constructor` interface renamed to `Instance`.

## Alternatives tried

None recorded in the history.

## Consequences

- Although the commit calls it a deprecation, calling `chalk.constructor()` now throws an error rather than warning, so it is a breaking change for callers of the old API.
- All instance creation goes through `chalkFactory`; `ChalkClass` is only a thin wrapper whose constructor returns the factory's result, so the returned object is the `chalk.template` function with a manually set prototype chain rather than a real `ChalkClass` instance.
- The `this instanceof Chalk` / `this.template` branching in `Chalk` is gone, so new code should not rely on `Chalk` behaving differently depending on how it is invoked.
- Type definitions expose `Instance` instead of `constructor` (`index.d.ts`, `index.js.flow`), and tests for instance creation live in the new `test/instance.js`, with `test/constructor.js` reduced in the same commit.

## Evidence

- Commit [`de2f4cd`](https://github.com/chalk/chalk/commit/de2f4cd6063b40834096c7dc874562006bb1283c) (2019-03-12): Deprecate `chalk.constructor()` in favor of `new chalk.Instance()` (#322) (Tom Sherman)
- PR [#322](https://github.com/chalk/chalk/pull/322): Deprecate `chalk.constructor()` in favor of `new chalk.Instance()`
