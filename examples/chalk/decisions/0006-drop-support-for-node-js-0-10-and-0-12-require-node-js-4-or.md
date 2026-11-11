---
id: "0006"
title: "Drop support for Node.js 0.10 and 0.12; require Node.js 4 or later"
date: 2017-05-21
status: active
confidence: medium
signals: ["dependency", "config"]
areas: ["config", "dependencies", "ci"]
files: ["package.json", ".editorconfig", ".gitattributes", ".travis.yml"]
written_by: claude-fable-5-2
---

# 0006. Drop support for Node.js 0.10 and 0.12; require Node.js 4 or later

- **Date:** 2017-05-21
- **Status:** active
- **Confidence:** medium. The commit subject and diff clearly show the support floor being raised, but no PR, issue or message body explains why it was done at this point.

## Context

Before 9b60021 the package declared `engines.node` as `>=0.10.0` and ran CI on Node.js 0.10, 0.12, 4 and 6. The commit subject says only "Drop support for Node.js 0.10 and 0.12"; the history does not say why the cut was made or why at this time.

## Decision

In 9b60021 the `engines` field was raised to `node >=4` and the 0.10 and 0.12 entries were removed from `.travis.yml`. The same commit updated dev dependencies: `require-uncached` was replaced by `import-fresh` in the tests, `nyc` moved from ^6.1.1 to ^10.3.2 and `resolve-from` from ^2.0.0 to ^3.0.0. It also added `*.js text eol=lf` to `.gitattributes`, removed the `package.json` override from `.editorconfig`, and changed `require('./')` to `require('.')` in the test and example files.

## Alternatives tried

None recorded in the history.

## Consequences

- Node.js 4 is the minimum supported runtime; `package.json` declares `engines.node` as `>=4` and CI no longer exercises 0.10 or 0.12, so nothing verifies behaviour on those versions.
- Tests that need a fresh copy of the module after changing `process.env.TERM` now use `importFresh('.')` rather than `requireUncached('./')`; new tests of environment-dependent behaviour should follow the same pattern.
- `.gitattributes` forces LF line endings for `*.js` files, so checkouts on Windows will not convert them to CRLF.
- `package.json` no longer has a two-space indentation override in `.editorconfig` and falls under the repository's general indent setting; the history does not say why this was bundled into the commit.

## Evidence

- Commit [`9b60021`](https://github.com/chalk/chalk/commit/9b60021fa605a6ebf62fbfd42d02c45597b10e6e) (2017-05-21): Drop support for Node.js 0.10 and 0.12 (Sindre Sorhus)
