'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildIndex, type Entry, search } from '@/lib/search'
import { TOOLS } from '@/lib/tools'

/**
 * Search across every tool, command and MCP tool name.
 *
 * The index is built once from the registry — the same source the pages render
 * from — so anything findable here exists, and anything that ships is
 * findable. It is small enough to hold in memory and needs no request.
 *
 * Accessibility is the reason this is hand-built rather than a div with a
 * click handler: it is a `combobox` with an owned `listbox`, arrow keys move
 * `aria-activedescendant` rather than focus, Escape closes and returns focus
 * to the trigger, and the result count is announced.
 *
 * It opens as a native modal `<dialog>`. That is what keeps Tab inside it,
 * makes the page behind inert to a screen reader, and closes it on Escape
 * from anywhere in it. Before, it was a positioned box: one Tab left it for
 * the page underneath, and from there Escape no longer reached it. The top
 * layer also puts it over the whole page, where a `fixed` box inside the
 * header was confined to the header by its backdrop blur.
 */

const KIND_LABEL: Record<Entry['kind'], string> = {
  tool: 'Tool',
  command: 'Command',
  mcp: 'MCP',
}

export function CommandPalette() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  const index = useMemo(() => buildIndex(TOOLS), [])
  const results = useMemo(() => search(index, query), [index, query])

  const close = useCallback(() => dialog.current?.close(), [])

  // The one place the palette is put away, however it was closed: the input's
  // Escape, the dialog's own, the close button or a click on the dim.
  const onClosed = () => {
    setIsOpen(false)
    setQuery('')
    setActive(0)
    trigger.current?.focus()
  }

  // The palette shortcut. Cmd+K on macOS, Ctrl+K elsewhere — and `/` only when
  // the user is not already typing somewhere, or it eats the keystroke.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsOpen(true)
        return
      }
      if (event.key === '/' && !isTyping && !isOpen) {
        event.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (dialog.current?.open === false) dialog.current.showModal()
    input.current?.focus()
  }, [isOpen])

  const go = (entry: Entry | undefined) => {
    if (entry === undefined) return
    close()
    router.push(entry.href)
  }

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(current => (results.length === 0 ? 0 : (current + 1) % results.length))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(current =>
        results.length === 0 ? 0 : (current - 1 + results.length) % results.length,
      )
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      go(results[active])
    }
  }

  return (
    <>
      {/* Named "Search" and nothing else: the key hint is a hint, and read out
          it made the name "Search command K". Below sm it is the icon alone,
          which is what leaves room in the bar for a menu. */}
      <button
        ref={trigger}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
        aria-keyshortcuts="Meta+K Control+K"
        className="flex items-center gap-2 rounded border border-border bg-surface p-2 text-muted text-sm hover:text-foreground sm:px-3"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="sm:hidden"
        >
          <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            d="m10.5 10.5 3.5 3.5"
          />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-xs sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {/* `bg-background` is a token. This once said `bg-bg`, which is no class
          at all, so the panel had no fill and the page showed through it. */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the click is for the dim; Escape is the keyboard's way out and the dialog handles it natively. */}
      <dialog
        ref={dialog}
        aria-label="Site search"
        onClose={onClosed}
        // A click on the dim lands on the dialog itself; one inside the panel
        // lands on something in it.
        onClick={event => {
          if (event.target === dialog.current) close()
        }}
        className="fixed inset-x-0 top-[10vh] mx-auto w-[calc(100%-2rem)] max-w-xl rounded-lg border border-border bg-background p-0 text-foreground shadow-lg backdrop:bg-black/50"
      >
        {isOpen && (
          <>
            <div className="flex items-center gap-2 border-border border-b pr-3">
              <input
                ref={input}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={results[active] ? `palette-option-${active}` : undefined}
                aria-label="Search tools, commands and MCP tools"
                autoComplete="off"
                value={query}
                onChange={event => {
                  setQuery(event.target.value)
                  setActive(0)
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search tools, commands, MCP tools…"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
              />
              {/* The way out for a reader with no Escape key and no dim to aim at. */}
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="rounded border border-border px-2 py-1 font-mono text-muted text-xs hover:text-foreground"
              >
                Esc
              </button>
            </div>

            {/* A div, not a ul: `ul` is non-interactive markup and giving it a
              listbox role is the kind of thing lint rightly objects to. The
              semantics come from the roles. */}
            <div
              id="palette-results"
              role="listbox"
              aria-label="Results"
              className="max-h-80 overflow-y-auto p-2"
            >
              {/* The option IS the list item. A wrapper between the listbox and
                its options breaks `aria-required-children`, and a button
                inside each one would put them in the Tab order — wrong for
                this pattern, where focus stays in the input and selection
                moves via `aria-activedescendant`. */}
              {results.map((entry, position) => (
                <div
                  key={`${entry.kind}-${entry.href}-${entry.label}`}
                  id={`palette-option-${position}`}
                  role="option"
                  // Programmatically focusable, but out of the Tab order:
                  // focus stays in the input and selection moves by
                  // aria-activedescendant, which is the pattern.
                  tabIndex={-1}
                  aria-selected={position === active}
                  onMouseEnter={() => setActive(position)}
                  onMouseDown={event => {
                    // mousedown, not click: click fires after the input blurs,
                    // and the blur can close the palette first.
                    event.preventDefault()
                    go(entry)
                  }}
                  className={`flex cursor-pointer items-baseline gap-3 rounded px-3 py-2 text-left ${
                    position === active ? 'bg-surface' : ''
                  }`}
                >
                  <span className="w-16 shrink-0 font-mono text-muted text-xs">
                    {KIND_LABEL[entry.kind]}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{entry.label}</span>
                    <span className="truncate text-muted text-sm">{entry.detail}</span>
                  </span>
                </div>
              ))}
            </div>

            <p aria-live="polite" className="border-border border-t px-4 py-2 text-muted text-sm">
              {query.trim() === ''
                ? 'Type to search. Escape closes.'
                : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </p>
          </>
        )}
      </dialog>
    </>
  )
}
