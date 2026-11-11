---
id: "0007"
title: "Convert the codebase to ES2015 syntax"
date: 2017-06-20
status: active
confidence: medium
signals: ["dependency", "refactor", "config"]
areas: ["root", "docs", "dependencies"]
files: ["package.json", ".travis.yml", "benchmark.js", "index.js", "license", "readme.md", "test.js"]
written_by: claude-fable-5-2
---

# 0007. Convert the codebase to ES2015 syntax

- **Date:** 2017-06-20
- **Status:** active
- **Confidence:** medium. The commit subject and diff make the change clear, but no commit body, PR, issue or comment states why it was made.

## Context

Before 249b9ac the library, its tests and its benchmark were written in ES5 style: `var`, `function` expressions, and `Object.keys(...).forEach` callbacks. CI ran on Node 6 and 4. The history does not say why the conversion was done at this point; the only stated intent is the subject line, "ES2015ify the codebase".

## Decision

249b9ac rewrote index.js, test.js and benchmark.js to ES2015 syntax: `const`/`let`, arrow functions, `for...of` loops, shorthand methods and shorthand properties. The same commit added Node 8 to the Travis matrix alongside 6 and 4, removed `semver` from package.json, and reworked package.json, license and readme. A few small non-syntactic changes rode along in index.js: `styles` became `Object.create(null)`, the prototype function became an anonymous arrow function, and the Windows terminal check switched from a regex to `process.env.TERM.toLowerCase().startsWith('xterm')`.

## Alternatives tried

None recorded in the history.

## Consequences

- The source now needs an ES2015-capable runtime with no transpile step visible in the evidence; Node 4 is the oldest version CI covers, so newer syntax should be checked against it.
- Some ES5-style constructs were kept on purpose: `build` and the model getters still use `function` and `arguments`, the comment against slicing `arguments` for V8 optimisation remains, and `builder.__proto__ = proto` stays with an inline eslint disable because a function with a different prototype cannot be created otherwise.
- The Windows terminal check now calls `.toLowerCase()` directly on `process.env.TERM`, whereas the earlier regex test did not call a method on that value; take care when touching it if `TERM` may be unset.
- `semver` is no longer a dependency; the visible patch excerpt does not show what it was used for or why it was removed.

## Evidence

- Commit [`249b9ac`](https://github.com/chalk/chalk/commit/249b9ac7e75077de5fc9d8063df35918745e8471) (2017-06-20): ES2015ify the codebase (Sindre Sorhus)
