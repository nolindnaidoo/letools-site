# Fleet pass ledger

One row per extension repo. `scripts/fleet-pass.test.ts` holds the rows against
`REPOS` in `scripts/check-fleet.ts`.

A status is one of `not started`, `in progress` or `pull request open`. A row
is written by step 8, [close.md](close.md).

| Repo | Status | Baseline commit | Record | Pull request | Date | Findings fixed | Carried |
|---|---|---|---|---|---|---|---|
| versions-le | not started | | | | | | |
| colors-le | not started | | | | | | |
| dates-le | not started | | | | | | |
| envsync-le | not started | | | | | | |
| i18n-le | not started | | | | | | |
| ids-le | not started | | | | | | |
| ips-le | not started | | | | | | |
| numbers-le | not started | | | | | | |
| paths-le | not started | | | | | | |
| regex-le | not started | | | | | | |
| scrape-le | not started | | | | | | |
| secrets-le | not started | | | | | | |
| string-le | not started | | | | | | |
| unicode-le | not started | | | | | | |
| units-le | not started | | | | | | |
| urls-le | not started | | | | | | |

`versions-le` is first. The order after it is not fixed.
