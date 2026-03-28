'use client'

import { SessionProvider } from 'next-auth/react'
import { CurrencyProvider } from './CurrencyContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/finance-hub/api/auth">
      <CurrencyProvider>{children}</CurrencyProvider>
    </SessionProvider>
  )
}
