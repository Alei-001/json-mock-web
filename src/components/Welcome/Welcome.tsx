import { useTranslation } from 'react-i18next'
import styles from './Welcome.module.css'
import { useProjectStore } from '../../store/useProjectStore'
import { MAX_GENERATE_COUNT } from '../../types'

interface WelcomeProps {
  onOpenTemplates: () => void
}

const strategies = [
  { icon: '✉', labelKey: 'strategies.email' },
  { icon: '👤', labelKey: 'strategies.name' },
  { icon: '📞', labelKey: 'strategies.phone' },
  { icon: '🔗', labelKey: 'strategies.uri' },
  { icon: '🆔', labelKey: 'strategies.uuid' },
  { icon: '📅', labelKey: 'strategies.datetime' },
  { icon: '🔢', labelKey: 'strategies.integer' },
  { icon: '💰', labelKey: 'strategies.price' },
  { icon: '🏠', labelKey: 'strategies.city' },
]

export default function Welcome({ onOpenTemplates }: WelcomeProps) {
  const { t } = useTranslation()
  const dismissWelcome = useProjectStore((s) => s.dismissWelcome)
  const generate = useProjectStore((s) => s.generate)
  const updateGenerationConfig = useProjectStore((s) => s.updateGenerationConfig)

  const handleTryDemo = () => {
    updateGenerationConfig({ count: 5 > MAX_GENERATE_COUNT ? MAX_GENERATE_COUNT : 5 })
    generate()
    dismissWelcome()
  }

  const handleStartTemplate = () => {
    dismissWelcome()
    onOpenTemplates()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.hero}>
        <div className={styles.logoSection}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H6a2 2 0 00-2 2v3c0 1.1-.9 2-2 2v4c1.1 0 2 .9 2 2v3a2 2 0 002 2h2" />
              <path d="M16 21h2a2 2 0 002-2v-3c0-1.1.9-2 2-2v-4c-1.1 0-2-.9-2-2V5a2 2 0 00-2-2h-2" />
            </svg>
          </div>
          <h1 className={styles.title}>JSON Mock</h1>
          <p className={styles.subtitle}>
            {t('welcome.tagline', 'Visual JSON Schema Editor & Realistic Mock Data Generator')}
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <div className={styles.featureText}>
              <h3>{t('welcome.featureVisualTitle', 'Visual Tree Editor')}</h3>
              <p>{t('welcome.featureVisualDesc', 'Drag-and-drop tree view to design nested objects and arrays intuitively.')}</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
              </svg>
            </div>
            <div className={styles.featureText}>
              <h3>{t('welcome.featureStrategiesTitle', '20+ Data Strategies')}</h3>
              <p>{t('welcome.featureStrategiesDesc', 'Email, name, phone, UUID, address, price, and more — powered by Faker.js.')}</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className={styles.featureText}>
              <h3>{t('welcome.featureExportTitle', 'Export JSON & CSV')}</h3>
              <p>{t('welcome.featureExportDesc', 'Copy to clipboard or download as JSON. Export flat data as CSV for spreadsheet tools.')}</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div className={styles.featureText}>
              <h3>{t('welcome.featureTemplatesTitle', 'Preset Templates')}</h3>
              <p>{t('welcome.featureTemplatesDesc', 'Jump-start with User, Order, Product, Article, and Employee schemas.')}</p>
            </div>
          </div>
        </div>

        <div className={styles.strategyCloud}>
          <span className={styles.cloudLabel}>{t('welcome.strategies', 'Built-in strategies:')}</span>
          {strategies.map((s) => (
            <span key={s.labelKey} className={styles.strategyPill}>
              {s.icon} {t(s.labelKey)}
            </span>
          ))}
        </div>

        <div className={styles.actions}>
          <button className={styles.ctaPrimary} onClick={handleStartTemplate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {t('welcome.startTemplate', 'Start from Template')}
          </button>
          <button className={styles.ctaSecondary} onClick={handleTryDemo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {t('welcome.tryDemo', 'Try Demo Data')}
          </button>
        </div>

        <button className={styles.dismiss} onClick={dismissWelcome}>
          {t('welcome.skip', 'Skip to Editor')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}
