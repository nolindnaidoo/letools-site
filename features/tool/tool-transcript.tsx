import type { Tool } from '@/lib/tools'
import type { Transcript } from '@/lib/transcripts'

/**
 * What this tool prints, captured from its own binary.
 *
 * The tools with an extension lead with a recording of the editor command,
 * because that is what using one looks like. The ones whose extension is still
 * to be written have no editor screen to record — so rather than stage a GIF
 * of something that does not exist yet, this shows the run itself.
 *
 * The exit code is shown because these tools treat it as the product: a report
 * is something to read, and the number is what a CI step acts on.
 */
export function ToolTranscript({
  tool,
  transcript,
}: {
  readonly tool: Tool
  readonly transcript: Transcript
}) {
  return (
    <figure className="mt-4 flex w-full flex-col gap-2">
      <div className="overflow-hidden rounded-xl border border-default bg-surface text-left">
        <div className="flex items-baseline gap-2 border-b border-border px-4 py-2">
          <span aria-hidden="true" className="font-mono text-sm text-muted">
            $
          </span>
          <code className="font-mono text-sm">{transcript.command}</code>
        </div>
        {/*
          The report is wider than a phone, so this is a scrollable region —
          and one that cannot take focus is unreachable by keyboard, leaving
          everything past the fold unreadable without a pointer (axe:
          scrollable-region-focusable, WCAG 2.1.1). Same shape as
          CommandSnippet, for the same reason.
        */}
        <section
          // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region is only keyboard-scrollable if it can take focus
          tabIndex={0}
          aria-label={`${tool.name} terminal output`}
          className="overflow-x-auto px-4 py-3"
        >
          <pre className="whitespace-pre font-mono text-xs leading-relaxed text-muted">
            {transcript.output}
          </pre>
        </section>
        <div className="border-t border-border px-4 py-2 font-mono text-xs text-muted">
          exit {transcript.exit}
        </div>
      </div>
      <figcaption className="text-pretty text-sm text-muted">
        A real run against {transcript.input}. The summary above is what a person reads; the same
        findings go to stdout as JSON, which is what a script reads.
      </figcaption>
    </figure>
  )
}
