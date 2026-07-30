import { Geist, Geist_Mono } from 'next/font/google'

// Geist for body text, Geist Mono for tool ids and install commands.
export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Applied to <html> in the root layout.
export const fontHtmlClassName = `${geistSans.variable} ${geistMono.variable} antialiased`
