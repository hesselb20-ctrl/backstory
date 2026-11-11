---
id: "0015"
title: "Require Node.js 8 as the minimum supported runtime"
date: 2019-03-12
status: active
confidence: medium
signals: ["config", "refactor"]
areas: ["root", "dependencies", "ci"]
files: ["package.json", ".travis.yml", "examples/rainbow.js", "index.d.ts", "index.js", "templates.js"]
written_by: claude-fable-5-2
---

# 0015. Require Node.js 8 as the minimum supported runtime

- **Date:** 2019-03-12
- **Status:** active
- **Confidence:** medium. The commit subject and diff clearly show the Node.js floor moving from 6 to 8, but no PR, issue or message body explains why it was raised at this point.

## Context

Before 3ef170b the package declared `engines.node` as `>=6` and ran CI on Node.js 6, 8 and 10. The code carried at least one workaround for that floor: templates.js had a comment `TODO: Use Object.entries when targeting Node.js 8` above a loop over `Object.keys`. The history does not say why the floor was raised at this time.

## Decision

3ef170b changes `engines.node` to `>=8`, removes Node.js 6 from the .travis.yml matrix, and starts using Node 8 features: `Object.entries` with destructuring in index.js and templates.js, and an async IIFE in examples/rainbow.js. The same commit bumps supports-color to ^6.1.0, updates dev dependencies (xo ^0.24.0, ava ^1.3.1, nyc, flow-bin, coveralls, @sindresorhus/tsconfig), and renames identifiers such as `args` to `arguments_` and `str` to `string`.

## Alternatives tried

None recorded in the history.

## Consequences

- Node.js 6 is no longer declared as supported or tested in CI, so code in this package may use Node 8 features such as `Object.entries` and async/await.
- The style-definition loop in index.js now iterates `Object.entries(ansiStyles)` and closes over the `style` object directly instead of re-reading `ansiStyles[key]` inside the getter.
- The `Object.entries` TODO in templates.js is resolved and an `eslint-disable-line prefer-destructuring` comment there was removed, so neither workaround should be reintroduced.
- The verbose names (`arguments_`, `string`, `characters`) arrived together with the xo ^0.24.0 bump; the history does not say whether the linter required them, but new code should follow the same naming to stay consistent.

## Evidence

- Commit [`3ef170b`](https://github.com/chalk/chalk/commit/3ef170b457dd9a318f74080dbaeb935c86ed026b) (2019-03-12): Require Node.js 8 (Sindre Sorhus)
