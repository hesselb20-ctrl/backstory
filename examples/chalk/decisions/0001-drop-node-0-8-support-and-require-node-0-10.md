---
id: "0001"
title: "Drop Node 0.8 support and require Node >=0.10"
date: 2014-03-26
status: active
confidence: low
signals: ["config", "refactor"]
areas: ["config", "root", "dependencies"]
files: ["package.json", ".editorconfig", ".gitattributes", ".travis.yml", "logo.ai", "test.js"]
written_by: claude-fable-5-2
---

# 0001. Drop Node 0.8 support and require Node >=0.10

- **Date:** 2014-03-26
- **Status:** active
- **Confidence:** low. The only stated message is "bump strip-ansi"; the support change is inferred from the engines field and the Travis matrix, and the package.json diff itself is cut off in the evidence.

## Context

Before af4983c the package declared engines node >=0.8.0 and ran CI on both Node 0.8 and 0.10. The commit is titled "bump strip-ansi", but it also changes the supported-runtime contract and several repository housekeeping files. The history does not say why Node 0.8 was dropped or whether the strip-ansi bump required it; the package.json patch is not visible in the evidence.

## Decision

af4983c raises the engines field to node >=0.10.0 and removes 0.8 from the .travis.yml matrix, leaving 0.10 as the only tested version. In the same commit, .gitattributes switches from `* text=auto` to `* text eol=lf`, .editorconfig gains a package.json rule for 2-space indentation, and the 1614-line logo.ai source file is deleted. The history gives no reason for any of these changes.

## Alternatives tried

None recorded in the history.

## Consequences

- Node 0.8 is no longer declared as supported or tested in CI, so code may rely on Node 0.10 behaviour.
- The support change sits under a commit titled "bump strip-ansi", so searching the log for a Node support change will not find it by subject.
- Line endings are forced to LF for all files via .gitattributes, including on Windows checkouts; this is deliberate, not an oversight.
- The Illustrator source for the logo (logo.ai) is no longer in the repository from this commit on, and the evidence does not show where it went.

## Evidence

- Commit [`af4983c`](https://github.com/chalk/chalk/commit/af4983c011e23fa4097759f702c383746d6a70c4) (2014-03-26): bump strip-ansi (Sindre Sorhus)
