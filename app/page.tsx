import { Faq } from '@/features/home/faq'
import { Hero } from '@/features/home/hero'
import { Install } from '@/features/home/install'
import { McpConfig } from '@/features/home/mcp-config'
import { Principles } from '@/features/home/principles'
import { RustTools } from '@/features/home/rust-tools'
import { Tools } from '@/features/home/tools'

// In the order a visitor needs them: the pitch, the tools the pitch is about,
// the promises, how to get one, how to wire it, the rest. The thesis used to
// sit between the hero and the tools, so the button that said "Browse the
// tools" landed on two paragraphs of argument first.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Tools />
      <Principles />
      <Install />
      <McpConfig />
      <RustTools />
      <Faq />
    </>
  )
}
