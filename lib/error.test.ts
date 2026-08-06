import { describe, expect, it, vi } from 'vitest'
import { reportError } from './error'

/**
 * The one reporter seam. It exists so a swallowed error is impossible: every
 * catch routes here, and a future reporter is a one-line change rather than a
 * sweep of the codebase.
 */
describe('reportError', () => {
  it('prefixes the line with the attributable source', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const failure = new Error('clipboard denied')

    reportError(failure, { source: 'copy-button.write' })

    expect(spy).toHaveBeenCalledWith('[letools:copy-button.write]', failure)
    spy.mockRestore()
  })

  it('attributes a non-Error cause just as clearly', () => {
    // A rejected promise can carry anything; the source is what makes the line
    // actionable, not the shape of the cause.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    reportError('a bare string', { source: 'tools-menu.open' })

    expect(spy).toHaveBeenCalledWith('[letools:tools-menu.open]', 'a bare string')
    spy.mockRestore()
  })
})
