import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/context/Providers'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Finance Hub',
  description: 'Track your net worth, expenses, and income'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
