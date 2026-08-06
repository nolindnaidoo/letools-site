import { Faq } from '@/features/home/faq'
import { Hero } from '@/features/home/hero'
import { Install } from '@/features/home/install'
import { McpConfig } from '@/features/home/mcp-config'
import { Principles } from '@/features/home/principles'
import { RustTools } from '@/features/home/rust-tools'
import { ToolGrid } from '@/features/home/tool-grid'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ToolGrid />
      <Principles />
      <Install />
      <McpConfig />
      <RustTools />
      <Faq />
    </>
  )
}
