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

  const index = useMemo(() => buildIndex(TOOLS), [])
  const results = useMemo(() => search(index, query), [index, query])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setActive(0)
    trigger.current?.focus()
  }, [])

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
    if (isOpen) input.current?.focus()
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
      <button
        ref={trigger}
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm text-muted hover:text-fg"
      >
        Search
        {/* A phone has no ⌘K, and the hint is what pushed the header past
            375px once the wordmark was spelled out. */}
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-xs sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh]">
          {/* Clicking the backdrop closes. It is not the only way out — Escape
              works and the close button is reachable — so it carries no role. */}
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 cursor-default"
            onClick={close}
          />

          <div className="relative w-full max-w-xl rounded-lg border border-border bg-bg shadow-lg">
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
              className="w-full border-border border-b bg-transparent px-4 py-3 outline-none"
            />

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
          </div>
        </div>
      )}
    </>
  )
}
