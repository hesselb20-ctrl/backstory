---
id: "0008"
title: "Replace mocha with ava and split the test suite into per-topic files"
date: 2017-07-23
status: active
confidence: medium
signals: ["dependency", "refactor"]
areas: ["test", "dependencies", "root"]
files: ["package.json", "test.js", "test/_fixture.js", "test/_supports-color.js", "test/chalk.js", "test/constructor.js", "test/enabled.js", "test/level.js", "test/template-literal.js", "test/windows.js"]
written_by: claude-fable-5-2
---

# 0008. Replace mocha with ava and split the test suite into per-topic files

- **Date:** 2017-07-23
- **Status:** active
- **Confidence:** medium. The commit subject and diff clearly show the runner swap and file split, but neither the message nor the visible patch states why ava was chosen over mocha.

## Context

Before 4c4eb1f (#182) all tests lived in a single 353-line test.js run by mocha via `xo && nyc mocha`. That file spoofed `supports-color` in the require cache at the top, and its Windows section mutated `process.env` and `process.platform` in before/after hooks and cleared `ansi-styles` from the require cache before each fresh import of chalk. The history does not say why the move to ava was made.

## Decision

4c4eb1f swaps the mocha devDependency for ava, changes the test script to `xo && nyc ava`, and deletes test.js. The tests are redistributed into test/chalk.js, test/constructor.js, test/enabled.js, test/level.js, test/template-literal.js and test/windows.js, with a new test/_supports-color.js helper and the existing test/_fixture.js alongside them.

## Alternatives tried

None recorded in the history.

## Consequences

- Tests now live under test/ split by topic, so new tests belong in the matching file rather than a root-level test.js.
- Underscore-prefixed files in test/ (_supports-color.js, _fixture.js) are helpers rather than test files; the 13-line _supports-color.js was added in the same commit that removed the inline `supports-color` require-cache spoof from test.js, though its contents are not visible in the excerpt.
- The Windows tests in the old suite depended on overriding `process.platform` and `process.env` and on deleting `ansi-styles` from the require cache because chalk modifies `ansiStyles.blue.open`; the evidence does not show how test/windows.js handles this, so check it before changing those tests.
- ava is declared with the version range `*`, as mocha was, so the installed test runner version is not pinned by package.json.

## Evidence

- Commit [`4c4eb1f`](https://github.com/chalk/chalk/commit/4c4eb1fd0aa9efea2b469f130ed01d6891670ac4) (2017-07-23): Move testing to `ava` (#182) (Kevin Mårtensson)
- PR [#182](https://github.com/chalk/chalk/pull/182): Move testing to `ava`
