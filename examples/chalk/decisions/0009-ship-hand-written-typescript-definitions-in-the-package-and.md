---
id: "0009"
title: "Ship hand-written TypeScript definitions in the package and type-check them in the test script"
date: 2017-10-17
status: active
confidence: medium
signals: ["dependency", "config"]
areas: ["dependencies", "types"]
files: ["package.json", "types/tsconfig.json"]
written_by: claude-fable-5-2
---

# 0009. Ship hand-written TypeScript definitions in the package and type-check them in the test script

- **Date:** 2017-10-17
- **Status:** active
- **Confidence:** medium. The commit subject and an inline comment ("For TypeScript") state what was added and why the default export exists, but no PR discussion or message body explains the motivation for bundling types in the package.

## Context

Before f653b06 (#207) the package was plain JavaScript with no type information: package.json had no "types" field and the test script ran only xo and ava. The history does not say why the definitions were added to this repository rather than maintained elsewhere; the commit subject says only "Add TypeScript definitions".

## Decision

f653b06 adds a hand-written types/index.d.ts (credited in its header to Thomas Sauer), points the package.json "types" field at it and adds it to the published "files" list. It adds typescript as a devDependency and changes the test script to "xo && tsc --project types && nyc ava", so types/test.ts is compiled against the definitions (noEmit, noImplicitAny) on every test run. index.js also gains "module.exports.default = module.exports", commented "For TypeScript", so that the default import used in types/test.ts resolves at runtime.

## Alternatives tried

None recorded in the history.

## Consequences

- The definitions are maintained by hand and list every style, colour and colour-model method explicitly, so any addition or rename in the public API in index.js must be mirrored in types/index.d.ts.
- A TypeScript compile error in types/test.ts or types/index.d.ts now fails "npm test", because tsc runs between xo and ava.
- The line "module.exports.default = module.exports" in index.js looks redundant but is deliberate (commented "For TypeScript"); removing it would break consumers using "import chalk from 'chalk'", which is how types/test.ts imports it.
- Only types/index.d.ts is published; types/test.ts and types/tsconfig.json are not in the "files" list and exist solely for the repository's own type check.

## Evidence

- Commit [`f653b06`](https://github.com/chalk/chalk/commit/f653b061d6fbdb1c7224f7d80476391202c47877) (2017-10-17): Add TypeScript definitions (#207) (calebboyd)
- PR [#207](https://github.com/chalk/chalk/pull/207): Add TypeScript definitions
