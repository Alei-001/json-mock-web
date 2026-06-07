import styles from './Toast.module.css'

interface ToastProps {
  visible: boolean
  message?: string
}

export default function Toast({ visible, message = '已复制到剪贴板' }: ToastProps) {
  return (
    <div className={`${styles.toast} ${visible ? styles.visible : ''}`} role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      {message}
    </div>
  )
}
