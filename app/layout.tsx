import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Métier Blog',
  description: 'A curated blog platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
