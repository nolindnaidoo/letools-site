import { iconSrc, type Tool } from '@/lib/tools'

/**
 * A tool's icon, or the family mark where its icon does not exist yet.
 *
 * Icons are copied out of each extension repo's `src/assets/images/`, so a
 * tool whose extension has not been written yet has none to copy. The fallback
 * is deliberately the LE tile rather than an invented per-tool mark: the
 * family mark is a true thing to show, and a glyph made up here would be
 * branding this site had decided on behalf of a repo that has not.
 *
 * It never carries the identification on its own — every slot that renders one
 * puts the tool's name directly beside it — so it is `aria-hidden` like the
 * real icons, and the name remains the accessible label.
 */
export function ToolIcon({
  tool,
  size,
  className = '',
}: {
  readonly tool: Tool
  readonly size: number
  readonly className?: string
}) {
  const source = iconSrc(tool)

  if (source !== undefined) {
    return (
      <img
        src={source}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={className}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      // Sized in px rather than a utility class so one prop drives both
      // branches and the two cannot fall out of step at a call site.
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      // Foreground on surface, not accent on accent-soft: that pair renders
      // 4.12:1 at this weight and axe fails it on every card that shows one.
      className={`inline-flex shrink-0 items-center justify-center border border-border bg-surface font-mono font-bold tracking-tight text-foreground ${className}`}
    >
      LE
    </span>
  )
}
