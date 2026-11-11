---
id: "0011"
title: "Require Node.js 6 and adopt rest/spread syntax in place of arguments handling"
date: 2018-09-18
status: active
confidence: medium
signals: ["config", "refactor"]
areas: ["test", "root", "dependencies"]
files: ["package.json", ".gitattributes", ".travis.yml", "benchmark.js", "index.js", "templates.js", "test/chalk.js", "test/constructor.js", "test/enabled.js", "test/level.js", "test/template-literal.js", "test/visible.js", "test/windows.js"]
written_by: claude-fable-5-2
---

# 0011. Require Node.js 6 and adopt rest/spread syntax in place of arguments handling

- **Date:** 2018-09-18
- **Status:** active
- **Confidence:** medium. The commit subject and diff clearly show the minimum Node.js version being raised and the code modernised, but no PR, issue or message body explains why Node.js 4 was dropped.

## Context

Before 0307f26 the package declared `engines.node` as `>=4` and Travis tested Node.js 4 alongside 6 and 8. The source was written around that floor, using `arguments`, `[].slice.call(arguments)` and `.apply(null, arguments)` for variadic functions in index.js and templates.js. The history does not say why Node.js 4 support was dropped at this point.

## Decision

0307f26 raises `engines.node` to `>=6`, removes Node.js 4 from the Travis matrix, and rewrites the variadic code paths to use rest parameters, spread calls and destructuring (`chalk.template`, the colour model getters, `build`, `applyStyle`, `chalkTag`, and `buildStyle` in templates.js). The same commit bumps supports-color to ^5.5.0, updates dev dependencies (xo, nyc, execa, flow-bin, typescript), switches ava and xo from pinned versions to caret ranges, removes the `node`/`mocha` envs from the xo config, and renames the test import from `m` to `chalk`.

## Alternatives tried

None recorded in the history.

## Consequences

- Node.js 4 is no longer supported or tested in CI; the code now relies on rest/spread and destructuring syntax, so anything added must only assume Node.js 6 or later.
- `chalkTag(chalk, ...strings)` now collects everything after `chalk` into one array and treats `strings[0]` as the template strings array, so the tagged-template versus plain-call distinction depends on `Array.isArray(strings[0])`.
- `build` creates `builder` as an arrow function that calls `applyStyle.call(builder, ...args)`, so `applyStyle` still depends on `this` being the builder even though the builder itself has no own `this`.
- `.gitattributes` now forces LF line endings for all text files (`* text=auto eol=lf`) rather than only for `*.js`.

## Evidence

- Commit [`0307f26`](https://github.com/chalk/chalk/commit/0307f263cb29dace28e7cf0648b13a3f527697af) (2018-09-18): Require Node.js 6 (Sindre Sorhus)
