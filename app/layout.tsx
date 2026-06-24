import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GolfHero — Play. Give. Win.',
  description: 'Golf performance tracking with charity fundraising and monthly prize draws.',
  keywords: 'golf, charity, prize draw, Stableford, fundraising',
  openGraph: {
    title: 'GolfHero — Play. Give. Win.',
    description: 'Track your golf scores, support charity, and win monthly prizes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
