---
id: "0010"
title: "Revert the lint fix that replaced \\x escapes with \\u escapes in the template tests"
date: 2018-02-14
status: reverted
confidence: low
signals: ["revert"]
areas: ["root", "test"]
files: ["templates.js", "test/template-literal.js"]
written_by: claude-fable-5-2
---

# 0010. Revert the lint fix that replaced \x escapes with \u escapes in the template tests

- **Date:** 2018-02-14
- **Status:** reverted
- **Confidence:** low. Neither commit message gives a reason, so the record rests only on what the two diffs show.

## Context

12d1276 ("Fix linting") added a file-level `/* eslint-disable unicorn/no-unsafe-regex */` to templates.js and rewrote three assertions in test/template-literal.js so that `\x78`, `\x6B` and `\x07` became `\u0078`, `\u006B` and `\u0007`. The rewritten tests include 'correctly parses unicode/hex escapes' and 'should not parse upper-case escapes'. TEMPLATE_REGEX in templates.js has a separate `x[a-f\d]{2}` branch for hex escapes alongside the `u[a-f\d]{4}` branch.

## Decision

5282300 reverts 12d1276 in full: it removes the eslint-disable comment from templates.js and restores the `\x` escapes in the three test assertions. The history does not say why; the commit body only names the commit it reverts. The diff does show that the lint fix left the tests with no `\x` input in the touched lines, and made the second `keyword('blac\u006B')` assertion an exact duplicate of the line after it.

## Alternatives tried

- Silencing unicorn/no-unsafe-regex for the whole of templates.js with a file-level eslint-disable comment was tried in 12d1276 and removed by 5282300.
- Replacing `\x` hex escapes with `\u` unicode escapes in the template tests was tried in 12d1276 and removed by 5282300.

## Consequences

- The `\x` escapes in test/template-literal.js are the only inputs in these assertions that exercise the `x[a-f\d]{2}` branch of TEMPLATE_REGEX, so do not normalise them to `\u` to satisfy a linter.
- The paired `keyword('blac\x6B')` and `keyword('blac\u006B')` assertions look redundant but cover the hex and unicode forms separately.
- templates.js carries no eslint-disable for unicorn/no-unsafe-regex after the revert, so whatever lint failure 12d1276 was addressing is not fixed by these commits.
- The recorded dates put the revert (2018-02-14) a day before the commit it reverts (2018-02-15), so do not rely on date order when reading this part of the history.

## Evidence

- Commit [`5282300`](https://github.com/chalk/chalk/commit/52823001a59ea2270c186cb41c36b0e3e0a6da37) (2018-02-14): Revert "Fix linting" (Josh Junon)
- Commit [`12d1276`](https://github.com/chalk/chalk/commit/12d1276b36cc026ecea1bdfe1771198b242f7b1d) (2018-02-15): Fix linting (Sindre Sorhus)
