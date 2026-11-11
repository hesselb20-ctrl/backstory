---
id: "0002"
title: "Use supports-color instead of has-color for terminal color detection"
date: 2014-06-14
status: active
confidence: low
signals: ["dependency"]
areas: ["dependencies"]
files: ["package.json"]
written_by: claude-fable-5-2
---

# 0002. Use supports-color instead of has-color for terminal color detection

- **Date:** 2014-06-14
- **Status:** active
- **Confidence:** low. The commit message is only "has-color => supports-color" and the diff shows a one-for-one dependency swap with no stated reasoning.

## Context

chalk exposed terminal color detection as `chalk.supportsColor`, backed by the `has-color` package at ^0.1.0. In 144421d that dependency was replaced by `supports-color` at ^0.2.0, and the readme link was updated from sindresorhus/has-color to sindresorhus/supports-color. The history does not say why the swap was made.

## Decision

Replace the `has-color` dependency with `supports-color` and assign its export to `chalk.supportsColor`. The change in 144421d is limited to the require in index.js, the dependency entry in package.json and the readme link; the public property name `chalk.supportsColor` is unchanged.

## Alternatives tried

None recorded in the history.

## Consequences

- Color detection lives in the external `supports-color` package, so changes to detection behaviour belong there rather than in chalk's index.js.
- `chalk.supportsColor` is a direct re-export of the `supports-color` module, so whatever that package exports is part of chalk's public API.
- The readme documents that users can override detection with the `--color` and `--no-color` flags, and that text was kept unchanged across the swap.
- `has-color` is no longer a dependency and should not be reintroduced alongside `supports-color`.

## Evidence

- Commit [`144421d`](https://github.com/chalk/chalk/commit/144421dc16c4e323fa6d1d074ede9abf75323b5d) (2014-06-14): has-color => supports-color (Sindre Sorhus)
