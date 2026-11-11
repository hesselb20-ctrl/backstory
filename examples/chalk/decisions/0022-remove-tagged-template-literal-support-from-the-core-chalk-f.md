---
id: "0022"
title: "Remove tagged template literal support from the core chalk function"
date: 2021-11-10
status: active
confidence: medium
signals: ["refactor"]
areas: ["source", "docs", "test"]
files: ["readme.md", "source/index.d.ts", "source/index.js", "source/index.test-d.ts", "source/templates.js", "test/template-literal.js"]
written_by: claude-fable-5-2
---

# 0022. Remove tagged template literal support from the core chalk function

- **Date:** 2021-11-10
- **Status:** active
- **Confidence:** medium. The commit subject and diff make the removal and the pointer to chalk-template clear, but no commit body, PR text or comment in the evidence states the motivation.

## Context

Chalk could be called as a tagged template literal (chalk`{red text}`), parsing a brace-delimited style mini-language implemented in source/templates.js. Supporting this meant every builder call checked whether its first argument was a template strings array, and the factory returned a chalk.template function wrapped around the instance. The removed type documentation also noted that template literals were unsupported for nested calls (issue #341). The history does not say why the feature was removed.

## Decision

Commit c987c61 (#524) deletes source/templates.js, the chalkTag helper, the template-literal branch in createBuilder, the TemplateStringsArray call signature in index.d.ts, the readme section and the template-literal tests. The base chalk function is now a plain function that joins its arguments with spaces, and builders only stringify and style their arguments. The readme's Related section now points to the separate chalk-template package for tagged template literal support.

## Alternatives tried

None recorded in the history.

## Consequences

- Calling chalk or a styled builder as a tagged template (chalk`...` or chalk.red`...`) no longer parses the {style text} syntax; the arguments are simply stringified and joined.
- The ChalkFunction interface is gone from index.d.ts and ChalkInstance now carries only the (...text: unknown[]) => string call signature, so typings that relied on the template overload or on ChalkFunction will break.
- Users who need the brace-delimited template syntax are directed by the readme to the chalk-template package rather than to anything in this repository.
- createBuilder is now a single expression with the single-argument hot path, with no array check on the first argument; reintroducing template handling there would add a branch back onto that path.

## Evidence

- Commit [`c987c61`](https://github.com/chalk/chalk/commit/c987c614869ba286f0eb11c1966ee1d135c80599) (2021-11-10): Remove support for tagged template literals (#524) (Richie Bendall)
- PR [#524](https://github.com/chalk/chalk/pull/524): Remove support for tagged template literals
