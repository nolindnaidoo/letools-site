// The two Rust desktop tools by the same maker — cross-linked with their
// dedicated sites (pixelcoords.dev / pixelactions.dev), which link back
// here. Taglines are each site's own, verbatim — never embellish.
export interface RustTool {
  readonly id: string
  readonly name: string
  readonly monogram: string
  readonly tagline: string
  readonly siteUrl: string
  readonly githubUrl: string
}

export const RUST_TOOLS: readonly RustTool[] = [
  {
    id: 'pixelcoords',
    name: 'pixelcoords',
    monogram: 'pc',
    tagline: 'Freeze your screen, mark regions, get pixel-exact coordinates and crops.',
    siteUrl: 'https://pixelcoords.dev',
    githubUrl: 'https://github.com/nolindnaidoo/pixelcoords',
  },
  {
    id: 'pixelactions',
    name: 'pixelactions',
    monogram: 'pa',
    tagline: 'Consume human-verified coordinates, perform the interaction, confirm it landed.',
    siteUrl: 'https://pixelactions.dev',
    githubUrl: 'https://github.com/nolindnaidoo/pixelactions',
  },
]
