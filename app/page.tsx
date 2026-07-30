import { Faq } from '@/features/home/faq'
import { Hero } from '@/features/home/hero'
import { Install } from '@/features/home/install'
import { Principles } from '@/features/home/principles'
import { ToolGrid } from '@/features/home/tool-grid'

export default function HomePage() {
  return (
    <>
      <Hero />
      <ToolGrid />
      <Principles />
      <Install />
      <Faq />
    </>
  )
}
