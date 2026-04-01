import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/context/Providers'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.avivo.dev'),
  title: {
    default: 'Finance Hub — Personal Finance Tracker',
    template: '%s | Finance Hub',
  },
  description: 'Finance Hub helps you track net worth, manage recurring expenses, and monitor income sources — all in one private, secure dashboard. Free personal finance app.',
  keywords: [
    'personal finance tracker',
    'net worth tracker',
    'expense tracker',
    'income tracker',
    'personal finance dashboard',
    'budget app',
    'financial planning',
    'recurring expenses',
    'wealth tracker',
  ],
  openGraph: {
    type: 'website',
    url: 'https://www.avivo.dev/finance-hub',
    siteName: 'Finance Hub',
    title: 'Finance Hub — Personal Finance Tracker',
    description: 'Track your net worth, recurring expenses, and income — all in one private, secure dashboard.',
    images: [{ url: 'https://www.avivo.dev/finance-hub/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finance Hub — Personal Finance Tracker',
    description: 'Track your net worth, recurring expenses, and income — all in one private, secure dashboard.',
  },
  alternates: {
    canonical: 'https://www.avivo.dev/finance-hub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Finance Hub',
  url: 'https://www.avivo.dev/finance-hub',
  description:
    'Finance Hub helps you track net worth, manage recurring expenses, and monitor income sources — all in one private, secure dashboard.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Net worth tracking',
    'Recurring expense management',
    'Income source tracking',
    'Monthly snapshots and history',
    'AI-powered financial insights',
    'Multi-currency support (NIS / USD)',
    'Household sharing',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
