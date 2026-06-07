import { useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './DataPreview.module.css'
import { useProjectStore } from '../../store/useProjectStore'
import { highlightJson } from '../../utils/syntaxHighlight'
import { copyToClipboard, downloadJson } from '../../utils/export'

export default function DataPreview() {
  const { t } = useTranslation()
  const generatedData = useProjectStore((s) => s.generatedData)
  const showToast = useProjectStore((s) => s.showToast)

  useEffect(() => {
    if (!generatedData) {
      useProjectStore.getState().generate()
    }
  }, [])

  const handleCopy = useCallback(async () => {
    if (generatedData) {
      try {
        await copyToClipboard(generatedData)
        showToast(t('dataPreview.copied'))
      } catch {
        showToast(t('dataPreview.copyFailed'))
      }
    }
  }, [generatedData, showToast])

  const handleDownloadJson = useCallback(() => {
    if (generatedData) {
      downloadJson(generatedData)
      showToast(t('dataPreview.downloaded'))
    }
  }, [generatedData, showToast])

  return (
    <div className="panel-right">
      <div className="card card-preview">
        <div className={styles.previewWrap}>
          <div className={styles.floatingActions}>
            <button className="btn-sm" onClick={handleCopy}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
            <button className="btn-sm" onClick={handleDownloadJson}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>

          {!generatedData ? (
            <div className={styles.emptyState}>
              {t('dataPreview.placeholder')}
            </div>
          ) : (
            <JsonPreview data={generatedData} />
          )}
        </div>
      </div>
    </div>
  )
}

function JsonPreview({ data }: { data: unknown }) {
  const lines = useMemo(() => highlightJson(data), [data])

  return (
    <div className={styles.jsonPreview}>
      {lines.map((line) => (
        <div className={styles.jsonLine} key={line.num}>
          <span className={styles.jsonLineNum}>{line.num}</span>
          <span className={styles.jsonContent}>
            {line.content}
          </span>
        </div>
      ))}
    </div>
  )
}