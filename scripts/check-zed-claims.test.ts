import { describe, expect, it } from 'vitest'
import { linkedPulls } from './check-zed-claims'

describe('linkedPulls', () => {
  it('finds each linked pull request once', () => {
    const text =
      '[a](https://github.com/zed-industries/extensions/pull/7077) and https://github.com/zed-industries/extensions/pull/7077 and /pull/12'
    expect(linkedPulls(text)).toEqual([7077])
    expect(linkedPulls('no links')).toEqual([])
  })
})
