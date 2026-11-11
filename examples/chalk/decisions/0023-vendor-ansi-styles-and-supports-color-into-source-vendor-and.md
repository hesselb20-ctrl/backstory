---
id: "0023"
title: "Vendor ansi-styles and supports-color into source/vendor and resolve them through package.json imports"
date: 2021-11-26
status: active
confidence: medium
signals: ["dependency"]
areas: ["dependencies"]
files: ["package.json"]
written_by: claude-fable-5-2
---

# 0023. Vendor ansi-styles and supports-color into source/vendor and resolve them through package.json imports

- **Date:** 2021-11-26
- **Status:** active
- **Confidence:** medium. The diff shows clearly what changed, but the commit message is only "Bundle dependencies" and no PR, issue or comment states the motive.

## Context

Before 04fdbd6 the package declared two runtime dependencies in package.json, ansi-styles ^6.1.0 and supports-color ^9.1.0, and imported them by their bare package names from source/index.js and source/index.d.ts. The commit message says only "Bundle dependencies". The history does not say why the dependencies were bundled.

## Decision

04fdbd6 removes the whole dependencies block from package.json and adds copies of both packages, with their type definitions, under source/vendor/ansi-styles and source/vendor/supports-color. A new package.json "imports" map exposes them as #ansi-styles and #supports-color, where #supports-color resolves to vendor/supports-color/index.js under the "node" condition and to vendor/supports-color/browser.js by default. source/index.js imports through those # specifiers, while source/index.d.ts uses relative paths into the vendor directory. The same commit renames source/util.js to source/utilities.js.

## Alternatives tried

- Importing the types in source/index.d.ts from '#supports-color' is left commented out, with a TODO saying to switch to it once TypeScript supports that; relative vendor paths are used in the meantime.

## Consequences

- The package no longer has a dependencies block, so changes to ansi-styles or supports-color do not arrive through a version range and must be made by editing the files in source/vendor.
- Runtime code should import the vendored modules as #ansi-styles and #supports-color; the "imports" map is what selects the Node or browser build of supports-color, so a direct relative import would bypass that selection.
- source/index.d.ts deliberately imports from './vendor/supports-color/index.js' rather than the # specifier, and the commented-out lines are a marked TODO, not dead code to tidy away.
- The eslint-disable-line import/order comment on the './utilities.js' import in source/index.js was added in this commit alongside the # imports, and the helper file is now source/utilities.js, not source/util.js.

## Evidence

- Commit [`04fdbd6`](https://github.com/chalk/chalk/commit/04fdbd6d8d262ed8668cf3f2e94f647d2bc028d8) (2021-11-26): Bundle dependencies (Sindre Sorhus)
