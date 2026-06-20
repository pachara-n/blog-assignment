import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PacharaBlog',
  description: 'บทความเทคโนโลยี การเขียนโปรแกรม และเทรนด์ดิจิทัลล่าสุด',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>{children}</body>
    </html>
  )
}
