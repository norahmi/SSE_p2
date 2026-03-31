import type { Metadata } from 'next'
import { Space_Mono, Inter } from 'next/font/google'
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
  title: {
    template: '%s | LeafCode',
    default: 'LeafCode - Green Code Challenges',
  },
  description: 'Compete to reduce the carbon footprint of real codebases.',
  metadataBase: new URL("https://leafcode.konsyrros.me"),
  openGraph: {
    title: 'LeafCode - Green Code Challenges',
    description: 'Compete to reduce the carbon footprint of real codebases.',
    url: 'https://leafcode.konsyrros.me',
    siteName: 'LeafCode',
    images: [
      {
        url: 'https://leafcode.konsyrros.me/assets/img/opengraph.jpg',
        width: 1008,
        height: 630,
        alt: 'LeafCode - Green Code Challenges',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeafCode - Green Code Challenges',
    description: 'Compete to reduce the carbon footprint of real codebases.',
    images: [
      {
        url: 'https://leafcode.konsyrros.me/assets/img/opengraph.jpg',
        width: 1008,
        height: 630,
        alt: 'LeafCode - Green Code Challenges',
      },
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${inter.variable}`} suppressHydrationWarning>
      {/* Background and text color now come from globals.css :root + @layer base */}
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}