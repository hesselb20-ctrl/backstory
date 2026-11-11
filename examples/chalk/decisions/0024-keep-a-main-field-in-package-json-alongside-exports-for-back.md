---
id: "0024"
title: "Keep a `main` field in package.json alongside `exports` for backwards compatibility"
date: 2022-03-09
status: active
confidence: medium
signals: ["config", "message"]
areas: ["dependencies"]
files: ["package.json"]
written_by: claude-fable-5-2
---

# 0024. Keep a `main` field in package.json alongside `exports` for backwards compatibility

- **Date:** 2022-03-09
- **Status:** active
- **Confidence:** medium. The commit message states the reason as backwards compatibility and references #536, but the issue text is not in the evidence, so what exactly broke is not shown.

## Context

The package is ESM (`"type": "module"`) and declared its entry point only through `"exports": "./source/index.js"`, with no `main` field. Commit 85f7e96 says a `main` field was needed for backwards compatibility and marks this as fixing #536. The evidence does not include the text of #536, so the history here does not say which tools or environments failed without `main`.

## Decision

Add `"main": "./source/index.js"` to package.json, pointing at the same file as `exports` (85f7e96). The `exports` field is kept unchanged, so both fields now declare the same entry point.

## Alternatives tried

None recorded in the history.

## Consequences

- The `main` field looks redundant next to `exports` but is deliberate; removing it would reintroduce whatever was reported in #536.
- `main` and `exports` must be kept pointing at the same file if the entry point is ever moved or renamed.
- The package remains `"type": "module"`, so `main` resolves to an ESM file; this change does not add a CommonJS entry point.

## Evidence

- Commit [`85f7e96`](https://github.com/chalk/chalk/commit/85f7e96f758e95dee5211b9bca1a173b8fb3abe9) (2022-03-09): Add `main` field to package.json for backwards compatibiltiy (Sindre Sorhus)
