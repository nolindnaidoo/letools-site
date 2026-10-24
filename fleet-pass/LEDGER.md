# Fleet pass ledger

One row per extension repo. `scripts/fleet-pass.test.ts` holds the rows against
`REPOS` in `scripts/check-fleet.ts`.

A status is one of `not started`, `in progress`, `pull request open` or `merged`. A row
is written by step 8, [close.md](close.md).

| Repo | Status | Baseline commit | Record | Pull request | Date | Findings fixed | Carried |
|---|---|---|---|---|---|---|---|
| versions-le | pull request open | `2b3b2562` | [records/versions-le.md](records/versions-le.md) | [nolindnaidoo/versions-le#39](https://github.com/nolindnaidoo/versions-le/pull/39) | 2026-10-24 | 23 | 1 |
| colors-le | not started | | | | | | |
| dates-le | not started | | | | | | |
| envsync-le | not started | | | | | | |
| i18n-le | not started | | | | | | |
| ids-le | not started | | | | | | |
| ips-le | not started | | | | | | |
| decisionlint | merged | `84dc063c` | [records/decisionlint.md](records/decisionlint.md) | [nolindnaidoo/decisionlint#30](https://github.com/nolindnaidoo/decisionlint/pull/30) | 2026-10-14 | 22 | 0 |
| numbers-le | not started | | | | | | |
| paths-le | merged | `0cb6ef02` | [records/paths-le.md](records/paths-le.md) | [nolindnaidoo/paths-le#51](https://github.com/nolindnaidoo/paths-le/pull/51) | 2026-10-11 | 25 | 0 |
| regex-le | not started | | | | | | |
| scrape-le | not started | | | | | | |
| secrets-le | not started | | | | | | |
| string-le | merged | `5554c397` | [records/string-le.md](records/string-le.md) | [nolindnaidoo/string-le#53](https://github.com/nolindnaidoo/string-le/pull/53) | 2026-10-13 | 34 | 1 |
| unicode-le | not started | | | | | | |
| units-le | not started | | | | | | |
| urls-le | not started | | | | | | |

The order of the remaining repos is not fixed.
