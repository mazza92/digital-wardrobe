import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import frTranslations from './locales/fr.json'
import enTranslations from './locales/en.json'

// Get initial language synchronously to avoid flash
const getInitialLanguage = () => {
  try {
    const stored = localStorage.getItem('i18nextLng')
    if (stored && ['fr', 'en'].includes(stored)) return stored
  } catch (e) {
    // localStorage blocked, continue with navigator detection
  }
  
  // Check navigator language
  const navLang = navigator.language?.split('-')[0]
  if (navLang === 'en') return 'en'
  
  return 'fr' // Default to French
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: frTranslations },
      en: { translation: enTranslations }
    },
    fallbackLng: 'fr',
    lng: getInitialLanguage(),
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['navigator'], // Skip localStorage to avoid storage errors
      caches: [] // Don't cache language selection
    },
    // Performance optimizations
    react: {
      useSuspense: false, // Disable suspense for faster initial render
      bindI18n: 'languageChanged', // Only re-render on language change
      bindI18nStore: false // Don't re-render on store updates
    },
    // Reduce bundle size
    returnNull: false,
    returnEmptyString: false
  })

export default i18n

