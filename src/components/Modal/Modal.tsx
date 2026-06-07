import { useTranslation } from 'react-i18next'
import styles from './Modal.module.css'

interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  onClose: () => void
}

export default function Modal({ open, title, subtitle, children, footer, onClose }: ModalProps) {
  const { t } = useTranslation()
  return (
    <>
      <div className={`${styles.modalBackdrop} ${open ? styles.open : ''}`} onClick={onClose} />
      <div
        className={`${styles.modal} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <h3 className={styles.modalTitle} id="modal-title">{title}</h3>
            {subtitle && <span className={styles.modalSubtitle}>{subtitle}</span>}
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label={t('common.close')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </>
  )
}
