'use client'

import { SessionProvider } from 'next-auth/react'
import { LanguageProvider } from './LanguageContext'
import { CurrencyProvider } from './CurrencyContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/finance-hub/api/auth">
      <LanguageProvider>
        <CurrencyProvider>{children}</CurrencyProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
