---
id: "0025"
title: "Source style-name lists and types from the vendored ansi-styles and keep the old names as deprecated aliases"
date: 2022-10-12
status: active
confidence: medium
signals: ["comment"]
areas: ["source"]
files: ["source/index.d.ts", "source/index.js"]
written_by: claude-fable-5-2
---

# 0025. Source style-name lists and types from the vendored ansi-styles and keep the old names as deprecated aliases

- **Date:** 2022-10-12
- **Status:** active
- **Confidence:** medium. The diff and its TODO/@deprecated comments clearly show what changed and that the old names are slated for removal, but the commit message (#567) gives no rationale.

## Context

Before 6e0df05, chalk defined its own style-name types in source/index.d.ts (`BasicColor`, `BrightColor`, `ForegroundColor`, `BackgroundColor`, `Color`, `Modifiers`) and built the runtime arrays `modifiers`, `foregroundColors`, `backgroundColors` and `colors` in source/index.js with `Object.keys(ansiStyles.modifier)` and similar calls. The history does not say why this was changed; the commit subject only reads "Export styles from `ansi-styles` (#567)".

## Decision

6e0df05 makes the vendored ansi-styles (source/vendor/ansi-styles) the source of both the arrays and the types: chalk now re-exports `modifierNames`, `foregroundColorNames`, `backgroundColorNames`, `colorNames` and the types `ModifierName`, `ForegroundColorName`, `BackgroundColorName`, `ColorName` from it. The previous names are kept as aliases of the new ones, marked `@deprecated` in the type definitions and tagged with a TODO to remove them in the next major version. The readme was updated to document only the new `*Names` exports.

## Alternatives tried

- Hand-written type unions in source/index.d.ts and `Object.keys(ansiStyles.*)` arrays in source/index.js were the previous approach and were removed in 6e0df05.

## Consequences

- Adding or renaming a style means changing source/vendor/ansi-styles (both index.js and index.d.ts); chalk's own index files only re-export the lists and types.
- The duplicate exports `modifiers`, `foregroundColors`, `backgroundColors`, `colors` and types `Modifiers`, `ForegroundColor`, `BackgroundColor`, `Color` are deliberate backwards-compatibility aliases, not leftovers, and should not be removed outside a major release.
- The TODO comments are still present in the current code (source/index.d.ts:374, source/index.js:247), so the aliases remain pending removal in the next major version.
- The type definitions import from the relative path './vendor/ansi-styles/index.js' rather than '#ansi-styles'; a comment in source/index.d.ts says to switch once TypeScript supports that.

## Evidence

- Commit [`6e0df05`](https://github.com/chalk/chalk/commit/6e0df055f49b08158b570898cc816aad35f1a003) (2022-10-12): Export styles from `ansi-styles` (#567) (LitoMore)
- Comment [`source/index.d.ts:374`](https://github.com/chalk/chalk/blob/72110019e147683f60e13fa0ff5c14a0c27cd9fe/source/index.d.ts#L374): // TODO: Remove these aliases in the next major version
- Comment [`source/index.js:247`](https://github.com/chalk/chalk/blob/72110019e147683f60e13fa0ff5c14a0c27cd9fe/source/index.js#L247): // TODO: Remove these aliases in the next major version
- PR [#567](https://github.com/chalk/chalk/pull/567): Export styles from `ansi-styles`
