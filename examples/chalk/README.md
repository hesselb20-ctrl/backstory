# Example: chalk/chalk

The decision log Backstory produced for [chalk/chalk](https://github.com/chalk/chalk) (MIT licensed), scanned at commit `7211001`.

```bash
git clone https://github.com/chalk/chalk
backstory scan chalk --max 30 --out examples/chalk/decisions
```

381 commits produced 115 signals and 30 candidates. The model skipped two (a logo commit and a one-day CI pin that was reverted) and wrote 28 records with `claude-fable-5-2`.

The scan ran without the GitHub CLI or a token and hit GitHub's anonymous rate limit, so only two PR descriptions were read. Other PRs are linked from their commits, but their text was not used. Expect higher-confidence records on a run with `gh` installed.

To browse the timeline, download [`decisions/index.html`](decisions/index.html) and open it in a browser.

| ADR | Date | Decision | Signals | Confidence |
| --- | --- | --- | --- | --- |
| [0001](decisions/0001-drop-node-0-8-support-and-require-node-0-10.md) | 2014-03-26 | Drop Node 0.8 support and require Node >=0.10 | config, refactor | low |
| [0002](decisions/0002-use-supports-color-instead-of-has-color-for-terminal-color-d.md) | 2014-06-14 | Use supports-color instead of has-color for terminal color detection | dependency | low |
| [0003](decisions/0003-add-test-coverage-reporting-with-nyc-and-coveralls.md) | 2015-05-25 | Add test coverage reporting with nyc and Coveralls | dependency, config | medium |
| [0004](decisions/0004-adopt-xo-as-the-linter-and-run-it-before-the-tests.md) | 2015-08-20 | Adopt XO as the linter and run it before the tests | dependency, config | medium |
| [0005](decisions/0005-remove-chalk-hascolor-and-chalk-stripcolor-along-with-the-ha.md) | 2015-12-12 | Remove chalk.hasColor and chalk.stripColor along with the has-ansi and strip-ansi dependencies | dependency | low |
| [0006](decisions/0006-drop-support-for-node-js-0-10-and-0-12-require-node-js-4-or.md) | 2017-05-21 | Drop support for Node.js 0.10 and 0.12; require Node.js 4 or later | dependency, config | medium |
| [0007](decisions/0007-convert-the-codebase-to-es2015-syntax.md) | 2017-06-20 | Convert the codebase to ES2015 syntax | dependency, refactor, config | medium |
| [0008](decisions/0008-replace-mocha-with-ava-and-split-the-test-suite-into-per-top.md) | 2017-07-23 | Replace mocha with ava and split the test suite into per-topic files | dependency, refactor | medium |
| [0009](decisions/0009-ship-hand-written-typescript-definitions-in-the-package-and.md) | 2017-10-17 | Ship hand-written TypeScript definitions in the package and type-check them in the test script | dependency, config | medium |
| [0010](decisions/0010-revert-the-lint-fix-that-replaced-x-escapes-with-u-escapes-i.md) | 2018-02-14 | Revert the lint fix that replaced \x escapes with \u escapes in the template tests | revert | low |
| [0011](decisions/0011-require-node-js-6-and-adopt-rest-spread-syntax-in-place-of-a.md) | 2018-09-18 | Require Node.js 6 and adopt rest/spread syntax in place of arguments handling | config, refactor | medium |
| [0012](decisions/0012-extend-the-shared-sindresorhus-tsconfig-preset-instead-of-de.md) | 2018-12-26 | Extend the shared @sindresorhus/tsconfig preset instead of declaring compiler options locally | dependency, config | low |
| [0013](decisions/0013-ship-typescript-definitions-as-a-documented-root-index-d-ts.md) | 2018-12-26 | Ship TypeScript definitions as a documented root index.d.ts tested with tsd-check | dependency, refactor, config | medium |
| [0014](decisions/0014-replace-chalk-constructor-with-new-chalk-instance-for-creati.md) | 2019-03-12 | Replace `chalk.constructor()` with `new chalk.Instance()` for creating isolated Chalk instances | refactor | medium |
| [0015](decisions/0015-require-node-js-8-as-the-minimum-supported-runtime.md) | 2019-03-12 | Require Node.js 8 as the minimum supported runtime | config, refactor | medium |
| [0016](decisions/0016-use-a-commonjs-compatible-export-in-the-typescript-definitio.md) | 2019-04-28 | Use a CommonJS-compatible export in the TypeScript definition, with types under a chalk namespace | dependency, refactor, config | medium |
| [0017](decisions/0017-replace-per-call-style-arrays-and-close-code-regexes-with-pr.md) | 2019-07-12 | Replace per-call style arrays and close-code regexes with precomputed linked stylers and cached builders | dependency, message | medium |
| [0018](decisions/0018-move-library-code-into-a-source-directory-and-point-package.md) | 2019-07-12 | Move library code into a source/ directory and point package.json main at it | dependency, config, refactor | low |
| [0019](decisions/0019-require-node-js-10-as-the-minimum-supported-version.md) | 2020-04-02 | Require Node.js 10 as the minimum supported version | config, refactor | medium |
| [0020](decisions/0020-require-node-js-12-and-publish-the-package-as-esm-only.md) | 2021-04-16 | Require Node.js 12 and publish the package as ESM only | dependency, config, refactor | medium |
| [0021](decisions/0021-ship-type-definitions-from-source-via-the-types-field-and-me.md) | 2021-07-30 | Ship type definitions from source/ via the `types` field, and measure coverage with c8 and Codecov | dependency, config | medium |
| [0022](decisions/0022-remove-tagged-template-literal-support-from-the-core-chalk-f.md) | 2021-11-10 | Remove tagged template literal support from the core chalk function | refactor | medium |
| [0023](decisions/0023-vendor-ansi-styles-and-supports-color-into-source-vendor-and.md) | 2021-11-26 | Vendor ansi-styles and supports-color into source/vendor and resolve them through package.json imports | dependency | medium |
| [0024](decisions/0024-keep-a-main-field-in-package-json-alongside-exports-for-back.md) | 2022-03-09 | Keep a `main` field in package.json alongside `exports` for backwards compatibility | config, message | medium |
| [0025](decisions/0025-source-style-name-lists-and-types-from-the-vendored-ansi-sty.md) | 2022-10-12 | Source style-name lists and types from the vendored ansi-styles and keep the old names as deprecated aliases | comment | medium |
| [0026](decisions/0026-exclude-vendored-code-from-linting-test-only-on-node-14-and.md) | 2026-03-29 | Exclude vendored code from linting, test only on Node 14 and 26, and drop the Codecov upload | dependency, config | low |
| [0027](decisions/0027-require-node-js-22-and-replace-tsd-type-tests-with-a-plain-t.md) | 2026-07-25 | Require Node.js 22 and replace tsd type tests with a plain tsc check | dependency, config, refactor | medium |
| [0028](decisions/0028-replace-ava-and-matcha-with-node-s-built-in-test-and-bench-r.md) | 2026-09-25 | Replace ava and matcha with Node's built-in test and bench runners | dependency, refactor, config | low |
