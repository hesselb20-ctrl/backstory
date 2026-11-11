---
id: "0021"
title: "Ship type definitions from source/ via the `types` field, and measure coverage with c8 and Codecov"
date: 2021-07-30
status: active
confidence: medium
signals: ["dependency", "config"]
areas: ["dependencies", "ci"]
files: ["package.json", ".github/workflows/main.yml"]
written_by: claude-fable-5-2
---

# 0021. Ship type definitions from source/ via the `types` field, and measure coverage with c8 and Codecov

- **Date:** 2021-07-30
- **Status:** active
- **Confidence:** medium. Both diffs are clear, but the only stated reasoning is "Fixes #500" and "Fix code coverage"; the issue text and the nature of the coverage failure are not in the evidence.

## Context

Before 625a285 the type definitions (`index.d.ts`) and their tsd test (`index.test-d.ts`) sat at the repository root and were published via the `files` list, with no `types` field in package.json. Coverage ran through `nyc ava` with `coveralls` as a devDependency and a Coveralls badge in the readme. 625a285 says only that it fixes #500, and 7a68935 says only "Fix code coverage"; the history does not say what was broken in either case.

## Decision

625a285 moved `index.d.ts` and `index.test-d.ts` into `source/`, added `"types": "./source/index.d.ts"`, and excluded the test file from the published package with a `!source/index.test-d.ts` entry in `files`. 7a68935 replaced `nyc` and `coveralls` with `c8`, so the test script is now `xo && c8 ava && tsd`, with c8 configured in package.json to emit `text` and `lcov` reports and to exclude `source/vendor`. The same commit added Node 16 to the CI matrix, added a `codecov/codecov-action@v2` upload step that runs only on Node 16, and switched the readme badge to Codecov.

## Alternatives tried

- Coverage with `nyc` plus `coveralls` was the earlier setup and was removed in 7a68935 under the subject "Fix code coverage"; the history does not say what was wrong with it.
- Type definitions at the repository root, published through `files` without a `types` field, were the earlier layout and were replaced in 625a285.
- A direct `typescript` devDependency was added in 625a285 and removed in 7a68935, which added `@types/node` instead; the history does not say why.

## Consequences

- The type definitions and their tsd test live in `source/` next to the implementation, and the `!source/index.test-d.ts` entry in `files` is what keeps the test file out of the published package.
- The Codecov upload runs only on the Node 16 CI job and sets `fail_ci_if_error: true`, so a failed upload fails that job even when the tests pass.
- `source/vendor` is deliberately excluded from coverage through the `c8` block in package.json, and the `lcov` reporter there is configured alongside the Codecov upload step.
- `typescript` is not a direct devDependency after 7a68935; type checking of the definitions runs through `tsd` in `npm test`.

## Evidence

- Commit [`625a285`](https://github.com/chalk/chalk/commit/625a2857722fb86cfe98f22c9c12888238e36f51) (2021-07-30): Add `types` field to package.json (Sindre Sorhus)
- Commit [`7a68935`](https://github.com/chalk/chalk/commit/7a6893551d93ebe0bd031141b3e2b91d7e0676aa) (2021-11-26): Fix code coverage (Sindre Sorhus)
