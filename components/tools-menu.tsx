'use client'

import { TOOLS, toolPath } from '@/lib/tools'
import { Dropdown } from '@/ui/dropdown'

// Every tool page, reachable from every page. Without this the only route to a
// tool page is the home grid, which means a visitor two clicks deep has to go
// back to the top to reach a sibling.
//
// A client leaf: the trigger owns open/closed state. Each item is a real
// anchor, so the links are in the HTML for a crawler and middle-click works.
export function ToolsMenu() {
  return (
    <Dropdown>
      <Dropdown.Trigger className="text-sm text-muted hover:text-foreground">
        Tools
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom start">
        <Dropdown.Menu aria-label="All tools">
          {TOOLS.map(tool => (
            <Dropdown.Item key={tool.id} href={toolPath(tool)} textValue={tool.name}>
              {tool.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  )
}
