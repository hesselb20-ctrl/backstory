---
id: "0017"
title: "Replace per-call style arrays and close-code regexes with precomputed linked stylers and cached builders"
date: 2019-07-12
status: active
confidence: medium
signals: ["dependency", "message"]
areas: ["root", "dependencies", "examples"]
files: ["package.json", "benchmark.js", "examples/screenshot.js", "index.js", "lib/util.js", "test/chalk.js"]
written_by: claude-fable-5-2
---

# 0017. Replace per-call style arrays and close-code regexes with precomputed linked stylers and cached builders

- **Date:** 2019-07-12
- **Status:** active
- **Confidence:** medium. The commit subject of c08417e states performance as the goal and the diff shows the mechanism clearly, but no PR discussion or benchmark numbers are in the evidence and the patch is cut off before the new applyStyle body.

## Context

Before c08417e, each chained style getter built a new builder holding an array copy of all styles (`[...(this._styles || []), style]`), each style carried a `closeRe` regex built with escape-string-regexp, and `level`/`enabled` accessors were defined on every builder individually. The commit subject (#337) says the aim was to improve performance greatly; the evidence does not include measurements or further discussion.

## Decision

c08417e replaces the `_styles` array with a `_styler` object made by `createStyler(open, close, parent)`, which links to its parent and precomputes concatenated `openAll`/`closeAll` strings. Style getters now cache their builder on the instance via `Object.defineProperty(this, styleName, {value: builder})`, `level` and `enabled` move to the shared prototype and delegate to `this._generator`, and the builder coerces a single argument with `'' + arguments_[0]` as a commented hot path. The `closeRe` regexes and the escape-string-regexp dependency are removed, with `stringReplaceAll` and `stringEncaseCRLFWithFirstIndex` helpers added in lib/util.js.

## Alternatives tried

- The previous design, removed in c08417e, kept a per-builder array of style objects and replaced close codes using precompiled `closeRe` regexes built with escape-string-regexp.

## Consequences

- Builders carry `_generator`, `_styler` and `_isEmpty` rather than `_styles`; any code reading `_styles` no longer works.
- After first access a style getter is replaced on that object by a plain value property holding the cached builder, so the getter does not run again for that chain.
- The implicit string coercion in the builder (`'' + arguments_[0]`) and its eslint-disable are deliberate: the comment marks the single-argument case as the hot path.
- String handling for close codes and newlines now depends on the in-repo helpers in lib/util.js instead of regexes, and benchmark.js was expanded to cover cached, newline and nested cases for checking future changes.

## Evidence

- Commit [`c08417e`](https://github.com/chalk/chalk/commit/c08417e88ca41f7133eb1a00e0b3fc8aefbb6cc9) (2019-07-12): Improve performance greatly (#337) (Yanis Benson)
- PR [#337](https://github.com/chalk/chalk/pull/337): Improve performance greatly
