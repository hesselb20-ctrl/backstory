---
id: "0012"
title: "Extend the shared @sindresorhus/tsconfig preset instead of declaring compiler options locally"
date: 2018-12-26
status: active
confidence: low
signals: ["dependency", "config"]
areas: ["dependencies", "ci", "config"]
files: ["package.json", ".travis.yml", "tsconfig.json"]
written_by: claude-fable-5-2
---

# 0012. Extend the shared @sindresorhus/tsconfig preset instead of declaring compiler options locally

- **Date:** 2018-12-26
- **Status:** active
- **Confidence:** low. The commit message says only "Update dependencies and meta tweaks", so the decision is read from the shape of the diff and no reasoning is stated.

## Context

Before 4726b1b, tsconfig.json set its own `module: commonjs`, `target: es6` and `noImplicitAny: true`, and `typescript` ^2.5.3 was a direct devDependency. Flow warnings were made fatal by passing `--max-warnings=0` in the test script. The change arrived inside a general dependency-update commit, and the history does not say why it was made.

## Decision

In 4726b1b, tsconfig.json was changed to extend `@sindresorhus/tsconfig` (added as a devDependency at ^0.1.1), and the local `module`, `target` and `noImplicitAny` settings were deleted, leaving `noEmit` and `allowJs` as local options. The direct `typescript` devDependency was removed in the same commit. The Flow setup was also adjusted: `include_warnings=true` was added to .flowconfig and `--max-warnings=0` was dropped from the test script.

## Alternatives tried

- Declaring `module`, `target` and `noImplicitAny` directly in tsconfig.json was the previous approach and was removed in 4726b1b.

## Consequences

- Compiler settings such as module format, target and strictness now come from `@sindresorhus/tsconfig`, so upgrading that package can change type-checking behaviour without any edit to this repository's tsconfig.json.
- Only overrides belong in the local tsconfig.json; the absence of `module`, `target` and `noImplicitAny` there is deliberate, not an omission.
- `typescript` is no longer a direct devDependency and the evidence does not show what provides the compiler for `tsd-check`, so check this before relying on a particular TypeScript version.
- Flow warnings are now included through .flowconfig (`include_warnings=true`) and the test script runs plain `flow` without `--max-warnings=0`; the evidence does not show whether warnings still fail the test run.

## Evidence

- Commit [`4726b1b`](https://github.com/chalk/chalk/commit/4726b1bfda3046ed02387ed587c8e9e8be1728b5) (2018-12-26): Update dependencies and meta tweaks (Sindre Sorhus)
