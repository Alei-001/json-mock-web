import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'

function detectBrowserLang(): string {
  const lang = navigator.language || ''
  if (lang.startsWith('zh')) return 'zh-CN'
  if (lang.startsWith('ja')) return 'ja'
  if (lang.startsWith('ko')) return 'ko'
  return 'en'
}

const saved = localStorage.getItem('json-mock-lang')
const defaultLang = saved || detectBrowserLang()

i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    en: { translation: en },
    ja: { translation: ja },
    ko: { translation: ko },
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
