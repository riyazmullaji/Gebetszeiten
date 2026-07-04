import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Gebetszeiten 2026 — Nürnberg',
  description: 'Fajr & Isha Zeiten — aufgezeichnet von der Gemeinde',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#059669',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
