import { useTranslation } from 'react-i18next'
import styles from './Welcome.module.css'
import { useProjectStore } from '../../store/useProjectStore'
import { MAX_GENERATE_COUNT } from '../../types'
import { demoSchema, demoFieldConfigs } from '../../constants/demoSchema'

interface WelcomeProps {
  onOpenTemplates: () => void
}

export default function Welcome({ onOpenTemplates }: WelcomeProps) {
  const { t } = useTranslation()
  const dismissWelcome = useProjectStore((s) => s.dismissWelcome)
  const generate = useProjectStore((s) => s.generate)
  const updateGenerationConfig = useProjectStore((s) => s.updateGenerationConfig)

  const handleTryDemo = () => {
    useProjectStore.getState().loadSchema(demoSchema, demoFieldConfigs)
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
            {t('welcome.tagline')}
          </p>
        </div>

        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div className={styles.featureText}>
              <h3>{t('welcome.featureSyncTitle')}</h3>
              <p>{t('welcome.featureSyncDesc')}</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className={styles.featureText}>
              <h3>{t('welcome.featureSeedTitle')}</h3>
              <p>{t('welcome.featureSeedDesc')}</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
                <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
              </svg>
            </div>
            <div className={styles.featureText}>
              <h3>{t('welcome.featureDataSourceTitle')}</h3>
              <p>{t('welcome.featureDataSourceDesc')}</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className={styles.featureText}>
              <h3>{t('welcome.featureOfflineTitle')}</h3>
              <p>{t('welcome.featureOfflineDesc')}</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.ctaPrimary} onClick={handleTryDemo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {t('welcome.tryDemo')}
          </button>
          <button className={styles.ctaSecondary} onClick={handleStartTemplate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {t('welcome.startTemplate')}
          </button>
        </div>

        <button className={styles.dismiss} onClick={dismissWelcome}>
          {t('welcome.skip')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}
