---
id: "0004"
title: "Adopt XO as the linter and run it before the tests"
date: 2015-08-20
status: active
confidence: medium
signals: ["dependency", "config"]
areas: ["dependencies", "config"]
files: ["package.json", ".editorconfig"]
written_by: claude-fable-5-2
---

# 0004. Adopt XO as the linter and run it before the tests

- **Date:** 2015-08-20
- **Status:** active
- **Confidence:** medium. The diff clearly shows JSHint config being replaced by XO wired into the test script, but the commit message only says "add XO" with a link and gives no reasoning.

## Context

Before 409f95e the project carried a .jshintrc with a set of JSHint rules, and `npm test` ran only mocha. The code also already contained an inline ESLint directive in index.js for the deliberate `__proto__` assignment. The history does not say why XO was chosen; the commit message is just "add XO" and a link to the XO repository.

## Decision

Commit 409f95e adds xo as a devDependency, deletes .jshintrc, and changes the test script to `xo && mocha` so linting runs first and gates the tests. XO is configured in package.json under an `xo` key with the `node` and `mocha` environments. Existing files were adjusted to pass: benchmark.js gained `'use strict'` and a `/* globals set bench */` declaration, the index.js directive became `/* eslint-disable no-proto */`, and a stray blank line in test.js was removed.

## Alternatives tried

- JSHint with a project-specific .jshintrc was the previous setup and was removed in 409f95e.

## Consequences

- `npm test` now fails on lint errors before mocha runs, so style violations block the test suite.
- Lint configuration lives in the `xo` key of package.json rather than in a standalone rc file; there is no .jshintrc to edit.
- xo is pinned to `*`, so a new XO release can introduce new rule failures without any change in this repository.
- The `/* eslint-disable no-proto */` in index.js and `/* globals set bench */` in benchmark.js are deliberate lint accommodations and should not be removed as noise.

## Evidence

- Commit [`409f95e`](https://github.com/chalk/chalk/commit/409f95eef525bcee56d1baafcee0b8f18cb72349) (2015-08-20): add XO (Sindre Sorhus)
