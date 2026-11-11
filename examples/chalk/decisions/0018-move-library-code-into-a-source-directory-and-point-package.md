---
id: "0018"
title: "Move library code into a source/ directory and point package.json main at it"
date: 2019-07-12
status: active
confidence: low
signals: ["dependency", "config", "refactor"]
areas: ["test", "source", "dependencies"]
files: ["package.json", "tsconfig.json", "index.d.ts", "readme.md", "source/index.js", "source/templates.js", "source/util.js", "test/_fixture.js", "test/chalk.js", "test/constructor.js", "test/enabled.js", "test/instance.js", "test/level.js", "test/no-color-support.js", "test/template-literal.js", "test/visible.js"]
written_by: claude-fable-5-2
---

# 0018. Move library code into a source/ directory and point package.json main at it

- **Date:** 2019-07-12
- **Status:** active
- **Confidence:** low. The commit message is only "Meta tweaks" and there is no PR, issue or comment, so the record is read from the shape of the diff alone.

## Context

Before 655653b the library's files were split between the repository root (index.js, templates.js) and lib/ (util.js), and package.json had no main field, so the package resolved to the root index.js by default. The repository also carried a tsconfig.json extending @sindresorhus/tsconfig with noEmit and allowJs. The history does not say why this layout was changed; the commit is labelled only "Meta tweaks".

## Decision

655653b renames index.js, templates.js and lib/util.js into a single source/ directory, sets "main": "source" in package.json and replaces the individual file entries in "files" with the source directory. All tests now require '../source' instead of '..', and internal requires become './templates' and './util'. The same commit deletes tsconfig.json and drops the @sindresorhus/tsconfig devDependency, without stating a reason.

## Alternatives tried

None recorded in the history.

## Consequences

- The package entry point is source/index.js via the main field, so new runtime modules must live under source/ to be published, since "files" lists only source and index.d.ts.
- index.d.ts stays at the repository root rather than alongside the implementation, and is published separately through the "files" list.
- Tests import '../source' directly rather than resolving through package.json, so moving the entry point again means updating every test file.
- There is no tsconfig.json in the repository after this commit, so anything that type-checks the JS or the type definitions cannot rely on a project-level TypeScript config.

## Evidence

- Commit [`655653b`](https://github.com/chalk/chalk/commit/655653bb0c88fb05f839d5027f79751449771ec4) (2019-07-12): Meta tweaks (Sindre Sorhus)
