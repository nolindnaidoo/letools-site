import type { CSSProperties } from 'react'
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
  sizeLg = size,
  className = '',
}: {
  readonly tool: Tool
  // Pixels. The glyph fills about two thirds of each 128px tile, so the box
  // has to be larger than the mark it is meant to show at.
  readonly size: number
  // From the lg breakpoint, where a row has fewer lines beside the icon.
  readonly sizeLg?: number
  readonly className?: string
}) {
  const source = iconSrc(tool)

  // Both branches are sized through the same two variables, so one prop pair
  // drives both and a call site cannot set one without the other. The size is
  // set as CSS, not only as the img's width and height attributes, because
  // the preflight sets img { height: auto }, and a flex row then stretches
  // the icon to the row's height while the width holds: 36 drawn as 36 by 70.
  const style = { '--icon': `${size}px`, '--icon-lg': `${sizeLg}px` } as CSSProperties
  const box = `size-(--icon) shrink-0 lg:size-(--icon-lg) ${className}`

  if (source !== undefined) {
    return (
      <img
        src={source}
        alt=""
        width={size}
        height={size}
        style={style}
        loading="lazy"
        decoding="async"
        className={box}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: Math.round(size * 0.36) }}
      // Foreground on surface, not accent on accent-soft: that pair renders
      // 4.12:1 at this weight and axe fails it on every card that shows one.
      className={`${box} inline-flex items-center justify-center border border-border bg-surface font-mono font-bold tracking-tight text-foreground`}
    >
      LE
    </span>
  )
}
