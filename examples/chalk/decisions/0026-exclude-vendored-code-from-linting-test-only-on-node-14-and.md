---
id: "0026"
title: "Exclude vendored code from linting, test only on Node 14 and 26, and drop the Codecov upload"
date: 2026-03-29
status: active
confidence: low
signals: ["dependency", "config"]
areas: ["dependencies", "ci"]
files: ["package.json", ".github/workflows/main.yml"]
written_by: claude-fable-5-2
---

# 0026. Exclude vendored code from linting, test only on Node 14 and 26, and drop the Codecov upload

- **Date:** 2026-03-29
- **Status:** active
- **Confidence:** low. The only message is the subject "Tweaks" and there is no PR, issue or comment text, so everything is read from the shape of a diff that is cut off at 7000 characters.

## Context

Commit 678e550 is a grab-bag titled "Tweaks" that touches CI, lint configuration, dev dependencies, types, examples and the readme in one go. Before it, CI ran on Node 18, 16 and 14 and uploaded coverage through codecov-action on the Node 16 job with fail_ci_if_error set. The package ships vendored copies of ansi-styles and supports-color under source/vendor, reached through the #ansi-styles and #supports-color import aliases. The history does not say why any of these changes were made.

## Decision

The CI matrix now tests only Node 26 and 14, the checkout and setup-node actions are bumped, and the Codecov upload step is removed. The xo config ignores source/vendor and turns off no-warning-comments, and xo itself moves from ^0.57.0 to ^0.54.2. ansi-styles ^6.2.3 is added as a devDependency, while source/index.js still imports through #ansi-styles and source/index.d.ts still re-exports from ./vendor/ansi-styles/index.js. In the same commit the type declarations for modifiers, foregroundColors, backgroundColors and colors switch to the *Name types, and the readme's level 1 downsampling example changes from 31 (red) to 91 (bright red).

## Alternatives tried

None recorded in the history.

## Consequences

- Files under source/vendor are no longer linted by xo, so style or lint problems there will not fail npm test.
- CI no longer uploads coverage to Codecov, so a coverage regression will not fail the build; c8 is still a devDependency.
- Only Node 14 and 26 are exercised in CI, so breakage specific to the versions in between will not be caught there.
- The xo range was lowered to ^0.54.2 rather than raised and the history does not say why, so check before bumping it again; likewise ansi-styles is a devDependency only, and the runtime code and types still use the vendored copy.

## Evidence

- Commit [`678e550`](https://github.com/chalk/chalk/commit/678e5505458d0cf40134e205aed4454e0eeac45c) (2026-03-29): Tweaks (Sindre Sorhus)
