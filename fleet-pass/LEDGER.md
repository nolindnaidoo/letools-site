# Fleet pass ledger

One row per extension repo. `scripts/fleet-pass.test.ts` holds the rows against
`REPOS` in `scripts/check-fleet.ts`.

A status is one of `not started`, `in progress`, `pull request open` or `merged`. A row
is written by step 8, [close.md](close.md).

| Repo | Status | Baseline commit | Record | Pull request | Date | Findings fixed | Carried |
|---|---|---|---|---|---|---|---|
| decisionlint | merged | `84dc063c` | [records/decisionlint.md](records/decisionlint.md) | [nolindnaidoo/decisionlint#30](https://github.com/nolindnaidoo/decisionlint/pull/30) | 2026-10-14 | 22 | 0 |
| paths-le | merged | `0cb6ef02` | [records/paths-le.md](records/paths-le.md) | [nolindnaidoo/paths-le#51](https://github.com/nolindnaidoo/paths-le/pull/51) | 2026-10-11 | 25 | 0 |
| string-le | merged | `5554c397` | [records/string-le.md](records/string-le.md) | [nolindnaidoo/string-le#53](https://github.com/nolindnaidoo/string-le/pull/53) | 2026-10-13 | 34 | 1 |
| envsync-le | merged | `4d95f569` | [records/envsync-le.md](records/envsync-le.md) | [nolindnaidoo/envsync-le#57](https://github.com/nolindnaidoo/envsync-le/pull/57) | 2026-10-25 | 24 | 0 |
| scrape-le | merged | `c377fe24` | [records/scrape-le.md](records/scrape-le.md) | [nolindnaidoo/scrape-le#59](https://github.com/nolindnaidoo/scrape-le/pull/59) | 2026-10-26 | 28 | 0 |
| numbers-le | merged | `7aece032` | [records/numbers-le.md](records/numbers-le.md) | [nolindnaidoo/numbers-le#64](https://github.com/nolindnaidoo/numbers-le/pull/64) | 2026-10-27 | 29 | 1 |
| urls-le | merged | `d6104d26` | [records/urls-le.md](records/urls-le.md) | [nolindnaidoo/urls-le#60](https://github.com/nolindnaidoo/urls-le/pull/60) | 2026-10-29 | 23 | 5 |
| colors-le | pull request open | `7f34b01a` | [records/colors-le.md](records/colors-le.md) | [nolindnaidoo/colors-le#67](https://github.com/nolindnaidoo/colors-le/pull/67) | | 20 | 6 |
| dates-le | not started | | | | | | |
| secrets-le | not started | | | | | | |
| regex-le | not started | | | | | | |
| i18n-le | not started | | | | | | |
| unicode-le | not started | | | | | | |
| ids-le | not started | | | | | | |
| ips-le | not started | | | | | | |
| versions-le | merged | `2b3b2562` | [records/versions-le.md](records/versions-le.md) | [nolindnaidoo/versions-le#39](https://github.com/nolindnaidoo/versions-le/pull/39) | 2026-10-24 | 23 | 1 |
| units-le | not started | | | | | | |

Passes go in the order the site's navigation shows the tools, which is
`byDownloads` in `lib/popularity.ts`: the most downloaded on Open VSX first,
with decisionlint leading. The rows above are in that order and a test holds
them to it. versions-le was taken out of turn; the next pass is the first row
still `not started`.
