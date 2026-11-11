---
id: "0020"
title: "Require Node.js 12 and publish the package as ESM only"
date: 2021-04-16
status: active
confidence: medium
signals: ["dependency", "config", "refactor"]
areas: ["test", "root", "source"]
files: ["package.json", ".github/workflows/main.yml", ".github/funding.yml", "benchmark.js", "examples/rainbow.js", "examples/screenshot.js", "index.d.ts", "index.test-d.ts", "license", "readme.md", "source/index.js", "source/templates.js", "source/util.js", "test/_fixture.js", "test/_supports-color.js", "test/chalk.js", "test/constructor.js", "test/instance.js", "test/level.js", "test/no-color-support.js"]
written_by: claude-fable-5-2
---

# 0020. Require Node.js 12 and publish the package as ESM only

- **Date:** 2021-04-16
- **Status:** active
- **Confidence:** medium. The commit subject and package.json signals state clearly what changed, but no PR, issue or message body in the evidence explains why.

## Context

Before fa16f4e the package was CommonJS: package.json had `main: source`, engines `node >=10`, source and tests used `'use strict'` with `require`, and the type definitions used a `declare namespace chalk` consumed via `import chalk = require('chalk')`. CI ran on Node 10, 12 and 14. The history does not say why the move to ESM was made at this point.

## Decision

fa16f4e converts the whole package to native ES modules and raises the minimum Node.js version to 12. package.json gains `type: module` and `exports: ./source/index.js`, drops `main`, and removes the import-fresh and resolve-from dependencies; Node 10 is dropped from the CI matrix. Source, tests, examples and benchmark switch to `import` with explicit `.js` paths, and index.d.ts is rewritten from a `chalk` namespace to top-level exported types (`Options`, `ChalkInstance`, `ColorSupport`, `ColorSupportLevel`, `Chalk`).

## Alternatives tried

None recorded in the history.

## Consequences

- The package can no longer be loaded with `require('chalk')`; with `type: module` and no `main`, consumers must use `import`.
- The `exports` field exposes only `./source/index.js`, so deep imports into other files of the package are not part of the public contract.
- Type names changed shape: what was `chalk.Level`, `chalk.Options` and `chalk.Instance` in the namespace are now the top-level exports `ColorSupportLevel`, `Options` and `ChalkInstance`, so TypeScript consumers of the old names break.
- import-fresh and resolve-from were removed along with test/_supports-color.js, so tests can no longer rely on re-requiring a fresh module copy or CommonJS resolution tricks; test/no-color-support.js was rewritten in the same commit.

## Evidence

- Commit [`fa16f4e`](https://github.com/chalk/chalk/commit/fa16f4ec37c1c25bda6ca1864bf53ecd3ea3d3c9) (2021-04-16): Require Node.js 12 and move to ESM (Sindre Sorhus)
