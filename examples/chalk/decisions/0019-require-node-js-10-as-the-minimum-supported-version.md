---
id: "0019"
title: "Require Node.js 10 as the minimum supported version"
date: 2020-04-02
status: active
confidence: medium
signals: ["config", "refactor"]
areas: ["root", "source", "dependencies"]
files: ["package.json", ".travis.yml", "examples/screenshot.js", "index.d.ts", "index.test-d.ts", "source/index.js", "source/templates.js", "test/template-literal.js"]
written_by: claude-fable-5-2
---

# 0019. Require Node.js 10 as the minimum supported version

- **Date:** 2020-04-02
- **Status:** active
- **Confidence:** medium. The commit subject and the engines/CI changes state the decision clearly, but no PR, issue or message body explains why Node.js 8 was dropped.

## Context

Before 61999a4 the package declared `engines.node` as `>=8` and ran CI on Node.js 8, 10 and 12. The history does not say why Node.js 8 support was dropped; the commit message is only "Require Node.js 10". The same commit also upgraded the dev tooling (xo ^0.25.3 to ^0.28.2, execa ^3.2.0 to ^4.0.0).

## Decision

61999a4 raises `engines.node` in package.json to `>=10` and removes Node.js 8 from the .travis.yml matrix, leaving 10 and 12. Alongside this it adapts the code to the newer xo: variables are renamed (`ret` to `returnValue`, `errMsg` to `errMessage`, `str` to `string`), the `Instance` type in index.d.ts becomes a constructor type alias instead of an interface, and four lint rules are switched off in the xo config. It also rewrites the `level` option check in source/index.js so the validation only runs when `options.level` is truthy.

## Alternatives tried

None recorded in the history.

## Consequences

- Node.js 8 is no longer declared as supported or tested in CI, so code here may rely on Node.js 10 features and should not be expected to run on 8.
- The `// eslint-disable-next-line no-constructor-return` in `ChalkClass` in source/index.js is deliberate: the constructor returns the result of `chalkFactory(options)` and the lint rule is suppressed rather than the pattern changed.
- The xo rules `@typescript-eslint/member-ordering`, `no-redeclare`, `unicorn/string-content` and `unicorn/better-regex` are turned off in package.json; the history does not say why, so check what they flag before re-enabling them.
- The `level` validation now skips falsy values, so `0` and an omitted level pass without the integer check, while any truthy value outside the integers 0 to 3 still throws.

## Evidence

- Commit [`61999a4`](https://github.com/chalk/chalk/commit/61999a4e77f7d4ca0631f6c833b9ad5d76d925d5) (2020-04-02): Require Node.js 10 (Sindre Sorhus)
