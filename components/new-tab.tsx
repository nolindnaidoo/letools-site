/**
 * Said to a screen reader after a link that opens a new tab, which is
 * otherwise a surprise: focus lands in a window with no way back. The links
 * with an `aria-label` say it there. This is for the ones named by their text.
 */
export function NewTab() {
  return <span className="sr-only"> (opens in new tab)</span>
}
