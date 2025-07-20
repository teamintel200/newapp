'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, setLocale } from '@/lib/locale'

interface LocaleContextType {
  locale: string
  setLocale: (locale: string) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function useLocaleContext() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocaleContext must be used within a LocaleProvider')
  }
  return context
}

interface LocaleProviderProps {
  children: React.ReactNode
  messages: any
}

export function LocaleProvider({ children, messages }: LocaleProviderProps) {
  const [locale, setCurrentLocale] = useState('en')
  const [currentMessages, setCurrentMessages] = useState(messages)

  useEffect(() => {
    const detectedLocale = getLocale()
    setCurrentLocale(detectedLocale)
    
    // Load messages for the detected locale
    import(`@/messages/${detectedLocale}.json`)
      .then((module) => {
        setCurrentMessages(module.default)
      })
      .catch(() => {
        // Fallback to English if locale messages can't be loaded
        import(`@/messages/en.json`)
          .then((module) => {
            setCurrentMessages(module.default)
          })
      })
  }, [])

  const handleSetLocale = (newLocale: string) => {
    setCurrentLocale(newLocale)
    setLocale(newLocale)
    
    // Load messages for the new locale
    import(`@/messages/${newLocale}.json`)
      .then((module) => {
        setCurrentMessages(module.default)
      })
      .catch(() => {
        console.error(`Failed to load messages for locale: ${newLocale}`)
      })
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      <NextIntlClientProvider locale={locale} messages={currentMessages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}