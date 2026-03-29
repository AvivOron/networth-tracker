'use client'

import { createContext, useContext, useState } from 'react'

type Language = 'en' | 'he'

interface LangCtx {
  lang: Language
  setLang: (l: Language) => void
}

const LanguageContext = createContext<LangCtx>({ lang: 'en', setLang: () => {} })

const LS_KEY = 'networth-language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en'
    try {
      const saved = localStorage.getItem(LS_KEY)
      return saved === 'he' || saved === 'en' ? saved : 'en'
    } catch {
      return 'en'
    }
  })

  function setLang(l: Language) {
    setLangState(l)
    try {
      localStorage.setItem(LS_KEY, l)
    } catch {}
  }

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}
