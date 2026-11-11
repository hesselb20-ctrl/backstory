---
id: "0003"
title: "Add test coverage reporting with nyc and Coveralls"
date: 2015-05-25
status: active
confidence: medium
signals: ["dependency", "config"]
areas: ["dependencies", "ci"]
files: ["package.json", ".travis.yml"]
written_by: claude-fable-5-2
---

# 0003. Add test coverage reporting with nyc and Coveralls

- **Date:** 2015-05-25
- **Status:** active
- **Confidence:** medium. The commit subject and diff in b630e70 clearly show what was added, but no PR, issue or comment explains why these tools were chosen or why coverage was wanted.

## Context

Before b630e70 the project ran its tests with mocha on Travis CI and had no coverage measurement; the only scripts were `test` and `bench`. The history does not say what prompted adding coverage or why nyc and Coveralls were chosen.

## Decision

b630e70 adds nyc and coveralls as devDependencies and two npm scripts: `coverage` (runs `nyc npm test` then `nyc report` locally) and `coveralls` (runs the tests under nyc and pipes a text-lcov report to the coveralls CLI). Travis is configured to run `npm run coveralls` in `after_success`, and a Coveralls coverage badge is added to the readme. The `coverage` and `nyc_output` directories are added to .gitignore.

## Alternatives tried

None recorded in the history.

## Consequences

- The `test` script stays plain `mocha`; coverage is only collected through `npm run coverage` or `npm run coveralls`.
- Because `npm run coveralls` runs `nyc npm test` in `after_success`, the test suite is executed a second time on every successful Travis build, once for each Node version in the matrix.
- Coverage upload depends on the external Coveralls service and on the Travis `after_success` hook, so it only happens for builds whose tests passed.
- The badge URL added to the readme has an empty `branch=` parameter, so it does not pin a specific branch.

## Evidence

- Commit [`b630e70`](https://github.com/chalk/chalk/commit/b630e70855e2bfc34b7437bfd7a935c0751f943c) (2015-05-25): add coverage reporting using nyc and coveralls (Benjamin Coe)
