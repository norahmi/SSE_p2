import type { Metadata } from 'next'
import { Space_Mono, Inter } from 'next/font/google'
import Navbar from '@/components/ui/Navbar'
import './globals.css'

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LeafCode — Green Code Challenges',
  description: 'Compete to reduce the carbon footprint of real codebases.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${inter.variable}`} suppressHydrationWarning>
      {/* Background and text color now come from globals.css :root + @layer base */}
      <body>
        {children}
      </body>
    </html>
  )
}