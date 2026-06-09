import { useTranslation } from 'react-i18next'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className={`${styles.backdrop} ${open ? styles.open : ''}`} onClick={onClose} />
      <div className={`${styles.dialog} ${open ? styles.open : ''}`} role="alertdialog" aria-modal="true">
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button type="button" className="btn-sm" onClick={onClose}>{t('common.cancel')}</button>
          <button type="button" className="btn-sm primary" onClick={() => { onConfirm(); onClose() }}>{confirmLabel ?? t('common.confirm')}</button>
        </div>
      </div>
    </>
  )
}
