import { Faq } from '@/features/home/faq'
import { Featured } from '@/features/home/featured'
import { Hero } from '@/features/home/hero'
import { Install } from '@/features/home/install'
import { McpConfig } from '@/features/home/mcp-config'
import { Principles } from '@/features/home/principles'
import { RustTools } from '@/features/home/rust-tools'
import { Thesis } from '@/features/home/thesis'
import { ToolGrid } from '@/features/home/tool-grid'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Thesis />
      <Featured />
      <ToolGrid />
      <Principles />
      <Install />
      <McpConfig />
      <RustTools />
      <Faq />
    </>
  )
}
