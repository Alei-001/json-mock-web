import { useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './DataPreview.module.css'
import { useProjectStore } from '../../store/useProjectStore'
import { highlightJson } from '../../utils/syntaxHighlight'
import { copyToClipboard, downloadJson, downloadCsv } from '../../utils/export'

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

  const handleDownloadCsv = useCallback(() => {
    if (generatedData) {
      downloadCsv(generatedData)
      showToast(t('dataPreview.downloadedCsv'))
    }
  }, [generatedData, showToast])

  return (
    <div className="panel-right">
      <div className="card card-preview">
        <div className={styles.previewWrap}>
          <div className={styles.floatingActions}>
            <button className={styles.actionBtn} onClick={handleCopy} title={t('dataPreview.copy')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
            <button className={styles.actionBtn} onClick={handleDownloadJson} title={t('dataPreview.downloadJson')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button className={styles.actionBtn} onClick={handleDownloadCsv} title={t('dataPreview.downloadCsv')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
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