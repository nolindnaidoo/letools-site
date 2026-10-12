import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { LOGO_SOURCE } from './brand'

/**
 * The mark as a data URI, for the images drawn at build time.
 *
 * Satori takes an image by URL and a build has no server to ask, so the file
 * is read and inlined. Kept out of `brand.ts` because that file is imported by
 * the page, and this one reads the disk.
 */
export function logoDataUri(): string {
  const file = readFileSync(join(process.cwd(), LOGO_SOURCE))
  return `data:image/png;base64,${file.toString('base64')}`
}
