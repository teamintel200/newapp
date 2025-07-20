const locales = ['en', 'ko', 'vi'] as const

export function getLocale(): string {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return 'en' // Default for server-side rendering
  }

  // Check localStorage for saved preference
  const savedLocale = localStorage.getItem('preferred-locale')
  if (savedLocale && locales.includes(savedLocale as any)) {
    return savedLocale
  }

  // Check browser language
  const browserLocale = navigator.language.split('-')[0]
  if (locales.includes(browserLocale as any)) {
    return browserLocale
  }

  // Default to English
  return 'en'
}

export function setLocale(locale: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred-locale', locale)
  }
}